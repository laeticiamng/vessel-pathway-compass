import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe2, Sun, Building2 } from "lucide-react";
import { useTranslation } from "@/i18n/context";

/**
 * Pilier WP5 — équité d'accès & médecine vasculaire de proximité.
 * Reflète le 1-pager VASCU-LINK v7 (LOI envisagées Sénégal/Maroc/Bénin).
 */
export function ProximityMedicineCard({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Card className={className} data-testid="proximity-medicine">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-primary" />
          {t("vasculink.proximity.title")}
        </CardTitle>
        <CardDescription>{t("vasculink.proximity.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border p-4 space-y-2 bg-muted/30">
            <Building2 className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">{t("vasculink.proximity.privateTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("vasculink.proximity.privateDesc")}</p>
          </div>
          <div className="rounded-xl border p-4 space-y-2 bg-muted/30">
            <Globe2 className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">{t("vasculink.proximity.lmicTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("vasculink.proximity.lmicDesc")}</p>
          </div>
          <div className="rounded-xl border p-4 space-y-2 bg-muted/30">
            <Sun className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold">{t("vasculink.proximity.photovoltaicTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("vasculink.proximity.photovoltaicDesc")}</p>
          </div>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
          <Badge variant="default" className="text-[10px] mb-2">
            {t("vasculink.proximity.wp5Badge")}
          </Badge>
          <p
            className="text-xs"
            dangerouslySetInnerHTML={{ __html: t("vasculink.proximity.wp5Body") }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
