import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Eye, Image, Watch, Glasses, Rocket } from "lucide-react";
import { useTranslation } from "@/i18n/context";

const features = [
  { icon: Cpu, key: "federated", status: "planned" },
  { icon: Eye, key: "aiSafety", status: "planned" },
  { icon: Image, key: "imaging", status: "planned" },
  { icon: Watch, key: "wearables", status: "concept" },
  { icon: Glasses, key: "arTraining", status: "concept" },
] as const;

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  planned: "secondary",
  concept: "outline",
};

export default function InnovationLab() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <Rocket className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
          {t("innovationLab.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("innovationLab.subtitle")}</p>
      </div>

      <div className="grid gap-4">
        {features.map((f) => (
          <Card key={f.key} className="hover:border-primary/20 transition-colors">
            <CardContent className="pt-6 flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{t(`innovationLab.features.${f.key}.title`)}</h3>
                  <Badge variant={statusVariant[f.status]} className="text-xs">
                    {t(`innovationLab.status.${f.status}`)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{t(`innovationLab.features.${f.key}.desc`)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">{t("innovationLab.feedback")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
