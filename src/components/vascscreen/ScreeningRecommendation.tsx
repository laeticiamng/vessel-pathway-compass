import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ScreeningRecommendation as ScreeningRec } from "@/lib/vascscreen/esc2024-criteria";

interface ScreeningRecommendationProps {
  recommendation: ScreeningRec;
  riskScore: number;
  onProceedToABI: () => void;
}

export function ScreeningRecommendation({ recommendation, riskScore, onProceedToABI }: ScreeningRecommendationProps) {
  const { t } = useTranslation();

  if (!recommendation.eligible) {
    return (
      <Card className="border-muted">
        <CardContent className="pt-6 text-center space-y-3">
          <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("vascscreen.assessment.noIndication")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={recommendation.urgency === "urgent" ? "border-red-500" : recommendation.urgency === "priority" ? "border-amber-500" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t("vascscreen.screeningResult")}</CardTitle>
          <Badge variant={recommendation.urgency === "urgent" ? "destructive" : "secondary"}>
            {recommendation.urgency === "urgent" && <AlertTriangle className="h-3 w-3 mr-1" />}
            {t(`vascscreen.assessment.${recommendation.urgency}`)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold font-mono">{riskScore.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">{t("vascscreen.assessment.riskScore")}</div>
          </div>
          <div className="flex-1 text-sm">
            {recommendation.reason.slice(0, 3).map((r, i) => (
              <p key={i} className="text-muted-foreground">- {r}</p>
            ))}
          </div>
        </div>

        <Button onClick={onProceedToABI} className="w-full">
          {t("vascscreen.assessment.proceedToABI")}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
