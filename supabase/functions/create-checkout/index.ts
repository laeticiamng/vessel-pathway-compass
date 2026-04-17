import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── In-memory rate limiter (5 req/min per user) ─────────────────────
const WINDOW_MS = 60_000;
const MAX_REQ = 5;
const rlMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(uid: string): boolean {
  const now = Date.now();
  const e = rlMap.get(uid);
  if (!e || now > e.resetAt) { rlMap.set(uid, { count: 1, resetAt: now + WINDOW_MS }); return false; }
  return ++e.count > MAX_REQ;
}
setInterval(() => { const now = Date.now(); for (const [k, v] of rlMap) if (now > v.resetAt) rlMap.delete(k); }, 60_000);

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { email: user.email });

    // ── Rate limit ───────────────────────────────────────────────────
    if (isRateLimited(user.id)) {
      logStep("Rate limited", { userId: user.id });
      return new Response(
        JSON.stringify({ error: "Too many checkout attempts. Please wait a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { priceId } = await req.json();
    if (!priceId) throw new Error("priceId is required");
    logStep("Price ID received", { priceId });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2025-08-27.basil" });
    
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      // Backfill metadata if missing so the webhook can map without listUsers
      if (!customers.data[0].metadata?.user_id) {
        await stripe.customers.update(customerId, { metadata: { user_id: user.id } });
        logStep("Backfilled customer metadata", { customerId, userId: user.id });
      }
      logStep("Existing customer found", { customerId });
    } else {
      // Pre-create customer with metadata so the webhook can map deterministically
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id },
      });
      customerId = newCustomer.id;
      logStep("New customer created with metadata", { customerId, userId: user.id });
    }

    const origin = req.headers.get("origin") || "http://localhost:8080";
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      subscription_data: { metadata: { user_id: user.id } },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
    });
    logStep("Checkout session created", { sessionId: session.id });

    // ── Audit log (fire & forget) ────────────────────────────────────
    const svcClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    svcClient.from("audit_logs").insert({
      user_id: user.id,
      action: "checkout_started",
      entity_type: "subscription",
      details: { priceId, sessionId: session.id },
    }).then(() => {});

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
