import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, HeartPulse, Brain, BookOpen, FlaskConical, ArrowRight, Sparkles } from "lucide-react";
import { useTranslation } from "@/i18n/context";

interface Props {
  stats: {
    activeCases: number;
    totalCases: number;
    aiReports: number;
    outcomes: number;
    simulations: number;
    educationExplored?: boolean;
  };
}

export function OnboardingChecklist({ stats }: Props) {
  const { t } = useTranslation();

  const steps = [
    { done: stats.totalCases > 0, label: t("dashboard.checklist.createPatient"), icon: HeartPulse, path: "/app/patients" },
    { done: stats.aiReports > 0, label: t("dashboard.checklist.generateAI"), icon: Brain, path: "/app/ai-assistant" },
    { done: !!stats.educationExplored, label: t("dashboard.checklist.exploreEducation"), icon: BookOpen, path: "/app/education" },
    { done: stats.simulations > 0, label: t("dashboard.checklist.runSimulation"), icon: FlaskConical, path: "/app/simulation" },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  if (completedCount >= 3) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {t("dashboard.checklist.title")}
        </CardTitle>
        <CardDescription>{t("dashboard.checklist.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step) => (
          <Link
            key={step.label}
            to={step.path}
            className="flex items-center gap-3 p-3 rounded-lg border bg-background hover:border-primary/30 transition-colors"
          >
            {step.done ? (
              <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
            )}
            <step.icon className="h-4 w-4 text-primary shrink-0" />
            <span className={`text-sm flex-1 ${step.done ? "line-through text-muted-foreground" : "font-medium"}`}>
              {step.label}
            </span>
            {!step.done && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
