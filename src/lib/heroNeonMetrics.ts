/**
 * Hero-neon performance metrics.
 *
 * Captures three signals:
 *   1. **LCP** — when the headline element is the LargestContentfulPaint
 *      target on the route, we tag it.
 *   2. **GPU cost proxy** — average frame duration during the 1s window
 *      after activation, measured via requestAnimationFrame deltas.
 *      (Browsers don't expose a real GPU timing API; this is the standard
 *      proxy used by Web Vitals tooling.)
 *   3. **Skeleton→active latency** — wall time between component mount
 *      and the first paint after the IntersectionObserver activates it.
 *
 * Each event is tagged with `device = mobile|desktop` (pointer media
 * query). In production, events are forwarded to the existing webVitals
 * pipeline so they appear on the WebVitalsAdmin page.
 */

export type HeroNeonEventKind =
  | "lcp"
  | "gpu-frame-avg"
  | "skeleton-to-active";

export interface HeroNeonEvent {
  kind: HeroNeonEventKind;
  value: number; // ms
  device: "mobile" | "desktop";
  timestamp: number;
}

const STORAGE_KEY = "hero-neon-metrics";
const MAX_EVENTS = 50;

function detectDevice(): "mobile" | "desktop" {
  if (typeof window === "undefined" || !window.matchMedia) return "desktop";
  return window.matchMedia("(pointer: coarse)").matches ? "mobile" : "desktop";
}

function readStore(): HeroNeonEvent[] {
  if (typeof sessionStorage === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HeroNeonEvent[]) : [];
  } catch {
    return [];
  }
}

function writeStore(events: HeroNeonEvent[]) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    /* quota — ignore */
  }
}

const listeners = new Set<(events: HeroNeonEvent[]) => void>();

export function recordHeroNeonEvent(input: {
  kind: HeroNeonEventKind;
  value: number;
}) {
  const event: HeroNeonEvent = {
    ...input,
    device: detectDevice(),
    timestamp: Date.now(),
  };
  const next = [...readStore(), event];
  writeStore(next);

  if (typeof console !== "undefined" && import.meta.env?.DEV) {
    console.info(
      `[hero-neon] ${event.kind}=${event.value.toFixed(1)}ms (${event.device})`,
    );
  }
  listeners.forEach((cb) => cb(next));
}

export function getHeroNeonEvents(): HeroNeonEvent[] {
  return readStore();
}

export function clearHeroNeonEvents() {
  writeStore([]);
  listeners.forEach((cb) => cb([]));
}

export function subscribeHeroNeonEvents(
  cb: (events: HeroNeonEvent[]) => void,
): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/**
 * Start watching frame durations for the next `windowMs` and record the
 * average as a GPU cost proxy. Returns a cleanup function.
 */
export function startGpuFrameProbe(windowMs = 1000): () => void {
  if (typeof requestAnimationFrame === "undefined") return () => {};
  let last = performance.now();
  const samples: number[] = [];
  let stopped = false;

  const tick = (now: number) => {
    if (stopped) return;
    const delta = now - last;
    last = now;
    samples.push(delta);
    if (now - performance.now() + windowMs > 0 && samples.length < 240) {
      requestAnimationFrame(tick);
    }
  };
  requestAnimationFrame(tick);

  const timer = window.setTimeout(() => {
    stopped = true;
    if (samples.length === 0) return;
    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    recordHeroNeonEvent({ kind: "gpu-frame-avg", value: avg });
  }, windowMs);

  return () => {
    stopped = true;
    window.clearTimeout(timer);
  };
}

/**
 * Observe LCP entries and record them when the LCP element is a hero-neon.
 * Safe no-op on browsers without PerformanceObserver / LCP support.
 */
export function observeHeroNeonLcp(): () => void {
  if (typeof PerformanceObserver === "undefined") return () => {};
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // LCP entries expose `element` on supporting browsers
        const el = (entry as PerformanceEntry & { element?: Element }).element;
        if (el && el.closest?.("[data-hero-neon]")) {
          recordHeroNeonEvent({ kind: "lcp", value: entry.startTime });
        }
      }
    });
    observer.observe({ type: "largest-contentful-paint", buffered: true });
    return () => observer.disconnect();
  } catch {
    return () => {};
  }
}
