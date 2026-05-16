import { TrendingUp } from "lucide-react";
import { AOMI_FRAGILE_CASE as CASE } from "@/demo/aomiFragileCase";

const MAX_SCORE = 24;

function bar(value: number) {
  return Math.round((value / MAX_SCORE) * 100);
}

export function PromsPanel() {
  const points = [
    { label: "Baseline", value: CASE.proms.baseline, color: "hsl(var(--muted-foreground))" },
    { label: "M3", value: CASE.proms.m3, color: "hsl(var(--primary))" },
    { label: "M6", value: CASE.proms.m6, color: "hsl(142 70% 45%)" },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">Registry · PROMs longitudinaux</h2>
        <span className="text-xs text-muted-foreground">{CASE.proms.tool}</span>
      </div>

      <div className="rounded-lg border border-border/60 bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-semibold">
            Qualité de vie : {CASE.proms.baseline} → {CASE.proms.m6}{" "}
            <span className="text-muted-foreground font-normal">/ {MAX_SCORE}</span>
          </span>
          <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
            +{CASE.proms.m6 - CASE.proms.baseline} pts
          </span>
        </div>

        <div className="space-y-3">
          {points.map((p) => (
            <div key={p.label}>
              <div className="flex items-baseline justify-between text-xs mb-1">
                <span className="font-medium">{p.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  {p.value} / {MAX_SCORE}
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${bar(p.value)}%`, backgroundColor: p.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded border border-border/60 p-3">
          <p className="text-[10px] uppercase text-muted-foreground">Δ M3</p>
          <p className="text-lg font-semibold tabular-nums text-primary">
            +{CASE.proms.m3 - CASE.proms.baseline}
          </p>
        </div>
        <div className="rounded border border-border/60 p-3">
          <p className="text-[10px] uppercase text-muted-foreground">Δ M6</p>
          <p className="text-lg font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            +{CASE.proms.m6 - CASE.proms.baseline}
          </p>
        </div>
        <div className="rounded border border-border/60 p-3">
          <p className="text-[10px] uppercase text-muted-foreground">MCID atteint</p>
          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">Oui</p>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground italic">
        VascuQoL-6 (English, validated) — score 6 = pire, 24 = meilleur. MCID ≈ 3 points.
      </p>
    </div>
  );
}
