import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation, type Language } from "@/i18n/context";
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
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
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

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
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
            <Button asChild size="sm">
              <Link to="/auth?mode=signup">{t("common.getStarted")}</Link>
            </Button>
          </div>
          {/* Mobile menu */}
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

      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(220_70%_50%_/_0.15),_transparent_70%)]" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 mb-8">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse-soft" />
              <span className="text-sm font-medium text-primary-foreground/80">
                {t("landing.hero.badge")}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-[1.1] mb-6 max-w-4xl mx-auto">
              {t("landing.hero.title")}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t("landing.hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="text-base px-8 h-12">
                <Link to="/auth?mode=signup">
                  {t("landing.hero.cta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base px-8 h-12 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/pricing">{t("landing.hero.secondary")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("landing.modules.title")}</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              {t("landing.modules.subtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                className="group relative rounded-2xl border bg-card p-8 hover:shadow-lg transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <mod.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{mod.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{mod.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">{t("landing.trust.title")}</h2>
              <p className="text-muted-foreground text-lg">
                {t("landing.trust.subtitle")}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.isArray(trustSignals) && trustSignals.map((signal, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border">
                  <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <span className="text-sm">{signal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-muted/30 border-t">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground mb-8 uppercase tracking-wider font-medium">{t("landing.socialProof.title")}</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {["University Hospital Zurich", "Hôpital Européen Georges-Pompidou", "Charité Berlin", "Cleveland Clinic"].map((name) => (
              <span key={name} className="text-lg font-semibold text-muted-foreground">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">{t("landing.testimonials.title")}</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {(t("landing.testimonials.items") as any as Array<{ quote: string; author: string; role: string }>)?.map((item, i) => (
              <Card key={i} className="p-6">
                <CardContent className="p-0">
                  <p className="text-sm italic text-muted-foreground mb-4">"{item.quote}"</p>
                  <p className="text-sm font-semibold">{item.author}</p>
                  <p className="text-xs text-muted-foreground">{item.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("landing.cta.title")}</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
            {t("landing.cta.subtitle")}
          </p>
          <Button asChild size="lg" className="text-base px-8 h-12">
            <Link to="/auth?mode=signup">
              {t("landing.cta.button")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-primary" />
              <span className="font-semibold">Vascular Atlas</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/legal/terms" className="hover:text-foreground transition-colors">{t("legal.tabs.terms")}</Link>
              <Link to="/legal/privacy" className="hover:text-foreground transition-colors">{t("legal.tabs.privacy")}</Link>
              <Link to="/legal/notice" className="hover:text-foreground transition-colors">{t("legal.tabs.notice")}</Link>
              <Link to="/support" className="hover:text-foreground transition-colors">{t("support.title")}</Link>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            {t("landing.footer")}
          </p>
        </div>
      </footer>
    </div>
  );
}
