import { Activity, AlertTriangle, Cigarette, Droplet, Footprints, HeartPulse, Stethoscope } from "lucide-react";
import { AOMI_FRAGILE_CASE, type DemoCase } from "@/demo/aomiFragileCase";
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

function riskChips(rf: NonNullable<DemoCase["riskFactors"]>) {
  const out: { label: string; icon?: React.ReactNode }[] = [];
  if (rf.diabetes) out.push({ label: "Diabète", icon: <Droplet className="h-3 w-3" /> });
  if (rf.smoking === "active") out.push({ label: "Tabac actif", icon: <Cigarette className="h-3 w-3" /> });
  if (rf.smoking === "former") out.push({ label: "Tabac sevré", icon: <Cigarette className="h-3 w-3" /> });
  if (rf.hypertension) out.push({ label: "HTA" });
  if (rf.dyslipidemia) out.push({ label: "Dyslipidémie" });
  if (rf.ckd) out.push({ label: "IRC" });
  if (rf.priorMI) out.push({ label: "ATCD IDM" });
  if (rf.priorStroke) out.push({ label: "ATCD AVC" });
  if (rf.antiplatelet) out.push({ label: "Antiagrégant" });
  return out;
}

export function TriagePanel({ case: c = AOMI_FRAGILE_CASE }: { case?: DemoCase } = {}) {
  const ciAkiHigh = c.triage.ciAkiRisk === "high";
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold">VascScreen · Triage initial</h2>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Patient {c.patient.initials} · {c.patient.sex} · {c.patient.age} ans
        </span>
      </div>

      {c.symptoms && c.symptoms.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            <Stethoscope className="h-3 w-3" /> Symptômes rapportés
          </div>
          <ul className="mt-2 text-sm space-y-1">
            {c.symptoms.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-muted-foreground">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Metric
          icon={<HeartPulse className="h-3.5 w-3.5" />}
          label="IPS droit"
          value={c.triage.abiRight}
          tone={c.triage.abiRight < 0.5 ? "danger" : c.triage.abiRight < 0.9 ? "warn" : "default"}
        />
        <Metric
          icon={<HeartPulse className="h-3.5 w-3.5" />}
          label="IPS gauche"
          value={c.triage.abiLeft}
          tone={c.triage.abiLeft < 0.5 ? "danger" : c.triage.abiLeft < 0.9 ? "warn" : "default"}
        />
        <Metric
          icon={<Footprints className="h-3.5 w-3.5" />}
          label="Périmètre de marche"
          value={c.triage.walkingDistanceMeters}
          unit="m"
          tone={c.triage.walkingDistanceMeters < 100 ? "danger" : "warn"}
        />
        <Metric
          icon={<Activity className="h-3.5 w-3.5" />}
          label="Rutherford"
          value={c.patient.rutherford}
          tone={c.patient.rutherford >= 4 ? "danger" : "warn"}
        />
        <Metric
          icon={<Activity className="h-3.5 w-3.5" />}
          label="eGFR"
          value={c.patient.egfr}
          unit="mL/min"
          tone={c.patient.egfr < 45 ? "danger" : c.patient.egfr < 60 ? "warn" : "default"}
        />
        <Metric
          icon={<Activity className="h-3.5 w-3.5" />}
          label="Frailty (CFS)"
          value={`${c.patient.frailty}/9`}
          tone={c.patient.frailty >= 5 ? "warn" : "default"}
        />
      </div>

      {c.doppler && (
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Doppler artériel
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <div className="text-[10px] text-muted-foreground">Onde</div>
              <div className="font-semibold capitalize">{c.doppler.waveform}</div>
            </div>
            {c.doppler.peakSystolicVelocityCmS != null && (
              <div>
                <div className="text-[10px] text-muted-foreground">PSV</div>
                <div className="font-semibold tabular-nums">{c.doppler.peakSystolicVelocityCmS} cm/s</div>
              </div>
            )}
            {c.doppler.tbiRight != null && (
              <div>
                <div className="text-[10px] text-muted-foreground">TBI droit</div>
                <div className="font-semibold tabular-nums">{c.doppler.tbiRight}</div>
              </div>
            )}
            {c.doppler.tbiLeft != null && (
              <div>
                <div className="text-[10px] text-muted-foreground">TBI gauche</div>
                <div className="font-semibold tabular-nums">{c.doppler.tbiLeft}</div>
              </div>
            )}
          </div>
          {c.doppler.notes && (
            <p className="mt-2 text-xs text-muted-foreground">{c.doppler.notes}</p>
          )}
        </div>
      )}

      {c.riskFactors && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Facteurs de risque cardiovasculaire
          </p>
          <div className="flex flex-wrap gap-2">
            {riskChips(c.riskFactors).map((r) => (
              <span
                key={r.label}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-xs"
              >
                {r.icon}
                {r.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div
        className={cn(
          "rounded-lg border p-4",
          ciAkiHigh ? "border-destructive/40 bg-destructive/5" : "border-amber-500/40 bg-amber-500/5",
        )}
      >
        <div className="flex items-start gap-2">
          <AlertTriangle className={cn("h-4 w-4 mt-0.5", ciAkiHigh ? "text-destructive" : "text-amber-600")} />
          <div>
            <p className={cn("text-sm font-semibold", ciAkiHigh ? "text-destructive" : "text-amber-900 dark:text-amber-300")}>
              Risque CI-AKI : {c.triage.ciAkiRisk === "high" ? "élevé" : c.triage.ciAkiRisk === "moderate" ? "modéré" : "faible"}
              {ciAkiHigh && " · Contraste iodé contre-indiqué"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{c.triage.ciAkiNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
