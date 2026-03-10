import { Link } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useTranslation } from "@/i18n/context";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UsageLimitBannerProps {
  current: number;
  limit: number;
  featureKey: string;
}

/**
 * Shows a banner when a free user is approaching or has reached their usage limit.
 * Hidden for subscribed users.
 */
export function UsageLimitBanner({ current, limit, featureKey }: UsageLimitBannerProps) {
  const { subscribed, isLoading } = useSubscription();
  const { t } = useTranslation();

  if (isLoading || subscribed) return null;

  const atLimit = current >= limit;
  const nearLimit = current >= limit - 1;

  if (!nearLimit) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 rounded-lg border ${atLimit ? "bg-destructive/10 border-destructive/30" : "bg-warning/10 border-warning/30"}`}>
      <div className="flex items-center gap-3 min-w-0">
        <Crown className={`h-4 w-4 shrink-0 ${atLimit ? "text-destructive" : "text-warning"}`} />
        <p className="text-sm leading-snug">
          {atLimit
            ? (t("premiumGate.limitReached") as string).replace("{{feature}}", t(`premiumGate.features.${featureKey}`) as string)
            : (t("premiumGate.limitNear") as string)
              .replace("{{current}}", String(current))
              .replace("{{limit}}", String(limit))
              .replace("{{feature}}", t(`premiumGate.features.${featureKey}`) as string)}
        </p>
      </div>
      <Button asChild size="sm" variant={atLimit ? "default" : "outline"} className="shrink-0 self-end sm:self-auto">
        <Link to="/pricing">{t("premiumGate.upgrade")}</Link>
      </Button>
    </div>
  );
}
