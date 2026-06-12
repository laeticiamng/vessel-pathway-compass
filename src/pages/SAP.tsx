import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, Calculator, Layers, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { SEOHead } from "@/components/SEOHead";
import { AquaMRLogo } from "@/components/branding/AquaMRLogo";
import { RegulatoryDisclaimer } from "@/components/RegulatoryDisclaimer";
import { useTranslation, type Language } from "@/i18n/context";

interface Block { title: string; body: string; }

const COPY: Record<Language, {
  seoTitle: string; seoDescription: string;
  kicker: string; title: string; intro: string; back: string;
  primary: Block; missing: Block; subgroups: Block; sensitivity: Block;
  alpha: string;
  downloadLabel: string; downloadHint: string;
  status: string;
  ctaMethodology: string;
}> = {
  en: {
    seoTitle: "SAP preview — VASCU-LINK Statistical Analysis Plan",
    seoDescription: "Pre-specified Statistical Analysis Plan: weighted κ ≥ 0.65, MICE m=20, pre-specified subgroups, sensitivity analyses, alpha 0.05 Bonferroni-Holm.",
    kicker: "Frozen before unblinding · Annex B placeholder",
    title: "Statistical Analysis Plan (preview)",
    intro: "This page summarises the pre-specified SAP for the L1 prospective study. The full document is deposited in Annex B of the thesis dossier and frozen before unblinding.",
    back: "Back to methodology",
    primary: { title: "Primary endpoint", body: "Decisional concordance (weighted quadratic κ, 3 therapeutic classes) between the post-mapping decision and the reference multidisciplinary decision; target κ ≥ 0.60, 95% CI by 10 000 bootstrap replicates. Anatomical concordance is a territory-stratified confirmatory secondary." },
    missing: { title: "Missing data", body: "Multiple imputation by chained equations (MICE), m = 20 imputations. Sensitivity analyses including complete-case and tipping-point." },
    subgroups: { title: "Pre-specified subgroups", body: "Sex, CKD (eGFR thresholds), diabetes, age strata, C4-i tertiles. Reported with forest plot and interaction p-values." },
    sensitivity: { title: "Sensitivity analyses", body: "Worst-/best-case imputation, per-protocol vs intention-to-diagnose, image-quality stratification, and AI-on / AI-off comparison." },
    alpha: "Two-sided alpha 0.05 with Bonferroni-Holm adjustment for the secondary endpoint family.",
    downloadLabel: "Download full SAP (PDF)",
    downloadHint: "Placeholder pointing to Annex B of the dossier — the public document will be released after pre-registration.",
    status: "Status: SAP frozen before unblinding · ClinicalTrials.gov + ISRCTN pre-registration planned at J1.",
    ctaMethodology: "Back to methodology overview",
  },
  fr: {
    seoTitle: "Aperçu SAP — Plan d'analyse statistique VASCU-LINK",
    seoDescription: "Plan d'analyse statistique pré-spécifié : κ pondéré ≥ 0,65, MICE m=20, sous-groupes pré-spécifiés, analyses de sensibilité, alpha 0,05 Bonferroni-Holm.",
    kicker: "Gelé avant levée d'aveugle · Annexe B placeholder",
    title: "Plan d'analyse statistique (aperçu)",
    intro: "Cette page résume le SAP pré-spécifié de l'étude prospective L1. Le document complet est déposé en Annexe B du dossier de thèse et gelé avant levée d'aveugle.",
    back: "Retour méthodologie",
    primary: { title: "Critère primaire", body: "Concordance décisionnelle (κ quadratique pondéré, 3 classes thérapeutiques) entre la décision post-cartographie et la décision multidisciplinaire de référence ; cible κ ≥ 0,60, IC 95 % par 10 000 réplications bootstrap. La concordance anatomique est un critère secondaire confirmatoire stratifié par territoire." },
    missing: { title: "Données manquantes", body: "Imputation multiple par équations chaînées (MICE), m = 20 imputations. Analyses de sensibilité incluant complete-case et tipping-point." },
    subgroups: { title: "Sous-groupes pré-spécifiés", body: "Sexe, IRC (seuils eGFR), diabète, strates d'âge, tertiles C4-i. Rapportés en forest plot avec p-values d'interaction." },
    sensitivity: { title: "Analyses de sensibilité", body: "Imputation worst-/best-case, per-protocol vs intention-to-diagnose, stratification qualité image, comparaison AI-on / AI-off." },
    alpha: "Alpha bilatéral 0,05 avec ajustement Bonferroni-Holm pour la famille des critères secondaires.",
    downloadLabel: "Télécharger le SAP complet (PDF)",
    downloadHint: "Placeholder pointant vers l'Annexe B du dossier — le document public sera publié après pré-enregistrement.",
    status: "Statut : SAP gelé avant levée d'aveugle · pré-enregistrement ClinicalTrials.gov + ISRCTN prévu à J1.",
    ctaMethodology: "Retour à la méthodologie",
  },
  de: {
    seoTitle: "SAP-Vorschau — VASCU-LINK Statistical Analysis Plan",
    seoDescription: "Vorab spezifizierter SAP: gewichtetes κ ≥ 0,65, MICE m=20, vorab spezifizierte Subgruppen, Sensitivitätsanalysen, Alpha 0,05 Bonferroni-Holm.",
    kicker: "Vor Entblindung eingefroren · Anhang B Platzhalter",
    title: "Statistical Analysis Plan (Vorschau)",
    intro: "Diese Seite fasst den vorab spezifizierten SAP der prospektiven L1-Studie zusammen. Das vollständige Dokument liegt in Anhang B des Thesis-Dossiers und ist vor Entblindung eingefroren.",
    back: "Zurück zur Methodik",
    primary: { title: "Primärer Endpunkt", body: "Entscheidungs-Konkordanz (gewichtetes quadratisches κ, 3 Therapieklassen) zwischen der Entscheidung nach der Kartierung und der multidisziplinären Referenzentscheidung; Ziel κ ≥ 0,60, 95 %-KI durch 10 000 Bootstrap-Replikationen. Anatomische Konkordanz ist ein territorial stratifizierter, konfirmatorischer sekundärer Endpunkt." },
    missing: { title: "Fehlende Daten", body: "Multiple Imputation durch verkettete Gleichungen (MICE), m = 20 Imputationen. Sensitivitätsanalysen inkl. Complete-Case und Tipping-Point." },
    subgroups: { title: "Vorab spezifizierte Subgruppen", body: "Geschlecht, CKD (eGFR-Schwellen), Diabetes, Alters-Strata, C4-i-Tertile. Berichtet als Forest Plot mit Interaktions-p-Werten." },
    sensitivity: { title: "Sensitivitätsanalysen", body: "Worst-/Best-Case-Imputation, Per-Protocol vs. Intention-to-Diagnose, Bildqualitäts-Stratifizierung, AI-on/AI-off-Vergleich." },
    alpha: "Zweiseitiges Alpha 0,05 mit Bonferroni-Holm-Adjustierung für die Sekundärendpunktfamilie.",
    downloadLabel: "Vollständigen SAP herunterladen (PDF)",
    downloadHint: "Platzhalter, der auf Anhang B des Dossiers verweist — das öffentliche Dokument wird nach Pre-Registration freigegeben.",
    status: "Status: SAP vor Entblindung eingefroren · ClinicalTrials.gov + ISRCTN Pre-Registration für J1 geplant.",
    ctaMethodology: "Zurück zur Methodik-Übersicht",
  },
};

