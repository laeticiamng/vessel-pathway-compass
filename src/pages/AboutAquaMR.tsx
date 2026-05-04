import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Atom,
  Wrench,
  Microscope,
  ShieldAlert,
  Sparkles,
  CircuitBoard,
} from "lucide-react";
import { motion } from "framer-motion";
import { AquaMRLogo } from "@/components/branding/AquaMRLogo";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "@/i18n/context";
import { ResearchPreviewBadge } from "@/components/ResearchPreviewBadge";
import { RegulatoryDisclaimer } from "@/components/RegulatoryDisclaimer";
import architectureSchema from "@/assets/vascu-link-architecture.jpg";

interface SectionItem {
  title: string;
  body: string;
}

interface HierarchyRow {
  component: string;
  role: string;
}

export default function AboutAquaMR() {
  const { t } = useTranslation();

  const sections =
    (t("aboutAquaMR.sections") as unknown as SectionItem[]) ?? [];
  const hierarchy =
    (t("aboutAquaMR.hierarchy.rows") as unknown as HierarchyRow[]) ?? [];

  const icons = [Atom, CircuitBoard, Wrench, Microscope, ShieldAlert];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: t("aboutAquaMR.seoTitle"),
    description: t("aboutAquaMR.seoDescription"),
    inLanguage: "en",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={t("aboutAquaMR.seoTitle") as string}
        description={t("aboutAquaMR.seoDescription") as string}
        path="/about-aquamr"
        jsonLd={jsonLd}
      />

      <header className="border-b sticky top-0 z-40 bg-background/90 backdrop-blur-sm">
        <nav
          className="container mx-auto flex items-center justify-between h-16 px-6"
          aria-label={t("home.nav.simpleAria") as string}
        >
          <Link to="/" className="flex items-center gap-2.5">
            <AquaMRLogo variant="badge" />
            <span className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight">
                {t("branding.programName")}
              </span>
              <span className="hidden sm:inline text-[10px] font-medium tracking-[0.18em] text-muted-foreground/80 mt-0.5">
                {t("branding.platformName")}
              </span>
            </span>
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
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-5">
            <ResearchPreviewBadge stage="research-preview" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 mb-5">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            <span className="text-xs font-medium text-primary">
              {t("aboutAquaMR.kicker")}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            {t("aboutAquaMR.title")}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("aboutAquaMR.intro")}
          </p>
        </motion.section>

        {/* Architecture diagram */}
        <figure className="mb-14 rounded-2xl border bg-card overflow-hidden">
          <img
            src={architectureSchema}
            alt={t("aboutAquaMR.diagramAlt") as string}
            className="w-full h-auto"
            loading="lazy"
            decoding="async"
          />
          <figcaption className="px-5 py-3 text-xs text-muted-foreground border-t bg-muted/30">
            {t("aboutAquaMR.diagramCaption")}
          </figcaption>
        </figure>

        {/* Five sections */}
        <section className="space-y-5 mb-14" aria-labelledby="aquamr-sections">
          <h2 id="aquamr-sections" className="sr-only">
            {t("aboutAquaMR.sectionsHeading")}
          </h2>
          {sections.map((s, i) => {
            const Icon = icons[i] ?? Atom;
            return (
              <article
                key={i}
                className="rounded-2xl border bg-card p-6 flex gap-4 items-start"
              >
                <div className="h-11 w-11 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="text-base md:text-lg font-semibold mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </article>
            );
          })}
        </section>

        {/* Signature quote */}
        <blockquote className="mb-14 rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 md:p-8 text-center">
          <p className="text-base md:text-lg italic font-medium text-foreground leading-relaxed">
            “{t("aboutAquaMR.signature")}”
          </p>
        </blockquote>

        {/* Nomenclature hierarchy table */}
        <section className="mb-14" aria-labelledby="aquamr-hierarchy">
          <div className="mb-5">
            <h2
              id="aquamr-hierarchy"
              className="text-2xl font-bold mb-1.5"
            >
              {t("aboutAquaMR.hierarchy.title")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("aboutAquaMR.hierarchy.subtitle")}
            </p>
          </div>
          <div className="rounded-2xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th
                    scope="col"
                    className="text-left px-5 py-3 font-semibold text-foreground w-1/3"
                  >
                    {t("aboutAquaMR.hierarchy.colComponent")}
                  </th>
                  <th
                    scope="col"
                    className="text-left px-5 py-3 font-semibold text-foreground"
                  >
                    {t("aboutAquaMR.hierarchy.colRole")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {hierarchy.map((r, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3 font-medium text-foreground">
                      {r.component}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {r.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-bold mb-3">
            {t("aboutAquaMR.cta.title")}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            {t("aboutAquaMR.cta.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Button asChild size="lg">
              <Link to="/protocol">{t("aboutAquaMR.cta.protocol")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/trajectory">{t("aboutAquaMR.cta.trajectory")}</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link to="/why">{t("aboutAquaMR.cta.why")}</Link>
            </Button>
          </div>
        </section>

        <RegulatoryDisclaimer />
      </main>
    </div>
  );
}
