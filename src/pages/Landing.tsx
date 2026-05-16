import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import dashboardPreview from "@/assets/dashboard-preview.jpg";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation, type Language } from "@/i18n/context";
import { SEOHead } from "@/components/SEOHead";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Globe,
  Shield,
  ArrowRight,
  CheckCircle2,
  Menu,
  Sparkles,
  ChevronUp,
} from "lucide-react";
import { AquaMRLogo } from "@/components/branding/AquaMRLogo";
import { MedRegBadge } from "@/components/MedRegBadge";
import { NeonGradientText } from "@/components/ui/neon-gradient-text";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LowResourceModeToggle } from "@/components/LowResourceModeToggle";
import { FourZeroBanner } from "@/components/landing/FourZeroBanner";
import { HomeIntroVideoSection } from "@/components/landing/HomeIntroVideoSection";
import { NonInferioritySection } from "@/components/landing/NonInferioritySection";
import { AboveHeroFramingLine } from "@/components/landing/AboveHeroFramingLine";
import { ComplianceBanner } from "@/components/ComplianceBanner";
import { RegulatoryDisclaimer } from "@/components/RegulatoryDisclaimer";
// JSON-LD: pure data module, no React component side-effects
import { homeFaqJsonLd, complianceFaqJsonLd } from "@/components/landing/jsonLd";
import { headerClasses } from "@/lib/breakpoints";
import { organizationJsonLd, founderPersonJsonLd, breadcrumbJsonLd } from "@/lib/seo/schemas";
import { Sculptural, SculpturalLink } from "@/components/sculpture";
import { useGlassScroll } from "@/hooks/useGlassScroll";
import { cn } from "@/lib/utils";


/* -------------------------------------------------------------------------
 * Above-the-fold (eager): PlatformCompletenessSection — anchor target of
 * the desktop/mobile nav, must be ready immediately for #platform-complete.
 * ----------------------------------------------------------------------- */
import { PlatformCompletenessSection } from "@/components/landing/PlatformCompletenessSection";
import { ProtocolHighlightBanner } from "@/components/landing/ProtocolHighlightBanner";

/* -------------------------------------------------------------------------
 * Below-the-fold sections — lazy-loaded to shrink the initial JS bundle.
 * Each chunk is fetched on-demand as the user scrolls.
 * ----------------------------------------------------------------------- */
const WhatsNewSection = lazy(() =>
  import("@/components/landing/WhatsNewSection").then((m) => ({ default: m.WhatsNewSection }))
);
const InteractiveDemoSection = lazy(() =>
  import("@/components/landing/InteractiveDemoSection").then((m) => ({ default: m.InteractiveDemoSection }))
);
const EnBrefSection = lazy(() =>
  import("@/components/landing/HomeSections").then((m) => ({ default: m.EnBrefSection }))
);
const AudienceSection = lazy(() =>
  import("@/components/landing/HomeSections").then((m) => ({ default: m.AudienceSection }))
);
const HowItWorksFRSection = lazy(() =>
  import("@/components/landing/HomeSections").then((m) => ({ default: m.HowItWorksFRSection }))
);
const UseCasesSection = lazy(() =>
  import("@/components/landing/HomeSections").then((m) => ({ default: m.UseCasesSection }))
);
const HomeFAQSection = lazy(() =>
  import("@/components/landing/HomeSections").then((m) => ({ default: m.HomeFAQSection }))
);
const ComplianceFAQSection = lazy(() =>
  import("@/components/landing/ComplianceFAQSection").then((m) => ({ default: m.ComplianceFAQSection }))
);
const ValidationSection = lazy(() =>
  import("@/components/landing/ValidationSection").then((m) => ({ default: m.ValidationSection }))
);
const LimitsSection = lazy(() =>
  import("@/components/landing/LimitsSection").then((m) => ({ default: m.LimitsSection }))
);
const AntiOverpromiseSection = lazy(() =>
  import("@/components/landing/AntiOverpromiseSection").then((m) => ({ default: m.AntiOverpromiseSection }))
);
const ComplianceLimitsFAQ = lazy(() =>
  import("@/components/landing/ComplianceLimitsFAQ").then((m) => ({ default: m.ComplianceLimitsFAQ }))
);
const AboutSection = lazy(() =>
  import("@/components/landing/AboutSection").then((m) => ({ default: m.AboutSection }))
);
const VasculinkArchitecture = lazy(() =>
  import("@/components/vasculink/VasculinkArchitecture").then((m) => ({ default: m.VasculinkArchitecture }))
);
const FourZeroPillars = lazy(() =>
  import("@/components/vasculink/FourZeroPillars").then((m) => ({ default: m.FourZeroPillars }))
);
const ProximityMedicineCard = lazy(() =>
  import("@/components/vasculink/ProximityMedicineCard").then((m) => ({ default: m.ProximityMedicineCard }))
);
const MaterialsScroll = lazy(() =>
  import("@/components/landing/MaterialsScroll").then((m) => ({ default: m.MaterialsScroll }))
);
const EngineeringExploded = lazy(() =>
  import("@/components/landing/EngineeringExploded").then((m) => ({ default: m.EngineeringExploded }))
);

