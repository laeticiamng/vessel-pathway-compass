import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator } from "lucide-react";

/**
 * Statistical power justification for the CHUV main cohort (n ≈ 250 analysable).
 * Primary endpoint: clinico-physiological concordance (C4-i v11.1) between
 * AquaMR-based decision and reference standard imaging.
 */
export function PowerCalculation({ className }: { className?: string }) {
  return (
    <Card className={className} data-testid="power-calculation">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          Power calculation · CHUV cohort n ≈ 250
        </CardTitle>
        <CardDescription>
          Sample size justification for the primary concordance endpoint (L1).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Stat label="Primary endpoint" value="Concordance C4-i v11.1" />
          <Stat label="Expected proportion (π₀)" value="0.80" />
          <Stat label="Non-inferiority margin (δ)" value="0.10" />
          <Stat label="α (two-sided)" value="0.05" />
          <Stat label="Power (1 − β)" value="0.80" />
          <Stat label="Required n (one-sample exact binomial)" value="≈ 196" />
          <Stat label="Anticipated dropouts / unanalysable" value="≈ 20%" />
          <Stat label="Target enrolment" value="n ≈ 250 analysable" />
        </div>
        <div className="rounded-lg border p-3 bg-muted/30 space-y-2">
          <p className="text-xs font-semibold">Secondary endpoints (descriptive, no inflation correction)</p>
          <ul className="text-[11px] text-muted-foreground space-y-1 list-disc pl-4">
            <li>WIQ / VascuQol-6 / 6-MWT trajectory across visits</li>
            <li>Subgroup analyses: CKD (eGFR &lt; 30), diabetes, BMI &gt; 35</li>
            <li>Image-quality failure rate (fallback to angio-CT / contrast MRA)</li>
          </ul>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-[10px]">Single-arm prospective</Badge>
          <Badge variant="outline" className="text-[10px]">Pre-registration: ClinicalTrials.gov (planned J1)</Badge>
          <Badge variant="outline" className="text-[10px]">SAP frozen before unblinding</Badge>
        </div>
        <p className="text-[10px] text-muted-foreground italic">
          Final sample size to be confirmed by CHUV biostatistics unit; recalibration possible
          after blinded interim review (≈ M24, before J3).
        </p>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3 bg-background">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5">{value}</p>
    </div>
  );
}
