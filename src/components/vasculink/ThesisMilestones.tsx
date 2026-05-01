import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag } from "lucide-react";

interface Milestone {
  id: string;
  month: string;
  title: string;
  criterion: string;
}

const MILESTONES: Milestone[] = [
  { id: "J1", month: "M06", title: "BoM & RMN signal", criterion: "BoM target < €15k validated + first NMR signal acquired" },
  { id: "J2", month: "M18", title: "Flow / static contrast", criterion: "Non-contrast flow & static cartography demonstrated on phantom" },
  { id: "J3", month: "M30", title: "Clinical concordance", criterion: "Clinical concordance vs reference imaging on subset of the prospective validation cohort" },
  { id: "J4", month: "M42", title: "Echo-MR phantom puncture", criterion: "Guided puncture on phantom / simulated model (L2 feasibility)" },
  { id: "J5", month: "M48", title: "L3 PoC + regulatory pre-submission", criterion: "Preclinical PoC + regulatory pre-submission (Class IIa hypothesis / IIb scenario anticipated)" },
];

export function ThesisMilestones({ className }: { className?: string }) {
  return (
    <Card className={className} data-testid="thesis-milestones">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Flag className="h-4 w-4 text-primary" />
          5 Go / No-Go milestones · 48-month PhD calendar
        </CardTitle>
        <CardDescription>
          Structuring decision points of the VASCU-LINK doctoral program (academic partnership in negotiation).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {MILESTONES.map((m) => (
            <li
              key={m.id}
              data-testid={`milestone-${m.id}`}
              className="flex items-start gap-3 rounded-xl border p-3 bg-muted/30"
            >
              <div className="flex flex-col items-center min-w-[3.5rem]">
                <Badge variant="default" className="font-mono text-xs">{m.id}</Badge>
                <span className="text-[10px] text-muted-foreground mt-1">{m.month}</span>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold">{m.title}</p>
                <p className="text-xs text-muted-foreground">{m.criterion}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
