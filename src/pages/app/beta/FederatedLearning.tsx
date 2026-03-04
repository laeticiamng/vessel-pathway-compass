import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Cpu, Shield, Activity } from "lucide-react";
import { useTranslation } from "@/i18n/context";

export default function FederatedLearning() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Cpu className="h-8 w-8 text-primary" />
          {t("federated.title")}
        </h1>
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">{t("common.betaPreview")}</Badge>
      </div>
      <p className="text-muted-foreground">{t("federated.subtitle")}</p>

      <Card>
        <CardHeader>
          <CardTitle>{t("federated.optIn.title")}</CardTitle>
          <CardDescription>{t("federated.optIn.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">{t("federated.optIn.toggle")}</p>
              <p className="text-sm text-muted-foreground">{t("federated.optIn.toggleDesc")}</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">{t("federated.optIn.ethicsApproval")}</p>
              <p className="text-sm text-muted-foreground">{t("federated.optIn.ethicsDesc")}</p>
            </div>
            <Button variant="outline" size="sm">{t("common.upload")}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("federated.status.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border text-center">
              <Activity className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t("federated.status.nodeStatus")}</p>
              <p className="font-bold mt-1">{t("federated.status.inactive")}</p>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <Cpu className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t("federated.status.trainingRounds")}</p>
              <p className="font-bold mt-1">0</p>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <Shield className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t("federated.status.modelVersion")}</p>
              <p className="font-bold mt-1">—</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
