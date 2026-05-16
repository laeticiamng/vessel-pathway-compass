import { toast } from "sonner";
import { getGuardToastConfig } from "@/lib/protocolGuardToastConfig";
import { recordGuardToastEvent } from "@/lib/protocolGuardAnalytics";

export {
  configureGuardToast,
  getGuardToastConfig,
  __resetGuardToastConfig,
  type GuardToastConfig,
} from "@/lib/protocolGuardToastConfig";

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
 * Build the sonner `id` for a guard toast.
 *
 * Keyed on **action + status** so that:
 *  - rapid retries of the SAME action+status REPLACE the live toast
 *    (sonner's built-in id-based replacement),
 *  - DIFFERENT actions get DIFFERENT ids → independent notifications
 *    that can coexist (e.g. a 403 on "protocol.view" and a 429 on
 *    "protocol.export.audit_log.csv" must not clobber each other).
 * Exported so tests + call sites can reason about dedup behavior.
 */
export function guardToastId(action: string, status: number): string {
  return `guard:${action}:${status}`;
}

/**
 * Per-action memory of the LAST toast we showed for a given action.
 * Lets us dismiss a stale 403 toast when a 429 then arrives for the
 * SAME action — otherwise the user would see two stacked toasts for a
 * single failing flow. Different actions keep their own slot.
 */
const lastIdByAction = new Map<string, string>();

/**
 * Shows a controlled, deduplicated toast for an EXPECTED guard denial.
 *
 * Dedup contract:
 *  - Same `action` + same `status` → REPLACE the existing toast in place
 *    (no stacking on rapid retries).
 *  - Same `action` + DIFFERENT `status` → DISMISS the previous toast and
 *    show the new one (the latest verdict supersedes the prior one).
 *  - Different `action` → independent toast, coexists with others.
 *
 * Why centralized:
 *  - A 403 from `protocol-access-guard` is a normal server verdict, not a
 *    runtime exception. Routing every denial through this helper keeps
 *    them out of `console.error` (which Lovable's dev overlay would
 *    otherwise turn into a "blank screen" panic).
 *  - Surfacing the server-issued `x-request-id` lets the user / auditor
 *    correlate the click with a `governance_events` row.
 */
export function showGuardDenialToast(opts: DenialOpts) {
  const cfg = getGuardToastConfig();
  // Master kill-switch — environments that route guard verdicts through
  // a different surface (e.g. e2e test runners, embedded views) can
  // disable the toast entirely without touching call sites.
  if (!cfg.enabled) return;

  const reqId = opts.requestId ?? "n/a";
  const httpLabel = labelForStatus(opts.status);
  const nextId = guardToastId(opts.action, opts.status);

  // If we already had a toast for this action under a DIFFERENT status,
  // dismiss it first so we never end up with two stacked notifications
  // for the same logical flow.
  const prevId = lastIdByAction.get(opts.action);
  if (prevId && prevId !== nextId) {
    toast.dismiss(prevId);
  }
  lastIdByAction.set(opts.action, nextId);

  // Raw server error strings can leak internals — suppress them when
  // the active config asks for a terse description.
  const detailLine = cfg.showErrorDetails && opts.error ? `\n${opts.error}` : "";

  toast.error(`Access blocked — ${httpLabel}`, {
    id: nextId,
    description: `Action: ${opts.action}\nRequest-Id: ${reqId}${detailLine}`,
    duration: cfg.duration,
    onDismiss: () => {
      // Free the slot once sonner unmounts the toast, otherwise a future
      // verdict for the same action would try to dismiss a stale id.
      if (lastIdByAction.get(opts.action) === nextId) {
        lastIdByAction.delete(opts.action);
      }
    },
    onAutoClose: () => {
      if (lastIdByAction.get(opts.action) === nextId) {
        lastIdByAction.delete(opts.action);
      }
    },
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
    // Secondary affordance: open the audit log already filtered by this
    // request-id so an admin can pivot from "I just hit a wall" to "here
    // is the corresponding governance_events row" in one click.
    // Suppressed when we have no real id to filter on.
    cancel: opts.requestId
      ? {
          label: "View in audit log",
          onClick: () => {
            try {
              const url = auditLogUrlForRequestId(opts.requestId!);
              window.open(url, "_blank", "noopener,noreferrer");
            } catch {
              /* navigation unavailable — silent */
            }
          },
        }
      : undefined,
  });
}

/**
 * Build the in-app URL that deep-links the protocol audit admin to the
 * row(s) matching a given `x-request-id`. Exported so the inline error
 * block and other surfaces can reuse the exact same contract.
 */
export function auditLogUrlForRequestId(requestId: string): string {
  return `/app/admin/protocol-audit?request_id=${encodeURIComponent(requestId)}`;
}

/**
 * Test/debug hook: reset the per-action dedup memory. Call from
 * `beforeEach` in tests so prior runs do not leak state.
 */
export function __resetGuardToastDedup() {
  lastIdByAction.clear();
}

/** Statuses for which we should surface a toast to the user. */
export function isExpectedDenial(status: number): boolean {
  return status === 401 || status === 403 || status === 429;
}
