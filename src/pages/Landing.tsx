import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation, type Language } from "@/i18n/context";
import { SEOHead } from "@/components/SEOHead";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Brain,
  Activity,
  LineChart,
  BookOpen,
  FlaskConical,
  Globe,
  Shield,
  ArrowRight,
  HeartPulse,
  CheckCircle2,
  Menu,
  Sparkles,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const moduleIcons = [Brain, Activity, LineChart, BookOpen, FlaskConical, Globe];
const moduleKeys = ["ai", "twin", "registry", "education", "simulation", "network"] as const;

export default function Landing() {
  const { t, language, setLanguage } = useTranslation();
  const langLabels: Record<Language, string> = { en: "EN", fr: "FR", de: "DE" };

  const modules = moduleKeys.map((key, i) => ({
    icon: moduleIcons[i],
    title: t(`landing.modules.${key}.title`),
    description: t(`landing.modules.${key}.desc`),
  }));

  const trustSignals: string[] = (t("landing.trust.signals") as any) || [];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Vascular Atlas?",
        "acceptedAnswer": { "@type": "Answer", "text": "Vascular Atlas is an AI-powered clinical platform for vascular medicine that unifies patient case management, AI-assisted reporting, outcomes registry, certification, clinical simulation, and expert networking." }
      },
      {
        "@type": "Question",
        "name": "Who is Vascular Atlas for?",
        "acceptedAnswer": { "@type": "Answer", "text": "Vascular Atlas is designed for vascular surgeons, angiologists, interventional radiologists, trainees, and hospital departments specializing in vascular medicine." }
      },
      {
        "@type": "Question",
        "name": "How much does Vascular Atlas cost?",
        "acceptedAnswer": { "@type": "Answer", "text": "Vascular Atlas offers a free Individual plan, a Professional plan at $99/month, and custom Institution pricing. All features are currently free during the beta period." }
      },
      {
        "@type": "Question",
        "name": "Is Vascular Atlas a medical device?",
        "acceptedAnswer": { "@type": "Answer", "text": "No. Vascular Atlas is a clinical workflow and documentation platform. It is not a certified medical device. All AI outputs require clinician confirmation before use." }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Vascular Atlas — AI-Powered Clinical Platform for Vascular Medicine"
        description="Unify AI clinical reports, patient case management, outcomes registry, certification, simulation and expert networking for vascular surgeons and angiologists. Free during beta."
        path="/"
        jsonLd={faqJsonLd}
      />
      <header>
      <nav className="fixed top-0 w-full z-50 glass-strong" aria-label="Main navigation">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Vascular Atlas</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("landing.nav.pricing")}
            </Link>
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("landing.nav.signIn")}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Globe className="h-4 w-4" />
                  {langLabels[language]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(["en", "fr", "de"] as Language[]).map((lang) => (
                  <DropdownMenuItem key={lang} onClick={() => setLanguage(lang)} className={language === lang ? "font-semibold" : ""}>
                    {lang === "en" ? "English" : lang === "fr" ? "Français" : "Deutsch"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild size="sm" className="shadow-md">
              <Link to="/auth?mode=signup">{t("common.getStarted")}</Link>
            </Button>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-6 mt-8">
                <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
                  {t("landing.nav.pricing")}
                </Link>
                <Link to="/auth" className="text-sm font-medium hover:text-primary transition-colors">
                  {t("landing.nav.signIn")}
                </Link>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    {(["en", "fr", "de"] as Language[]).map((lang) => (
                      <Button
                        key={lang}
                        variant={language === lang ? "default" : "outline"}
                        size="sm"
                        className="px-3 text-xs"
                        onClick={() => setLanguage(lang)}
                      >
                        {langLabels[lang]}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button asChild className="mt-2">
                  <Link to="/auth?mode=signup">{t("common.getStarted")}</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      </header>

      <main>
      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(220_70%_50%_/_0.18),_transparent_60%)]" />
        {/* Dot grid overlay for depth */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, hsl(0 0% 100%) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-8 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground/80" />
              <span className="text-sm font-medium text-primary-foreground/80">
                {t("landing.hero.badge")}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-[1.08] mb-6 max-w-4xl mx-auto">
              {t("landing.hero.headlinePre")}{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, hsl(220 80% 70%), hsl(165 60% 60%))" }}>
                {t("landing.hero.headlineHighlight")}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t("landing.hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="text-base px-8 h-12 shadow-lg shadow-primary/25">
                <Link to="/auth?mode=signup">
                  {t("landing.hero.cta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8 h-12 border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 backdrop-blur-sm">
                <Link to="/pricing">{t("landing.hero.secondary")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("landing.modules.title")}</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              {t("landing.modules.subtitle")}
            </p>
          </motion.div>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {modules.map((mod, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                className="group relative rounded-2xl border bg-card p-7 card-hover shine-hover"
              >
                <div className="relative z-10">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors duration-300">
                    <mod.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2.5">{mod.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{mod.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-24 bg-muted/40">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">{t("landing.trust.title")}</h2>
              <p className="text-muted-foreground text-lg">
                {t("landing.trust.subtitle")}
              </p>
            </motion.div>
            <div className="grid sm:grid-cols-2 gap-3">
              {Array.isArray(trustSignals) && trustSignals.map((signal, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card border card-hover"
                >
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-sm">{signal}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-muted/20 border-t">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">{t("landing.socialProof.title")}</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">{t("landing.testimonials.title")}</h2>
          <p className="text-sm text-muted-foreground text-center mb-12">{t("landing.testimonials.disclaimer")}</p>
          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {(t("landing.testimonials.items") as any as Array<{ quote: string; author: string; role: string }>)?.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Card className="p-6 h-full card-hover">
                  <CardContent className="p-0">
                    <p className="text-sm italic text-muted-foreground mb-4 leading-relaxed">"{item.quote}"</p>
                    <p className="text-sm font-semibold">{item.author}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern opacity-30" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("landing.cta.title")}</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
              {t("landing.cta.subtitle")}
            </p>
            <Button asChild size="lg" className="text-base px-8 h-12 shadow-lg shadow-primary/20">
              <Link to="/auth?mode=signup">
                {t("landing.cta.button")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
      </main>

      <footer className="border-t py-12 bg-card/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <HeartPulse className="h-5 w-5 text-primary" />
                <span className="font-semibold">Vascular Atlas</span>
              </div>
              <p className="text-sm text-muted-foreground">{t("landing.footer.tagline")}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">{t("landing.footer.product")}</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link to="/pricing" className="hover:text-foreground transition-colors">{t("landing.nav.pricing")}</Link>
                <Link to="/auth?mode=signup" className="hover:text-foreground transition-colors">{t("common.getStarted")}</Link>
                <Link to="/support" className="hover:text-foreground transition-colors">{t("support.title")}</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">{t("landing.footer.legal")}</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link to="/legal/terms" className="hover:text-foreground transition-colors">{t("legal.tabs.terms")}</Link>
                <Link to="/legal/privacy" className="hover:text-foreground transition-colors">{t("legal.tabs.privacy")}</Link>
                <Link to="/legal/notice" className="hover:text-foreground transition-colors">{t("legal.tabs.notice")}</Link>
              </div>
            </div>
          </div>
          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} Vascular Atlas. {t("landing.footer.rights")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
