import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Watch, Footprints, Camera, FileText, Shield } from "lucide-react";
import { useTranslation } from "@/i18n/context";

export default function Wearables() {
  const { t } = useTranslation();

  const features = [
    { icon: Footprints, key: "walking" },
    { icon: FileText, key: "symptom" },
    { icon: Camera, key: "wound" },
    { icon: Watch, key: "compression" },
  ] as const;

  const consentItems: string[] = (t("wearables.consent.items") as any) || [];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Watch className="h-8 w-8 text-primary" />
          {t("wearables.title")}
        </h1>
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">{t("common.betaPreview")}</Badge>
      </div>
      <p className="text-muted-foreground">{t("wearables.subtitle")}</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {features.map((f) => (
          <Card key={f.key}>
            <CardContent className="pt-6 flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{t(`wearables.features.${f.key}.title`)}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t(`wearables.features.${f.key}.desc`)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> {t("wearables.consent.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.isArray(consentItems) && consentItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
              <span className="text-sm">{item}</span>
              <Switch />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
