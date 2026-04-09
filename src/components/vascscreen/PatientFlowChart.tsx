import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowDown, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export function PatientFlowChart() {
  const { t } = useTranslation();

  const flowSteps = [
    {
      title: "Patient Presentation",
      description: "Age >= 65, or >= 50 with CV risk factors, or symptomatic, or known CVD, or CKD",
      type: "start" as const,
    },
    {
      title: "ESC 2024 Criteria Evaluation",
      description: "Evaluate risk factors and symptoms against ESC 2024 screening indications",
      type: "process" as const,
    },
    {
      title: "Screening Eligible?",
      description: "At least one ESC 2024 Class I indication present",
      type: "decision" as const,
    },
    {
      title: "ABI Measurement",
      description: "Measure ankle-brachial index (both legs) using Doppler",
      type: "process" as const,
    },
    {
      title: "ABI Interpretation",
      description: "Normal (>1.0), Borderline (0.91-0.99), PAD (<= 0.90), Non-compressible (>1.40)",
      type: "decision" as const,
    },
    {
      title: "Referral / Management",
      description: "Refer to angiologist if PAD confirmed, or manage risk factors if normal",
      type: "end" as const,
    },
  ];

  const typeStyles = {
    start: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
    process: "bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-700",
    decision: "bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800",
    end: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">ESC 2024 PAD Screening Flowchart</CardTitle>
        <CardDescription>{t("vascscreen.guidelineReference")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-2">
          {flowSteps.map((step, i) => (
            <div key={i} className="flex flex-col items-center w-full max-w-md">
              <div
                className={`w-full p-4 rounded-lg border-2 ${typeStyles[step.type]} ${
                  step.type === "decision" ? "rotate-0" : ""
                }`}
              >
                <h4 className="text-sm font-semibold">{step.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
              </div>
              {i < flowSteps.length - 1 && (
                <ArrowDown className="h-5 w-5 text-muted-foreground my-1" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
