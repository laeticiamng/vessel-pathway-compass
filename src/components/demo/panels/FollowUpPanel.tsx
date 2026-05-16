import { AlertTriangle, Footprints, Repeat, TrendingUp } from "lucide-react";
import { AOMI_FRAGILE_CASE, type DemoCase } from "@/demo/aomiFragileCase";
import { cn } from "@/lib/utils";

const MAX = 24;

export function FollowUpPanel({ case: c = AOMI_FRAGILE_CASE }: { case?: DemoCase } = {}) {
  const fu = c.longitudinalFollowUp ?? [];

  if (fu.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Aucun suivi longitudinal défini pour ce cas.
      </div>
    );
  }

  // Sparkline VascuQoL-6 (baseline + each milestone)
  const series = [
    { x: "Base", y: c.proms.baseline },
    ...fu.map((p) => ({ x: p.milestone, y: p.vascuQoL6 })),
  ];
  const W = 320;
  const H = 80;
  const pad = 8;
  const stepX = (W - pad * 2) / (series.length - 1);
  const points = series
    .map((s, i) => {
      const x = pad + i * stepX;
      const y = H - pad - ((s.y / MAX) * (H - pad * 2));
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">Suivi longitudinal · M1 → M12</h2>
        <span className="text-xs text-muted-foreground">{c.proms.tool}</span>
      </div>

      {/* Sparkline */}
      <div className="rounded-lg border border-border/60 bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold">Évolution VascuQoL-6 / 24</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20" aria-label="Évolution VascuQoL-6">
          <polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            points={points}
          />
          {series.map((s, i) => {
            const x = pad + i * stepX;
            const y = H - pad - ((s.y / MAX) * (H - pad * 2));
            return (
              <g key={s.x}>
                <circle cx={x} cy={y} r="3" fill="hsl(var(--primary))" />
                <text
                  x={x}
                  y={H - 1}
                  textAnchor="middle"
                  fontSize="8"
                  fill="hsl(var(--muted-foreground))"
                >
                  {s.x}
                </text>
                <text
                  x={x}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize="8"
                  fill="hsl(var(--foreground))"
                  fontFamily="ui-monospace"
                >
                  {s.y}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Timeline */}
      <ol className="space-y-3">
        {fu.map((m) => (
          <li
            key={m.milestone}
            className={cn(
              "rounded-lg border p-4",
              m.reintervention
                ? "border-destructive/40 bg-destructive/5"
                : "border-border/60 bg-card",
            )}
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold tabular-nums text-primary">{m.milestone}</span>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  QoL {m.vascuQoL6}/{MAX}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Footprints className="h-3 w-3" />
                  {m.walkingDistanceMeters} m
                </span>
                {m.reintervention && (
                  <span className="inline-flex items-center gap-1 text-destructive font-semibold">
                    <Repeat className="h-3 w-3" />
                    Ré-intervention
                  </span>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm text-foreground/90">{m.event}</p>
          </li>
        ))}
      </ol>

      <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-amber-900 dark:text-amber-200">
          Données simulées à but pédagogique. Les jalons M3, M6 et M12 du registre VASCU-LINK sont
          prospectifs (collecte en cours dans le cadre de l'étude L1).
        </p>
      </div>
    </div>
  );
}
