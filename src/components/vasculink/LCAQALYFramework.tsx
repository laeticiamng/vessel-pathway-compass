import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Coins } from "lucide-react";
import { useTranslation } from "@/i18n/context";

const STAGE_KEYS = ["raw", "manufacturing", "use", "maintenance", "eol"] as const;
const PARAM_KEYS = [
  "comparator", "horizon", "perspective", "discount",
  "outcomes", "costs", "icer", "sensitivity",
] as const;

export function LCAQALYFramework({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Card className={className} data-testid="lca-qaly-framework">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Leaf className="h-4 w-4 text-primary" />
          {t("vasculink.lca.title")}
        </CardTitle>
        <CardDescription>{t("vasculink.lca.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-xs font-semibold mb-2 flex items-center gap-1">
            <Leaf className="h-3 w-3 text-primary" /> {t("vasculink.lca.stagesTitle")}
          </p>
          <ul className="space-y-2">
            {STAGE_KEYS.map((k) => (
              <li key={k} className="rounded-lg border p-3 bg-muted/30">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm font-semibold">{t(`vasculink.lca.stages.${k}.stage`)}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {t(`vasculink.lca.stages.${k}.indicator`)}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {t(`vasculink.lca.stages.${k}.scope`)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold mb-2 flex items-center gap-1">
            <Coins className="h-3 w-3 text-primary" /> {t("vasculink.lca.paramsTitle")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {PARAM_KEYS.map((k) => (
              <div key={k} className="rounded-lg border p-3 bg-background">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {t(`vasculink.lca.params.${k}.p`)}
                </p>
                <p className="text-xs font-medium mt-0.5">
                  {t(`vasculink.lca.params.${k}.v`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground italic">
          {t("vasculink.lca.footer")}
        </p>
      </CardContent>
    </Card>
  );
}
