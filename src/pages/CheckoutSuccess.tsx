import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, HeartPulse, ArrowRight } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { SEOHead } from "@/components/SEOHead";
import { useSubscription } from "@/hooks/useSubscription";
import { useEffect } from "react";

export default function CheckoutSuccess() {
  const { t } = useTranslation();
  const { checkSubscription } = useSubscription();

  useEffect(() => {
    // Refresh subscription status after successful checkout
    const timer = setTimeout(() => checkSubscription(), 2000);
    return () => clearTimeout(timer);
  }, [checkSubscription]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <SEOHead title="Subscription Confirmed — Vascular Atlas" description="Your subscription is now active." path="/checkout/success" />
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-10 pb-8 space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">{t("checkout.success.title")}</h1>
            <p className="text-muted-foreground">{t("checkout.success.desc")}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link to="/app">
                {t("checkout.success.goToDashboard")}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/app/settings">{t("checkout.success.viewSettings")}</Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
            <HeartPulse className="h-3.5 w-3.5" />
            <span>Vascular Atlas Professional</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
