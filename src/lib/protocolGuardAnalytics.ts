/**
 * Lightweight client analytics for the protocol-guard toast surface.
 *
 * Why a dedicated module:
 *  - Lets product measure how often clinicians hit EXPECTED denials
 *    (401/403/429) without spelunking through `governance_events` JSON.
 *  - Tracks engagement with the toast affordances (Copy Request-Id,
 *    View in audit log) so we can iterate on the UX with real data.
 *
 * Sink: `public.log_governance_event` RPC (SECURITY DEFINER) — same
 * audit trail used by every other guard event, so analytics queries
 * can join naturally with the server-side verdict rows via `request_id`.
 *
 * Failure policy: ALWAYS swallow errors. Analytics MUST NOT break the
 * UX — a failing insert here would otherwise bubble into Lovable's dev
 * runtime-error overlay and recreate the very panic the guard toast was
 * built to prevent.
 */
import { supabase } from "@/integrations/supabase/client";

export type GuardToastEvent =
  | "guard_toast.impression"
  | "guard_toast.copy_request_id"
  | "guard_toast.view_audit_clicked";

export interface GuardToastAnalyticsInput {
  action: string;
  status: number;
  requestId?: string;
}

/**
 * Best-effort record of a guard-toast lifecycle event. Never throws,
 * never awaits the network call — returns immediately so the caller
 * (sonner's render path) is not blocked.
 */
export function recordGuardToastEvent(
  event: GuardToastEvent,
  input: GuardToastAnalyticsInput,
): void {
  try {
    // Fire-and-forget. We do NOT await; the toast must render instantly
    // and a slow network must never delay the UI.
    void supabase
      .rpc("log_governance_event", {
        _category: "ui",
        _action: event,
        _severity: "info",
        _context: {
          guard_action: input.action,
          status: input.status,
          // The server already logged the denial under this request_id —
          // including it here gives us a JOIN key between the verdict
          // row and the user-facing impression / click.
          request_id: input.requestId ?? null,
          // Surface for slicing dashboards by expected-vs-unexpected.
          is_expected_denial:
            input.status === 401 ||
            input.status === 403 ||
            input.status === 429,
        },
      })
      .then((res) => {
        // Swallow RPC-level errors silently — analytics must never
        // surface as a runtime error to the user. The Edge function
        // already keeps the authoritative audit trail.
        if (res?.error) {
          /* intentional no-op */
        }
      });
  } catch {
    /* analytics failures are non-fatal — never let them surface */
  }
}
