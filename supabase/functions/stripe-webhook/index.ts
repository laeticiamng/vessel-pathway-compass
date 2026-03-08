import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200 });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // ── P0: Require webhook secret + signature ───────────────────────
    if (!webhookSecret) {
      logStep("ERROR: STRIPE_WEBHOOK_SECRET is not configured");
      return new Response(JSON.stringify({ error: "Webhook not configured" }), {
        headers: { "Content-Type": "application/json" }, status: 500,
      });
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      logStep("REJECTED: Missing stripe-signature header");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        headers: { "Content-Type": "application/json" }, status: 401,
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const body = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Signature verified");
    } catch (err) {
      logStep("REJECTED: Invalid signature", { error: String(err) });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        headers: { "Content-Type": "application/json" }, status: 401,
      });
    }

    // ── P0: Idempotence check ────────────────────────────────────────
    const svcClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: existing } = await svcClient
      .from("stripe_webhook_events")
      .select("id")
      .eq("event_id", event.id)
      .maybeSingle();

    if (existing) {
      logStep("Duplicate event, skipping", { eventId: event.id });
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { "Content-Type": "application/json" }, status: 200,
      });
    }

    // Record event for idempotence
    await svcClient.from("stripe_webhook_events").insert({
      event_id: event.id,
      event_type: event.type,
      payload: event.data.object as unknown,
    });

    logStep("Event type", { type: event.type, id: event.id });

    // ── Fulfillment: sync subscription state to DB ───────────────────
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

        // Resolve user email from Stripe customer
        const customer = await stripe.customers.retrieve(customerId);
        if (!customer || customer.deleted || !("email" in customer) || !customer.email) {
          logStep("Cannot resolve customer email", { customerId });
          break;
        }

        // Find user by email
        const { data: authData } = await svcClient.auth.admin.listUsers();
        const matchedUser = authData?.users?.find(u => u.email === customer.email);
        if (!matchedUser) {
          logStep("No auth user found for email", { email: customer.email });
          break;
        }

        const isActive = ["active", "trialing"].includes(subscription.status);
        const productId = subscription.items.data[0]?.price?.product as string ?? null;
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        const { error: upsertErr } = await svcClient
          .from("subscriptions")
          .upsert({
            user_id: matchedUser.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            product_id: productId,
            status: isActive ? "active" : subscription.status,
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

        if (upsertErr) {
          logStep("Subscription upsert error", { error: upsertErr.message });
        } else {
          logStep("Subscription synced", {
            userId: matchedUser.id,
            status: subscription.status,
            productId,
          });
        }

        // Audit log
        svcClient.from("audit_logs").insert({
          user_id: matchedUser.id,
          action: `subscription_${event.type.split(".").pop()}`,
          entity_type: "subscription",
          entity_id: subscription.id as unknown as string,
          details: { status: subscription.status, productId },
        }).then(() => {});
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout completed", {
          customerId: session.customer,
          mode: session.mode,
          sessionId: session.id,
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment failed", {
          customerId: invoice.customer,
          amount: invoice.amount_due,
        });
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" }, status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" }, status: 400,
    });
  }
});
