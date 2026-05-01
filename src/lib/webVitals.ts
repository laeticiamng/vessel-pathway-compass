import { onCLS, onLCP, onINP, onFCP, onTTFB, type Metric } from "web-vitals";
import { supabase } from "@/integrations/supabase/client";

const SAMPLE_RATE = 1; // 100% for now (low-traffic beta). Drop to 0.25 at scale.
const APP_VERSION = (import.meta.env.VITE_APP_VERSION as string | undefined) ?? "beta";

type Queued = {
  metric: Metric["name"];
  value: number;
  rating: Metric["rating"];
  navigation_type: Metric["navigationType"];
  path: string;
  session_id: string;
  connection_type: string | null;
  user_agent: string;
  app_version: string;
};

const sessionId = (() => {
  try {
    const k = "wv_sid";
    const existing = sessionStorage.getItem(k);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(k, id);
    return id;
  } catch {
    return Math.random().toString(36).slice(2);
  }
})();

const getConnection = (): string | null => {
  const c = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
  return c?.effectiveType ?? null;
};

const queue: Queued[] = [];
let flushTimer: number | null = null;

const flush = async () => {
  if (queue.length === 0) return;
  const batch = queue.splice(0, queue.length);
  const { error } = await supabase.from("web_vitals").insert(batch);
  if (error && import.meta.env.DEV) {
    console.warn("[web-vitals] insert failed:", error.message);
  }
};

const scheduleFlush = () => {
  if (flushTimer !== null) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    void flush();
  }, 2000);
};

const handle = (metric: Metric) => {
  if (Math.random() > SAMPLE_RATE) return;
  queue.push({
    metric: metric.name,
    value: Math.round(metric.value * 1000) / 1000,
    rating: metric.rating,
    navigation_type: metric.navigationType,
    path: window.location.pathname || "/",
    session_id: sessionId,
    connection_type: getConnection(),
    user_agent: navigator.userAgent.slice(0, 240),
    app_version: APP_VERSION,
  });
  scheduleFlush();
};

let started = false;
export function startWebVitalsTracking() {
  if (started) return;
  started = true;

  // Skip in non-production previews to avoid skewing data, but allow override.
  const isProd = window.location.hostname.endsWith("lovable.app") || window.location.hostname === "aquamr-flow.com";
  if (!isProd && !import.meta.env.VITE_TRACK_WEB_VITALS) return;

  onLCP(handle);
  onCLS(handle);
  onINP(handle);
  onFCP(handle);
  onTTFB(handle);

  // Final flush on page hide / unload
  const finalFlush = () => {
    if (queue.length === 0) return;
    const batch = queue.splice(0, queue.length);
    // Fire-and-forget; ignore network failures during unload
    void supabase.from("web_vitals").insert(batch);
  };
  window.addEventListener("pagehide", finalFlush);
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") finalFlush();
  });
}
