import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { SEOHead } from "@/components/SEOHead";

export default function CheckoutCancel() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6 sm:p-6">
      <SEOHead title={`${t("checkout.cancel.title")} — Vascular Atlas`} description={t("checkout.cancel.desc") as string} path="/checkout/cancel" noindex />
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-6 sm:pt-10 sm:pb-8 space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <XCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">{t("checkout.cancel.title")}</h1>
            <p className="text-muted-foreground">{t("checkout.cancel.desc")}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link to="/pricing">
                <CreditCard className="h-4 w-4 mr-2" />
                {t("checkout.cancel.backToPricing")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/app">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("checkout.cancel.goToDashboard")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
