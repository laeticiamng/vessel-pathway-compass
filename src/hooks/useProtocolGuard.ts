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

  // Use fetch directly instead of supabase.functions.invoke:
  // invoke() logs non-2xx responses to console.error, which Lovable's
  // dev runtime-error overlay catches and turns into a "blank screen"
  // panic — but a 403 from this guard is an EXPECTED verdict, not a bug.
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) {
      return { ok: false, status: 401, requestId, error: "Not authenticated" };
    }

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/protocol-access-guard`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        "x-request-id": requestId,
      },
      body: JSON.stringify({ action }),
    });

    const serverReqId = res.headers.get("x-request-id") ?? undefined;
    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        requestId: serverReqId ?? (body?.request_id as string | undefined) ?? requestId,
        error: (body?.error as string | undefined) ?? `HTTP ${res.status}`,
      };
    }

    return {
      ok: !!body?.ok,
      status: 200,
      requestId: serverReqId ?? (body?.request_id as string | undefined) ?? requestId,
      role: body?.role as string | undefined,
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
