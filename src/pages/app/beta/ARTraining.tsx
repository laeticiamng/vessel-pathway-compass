import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Glasses, CheckSquare, Monitor } from "lucide-react";
import { useTranslation } from "@/i18n/context";

const stepKeys = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;
const stepStatuses = ["complete", "complete", "current", "pending", "pending", "pending"] as const;

export default function ARTraining() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Glasses className="h-8 w-8 text-primary" />
          {t("arTraining.title")}
        </h1>
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">{t("common.betaPreview")}</Badge>
      </div>
      <p className="text-muted-foreground">{t("arTraining.subtitle")}</p>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CheckSquare className="h-5 w-5" /> {t("arTraining.checklist.title")}</CardTitle>
          <CardDescription>{t("arTraining.checklist.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stepKeys.map((key, i) => {
              const status = stepStatuses[i];
              return (
                <div key={key} className={`flex items-center gap-3 p-3 rounded-lg border ${
                  status === "current" ? "border-primary bg-primary/5" :
                  status === "complete" ? "bg-success/5 border-success/30" : ""
                }`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    status === "complete" ? "bg-success text-success-foreground" :
                    status === "current" ? "bg-primary text-primary-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {i + 1}
                  </div>
                  <span className="text-sm">{t(`arTraining.checklist.steps.${key}`)}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Monitor className="h-5 w-5" /> {t("arTraining.station.title")}</CardTitle>
          <CardDescription>{t("arTraining.station.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 bg-muted/30 rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">{t("arTraining.station.placeholder")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
