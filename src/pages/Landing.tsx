import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import dashboardPreview from "@/assets/dashboard-preview.jpg";
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
  ChevronUp,
  ClipboardList,
  Stethoscope,
  Calculator,
  FileText,
  Link2,
} from "lucide-react";
import { FAQSection } from "@/components/landing/FAQSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { AboutSection } from "@/components/landing/AboutSection";
import {
  EnBrefSection,
  AudienceSection,
  HowItWorksFRSection,
  UseCasesSection,
  LimitsSection,
  HomeFAQSection,
  homeFaqJsonLd,
} from "@/components/landing/HomeSections";

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

const primaryIcons = [Brain, HeartPulse, Calculator, Activity, FlaskConical, LineChart];
const primaryKeys = ["procedurePlanner", "fusionViewer", "ciAkiEngine", "twin", "simulation", "registry"] as const;
const primaryPaths = ["/app/procedure-planner", "/app/fusion-viewer", "/app/ci-aki-engine", "/app/digital-twin", "/app/simulation", "/app/registry"];

const secondaryIcons = [BookOpen, FileText, Stethoscope, Link2];
const secondaryKeys = ["education", "research", "analytics", "fhir"] as const;
const secondaryPaths = ["/app/education", "/app/research", "/app/analytics", "/app/patients"];

