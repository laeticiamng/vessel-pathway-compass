import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, HeartPulse, HelpCircle } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "@/i18n/context";

type FaqItem = { q: string; a: string };

export default function FAQ() {
  const { t } = useTranslation();
  const faqs = (t("pages.faq.items") as unknown as FaqItem[]) ?? [];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("pages.faq.seoTitle") as string}
        description={t("pages.faq.seoDescription") as string}
        path="/faq"
        jsonLd={faqJsonLd}
      />

      <header className="border-b">
        <nav className="container mx-auto flex items-center justify-between h-16 px-6" aria-label={t("home.nav.simpleAria") as string}>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">AquaMR Flow</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              {t("pages.common.backHome")}
            </Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="text-center mb-12">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t("pages.faq.title")}</h1>
          <p className="text-muted-foreground text-lg">{t("pages.faq.subtitle")}</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border-border/60">
              <AccordionTrigger className="text-left text-base hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <section aria-labelledby="faq-next-title" className="mt-16 rounded-2xl border bg-card p-8 text-center">
          <h2 id="faq-next-title" className="text-xl font-semibold mb-3">
            {t("pages.faq.cantFindTitle")}
          </h2>
          <p className="text-muted-foreground mb-6">{t("pages.faq.cantFindDesc")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/contact">{t("pages.common.contactUs")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/pricing">{t("pages.common.seePricing")}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/securite-confidentialite">{t("pages.common.security")}</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">{t("pages.common.home")}</Link>
          <span className="mx-2">•</span>
          <Link to="/pricing" className="hover:text-foreground">{t("pages.common.pricing")}</Link>
          <span className="mx-2">•</span>
          <Link to="/contact" className="hover:text-foreground">{t("pages.common.contact")}</Link>
          <span className="mx-2">•</span>
          <Link to="/securite-confidentialite" className="hover:text-foreground">{t("pages.common.security")}</Link>
        </div>
      </footer>
    </div>
  );
}
