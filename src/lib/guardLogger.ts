/**
 * Dedicated application logger for the protocol-access-guard client flow.
 *
 * Goals:
 *  - Keep request-id correlation visible in DevTools for debugging.
 *  - NEVER use console.error for expected verdicts (401/403). Lovable's
 *    dev runtime-error overlay catches console.error and turns it into
 *    a "blank screen" panic — that ruined UX in prod-preview before.
 *  - Provide a single chokepoint so we can later pipe these events to a
 *    remote sink (Sentry, governance_events, etc.) without touching call
 *    sites.
 *
 * Severity mapping (intentionally NOT using console.error):
 *  - debug → console.debug (granted verdicts, 200s)
 *  - info  → console.info  (expected denials: 401 unauth, 403 forbidden)
 *  - warn  → console.warn  (unexpected failures: 5xx, network, timeouts)
 */

export type GuardLogLevel = "debug" | "info" | "warn";

export interface GuardLogEvent {
  level: GuardLogLevel;
  /** Action attempted, e.g. "protocol.view" or "guard.config.read". */
  action: string;
  /** HTTP status returned by the guard (or 0 for client-side failures). */
  status: number;
  /** Correlation id propagated via the `x-request-id` header. */
  requestId?: string;
  /** Optional human-readable detail. */
  message?: string;
  /** Optional extra context (kept small — no PII, no tokens). */
  context?: Record<string, unknown>;
}

const PREFIX = "[protocol-guard]";

function emit(evt: GuardLogEvent): void {
  const payload = {
    requestId: evt.requestId,
    action: evt.action,
    status: evt.status,
    ...(evt.context ?? {}),
  };
  const msg = evt.message ?? `${evt.action} → ${evt.status}`;

  // eslint-disable-next-line no-console
  switch (evt.level) {
    case "debug":
      console.debug(PREFIX, msg, payload);
      break;
    case "info":
      console.info(PREFIX, msg, payload);
      break;
    case "warn":
      console.warn(PREFIX, msg, payload);
      break;
  }
}

/** Map an HTTP status to the appropriate non-fatal log level. */
export function levelForStatus(status: number): GuardLogLevel {
  if (status >= 200 && status < 300) return "debug";
  if (status === 401 || status === 403) return "info";
  return "warn";
}

export const guardLog = {
  debug: (e: Omit<GuardLogEvent, "level">) => emit({ ...e, level: "debug" }),
  info: (e: Omit<GuardLogEvent, "level">) => emit({ ...e, level: "info" }),
  warn: (e: Omit<GuardLogEvent, "level">) => emit({ ...e, level: "warn" }),
  /** Auto-pick level from HTTP status. */
  auto: (e: Omit<GuardLogEvent, "level">) =>
    emit({ ...e, level: levelForStatus(e.status) }),
};
