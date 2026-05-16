import { CheckCircle2, Info, XCircle } from "lucide-react";
import { AOMI_FRAGILE_CASE, type DemoCase } from "@/demo/aomiFragileCase";

export function DecisionPanel({ case: c = AOMI_FRAGILE_CASE }: { case?: DemoCase } = {}) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Decision Board · arbitrage L1 / L2 / L3</h2>
        <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
          Niveau {c.decision.committeeLevel}
        </span>
      </div>

      <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-4">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300 font-semibold">
              Décision retenue
            </p>
            <p className="mt-1 text-base font-semibold">{c.decision.chosenPath}</p>
          </div>
        </div>
      </div>

      {c.triageJustification && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-primary mt-0.5" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-primary font-semibold">
                Justification du niveau {c.decision.committeeLevel}
              </p>
              <p className="mt-1 text-sm text-foreground/90 leading-relaxed">
                {c.triageJustification}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border/60 p-4 bg-card">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Raisonnement clinique
        </p>
        <p className="mt-2 text-sm text-foreground/90 leading-relaxed">{c.decision.rationale}</p>
      </div>

      <div className="rounded-lg border border-border/60 p-4 bg-card">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          Alternatives écartées
        </p>
        <ul className="space-y-2">
          {c.decision.alternativesConsidered.map((a) => (
            <li key={a} className="flex items-start gap-2 text-sm">
              <XCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{a}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded border border-border/60 p-2">
          <p className="text-[9px] uppercase text-muted-foreground">Rutherford</p>
          <p className="text-lg font-semibold tabular-nums">{c.patient.rutherford}</p>
        </div>
        <div className="rounded border border-border/60 p-2">
          <p className="text-[9px] uppercase text-muted-foreground">Frailty</p>
          <p className="text-lg font-semibold tabular-nums">{c.patient.frailty}/9</p>
        </div>
        <div className="rounded border border-border/60 p-2">
          <p className="text-[9px] uppercase text-muted-foreground">eGFR</p>
          <p className="text-lg font-semibold tabular-nums">{c.patient.egfr}</p>
        </div>
      </div>
    </div>
  );
}
