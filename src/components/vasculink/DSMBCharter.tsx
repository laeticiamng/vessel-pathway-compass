import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

const MEMBERS = [
  { role: "Independent vascular physician (chair)", affiliation: "External EU center · no AquaMR conflict" },
  { role: "Independent biostatistician", affiliation: "Access to unblinded data · SAP custodian" },
  { role: "Independent radiologist / MRI physicist", affiliation: "Image-quality and safety oversight" },
  { role: "Patient representative", affiliation: "Voting on benefit/risk and acceptability" },
  { role: "Ethics observer (non-voting)", affiliation: "CER-VD liaison" },
];

const TRIGGERS = [
  "Serious adverse event potentially related to AquaMR workflow",
  "Image-quality failure rate > 15% over a rolling 50-patient window",
  "Unanticipated safety signal raised by the investigator or sponsor",
  "Pre-planned interim review at M24 (before J3 milestone)",
  "Any deviation from frozen Statistical Analysis Plan (SAP)",
];

export function DSMBCharter({ className }: { className?: string }) {
  return (
    <Card className={className} data-testid="dsmb-charter">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          DSMB charter · independent oversight model
        </CardTitle>
        <CardDescription>
          Data Safety Monitoring Board structure and stop/continue triggers for the CHUV cohort.
          Acts in parallel with the Data Access Committee for registry queries.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-semibold mb-2">Composition (5 members, ≥3 voting rights)</p>
          <ul className="space-y-2">
            {MEMBERS.map((m) => (
              <li key={m.role} className="rounded-lg border p-3 bg-muted/30">
                <p className="text-sm font-medium">{m.role}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{m.affiliation}</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold mb-2">Stop / pause / continue triggers</p>
          <ul className="space-y-1.5">
            {TRIGGERS.map((t) => (
              <li key={t} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="text-primary mt-0.5">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="default" className="text-[10px]">Quorum 3/5</Badge>
          <Badge variant="outline" className="text-[10px]">Cadence: every 6 months + on-trigger</Badge>
          <Badge variant="outline" className="text-[10px]">Reports to sponsor + CER-VD</Badge>
          <Badge variant="outline" className="text-[10px]">Charter reviewed annually</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
