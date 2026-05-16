/**
 * Dedicated application logger for the protocol-access-guard client flow.
 *
 * Goals:
 *  - Keep request-id correlation visible in DevTools for debugging.
 *  - NEVER use console.error for expected verdicts (401/403). Lovable's
 *    dev runtime-error overlay catches console.error and turns it into
 *    a "blank screen" panic — that ruined UX in prod-preview before.
 *  - Provide a single chokepoint so we can pipe these events to an
 *    optional remote sink (Sentry, webhook, governance_events…) without
 *    touching any call site.
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

/** Payload shape forwarded to remote sinks. Strict, PII-safe whitelist. */
export interface GuardSinkPayload {
  ts: string;
  level: GuardLogLevel;
  action: string;
  status: number;
  requestId?: string;
  message?: string;
  /** Sanitized scalars only — no nested objects, no free-form strings. */
  context?: Record<string, string | number | boolean>;
}

export type GuardRemoteSink = (
  payload: GuardSinkPayload,
) => void | Promise<void>;

export interface GuardRemoteSinkConfig {
  sink: GuardRemoteSink;
  /**
   * 0..1 — probability that a given event is forwarded. Defaults to 1.
   * `warn` events are ALWAYS forwarded regardless of sampling: failures
   * are rare and must not be silently dropped.
   */
  sample?: number;
  /** Whitelist of levels to forward. Defaults to all three. */
  levels?: GuardLogLevel[];
}

const PREFIX = "[protocol-guard]";

// ---------------------------------------------------------------------
// Remote sink registry (singleton, opt-in)
// ---------------------------------------------------------------------

let remote: GuardRemoteSinkConfig | null = null;

/** Register a remote sink. Pass `null` to disable. Last-write-wins. */
export function configureGuardRemoteSink(
  config: GuardRemoteSinkConfig | null,
): void {
  remote = config;
}

/** Inspect the active sink config (mostly for tests / diagnostics). */
export function getGuardRemoteSink(): GuardRemoteSinkConfig | null {
  return remote;
}

// ---------------------------------------------------------------------
// PII sanitization
// ---------------------------------------------------------------------

/**
 * Keys we proactively drop from `context` even if the call site passes
 * them — defense in depth against a future regression that would leak
 * auth material into Sentry/webhooks.
 */
const PII_BLOCKLIST = new Set([
  "email",
  "phone",
  "name",
  "first_name",
  "last_name",
  "patient_id",
  "user_id",
  "token",
  "access_token",
  "refresh_token",
  "authorization",
  "auth",
  "session",
  "ip",
  "cookie",
]);

/** Truncate strings to a hard ceiling so a stray stack trace can't bloat the sink. */
function clip(s: string, max = 240): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

/**
 * Reduce `context` to a flat record of scalars only. Drops:
 *  - keys on the PII blocklist
 *  - any value that is not string/number/boolean (objects, arrays, fns)
 *  - undefined / null
 * Strings are length-capped.
 */
function sanitizeContext(
  ctx: Record<string, unknown> | undefined,
): Record<string, string | number | boolean> | undefined {
  if (!ctx) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(ctx)) {
    const key = k.toLowerCase();
    if (PII_BLOCKLIST.has(key)) continue;
    if (typeof v === "string") out[k] = clip(v);
    else if (typeof v === "number" && Number.isFinite(v)) out[k] = v;
    else if (typeof v === "boolean") out[k] = v;
    // everything else is intentionally dropped
  }
  return Object.keys(out).length ? out : undefined;
}

function toSinkPayload(evt: GuardLogEvent): GuardSinkPayload {
  return {
    ts: new Date().toISOString(),
    level: evt.level,
    action: clip(evt.action, 80),
    status: evt.status,
    requestId: evt.requestId ? clip(evt.requestId, 64) : undefined,
    message: evt.message ? clip(evt.message) : undefined,
    context: sanitizeContext(evt.context),
  };
}

function shouldForward(evt: GuardLogEvent, cfg: GuardRemoteSinkConfig): boolean {
  if (cfg.levels && !cfg.levels.includes(evt.level)) return false;
  // warns bypass sampling — operational failures must never be dropped.
  if (evt.level === "warn") return true;
  const rate = typeof cfg.sample === "number" ? cfg.sample : 1;
  if (rate >= 1) return true;
  if (rate <= 0) return false;
  return Math.random() < rate;
}

function forwardToRemote(evt: GuardLogEvent): void {
  const cfg = remote;
  if (!cfg) return;
  if (!shouldForward(evt, cfg)) return;
  try {
    const result = cfg.sink(toSinkPayload(evt));
    // Sink may be async — swallow rejections so a failing sink never
    // surfaces as a runtime-error overlay in dev.
    if (result && typeof (result as Promise<unknown>).catch === "function") {
      (result as Promise<unknown>).catch(() => {
        /* sink failure is non-fatal */
      });
    }
  } catch {
    /* sink failure is non-fatal */
  }
}

// ---------------------------------------------------------------------
// Built-in webhook sink helper
// ---------------------------------------------------------------------

/**
 * Create a fire-and-forget JSON webhook sink. Uses `fetch` with
 * `keepalive` so it survives page-unload. The endpoint receives the
 * sanitized {@link GuardSinkPayload} as the request body.
 *
 * Pair with a CORS-enabled collector (Sentry tunnel, a Supabase edge
 * function, or any logging webhook).
 */
export function createWebhookGuardSink(
  endpoint: string,
  init: { headers?: Record<string, string> } = {},
): GuardRemoteSink {
  return (payload) => {
    try {
      void fetch(endpoint, {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
        body: JSON.stringify(payload),
      }).catch(() => {
        /* network failure — non-fatal */
      });
    } catch {
      /* fetch unavailable (SSR) — non-fatal */
    }
  };
}

// ---------------------------------------------------------------------
// Emit pipeline
// ---------------------------------------------------------------------

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

  forwardToRemote(evt);
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

// Exported for tests
export const __internal = { sanitizeContext, toSinkPayload, shouldForward };
