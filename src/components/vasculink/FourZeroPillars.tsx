import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radiation, Droplets, Wind, Wallet } from "lucide-react";
import { useTranslation } from "@/i18n/context";

type PillarKey = "radiation" | "contrast" | "helium" | "cost";

const PILLAR_ICONS: Record<PillarKey, typeof Radiation> = {
  radiation: Radiation,
  contrast: Droplets,
  helium: Wind,
  cost: Wallet,
};

const PILLAR_KEYS: PillarKey[] = ["radiation", "contrast", "helium", "cost"];

interface Props {
  className?: string;
  variant?: "full" | "compact";
}

export function FourZeroPillars({ className, variant = "full" }: Props) {
  const { t } = useTranslation();
  return (
    <Card className={className} data-testid="four-zero-pillars">
      <CardHeader>
        <CardTitle className="text-base">{t("vasculink.pillars.title")}</CardTitle>
        <CardDescription>{t("vasculink.pillars.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={
            variant === "compact"
              ? "grid grid-cols-2 gap-3"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
          }
        >
          {PILLAR_KEYS.map((key) => {
            const Icon = PILLAR_ICONS[key];
            const pillar = t(`vasculink.pillars.items.${key}.pillar`);
            const target = t(`vasculink.pillars.items.${key}.target`);
            const benchmark = t(`vasculink.pillars.items.${key}.benchmark`);
            const externality = t(`vasculink.pillars.items.${key}.externality`);
            return (
              <div
                key={key}
                data-testid={`pillar-${key}`}
                className="rounded-xl border p-4 space-y-2 bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold leading-tight">{pillar}</p>
                </div>
                <Badge variant="default" className="text-[10px]">{target}</Badge>
                {variant === "full" && (
                  <>
                    <p className="text-[11px] text-muted-foreground italic">{benchmark}</p>
                    <p className="text-[11px] text-muted-foreground">{externality}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
