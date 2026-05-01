import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag } from "lucide-react";
import { useTranslation } from "@/i18n/context";

const MILESTONE_KEYS = ["J1", "J2", "J3", "J4", "J5"] as const;

export function ThesisMilestones({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Card className={className} data-testid="thesis-milestones">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Flag className="h-4 w-4 text-primary" />
          {t("vasculink.milestones.title")}
        </CardTitle>
        <CardDescription>{t("vasculink.milestones.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {MILESTONE_KEYS.map((id) => (
            <li
              key={id}
              data-testid={`milestone-${id}`}
              className="flex items-start gap-3 rounded-xl border p-3 bg-muted/30"
            >
              <div className="flex flex-col items-center min-w-[3.5rem]">
                <Badge variant="default" className="font-mono text-xs">{id}</Badge>
                <span className="text-[10px] text-muted-foreground mt-1">
                  {t(`vasculink.milestones.items.${id}.month`)}
                </span>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold">{t(`vasculink.milestones.items.${id}.title`)}</p>
                <p className="text-xs text-muted-foreground">
                  {t(`vasculink.milestones.items.${id}.criterion`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
