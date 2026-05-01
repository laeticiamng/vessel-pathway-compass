import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "@/i18n/context";

const MEMBER_KEYS = ["chair", "biostat", "radiologist", "patient", "ethics"] as const;
const TRIGGER_KEYS = ["sae", "quality", "signal", "interim", "sap"] as const;

export function DSMBCharter({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Card className={className} data-testid="dsmb-charter">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          {t("vasculink.dsmb.title")}
        </CardTitle>
        <CardDescription>{t("vasculink.dsmb.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-semibold mb-2">{t("vasculink.dsmb.compositionTitle")}</p>
          <ul className="space-y-2">
            {MEMBER_KEYS.map((k) => (
              <li key={k} className="rounded-lg border p-3 bg-muted/30">
                <p className="text-sm font-medium">{t(`vasculink.dsmb.members.${k}.role`)}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t(`vasculink.dsmb.members.${k}.affiliation`)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold mb-2">{t("vasculink.dsmb.triggersTitle")}</p>
          <ul className="space-y-1.5">
            {TRIGGER_KEYS.map((k) => (
              <li key={k} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="text-primary mt-0.5">•</span>
                <span>{t(`vasculink.dsmb.triggers.${k}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="default" className="text-[10px]">{t("vasculink.dsmb.badges.quorum")}</Badge>
          <Badge variant="outline" className="text-[10px]">{t("vasculink.dsmb.badges.cadence")}</Badge>
          <Badge variant="outline" className="text-[10px]">{t("vasculink.dsmb.badges.reports")}</Badge>
          <Badge variant="outline" className="text-[10px]">{t("vasculink.dsmb.badges.review")}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
