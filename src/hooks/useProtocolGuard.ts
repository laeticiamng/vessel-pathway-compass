import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";

export type GuardAction =
  | "protocol.view"
  | "protocol.export.compliance.json"
  | "protocol.export.audit_log.csv"
  | "protocol.export.audit_log.pdf";

interface GuardResult {
  ok: boolean;
  status: number;
  requestId?: string;
  role?: string;
  error?: string;
}

/**
 * Client wrapper around the `protocol-access-guard` edge function.
 *
 * Always returns the server's verdict — the server is the single source
 * of truth for /protocol authorization and writes a tamper-proof
 * governance_events row for every attempt.
 */
export async function callProtocolAccessGuard(
  action: GuardAction,
): Promise<GuardResult> {
  const requestId = globalThis.crypto?.randomUUID?.() ?? `r-${Date.now()}`;
  try {
    const { data, error } = await supabase.functions.invoke(
      "protocol-access-guard",
      {
        body: { action },
        headers: { "x-request-id": requestId },
      },
    );

    if (error) {
      // supabase-js v2: error.context is the underlying Response object.
      // Try to extract the server X-Request-Id and parsed status/body so
      // the UI can show a correlatable toast.
      const ctx = (error as unknown as { context?: Response }).context;
      let status = 500;
      let serverReqId: string | undefined;
      let serverError: string | undefined;
      if (ctx && typeof ctx === "object" && "status" in ctx) {
        status = (ctx as Response).status ?? 500;
        try {
          serverReqId =
            (ctx as Response).headers?.get?.("x-request-id") ?? undefined;
        } catch (_) { /* ignore */ }
        try {
          // Clone before reading — the body may have been consumed.
          const cloned = (ctx as Response).clone?.();
          if (cloned) {
            const body = await cloned.json().catch(() => null);
            serverReqId = serverReqId ?? (body?.request_id as string | undefined);
            serverError = body?.error as string | undefined;
          }
        } catch (_) { /* ignore */ }
      }
      return {
        ok: false,
        status,
        requestId: serverReqId ?? requestId,
        error: serverError ?? String(error.message ?? error),
      };
    }

    return {
      ok: !!data?.ok,
      status: 200,
      requestId: (data?.request_id as string) ?? requestId,
      role: data?.role as string | undefined,
    };
  } catch (e) {
    return { ok: false, status: 500, requestId, error: String((e as Error)?.message ?? e) };
  }
}

/**
 * Hook used by the /protocol page to obtain a server-side verdict for
 * "can this user view the internal audit panels?".
 *
 * - While `loading`, render skeletons (no audit data).
 * - When `verdict === 'denied'`, render nothing — the server already
 *   logged the denial with a request-id.
 */
export function useProtocolViewGuard() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isResearchLead, isLoading: rolesLoading } = useUserRoles();
  const [verdict, setVerdict] = useState<"loading" | "granted" | "denied">(
    "loading",
  );
  const [requestId, setRequestId] = useState<string | undefined>();

  useEffect(() => {
    if (authLoading || rolesLoading) return;
    if (!user) {
      setVerdict("denied");
      return;
    }
    // Client-side fast-path: if the user clearly lacks any allowlisted
    // role, skip the edge call entirely. The server guard remains the
    // source of truth for users who DO have a candidate role; this just
    // avoids a guaranteed 403 (and the console noise / runtime-error
    // overlay it triggers in dev) for every non-admin visitor.
    if (!isAdmin && !isResearchLead) {
      setVerdict("denied");
      return;
    }
    let cancelled = false;
    void callProtocolAccessGuard("protocol.view").then((r) => {
      if (cancelled) return;
      setRequestId(r.requestId);
      setVerdict(r.ok ? "granted" : "denied");
    });
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, rolesLoading, isAdmin, isResearchLead]);

  return {
    verdict,
    requestId,
    loading: verdict === "loading" || authLoading,
    granted: verdict === "granted",
  };
}
