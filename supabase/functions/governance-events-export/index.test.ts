// E2E test for /app/admin/visual-chain-events export.
// Inserts two governance_events (one matching, one not), calls the export
// edge function with filters, and asserts the CSV/PDF contains only the
// matching rows.
//
// Skipped automatically when TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD are not set.

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ADMIN_EMAIL = Deno.env.get("TEST_ADMIN_EMAIL");
const ADMIN_PASSWORD = Deno.env.get("TEST_ADMIN_PASSWORD");

const ENABLED = !!(SUPABASE_URL && SUPABASE_ANON && SERVICE_KEY && ADMIN_EMAIL && ADMIN_PASSWORD);

const MARKER = `e2e-${crypto.randomUUID()}`;

Deno.test({
  name: "governance-events-export filters (CSV) only returns matching rows",
  ignore: !ENABLED,
  async fn() {
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON);
    const { data: signIn, error: signErr } = await userClient.auth.signInWithPassword({
      email: ADMIN_EMAIL!, password: ADMIN_PASSWORD!,
    });
    if (signErr || !signIn.session) throw new Error(`Sign-in failed: ${signErr?.message}`);
    const token = signIn.session.access_token;
    const userId = signIn.user!.id;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Seed: one matching (visual_chain, recommended_layer L2)
    const matching = await admin.from("governance_events").insert({
      actor_id: userId,
      event_category: "visual_chain",
      event_action: "assessment.created",
      severity: "info",
      context: { recommended_layer: "L2", current_layer: "L1", test_marker: MARKER },
    }).select("id").single();
    if (matching.error) throw matching.error;

    // Seed: one non-matching (rsvp, recommended_level L3)
    const nonMatching = await admin.from("governance_events").insert({
      actor_id: userId,
      event_category: "rsvp",
      event_action: "rsvp.created",
      severity: "info",
      context: { recommended_level: "L3", test_marker: MARKER },
    }).select("id").single();
    if (nonMatching.error) throw nonMatching.error;

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/governance-events-export`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON,
        },
        body: JSON.stringify({
          format: "csv",
          mode: "sync",
          filters: { category: "visual_chain", recommended: "L2" },
        }),
      });
      assertEquals(res.status, 200);
      const csv = await res.text();
      assert(csv.includes(matching.data.id), "CSV must include matching event id");
      assert(!csv.includes(nonMatching.data.id), "CSV must NOT include non-matching event id");
    } finally {
      await admin.from("governance_events").delete().in(
        "id",
        [matching.data.id, nonMatching.data.id],
      );
    }
  },
});

Deno.test({
  name: "governance-events-export rejects unauthenticated callers",
  ignore: !ENABLED,
  async fn() {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/governance-events-export`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON },
      body: JSON.stringify({ format: "csv", filters: { category: "all" } }),
    });
    await res.text();
    assertEquals(res.status, 401);
  },
});
