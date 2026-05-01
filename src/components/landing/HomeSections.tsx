import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Compass,
  Users,
  Sparkles,
  Stethoscope,
  ScanLine,
  FlaskConical,
  Building2,
  ClipboardList,
  Image as ImageIcon,
  Layers,
  Database,
  HelpCircle,
} from "lucide-react";
import { useTranslation } from "@/i18n/context";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

type TitleDesc = { title: string; desc: string };
type FaqItem = { q: string; a: string };

/* =========================================================================
   EN BREF
   ======================================================================= */
export function EnBrefSection() {
  const { t } = useTranslation();
  const icons = [Compass, Users, Sparkles] as const;
  const items = t<TitleDesc[]>("home.enBref.items", "array");

  return (
    <section aria-labelledby="en-bref-title" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 id="en-bref-title" className="text-3xl md:text-4xl font-bold mb-3">
            {t("home.enBref.title")}
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            {t("home.enBref.subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {items.map((item, i) => {
            const Icon = icons[i] ?? Compass;
            return (
              <motion.article
                key={item.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ delay: i * 0.08, duration: 0.45 }}
                className="rounded-2xl border bg-card p-6 card-hover"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   AUDIENCE
   ======================================================================= */
export function AudienceSection() {
  const { t } = useTranslation();
  const icons = [Stethoscope, ScanLine, FlaskConical, Building2] as const;
  const audiences = t<TitleDesc[]>("home.audience.items", "array");

  return (
    <section aria-labelledby="audience-title" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 id="audience-title" className="text-3xl md:text-4xl font-bold mb-3">
            {t("home.audience.title")}
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            {t("home.audience.subtitle")}
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {audiences.map((a, i) => {
            const Icon = icons[i] ?? Users;
            return (
              <motion.article
                key={a.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="rounded-2xl border bg-card p-5 text-center card-hover"
              >
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-1.5">{a.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   COMMENT ÇA MARCHE
   ======================================================================= */
export function HowItWorksFRSection() {
  const { t } = useTranslation();
  const icons = [ClipboardList, ImageIcon, Layers, Database] as const;
  const steps = t<TitleDesc[]>("home.howItWorks.steps", "array");

  return (
    <section aria-labelledby="how-fr-title" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 id="how-fr-title" className="text-3xl md:text-4xl font-bold mb-3">
            {t("home.howItWorks.title")}
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            {t("home.howItWorks.subtitle")}
          </p>
        </motion.div>

        <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {steps.map((step, i) => {
            const Icon = icons[i] ?? ClipboardList;
            return (
              <motion.li
                key={step.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="rounded-2xl border bg-card p-5 card-hover relative"
              >
                <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center shadow-md">
                  {i + 1}
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-1.5">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/* =========================================================================
   CAS D'USAGE
   ======================================================================= */
export function UseCasesSection() {
  const { t } = useTranslation();
  const cases = t<TitleDesc[]>("home.useCases.items", "array");

  return (
    <section aria-labelledby="usecases-title" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 id="usecases-title" className="text-3xl md:text-4xl font-bold mb-3">
            {t("home.useCases.title")}
          </h2>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            {t("home.useCases.subtitle")}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {cases.map((c, i) => (
            <motion.article
              key={c.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ delay: i * 0.08, duration: 0.45 }}
              className="rounded-2xl border bg-card p-6 card-hover"
            >
              <h3 className="text-lg font-semibold mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* LimitsSection a été déplacé vers src/components/landing/LimitsSection.tsx
   (i18n FR/EN/DE complet, structure enrichie en 4 catégories). */

/* =========================================================================
   FAQ HOMEPAGE
   ======================================================================= */
export function HomeFAQSection() {
  const { t } = useTranslation();
  const faqs = t<FaqItem[]>("home.faq.items", "array");

  return (
    <section aria-labelledby="home-faq-title" className="py-20 bg-muted/40">
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
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <h2 id="home-faq-title" className="text-3xl md:text-4xl font-bold mb-3">
              {t("home.faq.title")}
            </h2>
            <p className="text-muted-foreground text-base">
              {t("home.faq.subtitle")}
            </p>
          </motion.div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, i) => (
              <AccordionItem key={i} value={`home-faq-${i}`} className="border-border/60">
                <AccordionTrigger className="text-left text-base hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            {t("home.faq.moreQuestions")}{" "}
            <Link to="/faq" className="text-primary hover:underline">
              {t("home.faq.seeFullFaq")}
            </Link>{" "}
            {t("home.faq.orWord")}{" "}
            <Link to="/contact" className="text-primary hover:underline">
              {t("home.faq.contactTeam")}
            </Link>
            .
          </div>
        </div>
      </div>
    </section>
  );
}

/* JSON-LD moved to ./jsonLd.ts (pure data module, no React deps).
   Re-exported here for backwards compatibility. */
export { homeFaqJsonLd } from "./jsonLd";