export default function Landing() {
  const { t, language, setLanguage } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const langLabels: Record<Language, string> = { en: "EN", fr: "FR", de: "DE" };

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const primaryModules = primaryKeys.map((key, i) => ({
    icon: primaryIcons[i],
    title: t(`landing.modules.${key}.title`),
    description: t(`landing.modules.${key}.desc`),
    path: primaryPaths[i],
  }));

  const secondaryModules = secondaryKeys.map((key, i) => ({
    icon: secondaryIcons[i],
    title: t(`landing.modules.${key}.title`),
    description: t(`landing.modules.${key}.desc`),
    path: secondaryPaths[i],
  }));

  const trustSignals: string[] = (t("landing.trust.signals") as any) || [];

  // JSON-LD: minimal, non-risky structured data (WebPage + SoftwareApplication + FAQPage)
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://aquamr-flow.com/#webpage",
        url: "https://aquamr-flow.com/",
        name: "AquaMR Flow — Plateforme de workflow non ionisant pour la médecine vasculaire",
        description:
          "AquaMR Flow est une plateforme de workflow non ionisant pour la médecine vasculaire : planification, imagerie, simulation clinique et registre de recherche.",
        inLanguage: "fr",
      },
      {
        "@type": "SoftwareApplication",
        name: "AquaMR Flow",
        applicationCategory: "HealthApplication",
        operatingSystem: "Web",
        url: "https://aquamr-flow.com",
        description:
          "Plateforme de workflow non ionisant pour la médecine vasculaire : planification, imagerie, simulation clinique et registre de recherche.",
      },
      homeFaqJsonLd,
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to content – accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg">
        {t("landing.footer.skipToContent")}
      </a>
      <SEOHead
        title="AquaMR Flow | Plateforme de workflow non ionisant pour la médecine vasculaire"
        description="AquaMR Flow est une plateforme de workflow non ionisant pour la médecine vasculaire : planification, imagerie, simulation clinique et registre de recherche."
        path="/"
        jsonLd={structuredData}
      />
      <header>
      <nav className="fixed top-0 w-full z-50 glass-strong" aria-label="Main navigation">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">AquaMR Flow</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#modules" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("landing.nav.explore")}
            </a>
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
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-6 mt-8">
                <a href="#modules" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
                  {t("landing.nav.explore")}
                </a>
                <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
                  {t("landing.nav.pricing")}
                </Link>
                <Link to="/auth" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileOpen(false)}>
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
                <Button asChild className="mt-2" onClick={() => setMobileOpen(false)}>
                  <Link to="/auth?mode=signup">{t("common.getStarted")}</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      </header>

      <main id="main-content">
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
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-8 backdrop-blur-sm max-w-[90vw]">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground/80" />
              <span className="text-sm font-medium text-primary-foreground/80">
                Prototype de recherche — médecine vasculaire
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-[1.08] mb-6 max-w-4xl mx-auto">
              AquaMR Flow :{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, hsl(220 80% 70%), hsl(165 60% 60%))" }}>
                plateforme de workflow non ionisant pour la médecine vasculaire
              </span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/60 max-w-2xl mx-auto mb-10 leading-relaxed">
              Planifiez les procédures, organisez les données d’imagerie, structurez la simulation clinique et
              centralisez les registres de recherche dans une interface unique.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="text-base px-8 h-12 shadow-lg shadow-primary/25">
                <a href="#comment-ca-marche">
                  Voir comment ça fonctionne
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8 h-12 border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 backdrop-blur-sm">
                <Link to="/pricing">Voir les tarifs</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-primary-foreground/60 max-w-xl mx-auto leading-relaxed">
              Prototype de recherche conçu pour les équipes impliquées dans la préparation et l’analyse des
              procédures vasculaires.
            </p>
          </motion.div>
          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <div className="rounded-2xl border border-primary-foreground/10 shadow-2xl shadow-primary/10 overflow-hidden bg-card/5 backdrop-blur-sm">
              <img
                src={dashboardPreview}
                alt="AquaMR Flow clinical dashboard showing patient statistics, risk distribution and module overview"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
            <p className="mt-4 text-sm text-primary-foreground/40 italic">
              {t("landing.hero.dashboardCaption")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorksSection />

      {/* Modules */}
      <section id="modules" className="py-24 bg-background scroll-mt-20">
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
            {primaryModules.map((mod, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
              >
                <Link to={mod.path} className="group relative rounded-2xl border bg-card p-5 sm:p-7 card-hover shine-hover block h-full">
                  <div className="relative z-10">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors duration-300">
                      <mod.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2.5">{mod.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{mod.description}</p>
                    <span className="inline-flex items-center gap-1 mt-4 text-xs font-medium text-primary opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {t("common.learnMore")} <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Secondary modules — compact */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mt-16 mb-8"
          >
            <h3 className="text-2xl font-bold mb-2">{t("landing.modules.moreTitle")}</h3>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">
              {t("landing.modules.moreSubtitle")}
            </p>
          </motion.div>
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {secondaryModules.map((mod, i) => (
              <motion.div key={i} custom={i} variants={fadeUp}>
                <Link to={mod.path} className="group flex flex-col items-center text-center rounded-xl border bg-card p-5 card-hover block h-full">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors duration-300">
                    <mod.icon className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="text-sm font-semibold mb-1">{mod.title}</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">{mod.description}</p>
                </Link>
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

      {/* Testimonials */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">{t("landing.testimonials.title")}</h2>
          <p className="text-sm text-muted-foreground text-center mb-12">{t("landing.testimonials.disclaimer")}</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
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

      {/* FAQ */}
      <FAQSection />

      {/* About */}
      <AboutSection />

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

      <footer className="border-t py-8 sm:py-12 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <HeartPulse className="h-5 w-5 text-primary" />
                <span className="font-semibold">AquaMR Flow</span>
              </div>
              <p className="text-sm text-muted-foreground">{t("landing.footer.tagline")}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{t("landing.footer.notMedicalDevice")}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">{t("landing.footer.product")}</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link to="/pricing" className="hover:text-foreground transition-colors">{t("landing.nav.pricing")}</Link>
                <Link to="/auth?mode=signup" className="hover:text-foreground transition-colors">{t("common.getStarted")}</Link>
                <Link to="/support" className="hover:text-foreground transition-colors">{t("landing.footer.contact")}</Link>
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
          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} EMOTIONSCARE SASU — Amiens, France. {t("landing.footer.rights")}
            </p>
            <div className="flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 text-muted-foreground mr-1" />
              {(["en", "fr", "de"] as Language[]).map((lang) => (
                <Button
                  key={lang}
                  variant={language === lang ? "default" : "ghost"}
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                  onClick={() => setLanguage(lang)}
                >
                  {langLabels[lang]}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-top"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center hover:bg-primary/90 transition-colors"
            aria-label="Scroll to top"
          >
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