const ICONS = [Calculator, Layers, FileText, ShieldCheck];

export default function SAP() {
  const { language, t } = useTranslation();
  const c = COPY[language] ?? COPY.en;
  const blocks = [c.primary, c.missing, c.subgroups, c.sensitivity];

  const jsonLd = { "@context": "https://schema.org", "@type": "TechArticle", headline: c.seoTitle, description: c.seoDescription, inLanguage: language };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={c.seoTitle} description={c.seoDescription} path="/sap" jsonLd={jsonLd} />
      <header className="border-b sticky top-0 z-40 bg-background/90 backdrop-blur-sm">
        <nav className="container mx-auto flex items-center justify-between h-16 px-6" aria-label="SAP navigation">
          <Link to="/" className="flex items-center gap-2.5">
            <AquaMRLogo variant="badge" />
            <span className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight">{t("branding.programName")}</span>
              <span className="hidden sm:inline text-[10px] font-medium tracking-[0.18em] text-muted-foreground/80 mt-0.5">{t("branding.platformName")}</span>
            </span>
          </Link>
          <Button asChild variant="ghost" size="sm"><Link to="/methodology"><ArrowLeft className="h-4 w-4 mr-1.5" />{c.back}</Link></Button>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 mb-5">
            <Calculator className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span className="text-xs font-medium text-primary">{c.kicker}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{c.title}</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">{c.intro}</p>
        </motion.section>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {blocks.map((b, i) => {
            const Icon = ICONS[i];
            return (
              <article key={i} className="rounded-2xl border bg-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-primary" aria-hidden />
                  <h2 className="font-semibold">{b.title}</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.body}</p>
              </article>
            );
          })}
        </div>

        <p className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 text-center text-sm font-medium mb-8">{c.alpha}</p>

        <div className="rounded-2xl border bg-card p-6 text-center mb-8">
          <Button size="lg" disabled aria-disabled className="mb-2">
            <Download className="h-4 w-4 mr-2" aria-hidden />
            {c.downloadLabel}
          </Button>
          <p className="text-xs text-muted-foreground italic">{c.downloadHint}</p>
        </div>

        <p className="text-xs text-muted-foreground text-center mb-8">{c.status}</p>

        <div className="text-center">
          <Button asChild variant="outline"><Link to="/methodology">{c.ctaMethodology}</Link></Button>
        </div>

        <RegulatoryDisclaimer className="mt-12" />
      </main>
    </div>
  );
}
