import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, HeartPulse, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { SEOHead } from "@/components/SEOHead";
import { useSubscription } from "@/hooks/useSubscription";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type VerifyState = "loading" | "verified" | "failed";

export default function CheckoutSuccess() {
  const { t } = useTranslation();
  const { checkSubscription } = useSubscription();
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [verifyState, setVerifyState] = useState<VerifyState>(sessionId ? "loading" : "verified");

  useEffect(() => {
    if (!sessionId || !session?.access_token) {
      // No session_id param — legacy flow, just refresh subscription
      const timer = setTimeout(() => checkSubscription(), 2000);
      return () => clearTimeout(timer);
    }

    // Server-side verification of Stripe checkout session
    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-checkout-session", {
          body: { sessionId },
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (error || !data?.valid) {
          console.error("Checkout verification failed:", error || data?.error);
          setVerifyState("failed");
          return;
        }

        setVerifyState("verified");
        checkSubscription();
      } catch {
        setVerifyState("failed");
      }
    };

    verify();
  }, [sessionId, session?.access_token, checkSubscription]);

  if (verifyState === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6 sm:p-6">
        <SEOHead title={t("checkout.success.verifying") as string || "Verifying Payment — Vascular Atlas"} description={t("checkout.success.desc") as string} path="/checkout/success" noindex />
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6 sm:pt-10 sm:pb-8 space-y-6">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">{t("checkout.success.verifying")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verifyState === "failed") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6 sm:p-6">
        <SEOHead title={t("checkout.success.verifyFailed") as string || "Verification Issue — Vascular Atlas"} description={t("checkout.success.verifyFailedDesc") as string} path="/checkout/success" noindex />
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6 sm:pt-10 sm:pb-8 space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">{t("checkout.success.verifyFailed")}</h1>
              <p className="text-muted-foreground">{t("checkout.success.verifyFailedDesc")}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link to="/app">
                  {t("checkout.success.goToDashboard")}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/support">{t("support.title")}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6 sm:p-6">
      <SEOHead title={`${t("checkout.success.title")} — Vascular Atlas`} description={t("checkout.success.desc") as string} path="/checkout/success" noindex />
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-6 sm:pt-10 sm:pb-8 space-y-6">
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
