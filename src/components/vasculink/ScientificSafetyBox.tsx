import { Card, CardContent } from "@/components/ui/card";
import { ShieldAlert, Target } from "lucide-react";
import { useTranslation } from "@/i18n/context";

interface Props {
  className?: string;
}

export function ScientificSafetyBox({ className }: Props) {
  const { t } = useTranslation();
  return (
    <Card className={className} data-testid="scientific-safety-box">
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">{t("vasculink.safety.ambitionTitle")}</p>
          </div>
          <p
            className="text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: t("vasculink.safety.ambitionBody") as string }}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-warning" />
            <p className="text-sm font-semibold">{t("vasculink.safety.boundaryTitle")}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("vasculink.safety.boundaryBody")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
