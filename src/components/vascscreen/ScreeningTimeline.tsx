import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Stethoscope, FileText, UserCheck } from "lucide-react";

type Step = "entry" | "assessment" | "abi" | "results";

interface ScreeningTimelineProps {
  currentStep: Step;
}

const steps: { key: Step; icon: typeof ClipboardList }[] = [
  { key: "entry", icon: ClipboardList },
  { key: "assessment", icon: Stethoscope },
  { key: "abi", icon: Stethoscope },
  { key: "results", icon: FileText },
];

const stepLabels: Record<Step, string> = {
  entry: "vascscreen.patientEntry",
  assessment: "vascscreen.assessment.title",
  abi: "vascscreen.abiMeasurement",
  results: "vascscreen.results.title",
};

export function ScreeningTimeline({ currentStep }: ScreeningTimelineProps) {
  const { t } = useTranslation();
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Screening Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isComplete = i < currentIndex;
            const isCurrent = i === currentIndex;

            return (
              <div key={step.key} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      isComplete
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isComplete ? (
                      <UserCheck className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="text-[10px] text-center leading-tight max-w-[80px]">
                    {t(stepLabels[step.key])}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      i < currentIndex ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
