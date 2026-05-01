import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, Target } from "lucide-react";

interface Props {
  className?: string;
}

export function ScientificSafetyBox({ className }: Props) {
  return (
    <Card className={className} data-testid="scientific-safety-box">
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Strategic ambition</p>
          </div>
          <p className="text-sm text-muted-foreground">
            VASCU-LINK aims to open a long-term pathway toward selected 4-zero
            vascular interventions: <strong>0 mSv</strong>, <strong>0 g Gd / 0 mL iodine</strong>,
            <strong> 0 helium</strong>, and a <strong>BoM target &lt; €15k</strong> — to enable
            proximity vascular medicine outside helium-bound hospital centers.
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-warning" />
            <p className="text-sm font-semibold">Scientific boundary</p>
          </div>
          <p className="text-sm text-muted-foreground">
            The thesis does not perform human revascularization. L1 validates
            mapping and decision-making. L2/L3 remain simulated or preclinical.
            Conventional angiography remains mandatory for emergencies, complex
            high-risk interventions, insufficient image quality, or when
            standard-of-care requires it.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
