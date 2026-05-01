import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AquaMRLogo } from "@/components/branding/AquaMRLogo";
import {
  ArrowLeft,
  ArrowRight,
  HeartPulse,
  Brain,
  Activity,
  LineChart,
  BookOpen,
  FlaskConical,
  Calculator,
  FileText,
  Stethoscope,
  Link2,
  CheckCircle2,
  ListChecks,
  KeyRound,
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "@/i18n/context";
import { motion } from "framer-motion";

const moduleDefs = [
  { key: "procedurePlanner", icon: Brain, path: "/app/procedure-planner" },
  { key: "fusionViewer", icon: HeartPulse, path: "/app/fusion-viewer" },
  { key: "ciAkiEngine", icon: Calculator, path: "/app/ci-aki-engine" },
  { key: "twin", icon: Activity, path: "/app/digital-twin" },
  { key: "simulation", icon: FlaskConical, path: "/app/simulation" },
  { key: "registry", icon: LineChart, path: "/app/registry" },
  { key: "education", icon: BookOpen, path: "/app/education" },
  { key: "research", icon: FileText, path: "/app/research" },
  { key: "analytics", icon: Stethoscope, path: "/app/analytics" },
  { key: "fhir", icon: Link2, path: "/app/patients" },
] as const;

type StatusKey = "available" | "beta" | "research";

export default function Modules() {
  const { t } = useTranslation();

  const statusBadgeClass: Record<StatusKey, string> = {
    available: "bg-primary/15 text-primary border-primary/30",
    beta: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    research: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t("pages.modules.seoTitle"),
    description: t("pages.modules.seoDescription"),
    itemListElement: moduleDefs.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t(`pages.modules.items.${m.key}.title`),
      description: t(`pages.modules.items.${m.key}.summary`),
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("pages.modules.seoTitle") as string}
        description={t("pages.modules.seoDescription") as string}
        path="/modules"
        jsonLd={jsonLd}
      />

      <header className="border-b sticky top-0 z-40 bg-background/90 backdrop-blur-sm">
        <nav
          className="container mx-auto flex items-center justify-between h-16 px-6"
          aria-label={t("home.nav.simpleAria") as string}
        >
          <Link to="/" className="flex items-center gap-2.5">
            <AquaMRLogo variant="badge" />
            <span className="text-xl font-bold tracking-tight">AquaMR Flow</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              {t("pages.common.backHome")}
            </Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 border-primary/40 text-primary">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t("pages.modules.heroBadge")}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t("pages.modules.heroTitle")}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("pages.modules.heroSubtitle")}
          </p>
        </motion.section>

        {/* Status legend */}
        <section
          aria-label={t("pages.modules.legend.aria") as string}
          className="flex flex-wrap items-center justify-center gap-3 mb-12 text-xs"
        >
          {(["available", "beta", "research"] as StatusKey[]).map((s) => (
            <span
              key={s}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium ${statusBadgeClass[s]}`}
            >
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              {t(`pages.modules.status.${s}`)}
            </span>
          ))}
        </section>

        {/* Modules list */}
        <section className="space-y-6">
          {moduleDefs.map((mod, i) => {
            const Icon = mod.icon;
            const status = (t(`pages.modules.items.${mod.key}.status`) as unknown as StatusKey) || "available";
            const features = (t(`pages.modules.items.${mod.key}.features`) as unknown as string[]) || [];
            const prerequisites =
              (t(`pages.modules.items.${mod.key}.prerequisites`) as unknown as string[]) || [];

            return (
              <motion.article
                key={mod.key}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
                className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground font-mono">
                        {String(i + 1).padStart(2, "0")} · {mod.path}
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold leading-tight">
                        {t(`pages.modules.items.${mod.key}.title`)}
                      </h2>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap self-start ${statusBadgeClass[status]}`}
                  >
                    <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                    {t(`pages.modules.status.${status}`)}
                  </span>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  {t(`pages.modules.items.${mod.key}.summary`)}
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Features */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                      <ListChecks className="h-4 w-4 text-primary" aria-hidden="true" />
                      {t("pages.modules.featuresLabel")}
                    </h3>
                    <ul className="space-y-2">
                      {features.map((f, fi) => (
                        <li key={fi} className="flex items-start gap-2 text-sm leading-relaxed">
                          <CheckCircle2
                            className="h-4 w-4 text-primary mt-0.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Prerequisites */}
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                      <KeyRound className="h-4 w-4 text-primary" aria-hidden="true" />
                      {t("pages.modules.prerequisitesLabel")}
                    </h3>
                    <ul className="space-y-2">
                      {prerequisites.map((p, pi) => (
                        <li
                          key={pi}
                          className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 mt-2 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground italic">
                    {t(`pages.modules.items.${mod.key}.disclaimer`)}
                  </span>
                  <Button asChild size="sm" variant="outline">
                    <Link to={mod.path}>
                      {t("pages.modules.openCta")}
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Link>
                  </Button>
                </div>
              </motion.article>
            );
          })}
        </section>

        {/* Footer disclaimer + CTAs */}
        <section className="mt-14 rounded-2xl border bg-muted/30 p-6 md:p-8 text-center">
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-5">
            {t("pages.modules.footerDisclaimer")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link to="/auth?mode=signup">
                {t("pages.modules.ctaSignup")}
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/protocol">{t("pages.modules.ctaProtocol")}</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
