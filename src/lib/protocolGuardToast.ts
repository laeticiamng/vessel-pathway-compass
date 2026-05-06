import { toast } from "sonner";
import type { GuardAction } from "@/hooks/useProtocolGuard";

interface DenialOpts {
  status: number;
  requestId?: string;
  error?: string;
  action: GuardAction;
}

/**
 * Shows a destructive toast for a guard denial that surfaces the
 * server-issued X-Request-Id so the user (or auditor) can correlate
 * the client action with a `governance_events` row.
 */
export function showGuardDenialToast(opts: DenialOpts) {
  const reqId = opts.requestId ?? "n/a";
  const httpLabel =
    opts.status === 401
      ? "401 Unauthorized"
      : opts.status === 403
        ? "403 Forbidden"
        : opts.status === 429
          ? "429 Throttled"
          : `HTTP ${opts.status}`;

  toast.error(`Export blocked — ${httpLabel}`, {
    description: `Action: ${opts.action}\nRequest-Id: ${reqId}${opts.error ? `\n${opts.error}` : ""}`,
    duration: 12_000,
    action: {
      label: "Copy Request-Id",
      onClick: () => {
        try {
          void navigator.clipboard?.writeText(reqId);
        } catch (_) { /* ignore */ }
      },
    },
  });
}
