import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/context";

/**
 * Statistical power calculation for the planned prospective main cohort.
 * Primary endpoint: clinico-physiological concordance (C4-i v11.1).
 *
 * Approximation: one-sample test of a single proportion vs a non-inferiority
 * margin, using normal approximation (Wald):
 *
 *   n = ((Z_{1-α/2} + Z_{1-β})² · π₀ · (1 - π₀)) / δ²
 *
 * Then divided by (1 - dropout) to obtain the target enrolment.
 * Final sample size to be confirmed by an independent biostatistics unit.
 */
function inverseNormalCDF(p: number): number {
  // Beasley-Springer-Moro approximation
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.383577518672690e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pLow = 0.02425, pHigh = 1 - pLow;
  let q: number, r: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p <= pHigh) {
    q = p - 0.5; r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
    ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

const DEFAULTS = { pi0: 0.80, delta: 0.10, alpha: 0.05, power: 0.80, dropout: 0.20 };

export function PowerCalculation({ className }: { className?: string }) {
  const { t } = useTranslation();
  const [pi0, setPi0] = useState(DEFAULTS.pi0);
  const [delta, setDelta] = useState(DEFAULTS.delta);
  const [alpha, setAlpha] = useState(DEFAULTS.alpha);
  const [power, setPower] = useState(DEFAULTS.power);
  const [dropout, setDropout] = useState(DEFAULTS.dropout);

  const { nAnalysable, nEnrolment, valid } = useMemo(() => {
    const ok = pi0 > 0 && pi0 < 1 && delta > 0 && delta < 1 && alpha > 0 && alpha < 1
      && power > 0 && power < 1 && dropout >= 0 && dropout < 1;
    if (!ok) return { nAnalysable: NaN, nEnrolment: NaN, valid: false };
    const zAlpha = inverseNormalCDF(1 - alpha / 2);
    const zBeta = inverseNormalCDF(power);
    const n = Math.ceil(((zAlpha + zBeta) ** 2 * pi0 * (1 - pi0)) / (delta ** 2));
    const enrol = Math.ceil(n / (1 - dropout));
    return { nAnalysable: n, nEnrolment: enrol, valid: true };
  }, [pi0, delta, alpha, power, dropout]);

  const reset = () => {
    setPi0(DEFAULTS.pi0); setDelta(DEFAULTS.delta); setAlpha(DEFAULTS.alpha);
    setPower(DEFAULTS.power); setDropout(DEFAULTS.dropout);
  };

  return (
    <Card className={className} data-testid="power-calculation">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          {t("power.title")}
        </CardTitle>
        <CardDescription>{t("power.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Field label={t("power.pi0")} id="pi0" value={pi0} onChange={setPi0} step={0.01} min={0.01} max={0.99} />
          <Field label={t("power.delta")} id="delta" value={delta} onChange={setDelta} step={0.01} min={0.01} max={0.5} />
          <Field label={t("power.alpha")} id="alpha" value={alpha} onChange={setAlpha} step={0.01} min={0.001} max={0.2} />
          <Field label={t("power.powerLabel")} id="power" value={power} onChange={setPower} step={0.05} min={0.5} max={0.99} />
          <Field label={t("power.dropouts")} id="dropout" value={dropout} onChange={setDropout} step={0.05} min={0} max={0.6} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Result label={t("power.nAnalysable")} value={valid ? `≈ ${nAnalysable}` : "—"} highlight />
          <Result label={t("power.nEnrolment")} value={valid ? `≈ ${nEnrolment}` : "—"} highlight />
        </div>

        <div className="rounded-lg border p-3 bg-muted/30 space-y-2">
          <p className="text-xs font-semibold">{t("power.secondary")}</p>
          <ul className="text-[11px] text-muted-foreground space-y-1 list-disc pl-4">
            <li>{t("power.secondary1")}</li>
            <li>{t("power.secondary2")}</li>
            <li>{t("power.secondary3")}</li>
          </ul>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-[10px]">{t("power.badge1")}</Badge>
            <Badge variant="outline" className="text-[10px]">{t("power.badge2")}</Badge>
            <Badge variant="outline" className="text-[10px]">{t("power.badge3")}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-3 w-3 mr-1" /> {t("power.reset")}
          </Button>
        </div>

        <p className="text-[10px] text-muted-foreground italic">{t("power.footnote")}</p>
      </CardContent>
    </Card>
  );
}

function Field(props: { label: string; id: string; value: number; onChange: (v: number) => void; step: number; min: number; max: number }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={props.id} className="text-[10px] uppercase tracking-wide text-muted-foreground">{props.label}</Label>
      <Input
        id={props.id}
        type="number"
        step={props.step}
        min={props.min}
        max={props.max}
        value={Number.isFinite(props.value) ? props.value : ""}
        onChange={(e) => props.onChange(Number(e.target.value))}
        className="h-8 text-sm font-mono"
      />
    </div>
  );
}

function Result({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? "bg-primary/5 border-primary/30" : "bg-background"}`}>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-lg font-bold mt-0.5 font-mono">{value}</p>
    </div>
  );
}
