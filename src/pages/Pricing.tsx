import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, HeartPulse, ArrowLeft } from "lucide-react";

const plans = [
  {
    name: "Individual",
    price: "Free",
    period: "forever",
    description: "For individual physicians exploring the platform",
    features: [
      "AI Clinical Assistant (limited)",
      "5 patient cases",
      "Education hub access",
      "Community forum access",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Professional",
    price: "$99",
    period: "/month",
    description: "For practicing vascular physicians",
    features: [
      "Unlimited AI Assistant",
      "Unlimited patient cases",
      "Digital Twin + Timeline",
      "Outcomes registry",
      "Full education + certification",
      "Simulation lab access",
      "Expert consultations (5/mo)",
    ],
    cta: "Start Trial",
    popular: true,
  },
  {
    name: "Institution",
    price: "Custom",
    period: "per seat",
    description: "For hospitals and vascular centers",
    features: [
      "Everything in Professional",
      "Multi-tenant workspace",
      "Aggregate dashboards",
      "Benchmarking analytics",
      "Research hub + study builder",
      "Compliance center",
      "SSO integration",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
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
          <h1 className="text-4xl font-bold mb-4">Plans & Pricing</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            From individual physicians to large institutions — find the right plan for your vascular practice.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${plan.popular ? "border-primary shadow-lg ring-1 ring-primary/20" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
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
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"}>
                  <Link to="/auth?mode=signup">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
