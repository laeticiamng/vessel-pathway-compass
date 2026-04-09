import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Clock, BookOpen } from "lucide-react";
import type { ScreeningRecommendation } from "@/lib/vascscreen/esc2024-criteria";

interface ESC2024CriteriaProps {
  recommendation: ScreeningRecommendation;
}

const urgencyConfig = {
  routine: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Clock },
  priority: { color: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200", icon: AlertTriangle },
  urgent: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: AlertTriangle },
};

export function ESC2024Criteria({ recommendation }: ESC2024CriteriaProps) {
  const { t } = useTranslation();
  const config = urgencyConfig[recommendation.urgency];
  const UrgencyIcon = config.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {recommendation.eligible ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5 text-muted-foreground" />
              )}
              {recommendation.eligible
                ? t("vascscreen.eligible")
                : t("vascscreen.notEligible")}
            </CardTitle>
            <CardDescription>{t("vascscreen.assessment.subtitle")}</CardDescription>
          </div>
          {recommendation.eligible && (
            <Badge className={config.color}>
              <UrgencyIcon className="h-3 w-3 mr-1" />
              {t(`vascscreen.assessment.${recommendation.urgency}`)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendation.reason.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">{t("vascscreen.assessment.reasons")}</h4>
            <ul className="space-y-1">
              {recommendation.reason.map((r, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-primary mt-0.5">-</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium mb-2">{t("vascscreen.assessment.actions")}</h4>
          <ul className="space-y-1">
            {recommendation.recommendedActions.map((a, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-primary mt-0.5">-</span>
                {a}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-start gap-2 pt-2 border-t text-xs text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{recommendation.guidelineReference}</span>
        </div>
      </CardContent>
    </Card>
  );
}
