import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, HeartPulse, ArrowLeft, Loader2, Globe } from "lucide-react";
import { useTranslation, type Language } from "@/i18n/context";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SEOHead } from "@/components/SEOHead";
import { useSubscription, STRIPE_PLANS } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const planKeys = ["individual", "professional", "institution"] as const;

export default function Pricing() {
  const { t, language, setLanguage } = useTranslation();
  const { session } = useAuth();
  const navigate = useNavigate();
  const { currentPlan, subscribed, openPortal, createCheckout } = useSubscription();
  const { toast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const plans = planKeys.map((key) => ({
    key,
    name: t(`pricing.plans.${key}.name`),
    price: t(`pricing.plans.${key}.price`),
    period: t(`pricing.plans.${key}.period`),
    description: t(`pricing.plans.${key}.desc`),
    features: (t(`pricing.plans.${key}.features`) as any) as string[],
    cta: t(`pricing.plans.${key}.cta`),
    popular: key === "professional",
  }));

  const handleCheckout = async (planKey: string) => {
    if (planKey === "institution") {
      navigate("/contact");
      return;
    }
    if (!session) {
      navigate("/auth?mode=signup");
      return;
    }
    if (planKey === "individual") {
      // Free tier — already accessible after signup
      navigate("/app");
      return;
    }

    setCheckoutLoading(planKey);
    try {
      await createCheckout(STRIPE_PLANS.professional.price_id);
    } catch (err: any) {
      toast({ title: t("auth.error"), description: err.message, variant: "destructive" });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManage = async () => {
    try {
      await openPortal();
    } catch (err: any) {
      toast({ title: t("auth.error"), description: err.message, variant: "destructive" });
    }
  };

  const getButtonAction = (planKey: string) => {
    const label = plans.find(p => p.key === planKey)!.cta;
    if (planKey === "institution") {
      return { href: "/contact", onClick: undefined, label };
    }
    if (planKey === "individual") {
      if (!session) return { href: "/auth?mode=signup", onClick: undefined, label };
      if (currentPlan === "individual" && !subscribed) return { href: undefined, onClick: undefined, label: t("pricing.currentPlan"), disabled: true };
      return { href: "/app", onClick: undefined, label };
    }
    // professional
    if (subscribed && currentPlan === "professional") {
      return { href: undefined, onClick: handleManage, label: t("pricing.managePlan") };
    }
    return { href: undefined, onClick: () => handleCheckout(planKey), label };
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("seo.pricing.title") as string}
        description={t("seo.pricing.description") as string}
        path="/pricing"
      />
      <nav className="border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <HeartPulse className="h-5 w-5 text-primary" />
            <span className="font-bold">AquaMR Flow</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Globe className="h-4 w-4" />
                {language.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(["en", "fr", "de"] as const).map((lang) => (
                <DropdownMenuItem key={lang} onClick={() => setLanguage(lang)} className={language === lang ? "font-semibold" : ""}>
                  {lang === "en" ? "English" : lang === "fr" ? "Français" : "Deutsch"}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Beta highlight banner */}
        <div className="max-w-3xl mx-auto mb-8 sm:mb-10 rounded-2xl border-2 border-success/30 bg-success/5 px-4 sm:px-6 py-4 sm:py-5 text-center">
          <p className="text-base sm:text-lg font-semibold text-success mb-1">{t("pricing.betaBannerTitle")}</p>
          <p className="text-sm text-muted-foreground">{t("pricing.betaBannerDesc")}</p>
        </div>

        <div className="text-center mb-10 sm:mb-16">
          <Badge className="mb-4 bg-success/10 text-success border-success/30">{t("pricing.betaBadge")}</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t("pricing.title")}</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {t("pricing.subtitle")}
          </p>
          <p className="text-sm text-muted-foreground/90 mt-3 max-w-xl mx-auto">{t("pricing.betaNote")}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = session && (
              (plan.key === "individual" && currentPlan === "individual") ||
              (plan.key === "professional" && currentPlan === "professional" && subscribed)
            );
            const action = getButtonAction(plan.key);

            return (
              <Card
                key={plan.key}
                className={`relative flex flex-col ${plan.popular ? "border-primary shadow-lg ring-1 ring-primary/20" : ""} ${isCurrentPlan ? "ring-2 ring-success" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    {t("pricing.mostPopular")}
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4 bg-success text-success-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    ✓ {t("pricing.currentPlan")}
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    {plan.key === "professional" ? (
                      <>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-success">Gratuit</span>
                          <span className="text-sm text-muted-foreground">pendant la bêta</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          <span className="line-through">{plan.price}{plan.period}</span> au lancement officiel
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground ml-1">{plan.period}</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {Array.isArray(plan.features) && plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {action.href ? (
                    <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"}>
                      <Link to={action.href}>{action.label}</Link>
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                      onClick={action.onClick}
                      disabled={checkoutLoading === plan.key || (action as any).disabled}
                    >
                      {checkoutLoading === plan.key ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {t("common.loading")}</>
                      ) : (
                        action.label
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
