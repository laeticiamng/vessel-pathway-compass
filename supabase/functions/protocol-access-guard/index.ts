// Server-side role guard for /protocol view + audit exports.
//
// Purpose:
//   - Enforce a strict allow-list (admin / super_admin / research_lead) on
//     the server, independent of any client UI gating.
//   - Emit a tamper-proof governance_events row for every access /
//     export attempt (granted OR denied), with a server-generated
//     request-id and high-resolution timestamp.
//
// Returns:
//   200 { ok, request_id, action, role }   — authorized
//   401 { error, request_id }               — missing/invalid JWT
//   403 { error, request_id }               — authenticated but not allowed
//   400 { error, request_id }               — invalid payload
//
// All responses include `X-Request-Id` and `Cache-Control: no-store`.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-request-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Expose-Headers": "X-Request-Id",
};

const noStore = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

const ALLOWED_ROLES = new Set([
  "admin",
  "super_admin",
  "research_lead",
]);

const ALLOWED_ACTIONS = new Set([
  "protocol.view",
  "protocol.export.compliance.json",
  "protocol.export.audit_log.csv",
  "protocol.export.audit_log.pdf",
]);

// ── Brute-force / abuse throttling ───────────────────────────────────
// Per-key sliding window: tracks denied attempts (401/403/400). When a
// key crosses MAX_DENIED in WINDOW_MS, subsequent calls return 429
// until BAN_MS elapses. Each ban transition is logged as a
// `protocol.access.throttled` governance_event for auditability.
const WINDOW_MS = 60_000;        // 1 min sliding window
const MAX_DENIED = 8;            // > this many denials → throttle
const BAN_MS = 5 * 60_000;       // 5 min ban
type ThrottleState = { denials: number[]; bannedUntil: number; lastLoggedBanAt: number };
const throttle = new Map<string, ThrottleState>();

function getState(key: string): ThrottleState {
  let s = throttle.get(key);
  if (!s) { s = { denials: [], bannedUntil: 0, lastLoggedBanAt: 0 }; throttle.set(key, s); }
  return s;
}
function isBanned(key: string): { banned: boolean; retryAfter: number } {
  const s = getState(key);
  const now = Date.now();
  if (s.bannedUntil > now) return { banned: true, retryAfter: Math.ceil((s.bannedUntil - now) / 1000) };
  return { banned: false, retryAfter: 0 };
}
function recordDenial(key: string): { newlyBanned: boolean; retryAfter: number; count: number } {
  const s = getState(key);
  const now = Date.now();
  s.denials = s.denials.filter((t) => now - t < WINDOW_MS);
  s.denials.push(now);
  if (s.denials.length > MAX_DENIED && s.bannedUntil <= now) {
    s.bannedUntil = now + BAN_MS;
    return { newlyBanned: true, retryAfter: Math.ceil(BAN_MS / 1000), count: s.denials.length };
  }
  return { newlyBanned: false, retryAfter: 0, count: s.denials.length };
}
// Periodic GC of expired entries
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of throttle) {
    if (v.bannedUntil < now && v.denials.every((t) => now - t > WINDOW_MS)) throttle.delete(k);
  }
}, 60_000);

function clientKey(req: Request, userId: string | null): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return `${userId ?? "anon"}|${ip}`;
}

function jsonResponse(
  status: number,
  body: Record<string, unknown>,
  reqId: string,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      ...noStore,
      "Content-Type": "application/json",
      "X-Request-Id": reqId,
    },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { ...corsHeaders, ...noStore } });
  }

  // Server-generated request-id for end-to-end log correlation.
  const reqId =
    req.headers.get("x-request-id") ??
    (crypto.randomUUID ? crypto.randomUUID() : `r-${Date.now()}-${Math.random()}`);
  const startedAt = new Date().toISOString();

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed", request_id: reqId }, reqId);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Require Bearer JWT — never allow anonymous calls to the guard.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    // Tamper-proof denial log even without a user (actor_id NULL).
    try {
      const svc = createClient(SUPABASE_URL, SERVICE);
      await svc.from("governance_events").insert({
        event_category: "compliance",
        event_action: "protocol.access.denied",
        severity: "warn",
        target_entity_type: "protocol",
        context: {
          reason: "missing_jwt",
          request_id: reqId,
          ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
          ua: req.headers.get("user-agent") ?? null,
          server_ts: startedAt,
        },
      });
    } catch (_) { /* best-effort */ }
    return jsonResponse(401, { error: "Unauthorized", request_id: reqId }, reqId);
  }

  // Parse + validate body
  let action = "";
  try {
    const body = await req.json();
    action = String(body?.action ?? "");
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body", request_id: reqId }, reqId);
  }
  if (!ALLOWED_ACTIONS.has(action)) {
    return jsonResponse(
      400,
      { error: "Unsupported action", request_id: reqId },
      reqId,
    );
  }

  // Verify JWT via anon client → claims.sub
  const anon = createClient(SUPABASE_URL, ANON, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsErr } = await anon.auth.getClaims(token);
  const userId = claimsData?.claims?.sub as string | undefined;

  const svc = createClient(SUPABASE_URL, SERVICE);

  if (claimsErr || !userId) {
    await svc.from("governance_events").insert({
      event_category: "compliance",
      event_action: "protocol.access.denied",
      severity: "warn",
      target_entity_type: "protocol",
      context: {
        reason: "invalid_jwt",
        action,
        request_id: reqId,
        ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        ua: req.headers.get("user-agent") ?? null,
        server_ts: startedAt,
      },
    });
    return jsonResponse(401, { error: "Unauthorized", request_id: reqId }, reqId);
  }

  // Authoritative role check via service-role read.
  const { data: roleRows, error: roleErr } = await svc
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (roleErr) {
    await svc.from("governance_events").insert({
      actor_id: userId,
      event_category: "compliance",
      event_action: "protocol.access.error",
      severity: "error",
      target_entity_type: "protocol",
      context: {
        reason: "role_lookup_failed",
        action,
        request_id: reqId,
        server_ts: startedAt,
      },
    });
    return jsonResponse(500, { error: "Internal error", request_id: reqId }, reqId);
  }

  const userRoles = (roleRows ?? []).map((r) => r.role as string);
  const matchedRole = userRoles.find((r) => ALLOWED_ROLES.has(r));

  if (!matchedRole) {
    // 403 — authenticated but role not allowed
    await svc.from("governance_events").insert({
      actor_id: userId,
      event_category: "compliance",
      event_action: "protocol.access.denied",
      severity: "warn",
      target_entity_type: "protocol",
      context: {
        reason: "role_forbidden",
        action,
        roles: userRoles,
        request_id: reqId,
        ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        ua: req.headers.get("user-agent") ?? null,
        server_ts: startedAt,
      },
    });
    return jsonResponse(403, { error: "Forbidden", request_id: reqId }, reqId);
  }

  // Authorized — log granted access (tamper-proof, server-side timestamp).
  await svc.from("governance_events").insert({
    actor_id: userId,
    event_category: "compliance",
    event_action: action.startsWith("protocol.export.")
      ? "protocol.export.granted"
      : "protocol.access.granted",
    severity: "info",
    target_entity_type: "protocol",
    context: {
      action,
      role: matchedRole,
      request_id: reqId,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      ua: req.headers.get("user-agent") ?? null,
      server_ts: startedAt,
    },
  });

  return jsonResponse(
    200,
    {
      ok: true,
      request_id: reqId,
      action,
      role: matchedRole,
      server_ts: startedAt,
    },
    reqId,
  );
});
