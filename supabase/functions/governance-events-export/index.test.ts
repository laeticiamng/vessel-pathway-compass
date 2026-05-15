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

Deno.test({
  name: "governance-events-export: sync and async produce identical CSV (same filters, same sort)",
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

    const marker = `parity-${crypto.randomUUID()}`;
    // Seed 12 matching events with explicit, distinct created_at so sort is deterministic.
    const seeded: string[] = [];
    const base = Date.now();
    for (let i = 0; i < 12; i++) {
      const ts = new Date(base - i * 1000).toISOString();
      const { data, error } = await admin.from("governance_events").insert({
        actor_id: userId,
        event_category: "visual_chain",
        event_action: "assessment.created",
        severity: "info",
        created_at: ts,
        context: { recommended_layer: "L2", current_layer: "L1", parity_marker: marker, idx: i },
      }).select("id").single();
      if (error) throw error;
      seeded.push(data.id);
    }

    const callExport = async (mode: "sync" | "async") => {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/governance-events-export`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON,
        },
        body: JSON.stringify({
          format: "csv",
          mode,
          filters: { category: "visual_chain", recommended: "L2", current: "L1" },
        }),
      });
      if (mode === "sync") {
        assertEquals(res.status, 200);
        return await res.text();
      }
      assertEquals(res.status, 202);
      const { job_id } = await res.json();
      // Poll job until done (max 30s)
      let path: string | null = null;
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const { data } = await admin.from("governance_export_jobs")
          .select("status,download_path,error").eq("id", job_id).single();
        if (data?.status === "done") { path = data.download_path; break; }
        if (data?.status === "failed") throw new Error(`async failed: ${data.error}`);
      }
      if (!path) throw new Error("async export did not complete in time");
      const dl = await admin.storage.from("governance-exports").download(path);
      if (dl.error || !dl.data) throw new Error(`download failed: ${dl.error?.message}`);
      return await dl.data.text();
    };

    try {
      // Filter to just our seeded rows for a deterministic comparison
      const syncCsv = await callExport("sync");
      const asyncCsv = await callExport("async");

      const filterToMarker = (csv: string) => {
        const lines = csv.split("\n");
        const header = lines[0];
        const body = lines.slice(1).filter((l) => seeded.some((id) => l.includes(id)));
        return [header, ...body].join("\n");
      };
      const syncSubset = filterToMarker(syncCsv);
      const asyncSubset = filterToMarker(asyncCsv);

      assertEquals(asyncSubset, syncSubset,
        "Sync and async exports must contain identical rows in the same order");

      // Verify the order respects created_at DESC (idx 0 newest first)
      const idxOrder = syncSubset.split("\n").slice(1)
        .map((l) => seeded.indexOf(seeded.find((id) => l.includes(id))!))
        .filter((n) => n >= 0);
      assertEquals(idxOrder, [...idxOrder].sort((a, b) => a - b),
        "Rows must be returned in created_at DESC order");
    } finally {
      await admin.from("governance_events").delete().in("id", seeded);
    }
  },
});
