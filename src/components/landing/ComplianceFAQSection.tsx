import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTranslation } from "@/i18n/context";

type ComplianceFaqItem = { q: string; a: string };

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function ComplianceFAQSection() {
  const { t } = useTranslation();
  const items = (t("home.complianceFaq.items") as unknown as ComplianceFaqItem[]) || [];

  return (
    <section
      id="compliance-faq"
      aria-labelledby="compliance-faq-title"
      className="py-20 bg-background scroll-mt-20 border-t border-border/40"
    >
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 mb-3">
              <span className="text-xs font-semibold tracking-wide text-primary uppercase">
                {t("home.complianceFaq.badge")}
              </span>
            </div>
            <h2 id="compliance-faq-title" className="text-3xl md:text-4xl font-bold mb-3">
              {t("home.complianceFaq.title")}
            </h2>
            <p className="text-muted-foreground text-base">
              {t("home.complianceFaq.subtitle")}
            </p>
          </motion.div>

          <Accordion type="single" collapsible className="w-full">
            {items.map((item, i) => (
              <AccordionItem
                key={i}
                value={`compliance-faq-${i}`}
                className="border-border/60"
              >
                <AccordionTrigger className="text-left text-base hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="mt-8 text-center text-xs text-muted-foreground italic max-w-2xl mx-auto">
            {t("home.complianceFaq.disclaimer")}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * JSON-LD for the compliance FAQ (SEO/GEO).
 * Locale-static (EN) — metadata for crawlers.
 */
export const complianceFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does \"no regulatory approval\" mean for AquaMR Flow?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AquaMR Flow is a research prototype, not a CE-marked or FDA-cleared medical device. It is not intended for unsupervised diagnosis or treatment. Every decision-support output requires confirmation by a qualified clinician.",
      },
    },
    {
      "@type": "Question",
      name: "How is auditability ensured?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every clinical action (read, write, export, decision) is timestamped and attributable to an authenticated user. Logs are immutable in our backend and accessible to institution administrators upon request.",
      },
    },
    {
      "@type": "Question",
      name: "How is data security designed in?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Encryption at rest and in transit, Row-Level Security on all sensitive tables, role-based access control, pseudonymization of patient data, and an architecture targeting GDPR / Swiss nFADP and IEC 62304 compliance.",
      },
    },
  ],
};
