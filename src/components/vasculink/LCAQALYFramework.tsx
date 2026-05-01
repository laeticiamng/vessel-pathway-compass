import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Coins } from "lucide-react";

/**
 * Structural skeleton for environmental life-cycle assessment (LCA, ISO 14040/44)
 * and cost-utility analysis (QALY) of the AquaMR vascular pathway.
 * Numbers are placeholders pending vendor-quoted BoM (J1) and cohort data (J3).
 */
const LCA_STAGES = [
  { stage: "Raw materials", scope: "NdFeB recycled magnets (WEEE), copper coils, FR-4 PCB", indicator: "kg CO₂-eq · kg rare-earth" },
  { stage: "Manufacturing", scope: "Halbach assembly, EU site assumed", indicator: "kWh · kg CO₂-eq" },
  { stage: "Use phase", scope: "0 He cryogen · 0 Gd / iodine consumed · electricity per exam", indicator: "kWh/exam · g Gd avoided" },
  { stage: "Maintenance", scope: "No cryogen refill · modular spare parts", indicator: "interventions/year" },
  { stage: "End-of-life", scope: "WEEE recycling target > 90% by mass", indicator: "% recovered" },
];

const QALY_PARAMS = [
  { p: "Comparator", v: "Standard pathway: Doppler + angio-CT or contrast MRA" },
  { p: "Time horizon", v: "Lifetime (PAD chronic disease)" },
  { p: "Perspective", v: "Healthcare payer (CH) + societal sensitivity analysis" },
  { p: "Discount rate", v: "3% costs and effects" },
  { p: "Health outcomes", v: "QALYs from VascuQol-6 → utility mapping (planned)" },
  { p: "Costs included", v: "Device amortisation, exam, CI-AKI events avoided, dialysis-years averted" },
  { p: "ICER threshold", v: "CHF 100k / QALY (Swiss reference)" },
  { p: "Sensitivity", v: "PSA (Monte-Carlo, 10 000 iterations) + tornado on BoM" },
];

export function LCAQALYFramework({ className }: { className?: string }) {
  return (
    <Card className={className} data-testid="lca-qaly-framework">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Leaf className="h-4 w-4 text-primary" />
          LCA + Cost-utility (QALY) framework
        </CardTitle>
        <CardDescription>
          Structural skeleton for environmental life-cycle assessment (ISO 14040/44) and
          cost-utility analysis. Quantitative values pending J1 (BoM) and J3 (cohort).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-xs font-semibold mb-2 flex items-center gap-1">
            <Leaf className="h-3 w-3 text-primary" /> Life-cycle stages (cradle-to-grave)
          </p>
          <ul className="space-y-2">
            {LCA_STAGES.map((s) => (
              <li key={s.stage} className="rounded-lg border p-3 bg-muted/30">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm font-semibold">{s.stage}</span>
                  <Badge variant="outline" className="text-[10px]">{s.indicator}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">{s.scope}</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold mb-2 flex items-center gap-1">
            <Coins className="h-3 w-3 text-primary" /> Cost-utility model parameters
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {QALY_PARAMS.map((q) => (
              <div key={q.p} className="rounded-lg border p-3 bg-background">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{q.p}</p>
                <p className="text-xs font-medium mt-0.5">{q.v}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground italic">
          Reporting will follow CHEERS 2022 (cost-utility) and ISO 14044 (LCA) guidelines.
          Independent academic review planned before publication.
        </p>
      </CardContent>
    </Card>
  );
}
