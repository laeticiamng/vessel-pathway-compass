import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Compass, FlaskConical, Microscope, Telescope } from "lucide-react";
import { useTranslation } from "@/i18n/context";

export type TrajectoryStage = "L1" | "L2" | "L3" | "PostPhD";

export interface TrajectoryStep {
  stage: TrajectoryStage;
  title: string;
  description: string;
  status: "active" | "future" | "horizon";
}

const STAGE_ICON: Record<TrajectoryStage, typeof Compass> = {
  L1: Compass,
  L2: FlaskConical,
  L3: Microscope,
  PostPhD: Telescope,
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
  const { t } = useTranslation();

  const STEPS: TrajectoryStep[] = [
    { stage: "L1", title: t("vasculink.trajectory.steps.L1.title") as string, description: t("vasculink.trajectory.steps.L1.desc") as string, status: "active" },
    { stage: "L2", title: t("vasculink.trajectory.steps.L2.title") as string, description: t("vasculink.trajectory.steps.L2.desc") as string, status: "future" },
    { stage: "L3", title: t("vasculink.trajectory.steps.L3.title") as string, description: t("vasculink.trajectory.steps.L3.desc") as string, status: "future" },
    { stage: "PostPhD", title: t("vasculink.trajectory.steps.PostPhD.title") as string, description: t("vasculink.trajectory.steps.PostPhD.desc") as string, status: "horizon" },
  ];

  const STATUS_LABEL: Record<TrajectoryStep["status"], string> = {
    active: t("vasculink.trajectory.status.active") as string,
    future: t("vasculink.trajectory.status.future") as string,
    horizon: t("vasculink.trajectory.status.horizon") as string,
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{t("vasculink.trajectory.title")}</CardTitle>
        <CardDescription>{t("vasculink.trajectory.subtitle")}</CardDescription>
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

        <p
          className="text-sm font-medium border-l-2 border-primary pl-3 italic"
          dangerouslySetInnerHTML={{ __html: t("vasculink.trajectory.scopeStatement") as string }}
        />
      </CardContent>
    </Card>
  );
}
