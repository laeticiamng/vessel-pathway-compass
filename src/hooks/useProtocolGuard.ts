import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  try {
    const requestId = (globalThis.crypto?.randomUUID?.() ?? `r-${Date.now()}`);
    const { data, error } = await supabase.functions.invoke(
      "protocol-access-guard",
      {
        body: { action },
        headers: { "x-request-id": requestId },
      },
    );

    // supabase-js v2 surfaces non-2xx as `error` with FunctionsHttpError.
    if (error) {
      // Extract status when possible
      const status = (error as unknown as { context?: { status?: number } })
        .context?.status ?? 500;
      return { ok: false, status, requestId, error: String(error.message ?? error) };
    }

    return {
      ok: !!data?.ok,
      status: 200,
      requestId: (data?.request_id as string) ?? requestId,
      role: data?.role as string | undefined,
    };
  } catch (e) {
    return { ok: false, status: 500, error: String((e as Error)?.message ?? e) };
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
  const [verdict, setVerdict] = useState<"loading" | "granted" | "denied">(
    "loading",
  );
  const [requestId, setRequestId] = useState<string | undefined>();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
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
  }, [user, authLoading]);

  return {
    verdict,
    requestId,
    loading: verdict === "loading" || authLoading,
    granted: verdict === "granted",
  };
}
