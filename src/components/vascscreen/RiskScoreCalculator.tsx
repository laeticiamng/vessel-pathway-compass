import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface RiskScoreCalculatorProps {
  score: number; // 0-10
}

function getScoreColor(score: number): string {
  if (score <= 2) return "text-green-600";
  if (score <= 4) return "text-yellow-600";
  if (score <= 6) return "text-orange-600";
  return "text-red-600";
}

function getProgressColor(score: number): string {
  if (score <= 2) return "[&>div]:bg-green-500";
  if (score <= 4) return "[&>div]:bg-yellow-500";
  if (score <= 6) return "[&>div]:bg-orange-500";
  return "[&>div]:bg-red-500";
}

export function RiskScoreCalculator({ score }: RiskScoreCalculatorProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("vascscreen.assessment.riskScore")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end gap-2">
          <span className={`text-4xl font-bold font-mono ${getScoreColor(score)}`}>
            {score.toFixed(1)}
          </span>
          <span className="text-muted-foreground text-sm mb-1">/ 10</span>
        </div>
        <Progress value={score * 10} className={`h-3 ${getProgressColor(score)}`} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low</span>
          <span>Moderate</span>
          <span>High</span>
        </div>
      </CardContent>
    </Card>
  );
}
