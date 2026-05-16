import { toast } from "sonner";

interface DenialOpts {
  status: number;
  requestId?: string;
  error?: string;
  /** Free-form action label, e.g. "protocol.view" or "guard.config.read". */
  action: string;
}

function labelForStatus(status: number): string {
  switch (status) {
    case 401:
      return "401 Unauthorized";
    case 403:
      return "403 Forbidden";
    case 429:
      return "429 Throttled";
    default:
      return `HTTP ${status}`;
  }
}

/**
 * Shows a controlled, deduplicated toast for an EXPECTED guard denial.
 *
 * Why centralized:
 *  - A 403 from `protocol-access-guard` is a normal server verdict, not a
 *    runtime exception. Routing every denial through this helper keeps
 *    them out of `console.error` (which Lovable's dev overlay would
 *    otherwise turn into a "blank screen" panic).
 *  - The stable `id` (action + status) makes sonner REPLACE the existing
 *    toast on rapid retries instead of stacking them.
 *  - Surfacing the server-issued `x-request-id` lets the user / auditor
 *    correlate the click with a `governance_events` row.
 */
export function showGuardDenialToast(opts: DenialOpts) {
  const reqId = opts.requestId ?? "n/a";
  const httpLabel = labelForStatus(opts.status);

  toast.error(`Access blocked — ${httpLabel}`, {
    id: `guard:${opts.action}:${opts.status}`,
    description:
      `Action: ${opts.action}\nRequest-Id: ${reqId}` +
      (opts.error ? `\n${opts.error}` : ""),
    duration: 12_000,
    action: {
      label: "Copy Request-Id",
      onClick: () => {
        try {
          void navigator.clipboard?.writeText(reqId);
        } catch {
          /* clipboard unavailable — silent */
        }
      },
    },
  });
}

/** Statuses for which we should surface a toast to the user. */
export function isExpectedDenial(status: number): boolean {
  return status === 401 || status === 403 || status === 429;
}
