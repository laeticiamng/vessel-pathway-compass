import { Clock, Compass, Scissors, Syringe } from "lucide-react";
import { AOMI_FRAGILE_CASE, type DemoCase } from "@/demo/aomiFragileCase";

export function PlanPanel({ case: c = AOMI_FRAGILE_CASE }: { case?: DemoCase } = {}) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">Procedure Planner</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          ~ {c.plan.expectedDurationMin} min
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border/60 p-4 bg-card">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Scissors className="h-3 w-3" /> Geste
          </div>
          <p className="mt-1 text-sm font-semibold">{c.plan.procedure}</p>
        </div>
        <div className="rounded-lg border border-border/60 p-4 bg-card">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Compass className="h-3 w-3" /> Abord
          </div>
          <p className="mt-1 text-sm font-semibold">{c.plan.access}</p>
        </div>
        <div className="rounded-lg border border-border/60 p-4 bg-card">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Syringe className="h-3 w-3" /> Anesthésie
          </div>
          <p className="mt-1 text-sm font-semibold">{c.plan.anaesthesia}</p>
        </div>
        <div className="rounded-lg border border-border/60 p-4 bg-card">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Clock className="h-3 w-3" /> Durée estimée
          </div>
          <p className="mt-1 text-sm font-semibold tabular-nums">
            {c.plan.expectedDurationMin} min
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-card p-4 text-xs text-muted-foreground">
        Timeline opératoire indicative — adaptée au profil de fragilité et à l'abord choisi.
      </div>
    </div>
  );
}
