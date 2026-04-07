import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WINDOW_MS = 60_000;
const MAX_REQ = 20;
const rlMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(uid: string): boolean {
  const now = Date.now();
  const e = rlMap.get(uid);
  if (!e || now > e.resetAt) { rlMap.set(uid, { count: 1, resetAt: now + WINDOW_MS }); return false; }
  return ++e.count > MAX_REQ;
}
setInterval(() => { const now = Date.now(); for (const [k, v] of rlMap) if (now > v.resetAt) rlMap.delete(k); }, 60_000);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    if (isRateLimited(userId)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please wait before trying again." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" },
      });
    }

    const { data: subData } = await svcClient
      .from("subscriptions")
      .select("status, current_period_end")
      .eq("user_id", userId)
      .maybeSingle();

    const hasActiveSubscription = subData?.status === "active"
      && subData?.current_period_end
      && new Date(subData.current_period_end) > new Date();

    if (!hasActiveSubscription) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count } = await svcClient
        .from("ai_outputs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", todayStart.toISOString());

      const FREE_DAILY_LIMIT = 3;
      if ((count ?? 0) >= FREE_DAILY_LIMIT) {
        return new Response(JSON.stringify({
          error: "Daily free AI limit reached. Upgrade to Professional for unlimited access.",
          code: "FREE_LIMIT_REACHED",
        }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { clinicalData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Support both old field names and new ProcedurePlanner field names
    const presentation = clinicalData.clinicalPresentation || clinicalData.symptoms || "Not provided";
    const renalFunction = clinicalData.renalFunction || "Not provided";
    const plannedProcedure = clinicalData.plannedProcedure || "Not provided";
    const priorImaging = clinicalData.priorImaging || clinicalData.imaging || "Not provided";
    const labs = clinicalData.labs || "Not provided";
    const medications = clinicalData.medications || "Not provided";
    const comorbidities = clinicalData.comorbidities || clinicalData.riskFactors || "Not provided";
    const abi = clinicalData.abi || "Not provided";
    const doppler = clinicalData.doppler || "Not provided";
    const preferBioContrast = clinicalData.preferBioContrast === true;

    const systemPrompt = `You are a vascular medicine clinical assistant. Generate a structured clinical report based on the provided patient data.

IMPORTANT RULES:
- You are NOT providing a diagnosis. All outputs require clinician review.
- Use "Citation Placeholder" where guideline references would go — never fabricate citations.
- Always include uncertainty statements.
- Label all suggestions as "Suggested" not "Recommended".
${preferBioContrast ? "- The clinician has indicated a preference for bio-based contrast agents (BBCA). When discussing contrast protocols, prioritize non-gadolinium alternatives and eco-friendly approaches." : ""}

Generate the following sections:
1. Structured Note (Subjective, Objective, Assessment, Plan)
2. Differential Diagnosis + Red Flags
3. Suggested Care Pathway (with citation placeholders)
4. Patient-Friendly Summary
5. Follow-up Plan & Monitoring Checklist

Format with clear markdown headers.`;

    const userMessage = `Clinical Data:
- Clinical Presentation: ${presentation}
- Renal Function (eGFR/Creatinine): ${renalFunction}
- Planned Procedure: ${plannedProcedure}
- Prior Imaging: ${priorImaging}
- ABI/IPS: ${abi}
- Doppler Summary: ${doppler}
- Labs: ${labs}
- Current Medications: ${medications}
- Comorbidities / Risk Factors: ${comorbidities}

Generate the structured clinical report.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits required. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    svcClient.from("audit_logs").insert({
      user_id: userId,
      action: "ai_query",
      entity_type: "ai_output",
      details: { model: "google/gemini-3-flash-preview", premium: hasActiveSubscription, timestamp: new Date().toISOString() },
    }).then(() => {});

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
