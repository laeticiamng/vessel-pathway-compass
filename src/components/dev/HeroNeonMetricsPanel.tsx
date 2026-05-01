import { useEffect, useState } from "react";
import {
  getHeroNeonEvents,
  subscribeHeroNeonEvents,
  startGpuFrameProbe,
  observeHeroNeonLcp,
  clearHeroNeonEvents,
  type HeroNeonEvent,
} from "@/lib/heroNeonMetrics";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  /** When true, render inline (no fixed positioning). */
  inline?: boolean;
}

/**
 * Floating debug chip that shows live hero-neon performance numbers.
 *
 * Activates a 1s GPU frame probe on mount and an LCP observer that
 * captures any largest-contentful-paint entries whose element is a
 * hero-neon. Aggregates results by device tag (mobile vs desktop).
 */
export function HeroNeonMetricsPanel({ inline = false }: Props) {
  const [events, setEvents] = useState<HeroNeonEvent[]>(() => getHeroNeonEvents());
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const unsubLcp = observeHeroNeonLcp();
    const stopProbe = startGpuFrameProbe(1200);
    const unsub = subscribeHeroNeonEvents(setEvents);
    return () => {
      unsubLcp();
      stopProbe();
      unsub();
    };
  }, []);

  const summary = aggregate(events);

  const Wrapper = inline ? "div" : (Card as unknown as "div");
  const wrapperClass = inline
    ? "w-full"
    : "fixed bottom-4 right-4 z-[9999] w-80 max-w-[calc(100vw-2rem)] p-3 shadow-2xl";

  return (
    <Wrapper className={wrapperClass}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Hero-neon metrics
        </h3>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={() => clearHeroNeonEvents()}
          >
            Reset
          </Button>
          {!inline && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? "Hide" : "Show"}
            </Button>
          )}
        </div>
      </div>
      {(open || inline) && (
        <div className="space-y-2 text-xs">
          {(["mobile", "desktop"] as const).map((dev) => (
            <div key={dev} className="rounded-md border border-border/40 p-2">
              <div className="font-semibold mb-1 capitalize">{dev}</div>
              <Row label="LCP (avg)" value={summary[dev].lcp} unit="ms" />
              <Row
                label="Frame Δ (avg)"
                value={summary[dev].frame}
                unit="ms"
                hint={summary[dev].frame && summary[dev].frame! > 18 ? "⚠︎ jank" : "ok"}
              />
              <Row
                label="Skeleton → active"
                value={summary[dev].skeleton}
                unit="ms"
              />
              <div className="text-[10px] text-muted-foreground mt-1">
                {summary[dev].count} events
              </div>
            </div>
          ))}
        </div>
      )}
    </Wrapper>
  );
}

function Row({
  label,
  value,
  unit,
  hint,
}: {
  label: string;
  value: number | null;
  unit: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">
        {value === null ? "—" : `${value.toFixed(1)} ${unit}`}
        {hint && (
          <span className="ml-1 text-[10px] text-muted-foreground">{hint}</span>
        )}
      </span>
    </div>
  );
}

function aggregate(events: HeroNeonEvent[]) {
  const out = {
    mobile: { lcp: null as number | null, frame: null as number | null, skeleton: null as number | null, count: 0 },
    desktop: { lcp: null as number | null, frame: null as number | null, skeleton: null as number | null, count: 0 },
  };
  const buckets = {
    mobile: { lcp: [] as number[], frame: [] as number[], skeleton: [] as number[] },
    desktop: { lcp: [] as number[], frame: [] as number[], skeleton: [] as number[] },
  };
  for (const e of events) {
    out[e.device].count++;
    if (e.kind === "lcp") buckets[e.device].lcp.push(e.value);
    if (e.kind === "gpu-frame-avg") buckets[e.device].frame.push(e.value);
    if (e.kind === "skeleton-to-active") buckets[e.device].skeleton.push(e.value);
  }
  for (const dev of ["mobile", "desktop"] as const) {
    const avg = (arr: number[]) =>
      arr.length === 0 ? null : arr.reduce((a, b) => a + b, 0) / arr.length;
    out[dev].lcp = avg(buckets[dev].lcp);
    out[dev].frame = avg(buckets[dev].frame);
    out[dev].skeleton = avg(buckets[dev].skeleton);
  }
  return out;
}