// Lightweight skeleton placeholder rendered while a lazy section loads.
const SectionFallback = () => (
  <div className="py-20" aria-hidden="true">
    <div className="container mx-auto px-6 max-w-4xl">
      <div className="h-8 w-2/3 mx-auto rounded-md bg-muted/40 animate-pulse mb-4" />
      <div className="h-4 w-1/2 mx-auto rounded-md bg-muted/30 animate-pulse" />
    </div>
  </div>
);


export default function Landing() {
  const { t, language, setLanguage } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const headerScrolled = useGlassScroll(12);
  const langLabels: Record<Language, string> = { en: "EN", fr: "FR", de: "DE" };

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const trustSignals = useMemo<string[]>(
    () => (t("landing.trust.signals") as unknown as string[]) || [],
    [t]
  );

  // JSON-LD: minimal, non-risky structured data (WebPage + SoftwareApplication + FAQPage)
  // Brand hierarchy is encoded explicitly: VASCU-LINK is the program name,
  // AquaMR Flow Platform is the SaaS that ships it.
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://aquamr-flow.com/#webpage",
        url: "https://aquamr-flow.com/",
        name: "VASCU-LINK — AquaMR Flow · Workflow vasculaire non ionisant",
        description:
          "VASCU-LINK reconstruit la fonction angiographique en 4-zéro (0 mSv, 0 contraste, 0 hélium). Plateforme AquaMR Flow pour la cartographie pré-revascularisation, la décision clinique et le guidage préclinique.",
        inLanguage: "fr",
      },
      {
        "@type": "SoftwareApplication",
        name: "VASCU-LINK (AquaMR Flow Platform)",
        alternateName: ["AquaMR Flow", "VASCU-LINK"],
        applicationCategory: "HealthApplication",
        operatingSystem: "Web",
        url: "https://aquamr-flow.com",
        description:
          "VASCU-LINK reconstruit la fonction angiographique en 4-zéro : 0 mSv, 0 contraste, 0 hélium. Plateforme AquaMR Flow pour la cartographie pré-revascularisation, la décision clinique et le guidage préclinique. Intègre le dispositif d'imagerie bas champ AquaMR.",
      },
      organizationJsonLd,
      founderPersonJsonLd,
      breadcrumbJsonLd([{ name: "Home", path: "/" }]),
      homeFaqJsonLd,
      complianceFaqJsonLd,
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Skip to content – accessibility */}
      <a href="#main-content" data-skip-link className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        {t("landing.footer.skipToContent")}
      </a>
      <SEOHead
        title={t("home.seo.title")}
        description={t("home.seo.description")}
        path="/"
        jsonLd={structuredData}
      />
      <header>
      <nav
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          headerScrolled
            ? "glass-strong border-b border-border/50 shadow-[0_8px_24px_hsl(var(--foreground)/0.06)]"
            : "bg-background/40 backdrop-blur-md border-b border-transparent",
        )}
        aria-label={t("home.nav.mainAria")}
        data-sculptural-header
        data-scrolled={headerScrolled}
      >
        <div
          className="container mx-auto flex items-center justify-between gap-3 h-16 px-6 min-w-0"
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <Sculptural strength={3} className={headerClasses.brandLink}>
            <Link to="/" className={cn(headerClasses.brandLink, "no-underline")}>
              <AquaMRLogo variant="badge" />
              <span className={headerClasses.brandStack}>
                <span className={headerClasses.brandWordmark}>
                  {t("branding.programName")}
                </span>
                <span className={headerClasses.brandSubtitle}>
                  {t("branding.platformName")}
                </span>
              </span>
            </Link>
          </Sculptural>
          <div className={`${headerClasses.desktopNav} shrink-0`}>
            <SculpturalLink to="/protocol" tone="primary">
              {t("home.footerNav.protocol")}
            </SculpturalLink>
            <SculpturalLink href="#platform-complete">
              {t("landing.nav.explore")}
            </SculpturalLink>
            <SculpturalLink to="/why">
              {t("landing.nav.why")}
            </SculpturalLink>
            <SculpturalLink to="/visual-chain">
              Visual Chain
            </SculpturalLink>
            <SculpturalLink to="/rsvp">
              RSVP
            </SculpturalLink>
            <SculpturalLink to="/trajectory">
              {t("landing.nav.trajectory")}
            </SculpturalLink>
            <SculpturalLink to="/about-aquamr">
              {t("landing.nav.aboutAquaMR")}
            </SculpturalLink>
            <SculpturalLink to="/auth">
              {t("landing.nav.signIn")}
            </SculpturalLink>
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
            <ThemeToggle />
            <LowResourceModeToggle />
          </div>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={headerClasses.mobileTrigger} aria-label={t("home.nav.openMenu") as string}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className={cn(
                "w-72 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                headerScrolled ? "glass-strong" : "bg-background/90 backdrop-blur-md",
              )}
              data-sculptural-mobile-menu
              data-scrolled={headerScrolled}
            >
              <Sculptural strength={3} className="inline-flex">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 mt-2 no-underline"
                  onClick={() => setMobileOpen(false)}
                >
                  <AquaMRLogo variant="badge" />
                  <span className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold text-foreground">
                      {t("branding.programName")}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {t("branding.platformName")}
                    </span>
                  </span>
                </Link>
              </Sculptural>
              <div className="flex flex-col gap-5 mt-8">
                <SculpturalLink to="/protocol" tone="primary" size="lg" onClick={() => setMobileOpen(false)}>
                  {t("home.footerNav.protocol")}
                </SculpturalLink>
                <SculpturalLink href="#platform-complete" size="lg" onClick={() => setMobileOpen(false)}>
                  {t("landing.nav.explore")}
                </SculpturalLink>
                <SculpturalLink to="/why" size="lg" onClick={() => setMobileOpen(false)}>
                  {t("landing.nav.why")}
                </SculpturalLink>
                <SculpturalLink to="/visual-chain" size="lg" onClick={() => setMobileOpen(false)}>
                  Visual Chain
                </SculpturalLink>
                <SculpturalLink to="/rsvp" size="lg" onClick={() => setMobileOpen(false)}>
                  RSVP
                </SculpturalLink>
                <SculpturalLink to="/trajectory" size="lg" onClick={() => setMobileOpen(false)}>
                  {t("landing.nav.trajectory")}
                </SculpturalLink>
                <SculpturalLink to="/about-aquamr" size="lg" onClick={() => setMobileOpen(false)}>
                  {t("landing.nav.aboutAquaMR")}
                </SculpturalLink>
                <SculpturalLink to="/auth" size="lg" onClick={() => setMobileOpen(false)}>
                  {t("landing.nav.signIn")}
                </SculpturalLink>
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("topBar.toggleTheme")}</span>
                  <ThemeToggle />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t("lowResourceMode.label")}</span>
                  <LowResourceModeToggle />
                </div>
                <Button asChild variant="outline" className="mt-2" onClick={() => setMobileOpen(false)}>
                  <Link to="/protocol">{t("home.footerNav.protocol")}</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      </header>

      {/* Standard spacer matching fixed header height (--header-h) — keeps top banners under the header on every page */}
      <div aria-hidden="true" style={{ height: 'var(--header-h)' }} />
      <FourZeroBanner />
      <ComplianceBanner />
      <AboveHeroFramingLine />

      <main id="main-content" tabIndex={-1} className="focus:outline-none">
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
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-1.5 mb-8 backdrop-blur-sm max-w-[90vw]">
              <Sparkles className="h-3.5 w-3.5 text-on-hero" />
              <span className="text-sm font-semibold text-on-hero">
                {t("home.hero.betaBadge")}
              </span>
            </div>
            <p className="text-sm md:text-base font-semibold uppercase tracking-[0.22em] text-on-hero mb-4">
              <NeonGradientText intensity="soft" className="inline-block">
                {t("home.hero.title1")}
              </NeonGradientText>
              <span className="mx-2 text-on-hero-soft" aria-hidden="true">·</span>
              <span>{t("branding.platformName")}</span>
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-on-hero leading-[1.1] mb-5 tracking-tight max-w-4xl mx-auto">
              {t("home.hero.title2")}
            </h1>
            <p className="text-base md:text-lg text-on-hero max-w-2xl mx-auto mb-4 leading-relaxed">
              {t("home.hero.subtitle")}
            </p>
            <p className="text-sm md:text-base text-on-hero-soft max-w-2xl mx-auto mb-10 italic leading-relaxed">
              {t("home.hero.translationalAmbition")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="text-base px-8 h-12 shadow-lg shadow-primary/25 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Link to="/protocol" aria-label={t("home.hero.ctaPrimary") as string}>
                  {t("home.hero.ctaPrimary")}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base px-8 h-12 border-2 border-white bg-white/10 text-white hover:bg-white/20 backdrop-blur-md font-semibold focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <a href="#comment-ca-marche" aria-label={t("home.hero.ctaSecondary") as string}>
                  {t("home.hero.ctaSecondary")}
                </a>
              </Button>
            </div>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-on-hero font-medium list-none p-0">
              <li className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {t("home.hero.perkNoCard")}</li>
              <li className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {t("home.hero.perkBetaAccess")}</li>
              <li className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {t("home.hero.perkGdpr")}</li>
            </ul>
            <p className="mt-6 text-sm md:text-base text-on-hero-soft max-w-xl mx-auto leading-relaxed">
              {t("home.hero.disclaimer")}
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
                alt={t("home.hero.dashboardAlt")}
                className="w-full h-auto"
                width={1920}
                height={1088}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </div>
            <p className="mt-4 text-sm text-on-hero-soft italic">
              {t("landing.hero.dashboardCaption")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Programme video — 30s motion brief, sits right under the hero */}
      <HomeIntroVideoSection />

      {/* Platform completeness — directly under hero (eager, anchor target) */}
      {/* Research protocol highlight — institutional priority for thesis reviewers */}
      <ProtocolHighlightBanner />

      <PlatformCompletenessSection />

      {/* Sculptural narrative — materials parchment + engineering exploded view */}
      <Suspense fallback={<SectionFallback />}>
        <MaterialsScroll />
        <EngineeringExploded />
      </Suspense>

      {/* Methodological framing — concordance / pragmatic non-inferiority */}
      <NonInferioritySection />

      {/* Below-the-fold: every section is code-split + lazy-loaded.
          A single Suspense boundary keeps the perceived flow smooth. */}
      <Suspense fallback={<SectionFallback />}>
        {/* What's new — changelog */}
        <WhatsNewSection />

        {/* Interactive demo — guided 4-screen walkthrough */}
        <InteractiveDemoSection />

        {/* En bref */}
        <EnBrefSection />

        {/* Audience */}
        <AudienceSection />

        {/* Comment ça marche (anchor target for hero CTA) */}
        <div id="comment-ca-marche" className="scroll-mt-20">
          <HowItWorksFRSection />
        </div>

        {/* Cas d'usage */}
        <UseCasesSection />

        {/* VASCU-LINK scientific architecture (3 concentric circles) */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6 max-w-6xl space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{t("home.vasculink.title")}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("home.vasculink.subtitle")}
              </p>
            </div>
            <FourZeroPillars />
            <VasculinkArchitecture />
            <ProximityMedicineCard />
          </div>
        </section>

        {/* Validation clinique — niveau protocole */}
        <ValidationSection />

        {/* Limites actuelles */}
        <LimitsSection />

        {/* Anti-overpromise — what the platform does NOT claim to do */}
        <AntiOverpromiseSection />

        {/* Compliance-ready FAQ — limits & honesty (T10) */}
        <ComplianceLimitsFAQ />

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

        {/* Home FAQ — French, optimized for SEO/GEO */}
        <HomeFAQSection />

        {/* Compliance-ready FAQ */}
        <ComplianceFAQSection />

        {/* About */}
        <AboutSection />
      </Suspense>

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
              <Link to="/protocol">
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
              <div className="flex items-center gap-2 mb-3">
                <AquaMRLogo />
                <span className="flex flex-col leading-tight">
                  <span className="font-semibold">{t("branding.programName")}</span>
                  <span className="text-[10px] font-medium tracking-[0.18em] text-muted-foreground/80 uppercase">
                    {t("branding.platformName")}
                  </span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{t("landing.footer.tagline")}</p>
              <p className="text-xs text-muted-foreground/80 mt-3 leading-relaxed">
                {t("branding.footerExplain")}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2">{t("landing.footer.notMedicalDevice")}</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">{t("landing.footer.product")}</h4>
              <nav aria-label={t("home.footerNav.productAria")} className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link to="/protocol" className="hover:text-foreground transition-colors font-semibold text-foreground">{t("home.footerNav.protocol")}</Link>
                <a href="#platform-complete" className="hover:text-foreground transition-colors">{t("home.footerNav.features")}</a>
                <Link to="/why" className="hover:text-foreground transition-colors">{t("landing.nav.why")}</Link>
                <Link to="/visual-chain" className="hover:text-foreground transition-colors">Visual Chain</Link>
                <Link to="/rsvp" className="hover:text-foreground transition-colors">RSVP</Link>
                <Link to="/trajectory" className="hover:text-foreground transition-colors">{t("landing.nav.trajectory")}</Link>
                <Link to="/methodology" className="hover:text-foreground transition-colors">Methodology</Link>
                <Link to="/sap" className="hover:text-foreground transition-colors">SAP</Link>
                <Link to="/research-evidence" className="hover:text-foreground transition-colors font-semibold text-foreground">Research Evidence</Link>
                <Link to="/data-management-plan" className="hover:text-foreground transition-colors">DMP (FAIR)</Link>
                <Link to="/incidental-findings" className="hover:text-foreground transition-colors">Incidental findings</Link>
                <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
                <Link to="/securite-confidentialite" className="hover:text-foreground transition-colors">{t("home.footerNav.security")}</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">{t("landing.footer.legal")}</h4>
              <nav aria-label={t("home.footerNav.legalAria")} className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link to="/legal/terms" className="hover:text-foreground transition-colors">{t("legal.tabs.terms")}</Link>
                <Link to="/legal/privacy" className="hover:text-foreground transition-colors">{t("legal.tabs.privacy")}</Link>
                <Link to="/legal/notice" className="hover:text-foreground transition-colors">{t("legal.tabs.notice")}</Link>
                <Link to="/transparence" className="hover:text-foreground transition-colors">Transparence</Link>
              </nav>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center sm:items-start gap-2">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {t("landing.footer.rights")}
              </p>
              <MedRegBadge variant="compact" />
            </div>
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

      <RegulatoryDisclaimer />

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
            aria-label={t("home.misc.scrollTop")}
          >
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
