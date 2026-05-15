// governance-events-export — server-side CSV/PDF export of governance_events
// for /app/admin/visual-chain-events.
//
// - verify_jwt = true (also re-validates JWT in code).
// - Enforces role: must be admin / super_admin / hospital_admin.
// - Uses RLS-equivalent SECURITY DEFINER helper `governance_events_for_user`,
//   so a hospital_admin only ever sees their institution's events.
// - Sync mode (rows <= SYNC_THRESHOLD) returns the file inline.
// - Async mode (rows > SYNC_THRESHOLD or mode='async') creates a job row,
//   processes it in the background via EdgeRuntime.waitUntil, uploads
//   the file to the `governance-exports` bucket and updates the job
//   so the UI can show progress and download the result via Realtime.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { z } from "https://esm.sh/zod@3.23.8";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

declare const EdgeRuntime: { waitUntil: (p: Promise<unknown>) => void } | undefined;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYNC_THRESHOLD = 1000;
const PAGE_SIZE = 500;
const MAX_ROWS = 100_000;

const Layer = z.enum(["L1", "L2", "L3", "Post-PhD"]);
const FiltersSchema = z.object({
  category: z.enum(["all", "visual_chain", "rsvp"]).default("all"),
  institution_id: z.string().uuid().nullable().optional(),
  from: z.string().datetime().nullable().optional(),
  to: z.string().datetime().nullable().optional(),
  recommended: Layer.nullable().optional(),
  current: Layer.nullable().optional(),
});
const BodySchema = z.object({
  format: z.enum(["csv", "pdf"]),
  mode: z.enum(["auto", "sync", "async"]).default("auto"),
  filters: FiltersSchema.default({ category: "all" }),
});

const ALLOWED_ROLES = new Set(["admin", "super_admin", "hospital_admin"]);

type Row = {
  id: string;
  created_at: string;
  event_category: string;
  event_action: string;
  severity: string;
  actor_id: string | null;
  institution_id: string | null;
  target_entity_type: string | null;
  target_entity_id: string | null;
  context: Record<string, unknown> | null;
};

type RpcArgs = {
  _user: string;
  _category: string | null;
  _institution: string | null;
  _from: string | null;
  _to: string | null;
  _recommended: string | null;
  _current: string | null;
};

function rpcArgs(userId: string, f: z.infer<typeof FiltersSchema>): RpcArgs {
  return {
    _user: userId,
    _category: f.category === "all" ? null : f.category,
    _institution: f.institution_id ?? null,
    _from: f.from ?? null,
    _to: f.to ?? null,
    _recommended: f.recommended ?? null,
    _current: f.current ?? null,
  };
}

