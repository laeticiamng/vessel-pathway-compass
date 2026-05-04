import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDown,
  Stethoscope,
  Compass,
  FlaskConical,
  Microscope,
  ShieldAlert,
  Target,
  RotateCcw,
  Info,
} from "lucide-react";
import { useTranslation } from "@/i18n/context";

/**
 * VASCU-LINK — Schéma CHUV-ready.
 * Reconstruire la fonction angiographique en 4-zéro :
 * Cartographier · Décider · Guider en simulation · Préparer le préclinique.
 *
 * Couleurs intentionnellement académiques (vert clinique L1, bleu profond
 * cockpit, orange L2, bordeaux L3) — palette dérivée des tokens sémantiques
 * (success / primary / warning / destructive) pour rester cohérent avec le
 * design system et le mode sombre.
 */
export function VasculinkArchitecture({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Card className={className} data-testid="vasculink-architecture">
      <CardHeader className="space-y-2">
        <CardTitle className="text-base md:text-lg leading-snug">
          {t("vasculink.arch.title")}
        </CardTitle>
        <CardDescription className="text-sm">
          {t("vasculink.arch.subtitle")}
        </CardDescription>
        <p className="text-[11px] text-muted-foreground">
          {t("vasculink.arch.tagline")}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bandeau de positionnement clinique */}
        <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("vasculink.arch.positioningTitle")}
            </h3>
          </div>
          <ul className="text-xs space-y-1.5 leading-relaxed">
            <li className="flex gap-2">
              <span className="text-success font-bold">·</span>
              <span>{t("vasculink.arch.positioningDoppler")}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">·</span>
              <span>{t("vasculink.arch.positioningVasculink")}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-muted-foreground font-bold">·</span>
              <span>{t("vasculink.arch.positioningStandard")}</span>
            </li>
          </ul>
        </div>

        {/* L1 — Diagnose (vert clinique) */}
        <div className="rounded-xl border-2 border-success/40 bg-success/5 p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Stethoscope className="h-5 w-5 text-success" />
            <h3 className="font-bold text-success">{t("vasculink.arch.l1Title")}</h3>
            <Badge variant="default" className="text-[10px] bg-success text-success-foreground hover:bg-success/90">
              {t("vasculink.arch.l1Badge")}
            </Badge>
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
                <p className="text-xs font-semibold text-success">{x.t}</p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{x.s}</p>
              </div>
            ))}
          </div>

          {/* Indications cibles */}
          <div className="rounded-lg border border-success/30 bg-background/60 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-3.5 w-3.5 text-success" />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-success">
                {t("vasculink.arch.l1IndicationsTitle")}
              </p>
            </div>
            <p className="text-xs leading-relaxed">{t("vasculink.arch.l1Indications")}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-medium">{t("vasculink.arch.l1Routing")}</p>
            <p className="text-[11px] text-muted-foreground">{t("vasculink.arch.l1RoutingDest")}</p>
          </div>
        </div>

        <div className="flex justify-center"><ArrowDown className="h-5 w-5 text-primary" /></div>

        {/* Cockpit DÉCISION — pivot du schéma (bleu profond) */}
        <div className="rounded-xl bg-primary text-primary-foreground p-5 space-y-3 shadow-md">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Compass className="h-5 w-5" />
              <h3 className="font-bold text-base">{t("vasculink.arch.decisionTitle")}</h3>
            </div>
            <p className="text-xs opacity-90">{t("vasculink.arch.decisionSub")}</p>
          </div>

          {/* Sortie clinique structurée */}
          <div className="rounded-lg bg-primary-foreground/10 p-3 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider opacity-90">
              {t("vasculink.arch.decisionOutputsTitle")}
            </p>
            <p className="text-xs leading-relaxed">{t("vasculink.arch.decisionOutputs")}</p>
          </div>

          {/* Règle de sécurité — encadré très visible */}
          <div className="rounded-lg border-2 border-primary-foreground/60 bg-primary-foreground/15 p-3 space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              <p className="text-[11px] font-bold uppercase tracking-wider">
                {t("vasculink.arch.decisionSafetyTitle")}
              </p>
            </div>
            <p className="text-xs leading-relaxed">{t("vasculink.arch.decisionSafety")}</p>
          </div>

          <div className="space-y-1 pt-1 border-t border-primary-foreground/20">
            <p className="text-[11px] italic opacity-80">{t("vasculink.arch.decisionAdr")}</p>
            <p className="text-[11px] italic opacity-80">{t("vasculink.arch.decisionMigration")}</p>
          </div>
        </div>

        {/* Boucle de feedback longitudinal — visuelle, remonte vers L1 */}
        <div className="relative my-2" aria-label={t("vasculink.arch.followUpLoop")}>
          <div className="rounded-xl border-2 border-dashed border-primary/50 bg-primary/5 px-4 py-3 flex items-center gap-3">
            <div className="flex-shrink-0 rounded-full bg-primary/15 p-2">
              <RotateCcw className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                {t("vasculink.arch.feedbackLoopTitle")}
              </p>
              <p className="text-xs text-foreground/80 leading-snug mt-0.5">
                {t("vasculink.arch.feedbackLoopDesc")}
              </p>
            </div>
            <div className="flex-shrink-0 hidden sm:flex items-center gap-1 text-primary">
              <span className="text-[10px] font-mono uppercase tracking-wider">L1</span>
              <ArrowDown className="h-3.5 w-3.5 rotate-180" />
            </div>
          </div>
          {/* Rail vertical symbolisant le retour vers L1 (haut du schéma) */}
          <div
            aria-hidden
            className="absolute -left-1 top-0 bottom-0 w-0.5 bg-gradient-to-t from-primary/10 via-primary/40 to-primary/10"
          />
        </div>

        <div className="flex justify-center"><ArrowDown className="h-5 w-5 text-warning" /></div>

        {/* L2 — Guide (orange doux / simulation) */}
        <div className="rounded-xl border-2 border-warning/40 bg-warning/5 p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <FlaskConical className="h-5 w-5 text-warning" />
            <h3 className="font-bold text-warning">{t("vasculink.arch.l2Title")}</h3>
            <Badge variant="secondary" className="text-[10px]">{t("vasculink.arch.l2Badge")}</Badge>
          </div>
          <p className="text-xs text-muted-foreground italic">{t("vasculink.arch.l2Caption")}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {[
              t("vasculink.arch.l2Item1"),
              t("vasculink.arch.l2Item2"),
              t("vasculink.arch.l2Item3"),
            ].map((x) => (
              <div key={x} className="rounded-lg bg-background border p-3 text-xs font-medium text-center">
                {x}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-warning/90 font-medium text-center">
            {t("vasculink.arch.l2Limit")}
          </p>
        </div>

        <div className="flex justify-center"><ArrowDown className="h-5 w-5 text-destructive" /></div>

        {/* L3 — Vision préclinique (bordeaux léger) */}
        <div className="rounded-xl border-2 border-destructive/40 bg-destructive/5 p-4 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Microscope className="h-5 w-5 text-destructive" />
            <h3 className="font-bold text-destructive">{t("vasculink.arch.l3Title")}</h3>
            <Badge variant="outline" className="text-[10px]">{t("vasculink.arch.l3Badge")}</Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{t("vasculink.arch.l3Desc")}</p>
        </div>

        {/* Message final */}
        <div className="pt-3 border-t border-border space-y-2 text-center">
          <p className="text-xs font-medium leading-relaxed max-w-3xl mx-auto">
            {t("vasculink.arch.footerMain")}
          </p>
          <p className="text-[11px] text-muted-foreground italic leading-relaxed max-w-3xl mx-auto">
            {t("vasculink.arch.footerSub")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
