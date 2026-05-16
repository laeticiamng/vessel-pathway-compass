import { Activity, AlertTriangle, Footprints, HeartPulse } from "lucide-react";
import { AOMI_FRAGILE_CASE as CASE } from "@/demo/aomiFragileCase";
import { cn } from "@/lib/utils";

function Metric({
  icon,
  label,
  value,
  unit,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  tone?: "default" | "warn" | "danger";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 bg-card",
        tone === "warn" && "border-amber-500/40 bg-amber-500/5",
        tone === "danger" && "border-destructive/40 bg-destructive/5",
        tone === "default" && "border-border/60",
      )}
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tabular-nums">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}

export function TriagePanel() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">VascScreen · Triage initial</h2>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Patient {CASE.patient.initials}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Metric
          icon={<HeartPulse className="h-3.5 w-3.5" />}
          label="IPS droit"
          value={CASE.triage.abiRight}
          tone="danger"
        />
        <Metric
          icon={<HeartPulse className="h-3.5 w-3.5" />}
          label="IPS gauche"
          value={CASE.triage.abiLeft}
          tone="warn"
        />
        <Metric
          icon={<Footprints className="h-3.5 w-3.5" />}
          label="Périmètre de marche"
          value={CASE.triage.walkingDistanceMeters}
          unit="m"
          tone="warn"
        />
        <Metric
          icon={<Activity className="h-3.5 w-3.5" />}
          label="Rutherford"
          value={CASE.patient.rutherford}
          tone="danger"
        />
        <Metric
          icon={<Activity className="h-3.5 w-3.5" />}
          label="eGFR"
          value={CASE.patient.egfr}
          unit="mL/min"
          tone="danger"
        />
        <Metric
          icon={<Activity className="h-3.5 w-3.5" />}
          label="Frailty (CFS)"
          value={`${CASE.patient.frailty}/9`}
          tone="warn"
        />
      </div>

      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">
              Risque CI-AKI : élevé · Contraste iodé contre-indiqué
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{CASE.triage.ciAkiNote}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">Décision de triage</p>
        Orientation vers imagerie sans contraste (AquaMR) + bilan L1 prioritaire. Ulcère évolutif
        (Rutherford {CASE.patient.rutherford}) → revascularisation à envisager.
      </div>
    </div>
  );
}
