import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, GitCompare, BarChart3, ShieldAlert, AlertTriangle, FileCheck, Users, FlaskConical, Microscope } from "lucide-react";
import { AquaMRLogo } from "@/components/branding/AquaMRLogo";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "@/i18n/context";
import { motion } from "framer-motion";

type ListItem = { title: string; desc: string };
type EndpointRow = { metric: string; target: string };

export default function Protocol() {
  const { t } = useTranslation();

  const endpoints = (t("pages.protocol.endpoints.rows") as unknown as EndpointRow[]) ?? [];
  const comparators = (t("pages.protocol.comparators.items") as unknown as ListItem[]) ?? [];
  const limits = (t("pages.protocol.limits.items") as unknown as string[]) ?? [];
  const lines = (t("pages.protocol.scope.lines") as unknown as ListItem[]) ?? [];
  const safetyTriggers = (t("pages.protocol.safety.triggers") as unknown as string[]) ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalScholarlyArticle",
    headline: t("pages.protocol.seoTitle"),
    description: t("pages.protocol.seoDescription"),
    inLanguage: "fr",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("pages.protocol.seoTitle") as string}
        description={t("pages.protocol.seoDescription") as string}
        path="/protocol"
        jsonLd={jsonLd}
      />

      <header className="border-b sticky top-0 z-40 bg-background/90 backdrop-blur-sm">
        <nav className="container mx-auto flex items-center justify-between h-16 px-6" aria-label={t("home.nav.simpleAria") as string}>
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

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 mb-5">
            <FlaskConical className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">
              {t("pages.protocol.badge")}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            {t("pages.protocol.title")}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("pages.protocol.intro")}
          </p>
        </motion.section>

        {/* Objectif clinique + population */}
        <section className="grid md:grid-cols-2 gap-5 mb-12">
          <Card icon={Target} title={t("pages.protocol.objective.title")} body={t("pages.protocol.objective.body")} />
          <Card icon={Users} title={t("pages.protocol.population.title")} body={t("pages.protocol.population.body")} />
        </section>

        {/* Périmètre L1 / L2 / L3 */}
        <section className="mb-14">
          <SectionHeader icon={Microscope} title={t("pages.protocol.scope.title")} subtitle={t("pages.protocol.scope.subtitle")} />
          <div className="grid md:grid-cols-3 gap-4">
            {lines.map((line, i) => (
              <div key={i} className="rounded-2xl border bg-card p-5">
                <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">L{i + 1}</div>
                <h3 className="text-base font-semibold mb-2">{line.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{line.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Design de validation */}
        <section className="mb-14">
          <SectionHeader icon={FileCheck} title={t("pages.protocol.design.title")} subtitle={t("pages.protocol.design.subtitle")} />
          <div className="rounded-2xl border bg-card p-6 prose prose-sm max-w-none dark:prose-invert">
            <p className="text-sm text-foreground leading-relaxed">{t("pages.protocol.design.body")}</p>
          </div>
        </section>

        {/* Comparateurs */}
        <section className="mb-14">
          <SectionHeader icon={GitCompare} title={t("pages.protocol.comparators.title")} subtitle={t("pages.protocol.comparators.subtitle")} />
          <div className="grid sm:grid-cols-2 gap-3">
            {comparators.map((c, i) => (
              <div key={i} className="rounded-xl border bg-card p-4">
                <h3 className="text-sm font-semibold mb-1.5">{c.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Endpoints */}
        <section className="mb-14">
          <SectionHeader icon={BarChart3} title={t("pages.protocol.endpoints.title")} subtitle={t("pages.protocol.endpoints.subtitle")} />

          <div className="rounded-2xl border bg-card overflow-hidden mb-4">
            <div className="bg-primary/10 border-b px-5 py-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                {t("pages.protocol.endpoints.primaryLabel")}
              </p>
              <p className="text-sm font-medium">{t("pages.protocol.endpoints.primary")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("pages.protocol.endpoints.primaryTarget")}</p>
            </div>
            <div className="divide-y">
              {endpoints.map((row, i) => (
                <div key={i} className="px-5 py-3 flex items-start justify-between gap-4">
                  <span className="text-sm">{row.metric}</span>
                  <span className="text-sm text-muted-foreground font-mono shrink-0">{row.target}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Plan statistique */}
        <section className="mb-14">
          <SectionHeader icon={BarChart3} title={t("pages.protocol.stats.title")} subtitle={t("pages.protocol.stats.subtitle")} />
          <div className="rounded-2xl border bg-card p-6">
            <ul className="space-y-2.5 text-sm text-foreground">
              <li><strong>{t("pages.protocol.stats.sampleLabel")}:</strong> {t("pages.protocol.stats.sample")}</li>
              <li><strong>{t("pages.protocol.stats.testsLabel")}:</strong> {t("pages.protocol.stats.tests")}</li>
              <li><strong>{t("pages.protocol.stats.missingLabel")}:</strong> {t("pages.protocol.stats.missing")}</li>
              <li><strong>{t("pages.protocol.stats.interimLabel")}:</strong> {t("pages.protocol.stats.interim")}</li>
            </ul>
          </div>
        </section>

        {/* Sécurité / bascule */}
        <section className="mb-14">
          <SectionHeader icon={ShieldAlert} title={t("pages.protocol.safety.title")} subtitle={t("pages.protocol.safety.subtitle")} />
          <div className="rounded-2xl border-2 border-amber-500/30 bg-amber-500/5 p-5">
            <p className="text-sm font-medium mb-3">{t("pages.protocol.safety.intro")}</p>
            <ul className="space-y-2">
              {safetyTriggers.map((trigger, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">→</span>
                  <span>{trigger}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Limites */}
        <section className="mb-14">
          <SectionHeader icon={AlertTriangle} title={t("pages.protocol.limits.title")} subtitle={t("pages.protocol.limits.subtitle")} />
          <div className="rounded-2xl border bg-card p-6">
            <ul className="space-y-2.5">
              {limits.map((limit, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="text-primary mt-1">•</span>
                  <span>{limit}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Statut réglementaire */}
        <section className="mb-14">
          <div className="rounded-2xl border-2 border-dashed bg-muted/30 p-6">
            <h3 className="text-base font-semibold mb-2">{t("pages.protocol.regulatory.title")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {t("pages.protocol.regulatory.body")}
            </p>
            <p className="text-xs text-muted-foreground/80 italic">
              {t("pages.protocol.regulatory.disclaimers")}
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-bold mb-3">{t("pages.protocol.cta.title")}</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">{t("pages.protocol.cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Button asChild size="lg">
              <Link to="/contact">{t("pages.protocol.cta.contact")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/">{t("pages.protocol.cta.backHome")}</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3 mb-1.5">
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-muted-foreground ml-12">{subtitle}</p>}
    </div>
  );
}

function Card({ icon: Icon, title, body }: { icon: React.ElementType; title: string; body: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="text-base font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
