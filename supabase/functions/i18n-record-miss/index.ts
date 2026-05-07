// i18n missing-key telemetry recorder.
// Accepts a small batch of {locale, key, route, role?} entries and upserts
// them into public.i18n_missing_keys (per locale+key+route+role+day bucket).
// Auth: requires a valid Supabase JWT. Anonymous users are rejected.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type Entry = {
  locale: "en" | "fr" | "de";
  key: string;
  route?: string | null;
  role?: string | null;
  reason?: "missing" | "shape-mismatch";
  app_version?: string | null;
};

function isValidEntry(e: unknown): e is Entry {
  if (!e || typeof e !== "object") return false;
  const o = e as Record<string, unknown>;
  if (o.locale !== "en" && o.locale !== "fr" && o.locale !== "de") return false;
  if (typeof o.key !== "string" || o.key.length < 1 || o.key.length > 256) return false;
  if (o.route != null && (typeof o.route !== "string" || o.route.length > 256)) return false;
  if (o.role != null && (typeof o.role !== "string" || o.role.length > 64)) return false;
  if (o.reason != null && o.reason !== "missing" && o.reason !== "shape-mismatch") return false;
  if (o.app_version != null && (typeof o.app_version !== "string" || o.app_version.length > 64)) return false;
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // AuthN: validate the caller's JWT before doing anything.
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const authClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userResp, error: userErr } = await authClient.auth.getUser();
  if (userErr || !userResp?.user) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const raw = (body as { entries?: unknown }).entries;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 50) {
    return new Response(JSON.stringify({ error: "invalid_entries" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const entries = raw.filter(isValidEntry) as Entry[];
  if (entries.length === 0) {
    return new Response(JSON.stringify({ error: "no_valid_entries" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Aggregate identical (locale,key,route,role,reason) within batch.
  type Bucket = Required<Omit<Entry, "app_version">> & { app_version: string | null; count: number };
  const agg = new Map<string, Bucket>();
  for (const e of entries) {
    const k = `${e.locale}|${e.key}|${e.route ?? ""}|${e.role ?? ""}|${e.reason ?? "missing"}`;
    const cur = agg.get(k);
    if (cur) cur.count += 1;
    else agg.set(k, {
      locale: e.locale,
      key: e.key,
      route: e.route ?? null,
      role: e.role ?? null,
      reason: e.reason ?? "missing",
      app_version: e.app_version ?? null,
      count: 1,
    });
  }

  const svc = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const today = new Date().toISOString().slice(0, 10);

  // Try update, then insert if no row — the unique index covers
  // (locale, key, COALESCE(route,''), COALESCE(role,''), bucket_day).
  for (const b of agg.values()) {
    const { data: updated, error: upErr } = await svc
      .from("i18n_missing_keys")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("locale", b.locale)
      .eq("key", b.key)
      .eq("bucket_day", today)
      .filter("route", b.route === null ? "is" : "eq", b.route === null ? null : b.route)
      .filter("role", b.role === null ? "is" : "eq", b.role === null ? null : b.role)
      .select("id, occurrences");

    if (upErr) {
      console.error("update failed", upErr);
      continue;
    }
    if (updated && updated.length > 0) {
      const id = updated[0].id;
      const newCount = (updated[0].occurrences ?? 1) + b.count;
      await svc.from("i18n_missing_keys").update({ occurrences: newCount }).eq("id", id);
    } else {
      await svc.from("i18n_missing_keys").insert({
        locale: b.locale,
        key: b.key,
        route: b.route,
        role: b.role,
        reason: b.reason,
        app_version: b.app_version,
        occurrences: b.count,
        bucket_day: today,
      });
    }
  }

  return new Response(JSON.stringify({ ok: true, accepted: entries.length, buckets: agg.size }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
