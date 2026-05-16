import { Clock, Compass, Scissors, Syringe } from "lucide-react";
import { AOMI_FRAGILE_CASE as CASE } from "@/demo/aomiFragileCase";

const TIMELINE = [
  { t: "00:00", label: "Installation, asepsie, anesthésie locale" },
  { t: "00:10", label: "Ponction fémorale controlatérale, abord crossover" },
  { t: "00:25", label: "Franchissement et angioplastie fémoro-poplitée G" },
  { t: "00:55", label: "Contrôle, stent si dissection résiduelle" },
  { t: "01:15", label: "Fermeture, surveillance, transfert salle de réveil" },
];

export function PlanPanel() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">Procedure Planner</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          ~ {CASE.plan.expectedDurationMin} min
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-lg border border-border/60 p-4 bg-card">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Scissors className="h-3 w-3" /> Geste
          </div>
          <p className="mt-1 text-sm font-semibold">{CASE.plan.procedure}</p>
        </div>
        <div className="rounded-lg border border-border/60 p-4 bg-card">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Compass className="h-3 w-3" /> Abord
          </div>
          <p className="mt-1 text-sm font-semibold">{CASE.plan.access}</p>
        </div>
        <div className="rounded-lg border border-border/60 p-4 bg-card">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Syringe className="h-3 w-3" /> Anesthésie
          </div>
          <p className="mt-1 text-sm font-semibold">{CASE.plan.anaesthesia}</p>
        </div>
        <div className="rounded-lg border border-border/60 p-4 bg-card">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            <Clock className="h-3 w-3" /> Durée estimée
          </div>
          <p className="mt-1 text-sm font-semibold tabular-nums">
            {CASE.plan.expectedDurationMin} min
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-card p-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
          Timeline opératoire
        </p>
        <ol className="space-y-2">
          {TIMELINE.map((step) => (
            <li key={step.t} className="flex items-start gap-3 text-sm">
              <span className="font-mono text-xs text-primary tabular-nums w-12 flex-shrink-0">
                {step.t}
              </span>
              <span className="text-foreground/90">{step.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