function csvEscape(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowsToCsv(rows: Row[]): string {
  const header = [
    "timestamp",
    "category",
    "action",
    "severity",
    "recommended",
    "current",
    "institution_id",
    "actor_id",
    "target_entity_type",
    "target_entity_id",
    "event_id",
  ].join(",");
  const lines = rows.map((r) => {
    const ctx = (r.context ?? {}) as Record<string, string>;
    const recommended = ctx.recommended_layer ?? ctx.recommended_level ?? "";
    const current = ctx.current_layer ?? ctx.requested_level ?? "";
    return [
      r.created_at,
      r.event_category,
      r.event_action,
      r.severity,
      recommended,
      current,
      r.institution_id ?? "",
      r.actor_id ?? "",
      r.target_entity_type ?? "",
      r.target_entity_id ?? "",
      r.id,
    ].map(csvEscape).join(",");
  });
  return [header, ...lines].join("\n");
}

function rowsToPdf(rows: Row[], title: string): Uint8Array {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  doc.setFontSize(14);
  doc.text(title, 40, 40);
  doc.setFontSize(8);

  const headers = ["When", "Cat", "Action", "Sev", "Rec", "Cur", "Entity"];
  const colX = [40, 160, 215, 380, 425, 460, 495];
  let y = 70;
  doc.setFont("helvetica", "bold");
  headers.forEach((h, i) => doc.text(h, colX[i], y));
  doc.setFont("helvetica", "normal");
  y += 14;

  for (const r of rows) {
    if (y > 560) {
      doc.addPage();
      y = 40;
      doc.setFont("helvetica", "bold");
      headers.forEach((h, i) => doc.text(h, colX[i], y));
      doc.setFont("helvetica", "normal");
      y += 14;
    }
    const ctx = (r.context ?? {}) as Record<string, string>;
    const recommended = ctx.recommended_layer ?? ctx.recommended_level ?? "";
    const current = ctx.current_layer ?? ctx.requested_level ?? "";
    const cells = [
      new Date(r.created_at).toISOString().slice(0, 19).replace("T", " "),
      r.event_category,
      r.event_action.slice(0, 38),
      r.severity,
      recommended,
      current,
      (r.target_entity_type ?? "").slice(0, 22),
    ];
    cells.forEach((c, i) => doc.text(String(c), colX[i], y));
    y += 12;
  }

  return new Uint8Array(doc.output("arraybuffer"));
}

async function fetchAllPages(
  adminClient: ReturnType<typeof createClient>,
  args: RpcArgs,
  max: number,
  onProgress?: (n: number) => Promise<void> | void,
): Promise<Row[]> {
  const out: Row[] = [];
  let offset = 0;
  while (out.length < max) {
    const limit = Math.min(PAGE_SIZE, max - out.length);
    const { data, error } = await adminClient.rpc(
      "governance_events_for_user",
      { ...args, _limit: limit, _offset: offset },
    );
    if (error) throw error;
    const batch = (data ?? []) as Row[];
    out.push(...batch);
    if (onProgress) await onProgress(out.length);
    if (batch.length < limit) break;
    offset += batch.length;
  }
  return out;
}

async function processJob(
  jobId: string,
  userId: string,
  format: "csv" | "pdf",
  filters: z.infer<typeof FiltersSchema>,
  total: number,
) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseService = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, supabaseService);
  const args = rpcArgs(userId, filters);

  try {
    await admin.from("governance_export_jobs")
      .update({ status: "running", rows_total: total }).eq("id", jobId);

    const rows = await fetchAllPages(admin, args, MAX_ROWS, async (n) => {
      await admin.from("governance_export_jobs")
        .update({ rows_processed: n }).eq("id", jobId);
    });

    const path = `${userId}/${jobId}.${format}`;
    const body: Uint8Array | string = format === "csv"
      ? rowsToCsv(rows)
      : rowsToPdf(rows, "Governance events — Visual Chain & RSVP");
    const contentType = format === "csv"
      ? "text/csv; charset=utf-8"
      : "application/pdf";

    const { error: upErr } = await admin.storage
      .from("governance-exports")
      .upload(path, body, { contentType, upsert: true });
    if (upErr) throw upErr;

    await admin.from("governance_export_jobs").update({
      status: "done",
      rows_processed: rows.length,
      rows_total: rows.length,
      download_path: path,
    }).eq("id", jobId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await admin.from("governance_export_jobs")
      .update({ status: "failed", error: msg }).eq("id", jobId);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabaseService = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: authHeader } },
  });
  const admin = createClient(supabaseUrl, supabaseService);

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } =
    await userClient.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = claimsData.claims.sub as string;

  const { data: roles } = await admin.from("user_roles")
    .select("role").eq("user_id", userId);
  const isAdmin = (roles ?? []).some((r) => ALLOWED_ROLES.has(r.role));
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let parsed;
  try {
    parsed = BodySchema.safeParse(await req.json());
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: parsed.error.flatten() }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
  const { format, mode, filters } = parsed.data;
  const args = rpcArgs(userId, filters);

  // Count first (uses the same predicates as the rows query)
  const { data: countRaw, error: countErr } = await userClient.rpc(
    "governance_events_count_for_user",
    {
      _user: userId,
      _category: args._category,
      _institution: args._institution,
      _from: args._from,
      _to: args._to,
      _recommended: args._recommended,
      _current: args._current,
    },
  );
  if (countErr) {
    return new Response(JSON.stringify({ error: countErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const total = Number(countRaw ?? 0);

  const useAsync = mode === "async" || (mode === "auto" && total > SYNC_THRESHOLD);

  // Audit
  await admin.rpc("log_governance_event", {
    _category: "compliance",
    _action: "governance_events.exported",
    _severity: "info",
    _target_entity_type: "governance_events_export",
    _context: { format, mode: useAsync ? "async" : "sync", filters, total },
  });

  if (useAsync) {
    const { data: job, error: jobErr } = await admin
      .from("governance_export_jobs")
      .insert({
        user_id: userId,
        format,
        filters,
        rows_total: total,
        status: "queued",
      })
      .select("id")
      .single();
    if (jobErr) {
      return new Response(JSON.stringify({ error: jobErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const work = processJob(job.id, userId, format, filters, total);
    if (typeof EdgeRuntime !== "undefined") {
      EdgeRuntime.waitUntil(work);
    } else {
      // Fallback: fire and forget
      void work;
    }

    return new Response(
      JSON.stringify({ job_id: job.id, mode: "async", total }),
      {
        status: 202,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Sync path: stream the file directly
  try {
    const rows = await fetchAllPages(admin, args, SYNC_THRESHOLD);
    const filenameBase = `governance-events-${Date.now()}`;
    if (format === "csv") {
      const body = rowsToCsv(rows);
      return new Response(body, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition":
            `attachment; filename="${filenameBase}.csv"`,
          "X-Total-Rows": String(rows.length),
        },
      });
    }
    const pdf = rowsToPdf(rows, "Governance events — Visual Chain & RSVP");
    return new Response(pdf, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition":
          `attachment; filename="${filenameBase}.pdf"`,
        "X-Total-Rows": String(rows.length),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
