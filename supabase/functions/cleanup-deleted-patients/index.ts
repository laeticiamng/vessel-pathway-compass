import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    // Find patients soft-deleted more than 30 days ago
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
      // Get case IDs for this patient
      const { data: cases } = await supabase
        .from("cases")
        .select("id")
        .eq("patient_id", patientId);

      const caseIds = cases?.map((c) => c.id) ?? [];

      if (caseIds.length > 0) {
        // Delete all case-related data in parallel
        await Promise.all([
          supabase.from("case_events").delete().in("case_id", caseIds),
          supabase.from("measurements").delete().in("case_id", caseIds),
          supabase.from("imaging_summaries").delete().in("case_id", caseIds),
          supabase.from("outcomes").delete().in("case_id", caseIds),
          supabase.from("proms").delete().in("case_id", caseIds),
        ]);
        await supabase.from("cases").delete().eq("patient_id", patientId);
      }

      // Delete consents and the patient record
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
