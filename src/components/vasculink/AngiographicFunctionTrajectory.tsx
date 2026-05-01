import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Compass, FlaskConical, Microscope, Telescope } from "lucide-react";

export type TrajectoryStage = "L1" | "L2" | "L3" | "PostPhD";

export interface TrajectoryStep {
  stage: TrajectoryStage;
  title: string;
  description: string;
  status: "active" | "future" | "horizon";
}

const STEPS: TrajectoryStep[] = [
  {
    stage: "L1",
    title: "See & Decide",
    description:
      "Validate 4-zero pre-revascularization mapping: make the patient readable, classifiable and orientable.",
    status: "active",
  },
  {
    stage: "L2",
    title: "Simulate & Guide",
    description:
      "Explore non-ionizing guidance in phantom and simulation environments. No human intervention.",
    status: "future",
  },
  {
    stage: "L3",
    title: "Preclinical Intervention",
    description:
      "Test preclinical feasibility of non-ionizing interventional trajectories. Non-human only.",
    status: "future",
  },
  {
    stage: "PostPhD",
    title: "Selected 4-Zero Revascularization",
    description:
      "Long-term horizon: selected elective revascularizations in specialized ambulatory vascular structures with hospital backup.",
    status: "horizon",
  },
];

const STAGE_ICON: Record<TrajectoryStage, typeof Compass> = {
  L1: Compass,
  L2: FlaskConical,
  L3: Microscope,
  PostPhD: Telescope,
};

const STATUS_LABEL: Record<TrajectoryStep["status"], string> = {
  active: "Active scope",
  future: "Future scope",
  horizon: "Long-term horizon",
};

const STATUS_VARIANT: Record<TrajectoryStep["status"], "default" | "secondary" | "outline"> = {
  active: "default",
  future: "secondary",
  horizon: "outline",
};

interface Props {
  className?: string;
  compact?: boolean;
}

export function AngiographicFunctionTrajectory({ className, compact }: Props) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">VASCU-LINK translational trajectory</CardTitle>
        <CardDescription>
          Reconstructing selected angiographic functions in a 4-zero chain — 0 mSv,
          0 g Gd / 0 mL iodine, 0 helium, BoM target &lt; €15k for proximity vascular medicine.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={
            compact
              ? "grid grid-cols-1 sm:grid-cols-2 gap-3"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
          }
        >
          {STEPS.map((step) => {
            const Icon = STAGE_ICON[step.stage];
            return (
              <div
                key={step.stage}
                data-testid={`trajectory-step-${step.stage}`}
                className="rounded-xl border p-4 space-y-2 bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-mono text-muted-foreground">{step.stage}</p>
                    <p className="text-sm font-semibold leading-tight">{step.title}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{step.description}</p>
                <Badge variant={STATUS_VARIANT[step.status]} className="text-[10px]">
                  {STATUS_LABEL[step.status]}
                </Badge>
              </div>
            );
          })}
        </div>

        <p className="text-sm font-medium border-l-2 border-primary pl-3 italic">
          VASCU-LINK does not claim to replace conventional angiography during the thesis.
          It tests whether selected angiographic functions can be progressively reconstructed
          in a 4-zero chain: <strong>0 mSv · 0 Gd / 0 iodine · 0 helium · BoM target &lt; €15k</strong>.
        </p>
      </CardContent>
    </Card>
  );
}
