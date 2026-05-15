// P2 — RSVP Resource Stratification Engine
// Persists rsvp_stratifications and exposes recommendations across L1/L2/L3.
// JWT enforced (verify_jwt=true), role checks, esm.sh imports.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const InputsSchema = z.object({
  requested_level: z.enum(["L1", "L2", "L3"]).default("L2"),
  low_resource_mode: z.boolean().default(false),
  lmic_context: z.boolean().default(false),
  urgent: z.boolean().default(false),
  iodine_contraindicated: z.boolean().default(false),
  gadolinium_contraindicated: z.boolean().default(false),
  radiation_contraindicated: z.boolean().default(false),
  l1l2_insufficient: z.boolean().default(false),
});

const BodySchema = z.object({
  case_id: z.string().uuid().optional().nullable(),
  inputs: InputsSchema,
});

const ALLOWED_ROLES = new Set([
  "physician",
  "expert_reviewer",
  "admin",
  "super_admin",
  "hospital_admin",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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
  const adminClient = createClient(supabaseUrl, supabaseService);

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

  const { data: roles, error: rolesError } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (rolesError) {
    return new Response(JSON.stringify({ error: "Role lookup failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const hasRole = (roles ?? []).some((r) => ALLOWED_ROLES.has(r.role));
  if (!hasRole) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
      const caseId = url.searchParams.get("case_id");
      let query = userClient
        .from("rsvp_stratifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (caseId) {
        if (!/^[0-9a-f-]{36}$/i.test(caseId)) {
          return new Response(JSON.stringify({ error: "Invalid case_id" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        query = query.eq("case_id", caseId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return new Response(JSON.stringify({ stratifications: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const raw = await req.json();
      const parsed = BodySchema.safeParse(raw);
      if (!parsed.success) {
        return new Response(
          JSON.stringify({ error: parsed.error.flatten() }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const { case_id, inputs } = parsed.data;

      const { data: rec, error: rpcError } = await userClient.rpc(
        "compute_rsvp_recommendation",
        { _inputs: inputs },
      );
      if (rpcError) throw rpcError;

      let institutionId: string | null = null;
      if (case_id) {
        const { data: caseRow } = await adminClient
          .from("cases")
          .select("institution_id")
          .eq("id", case_id)
          .maybeSingle();
        institutionId = caseRow?.institution_id ?? null;
      }

      const { data: inserted, error: insertError } = await userClient
        .from("rsvp_stratifications")
        .insert({
          case_id: case_id ?? null,
          created_by: userId,
          institution_id: institutionId,
          requested_level: inputs.requested_level,
          recommended_level: rec.recommended_level,
          inputs,
          bands: rec.bands,
          rationale: rec.rationale,
        })
        .select()
        .single();
      if (insertError) throw insertError;

      await adminClient.rpc("log_governance_event", {
        _category: "rsvp",
        _action: "stratification.created",
        _severity: "info",
        _target_entity_type: "rsvp_stratification",
        _target_entity_id: inserted.id,
        _institution_id: institutionId,
        _context: {
          recommended_level: rec.recommended_level,
          requested_level: inputs.requested_level,
        },
      });

      return new Response(
        JSON.stringify({ stratification: inserted, recommendation: rec }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
