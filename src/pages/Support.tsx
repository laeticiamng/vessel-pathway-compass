import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, HeartPulse, Mail, MessageCircle, BookOpen, Shield } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import { SEOHead } from "@/components/SEOHead";

export default function Support() {
  const { t } = useTranslation();

  const faqItems: { q: string; a: string }[] = (t("support.faq.items") as any) || [];

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

      <div className="container mx-auto px-6 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">{t("support.title")}</h1>
        <p className="text-muted-foreground mb-8">{t("support.subtitle")}</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <Card>
            <CardContent className="pt-6 flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t("support.email.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("support.email.desc")}</p>
                <a href="mailto:support@vascularatlas.com" className="text-sm text-primary hover:underline mt-2 inline-block">
                  support@vascularatlas.com
                </a>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{t("support.response.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("support.response.desc")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold mb-6">{t("support.faq.title")}</h2>
        <div className="space-y-4">
          {Array.isArray(faqItems) && faqItems.map((item, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.q}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid sm:grid-cols-2 gap-4">
          <Button variant="outline" asChild>
            <Link to="/legal/terms" className="gap-2">
              <Shield className="h-4 w-4" />
              {t("support.links.terms")}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/legal/privacy" className="gap-2">
              <BookOpen className="h-4 w-4" />
              {t("support.links.privacy")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
