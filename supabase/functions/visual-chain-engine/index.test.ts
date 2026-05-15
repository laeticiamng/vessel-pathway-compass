// Auto test: submit a visual-chain assessment and assert that a
// governance_events row appears with category 'visual_chain'.
//
// Requires a logged-in user JWT; we sign a test user in via password.
// Set TEST_USER_EMAIL / TEST_USER_PASSWORD in `.env` (a physician role).

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;
const EMAIL = Deno.env.get("TEST_USER_EMAIL");
const PASSWORD = Deno.env.get("TEST_USER_PASSWORD");

Deno.test({
  name: "visual-chain-engine creates governance_events.visual_chain",
  ignore: !EMAIL || !PASSWORD,
  async fn() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
      email: EMAIL!, password: PASSWORD!,
    });
    assert(!authErr, `sign-in failed: ${authErr?.message}`);
    assert(auth.session, "no session");

    const before = new Date().toISOString();

    const { data, error } = await supabase.functions.invoke("visual-chain-engine", {
      body: {
        current_layer: "L2",
        inputs: {
          resource_level: "L2",
          echo_quality: "inconclusive",
          ci_aki_risk: false,
          radiation_contraindicated: false,
          research_context: false,
          pre_gesture_confirmation_required: false,
        },
      },
    });
    assert(!error, `engine call failed: ${error?.message}`);
    assert(data?.assessment?.id, "no assessment returned");

    // Poll governance_events for up to 5s
    let row: { event_category: string; event_action: string } | null = null;
    for (let i = 0; i < 10; i++) {
      const { data: events } = await supabase
        .from("governance_events")
        .select("event_category, event_action, target_entity_id, created_at")
        .eq("event_category", "visual_chain")
        .gte("created_at", before)
        .order("created_at", { ascending: false })
        .limit(5);
      if (events && events.length > 0) {
        row = events.find((e: { target_entity_id: string }) => e.target_entity_id === data.assessment.id) ?? events[0];
        break;
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    assert(row, "no governance_events row created");
    assertEquals(row!.event_category, "visual_chain");
    assert(row!.event_action.length > 0, "event_action empty");

    await supabase.auth.signOut();
  },
});
