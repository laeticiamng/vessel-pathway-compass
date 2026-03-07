import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ArrowRight, Loader2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/context";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function SubscriptionSettingsCard() {
  const { t } = useTranslation();
  const { subscribed, currentPlan, subscriptionEnd, isLoading, openPortal } = useSubscription();
  const { toast } = useToast();
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      await openPortal();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" /> {t("settings.plan.title")}
        </CardTitle>
        <CardDescription>{t("settings.plan.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{t("settings.plan.currentPlan")}</span>
                <Badge variant={subscribed ? "default" : "secondary"}>
                  {subscribed ? "Professional" : t("settings.plan.free")}
                </Badge>
              </div>
              {subscribed ? (
                <Button variant="outline" size="sm" onClick={handleManage} disabled={portalLoading}>
                  {portalLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                  )}
                  {t("pricing.managePlan") || "Manage Plan"}
                </Button>
              ) : (
                <Button asChild variant="default" size="sm">
                  <Link to="/pricing">
                    {t("settings.plan.viewPlans")}
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Link>
                </Button>
              )}
            </div>
            {subscribed && subscriptionEnd && (
              <p className="text-xs text-muted-foreground">
                Renews on {new Date(subscriptionEnd).toLocaleDateString()}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
