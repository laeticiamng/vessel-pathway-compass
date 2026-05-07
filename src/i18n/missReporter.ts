import { supabase } from "@/integrations/supabase/client";
import { APP_VERSION } from "@/lib/appVersion";
import type { Language } from "./context";

type Pending = {
  locale: Language;
  key: string;
  route: string;
  role: string | null;
  reason: "missing" | "shape-mismatch";
};

// Per-key dedupe within session (avoid spamming).
const seen = new Set<string>();
let buffer: Pending[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let currentRole: string | null = null;

export function setI18nReporterRole(role: string | null) {
  currentRole = role;
}

function scheduleFlush() {
  if (flushTimer != null) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flush();
  }, 4000);
}

async function flush() {
  if (buffer.length === 0) return;
  const entries = buffer.splice(0, buffer.length).map((p) => ({
    locale: p.locale,
    key: p.key,
    route: p.route || null,
    role: p.role,
    reason: p.reason,
    app_version: APP_VERSION,
  }));
  try {
    // Anonymous callers will fail JWT validation server-side (401) — silently skip.
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.functions.invoke("i18n-record-miss", { body: { entries } });
  } catch {
    // best-effort telemetry — never throw from t()
  }
}

export function reportI18nMiss(p: Omit<Pending, "role" | "route"> & { route?: string }) {
  // Disable on dev: avoid noise while authoring; only ship in prod.
  const isProd =
    typeof import.meta !== "undefined" &&
    (import.meta as { env?: { PROD?: boolean } }).env?.PROD === true;
  if (!isProd) return;

  const route =
    p.route ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const dedupe = `${p.locale}|${p.key}|${route}|${currentRole ?? ""}|${p.reason}`;
  if (seen.has(dedupe)) return;
  seen.add(dedupe);

  buffer.push({ locale: p.locale, key: p.key, route, role: currentRole, reason: p.reason });
  if (buffer.length >= 25) {
    if (flushTimer) { clearTimeout(flushTimer); flushTimer = null; }
    void flush();
  } else {
    scheduleFlush();
  }
}
