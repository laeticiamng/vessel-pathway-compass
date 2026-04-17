// Edge function : export RGPD self-service (art. 15 + 20).
// Retourne un JSON consolidé de toutes les données de l'utilisateur authentifié.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 1) Validate JWT via anon client
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    // 2) Use service role to bypass RLS for full consolidated export
    const admin = createClient(supabaseUrl, serviceKey);

    const tables = [
      { name: "profiles", filter: { col: "user_id", val: userId } },
      { name: "user_roles", filter: { col: "user_id", val: userId } },
      { name: "memberships", filter: { col: "user_id", val: userId } },
      { name: "patients", filter: { col: "created_by", val: userId } },
      { name: "cases", filter: { col: "created_by", val: userId } },
      { name: "case_events", filter: { col: "created_by", val: userId } },
      { name: "measurements", filter: { col: "created_by", val: userId } },
      { name: "outcomes", filter: { col: "created_by", val: userId } },
      { name: "imaging_summaries", filter: { col: "created_by", val: userId } },
      { name: "ai_outputs", filter: { col: "user_id", val: userId } },
      { name: "logbook_entries", filter: { col: "user_id", val: userId } },
      { name: "quiz_attempts", filter: { col: "user_id", val: userId } },
      { name: "simulation_runs", filter: { col: "user_id", val: userId } },
      { name: "exports", filter: { col: "user_id", val: userId } },
      { name: "studies", filter: { col: "created_by", val: userId } },
      { name: "forum_posts", filter: { col: "user_id", val: userId } },
      { name: "expert_requests", filter: { col: "requester_id", val: userId } },
      { name: "notifications", filter: { col: "user_id", val: userId } },
      { name: "subscriptions", filter: { col: "user_id", val: userId } },
      { name: "rgpd_requests", filter: { col: "user_id", val: userId } },
      { name: "audit_logs", filter: { col: "user_id", val: userId } },
    ];

    const payload: Record<string, unknown> = {
      __metadata: {
        generated_at: new Date().toISOString(),
        user_id: userId,
        email: userData.user.email,
        legal_basis: "RGPD art. 15 (droit d'accès) + art. 20 (portabilité)",
        format: "JSON",
        notice:
          "Ce fichier contient toutes vos données traitées par la plateforme. Conservez-le en lieu sûr.",
      },
    };

    for (const t of tables) {
      const { data, error } = await admin
        .from(t.name)
        .select("*")
        .eq(t.filter.col, t.filter.val);
      payload[t.name] = error ? { __error: error.message } : (data ?? []);
    }

    // 3) Log governance event (best-effort)
    await admin.rpc("log_governance_event", {
      _category: "compliance",
      _action: "rgpd.export.generated",
      _severity: "info",
      _target_user: userId,
      _context: { tables: tables.length },
    });

    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[export-user-data]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
