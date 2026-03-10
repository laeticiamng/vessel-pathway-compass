import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useTranslation } from "@/i18n/context";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PremiumGateProps {
  children: ReactNode;
  /** Feature name shown in the gate message */
  feature?: string;
}

export function PremiumGate({ children, feature }: PremiumGateProps) {
  const { subscribed, isLoading } = useSubscription();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }
  if (subscribed) return <>{children}</>;

  return (
    <Card className="border-primary/20">
      <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6 text-center">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <Crown className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {t("premiumGate.title")}
        </h3>
        <p className="text-muted-foreground mb-1 max-w-sm">
          {feature
            ? (t("premiumGate.featureDesc") as string).replace("{{feature}}", feature)
            : t("premiumGate.desc")}
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          {t("premiumGate.betaNote")}
        </p>
        <Button asChild>
          <Link to="/pricing">{t("premiumGate.upgrade")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
