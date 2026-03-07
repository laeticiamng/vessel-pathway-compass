import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, HeartPulse, ArrowLeft, Loader2 } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { SEOHead } from "@/components/SEOHead";
import { useSubscription, STRIPE_PLANS } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const planKeys = ["individual", "professional", "institution"] as const;

export default function Pricing() {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { currentPlan, subscribed, openPortal } = useSubscription();
  const { toast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const { createCheckout } = useSubscription();

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
    if (planKey === "institution") return;
    if (!session) {
      window.location.href = "/auth?mode=signup";
      return;
    }
    if (planKey === "individual") return;

    setCheckoutLoading(planKey);
    try {
      await createCheckout(STRIPE_PLANS.professional.price_id);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManage = async () => {
    try {
      await openPortal();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const getButtonAction = (planKey: string) => {
    if (planKey === "institution") {
      return { href: "/support", onClick: undefined, label: plans.find(p => p.key === planKey)!.cta };
    }
    if (planKey === "individual") {
      if (!session) return { href: "/auth?mode=signup", onClick: undefined, label: plans.find(p => p.key === planKey)!.cta };
      if (currentPlan === "individual" && !subscribed) return { href: undefined, onClick: undefined, label: t("pricing.currentPlan") || "Current Plan", disabled: true };
      return { href: "/auth?mode=signup", onClick: undefined, label: plans.find(p => p.key === planKey)!.cta };
    }
    // professional
    if (subscribed && currentPlan === "professional") {
      return { href: undefined, onClick: handleManage, label: t("pricing.managePlan") || "Manage Plan" };
    }
    return { href: undefined, onClick: () => handleCheckout(planKey), label: plans.find(p => p.key === planKey)!.cta };
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Pricing — Vascular Atlas Plans"
        description="Compare Vascular Atlas plans: Free Individual, $99/mo Professional, and custom Institution pricing. All features free during beta."
        path="/pricing"
      />
      <nav className="border-b">
        <div className="container mx-auto flex items-center h-16 px-6">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <HeartPulse className="h-5 w-5 text-primary" />
            <span className="font-bold">Vascular Atlas</span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-success/10 text-success border-success/30">{t("pricing.betaBadge")}</Badge>
          <h1 className="text-4xl font-bold mb-4">{t("pricing.title")}</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
                    ✓ {t("pricing.currentPlan") || "Your Plan"}
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
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
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...</>
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
