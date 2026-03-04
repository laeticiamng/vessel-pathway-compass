import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, AlertTriangle, CheckCircle2, FileText, TrendingUp } from "lucide-react";
import { useTranslation } from "@/i18n/context";

export default function AISafety() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Eye className="h-8 w-8 text-primary" />
          {t("aiSafetyPage.title")}
        </h1>
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">{t("common.betaPreview")}</Badge>
      </div>
      <p className="text-muted-foreground">{t("aiSafetyPage.subtitle")}</p>

      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: t("aiSafetyPage.stats.modelVersion"), value: "v2.1", icon: TrendingUp },
          { label: t("aiSafetyPage.stats.outputsLogged"), value: "89", icon: FileText },
          { label: t("aiSafetyPage.stats.issuesReported"), value: "2", icon: AlertTriangle },
          { label: t("aiSafetyPage.stats.signOffRate"), value: "96.6%", icon: CheckCircle2 },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6 text-center">
              <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("aiSafetyPage.drift.title")}</CardTitle>
          <CardDescription>{t("aiSafetyPage.drift.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 bg-muted/30 rounded-lg border-2 border-dashed">
          <p className="text-muted-foreground">{t("aiSafetyPage.drift.placeholder")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
