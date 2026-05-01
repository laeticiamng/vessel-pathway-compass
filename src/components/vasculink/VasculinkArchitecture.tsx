import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, Stethoscope, Compass, FlaskConical, Microscope } from "lucide-react";
import { useTranslation } from "@/i18n/context";

/**
 * Reproduction React du schéma SVG VASCU-LINK v7 — architecture en
 * trois cercles concentriques + cockpit AquaMR Flow.
 */
export function VasculinkArchitecture({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Card className={className} data-testid="vasculink-architecture">
      <CardHeader>
        <CardTitle className="text-base">{t("vasculink.arch.title")}</CardTitle>
        <CardDescription>{t("vasculink.arch.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Banner cockpit */}
        <div className="rounded-xl bg-primary text-primary-foreground p-4 text-center">
          <p className="text-sm font-semibold">{t("vasculink.arch.cockpitBanner")}</p>
        </div>

        {/* L1 — Diagnose */}
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-primary">{t("vasculink.arch.l1Title")}</h3>
            <Badge variant="default" className="text-[10px]">{t("vasculink.arch.l1Badge")}</Badge>
          </div>
          <p className="text-xs text-muted-foreground italic">{t("vasculink.arch.l1Caption")}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { t: t("vasculink.arch.l1Item1Title"), s: t("vasculink.arch.l1Item1Sub") },
              { t: t("vasculink.arch.l1Item2Title"), s: t("vasculink.arch.l1Item2Sub") },
              { t: t("vasculink.arch.l1Item3Title"), s: t("vasculink.arch.l1Item3Sub") },
              { t: t("vasculink.arch.l1Item4Title"), s: t("vasculink.arch.l1Item4Sub") },
            ].map((x) => (
              <div key={x.t} className="rounded-lg bg-background border p-3">
                <p className="text-xs font-semibold text-primary">{x.t}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{x.s}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-center font-medium">
            {t("vasculink.arch.l1Routing")}{" "}
            <span className="text-muted-foreground">{t("vasculink.arch.l1RoutingDest")}</span>
          </p>
          <p className="text-[11px] text-center text-muted-foreground italic">
            {t("vasculink.arch.l1Fallback")}
          </p>
        </div>

        <div className="flex justify-center"><ArrowDown className="h-5 w-5 text-primary" /></div>

        {/* Decision cockpit */}
        <div className="rounded-xl bg-primary/90 text-primary-foreground p-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Compass className="h-5 w-5" />
            <h3 className="font-bold">{t("vasculink.arch.decisionTitle")}</h3>
          </div>
          <p className="text-xs">{t("vasculink.arch.decisionSub")}</p>
          <p className="text-[11px] italic opacity-90">{t("vasculink.arch.decisionAdr")}</p>
          <p className="text-[11px] italic opacity-90">{t("vasculink.arch.decisionMigration")}</p>
        </div>

        <div className="flex justify-center"><ArrowDown className="h-5 w-5 text-primary" /></div>

        {/* L2 — Guide */}
        <div className="rounded-xl border-2 border-warning/40 bg-warning/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-warning" />
            <h3 className="font-bold text-warning">{t("vasculink.arch.l2Title")}</h3>
            <Badge variant="secondary" className="text-[10px]">{t("vasculink.arch.l2Badge")}</Badge>
          </div>
          <p className="text-xs text-muted-foreground italic">{t("vasculink.arch.l2Caption")}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {[t("vasculink.arch.l2Item1"), t("vasculink.arch.l2Item2"), t("vasculink.arch.l2Item3")].map((x) => (
              <div key={x} className="rounded-lg bg-background border p-3 text-xs font-medium text-center">{x}</div>
            ))}
          </div>
        </div>

        <div className="flex justify-center"><ArrowDown className="h-5 w-5 text-primary" /></div>

        {/* L3 — Vision */}
        <div className="rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Microscope className="h-5 w-5 text-destructive" />
            <h3 className="font-bold text-destructive">{t("vasculink.arch.l3Title")}</h3>
            <Badge variant="outline" className="text-[10px]">{t("vasculink.arch.l3Badge")}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{t("vasculink.arch.l3Desc")}</p>
        </div>
      </CardContent>
    </Card>
  );
}
