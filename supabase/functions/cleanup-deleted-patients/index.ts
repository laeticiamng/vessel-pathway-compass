import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const cronSecretHeader = req.headers.get("x-cron-secret");
    const expectedSecret = Deno.env.get("CRON_SECRET");

    // Support cron secret from header or from JSON body
    let cronSecretBody: string | null = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        cronSecretBody = body?.cronSecret ?? null;
      } catch { /* no body */ }
    }

    const cronSecret = cronSecretHeader || cronSecretBody;
    const isCronJob = expectedSecret && cronSecret === expectedSecret;

    if (!isCronJob) {
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const svcClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        { auth: { persistSession: false } }
      );

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await svcClient.auth.getUser(token);
      if (userError || !userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: hasAdmin } = await svcClient.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "super_admin",
      });

      if (!hasAdmin) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: expiredPatients, error: fetchError } = await supabase
      .from("patients")
      .select("id")
      .not("deleted_at", "is", null)
      .lt("deleted_at", thirtyDaysAgo);

    if (fetchError) throw fetchError;
    if (!expiredPatients || expiredPatients.length === 0) {
      return new Response(
        JSON.stringify({ message: "No expired patients to clean up", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const patientIds = expiredPatients.map((p) => p.id);
    let totalDeleted = 0;

    for (const patientId of patientIds) {
      const { data: cases } = await supabase
        .from("cases")
        .select("id")
        .eq("patient_id", patientId);

      const caseIds = cases?.map((c) => c.id) ?? [];

      if (caseIds.length > 0) {
        await Promise.all([
          supabase.from("case_events").delete().in("case_id", caseIds),
          supabase.from("measurements").delete().in("case_id", caseIds),
          supabase.from("imaging_summaries").delete().in("case_id", caseIds),
          supabase.from("outcomes").delete().in("case_id", caseIds),
          supabase.from("proms").delete().in("case_id", caseIds),
        ]);
        await supabase.from("cases").delete().eq("patient_id", patientId);
      }

      await supabase.from("consents").delete().eq("patient_id", patientId);
      const { error: delError } = await supabase
        .from("patients")
        .delete()
        .eq("id", patientId);

      if (delError) {
        console.error(`Failed to delete patient ${patientId}:`, delError);
      } else {
        totalDeleted++;
      }
    }

    return new Response(
      JSON.stringify({
        message: `Permanently deleted ${totalDeleted} expired patients`,
        count: totalDeleted,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cleanup error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
