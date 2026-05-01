import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText } from "lucide-react";
import { useTranslation } from "@/i18n/context";

const COMMANDMENT_KEYS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "c10"] as const;

export function TenCommandments({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Card className={className} data-testid="ten-commandments">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-primary" />
          {t("vasculink.commandments.title")}
        </CardTitle>
        <CardDescription>{t("vasculink.commandments.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2">
          {COMMANDMENT_KEYS.map((k, i) => (
            <li key={k} className="flex items-start gap-3 rounded-lg border p-3">
              <span className="font-mono text-xs font-bold text-primary min-w-[1.5rem]">{i + 1}.</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{t(`vasculink.commandments.items.${k}.gesture`)}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  → {t(`vasculink.commandments.items.${k}.mapping`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
