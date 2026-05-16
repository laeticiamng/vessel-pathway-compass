/**
 * Centralized configuration for the protocol-guard toast helper.
 *
 * Why a dedicated module:
 *  - Different environments need different UX. Dev wants verbose
 *    server-error details for debugging; prod / e2e want a terse,
 *    user-friendly notice. Tests want toasts disabled outright.
 *  - Without a single source of truth, every consumer would have to
 *    pass per-call overrides — brittle and easy to drift.
 *
 * Resolution order (highest precedence first):
 *  1. Runtime override via {@link configureGuardToast} (last-write-wins).
 *  2. Build-time Vite env vars (`VITE_GUARD_TOAST_*`).
 *  3. Hard defaults (toasts on, 12s, details shown).
 *
 * IMPORTANT: this module owns ONLY presentation policy. It must NOT
 * decide whether a status is an expected denial — that's
 * `isExpectedDenial` in `protocolGuardToast.ts`.
 */

export interface GuardToastConfig {
  /** Master switch — disable to silence ALL guard toasts (e.g. in e2e). */
  enabled: boolean;
  /** Auto-dismiss duration in milliseconds. */
  duration: number;
  /**
   * When false, the server's `error` string is hidden from the toast
   * description. Useful for production locales where raw backend
   * messages would leak implementation details to end users.
   */
  showErrorDetails: boolean;
}

const DEFAULTS: GuardToastConfig = {
  enabled: true,
  duration: 12_000,
  showErrorDetails: true,
};

/**
 * Read Vite env vars at module-evaluation time. Wrapped in try/catch
 * because non-Vite test runners may not expose `import.meta.env`.
 */
function readEnvOverrides(): Partial<GuardToastConfig> {
  try {
    const env = (import.meta as { env?: Record<string, string | undefined> })
      .env ?? {};
    const out: Partial<GuardToastConfig> = {};
    if (env.VITE_GUARD_TOAST_ENABLED !== undefined) {
      out.enabled = env.VITE_GUARD_TOAST_ENABLED !== "false";
    }
    if (env.VITE_GUARD_TOAST_DURATION !== undefined) {
      const n = Number(env.VITE_GUARD_TOAST_DURATION);
      if (Number.isFinite(n) && n > 0) out.duration = n;
    }
    if (env.VITE_GUARD_TOAST_DETAILS !== undefined) {
      out.showErrorDetails = env.VITE_GUARD_TOAST_DETAILS !== "false";
    }
    return out;
  } catch {
    return {};
  }
}

let active: GuardToastConfig = { ...DEFAULTS, ...readEnvOverrides() };

/** Return the currently active configuration (cloned — safe to mutate). */
export function getGuardToastConfig(): GuardToastConfig {
  return { ...active };
}

/**
 * Override the active config. Pass a partial; unspecified fields keep
 * their current values. Pass no argument or `null` to reset to defaults
 * (used by tests via {@link __resetGuardToastConfig}).
 */
export function configureGuardToast(
  patch: Partial<GuardToastConfig>,
): GuardToastConfig {
  active = { ...active, ...patch };
  return { ...active };
}

/** Test-only: restore the env-resolved baseline. */
export function __resetGuardToastConfig(): void {
  active = { ...DEFAULTS, ...readEnvOverrides() };
}
