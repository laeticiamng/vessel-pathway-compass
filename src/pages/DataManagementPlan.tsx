import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database, Code2, FileSearch, Share2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { SEOHead } from "@/components/SEOHead";
import { AquaMRLogo } from "@/components/branding/AquaMRLogo";
import { RegulatoryDisclaimer } from "@/components/RegulatoryDisclaimer";
import { useTranslation, type Language } from "@/i18n/context";

interface Item { label: string; value: string; href?: string; }

const COPY: Record<Language, {
  seoTitle: string; seoDescription: string;
  kicker: string; title: string; intro: string; back: string;
  metadataTitle: string; metadata: Item[];
  codeTitle: string; code: Item[];
  preregTitle: string; prereg: Item[];
  sharingTitle: string; sharing: Item[];
  funder: string;
}> = {
  en: {
    seoTitle: "Data Management Plan — VASCU-LINK FAIR",
    seoDescription: "VASCU-LINK Data Management Plan aligned with the Swiss National Science Foundation Open Research Data Policy 2024 and FAIR principles.",
    kicker: "FAIR · FNS Open Research Data Policy 2024",
    title: "Data Management Plan",
    intro: "VASCU-LINK is committed to FAIR research data. This DMP describes metadata, code, pre-registration and post-publication sharing terms.",
    back: "Back to methodology",
    metadataTitle: "Metadata & repository",
    metadata: [
      { label: "Zenodo DOI", value: "10.5281/zenodo.placeholder", href: "https://zenodo.org/" },
      { label: "Persistent identifier", value: "ORCID + ROR (Switzerland)" },
      { label: "Metadata standard", value: "DataCite 4.5 + DICOM-SR for imaging" },
    ],
    codeTitle: "Code & AI weights",
    code: [
      { label: "Source code", value: "GitHub — public repository (BSD-3 / MIT)", href: "https://github.com/" },
      { label: "Reproducibility", value: "Quarto + R + renv lockfile + container image" },
      { label: "AI model card", value: "Published with weights on Zenodo (TRIPOD+AI compliant)" },
    ],
    preregTitle: "Pre-registration",
    prereg: [
      { label: "ClinicalTrials.gov", value: "ID NCT-placeholder (planned at J1)", href: "https://clinicaltrials.gov/" },
      { label: "ISRCTN", value: "ID ISRCTN-placeholder (planned at J1)", href: "https://www.isrctn.com/" },
      { label: "OSF", value: "Pre-registration of analytical decisions before unblinding", href: "https://osf.io/" },
    ],
    sharingTitle: "Sharing terms (post-publication)",
    sharing: [
      { label: "Access route", value: "Data Access Committee — request via institutional form" },
      { label: "Eligibility", value: "Bona-fide academic researcher with IRB approval and data-use agreement" },
      { label: "Embargo", value: "Released after primary publication or 24 months — whichever comes first" },
      { label: "License", value: "CC-BY 4.0 for derivatives, BSD-3 / MIT for code" },
    ],
    funder: "Funder: Swiss National Science Foundation (SNF) Open Research Data Policy 2024 — placeholder for grant identifier.",
  },
  fr: {
    seoTitle: "Plan de gestion des données — VASCU-LINK FAIR",
    seoDescription: "Plan de gestion des données VASCU-LINK aligné sur la politique FNS Open Research Data 2024 et les principes FAIR.",
    kicker: "FAIR · politique FNS Open Research Data 2024",
    title: "Plan de gestion des données",
    intro: "VASCU-LINK s'engage sur des données de recherche FAIR. Ce DMP décrit métadonnées, code, pré-enregistrement et conditions de partage post-publication.",
    back: "Retour méthodologie",
    metadataTitle: "Métadonnées & dépôt",
    metadata: [
      { label: "DOI Zenodo", value: "10.5281/zenodo.placeholder", href: "https://zenodo.org/" },
      { label: "Identifiant persistant", value: "ORCID + ROR (Switzerland)" },
      { label: "Standard métadonnées", value: "DataCite 4.5 + DICOM-SR pour l'imagerie" },
    ],
    codeTitle: "Code & poids IA",
    code: [
      { label: "Code source", value: "GitHub — dépôt public (BSD-3 / MIT)", href: "https://github.com/" },
      { label: "Reproductibilité", value: "Quarto + R + lockfile renv + image conteneur" },
      { label: "Model card IA", value: "Publiée avec les poids sur Zenodo (conforme TRIPOD+AI)" },
    ],
    preregTitle: "Pré-enregistrement",
    prereg: [
      { label: "ClinicalTrials.gov", value: "ID NCT-placeholder (prévu à J1)", href: "https://clinicaltrials.gov/" },
      { label: "ISRCTN", value: "ID ISRCTN-placeholder (prévu à J1)", href: "https://www.isrctn.com/" },
      { label: "OSF", value: "Pré-enregistrement des décisions analytiques avant levée d'aveugle", href: "https://osf.io/" },
    ],
    sharingTitle: "Conditions de partage (post-publication)",
    sharing: [
      { label: "Voie d'accès", value: "Data Access Committee — demande via formulaire institutionnel" },
      { label: "Éligibilité", value: "Chercheur académique bona-fide avec approbation IRB et data-use agreement" },
      { label: "Embargo", value: "Diffusion après publication primaire ou 24 mois — la plus précoce des deux" },
      { label: "Licence", value: "CC-BY 4.0 pour les dérivés, BSD-3 / MIT pour le code" },
    ],
    funder: "Bailleur : Fonds national suisse (FNS) — politique Open Research Data 2024, placeholder pour l'identifiant de subside.",
  },
  de: {
    seoTitle: "Datenmanagement-Plan — VASCU-LINK FAIR",
    seoDescription: "VASCU-LINK Datenmanagement-Plan ausgerichtet an SNF Open Research Data Policy 2024 und FAIR-Prinzipien.",
    kicker: "FAIR · SNF Open Research Data Policy 2024",
    title: "Datenmanagement-Plan",
    intro: "VASCU-LINK verpflichtet sich zu FAIR-Forschungsdaten. Dieser DMP beschreibt Metadaten, Code, Pre-Registration und Post-Publication-Sharing.",
    back: "Zurück zur Methodik",
    metadataTitle: "Metadaten & Repository",
    metadata: [
      { label: "Zenodo-DOI", value: "10.5281/zenodo.placeholder", href: "https://zenodo.org/" },
      { label: "Persistenter Identifier", value: "ORCID + ROR (Switzerland)" },
      { label: "Metadaten-Standard", value: "DataCite 4.5 + DICOM-SR für Bildgebung" },
    ],
    codeTitle: "Code & KI-Gewichte",
    code: [
      { label: "Quellcode", value: "GitHub — öffentliches Repo (BSD-3 / MIT)", href: "https://github.com/" },
      { label: "Reproduzierbarkeit", value: "Quarto + R + renv-Lockfile + Container-Image" },
      { label: "KI Model Card", value: "Mit Gewichten auf Zenodo (TRIPOD+AI-konform)" },
    ],
    preregTitle: "Pre-Registration",
    prereg: [
      { label: "ClinicalTrials.gov", value: "ID NCT-Platzhalter (geplant J1)", href: "https://clinicaltrials.gov/" },
      { label: "ISRCTN", value: "ID ISRCTN-Platzhalter (geplant J1)", href: "https://www.isrctn.com/" },
      { label: "OSF", value: "Pre-Registration analytischer Entscheidungen vor Entblindung", href: "https://osf.io/" },
    ],
    sharingTitle: "Sharing-Bedingungen (post-publication)",
    sharing: [
      { label: "Zugangsweg", value: "Data Access Committee — Anfrage via institutionelles Formular" },
      { label: "Berechtigung", value: "Bona-Fide-Forscher mit IRB-Zustimmung und Data-Use-Agreement" },
      { label: "Embargo", value: "Freigabe nach Primärpublikation oder 24 Monate — je nachdem, was zuerst eintritt" },
      { label: "Lizenz", value: "CC-BY 4.0 für Derivate, BSD-3 / MIT für Code" },
    ],
    funder: "Förderer: Schweizerischer Nationalfonds (SNF) — Open Research Data Policy 2024, Platzhalter für Förderkennzeichen.",
  },
};

export default function DataManagementPlan() {
  const { language, t } = useTranslation();
  const c = COPY[language] ?? COPY.en;

  const jsonLd = { "@context": "https://schema.org", "@type": "TechArticle", headline: c.seoTitle, description: c.seoDescription, inLanguage: language };

  const blocks = [
    { Icon: Database, title: c.metadataTitle, items: c.metadata },
    { Icon: Code2, title: c.codeTitle, items: c.code },
    { Icon: FileSearch, title: c.preregTitle, items: c.prereg },
    { Icon: Share2, title: c.sharingTitle, items: c.sharing },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={c.seoTitle} description={c.seoDescription} path="/data-management-plan" jsonLd={jsonLd} />
      <header className="border-b sticky top-0 z-40 bg-background/90 backdrop-blur-sm">
        <nav className="container mx-auto flex items-center justify-between h-16 px-6" aria-label="DMP navigation">
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
            <Database className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span className="text-xs font-medium text-primary">{c.kicker}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{c.title}</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">{c.intro}</p>
        </motion.section>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {blocks.map(({ Icon, title, items }, idx) => (
            <article key={idx} className="rounded-2xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4 text-primary" aria-hidden />
                <h2 className="font-semibold">{title}</h2>
              </div>
              <dl className="space-y-2 text-sm">
                {items.map((it, i) => (
                  <div key={i} className="flex flex-col">
                    <dt className="text-xs font-medium text-foreground/70">{it.label}</dt>
                    <dd className="text-muted-foreground">
                      {it.href ? (
                        <a href={it.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                          {it.value}<ExternalLink className="h-3 w-3" aria-hidden />
                        </a>
                      ) : it.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>

        <p className="text-xs text-muted-foreground italic text-center border-t pt-4">{c.funder}</p>

        <RegulatoryDisclaimer className="mt-12" />
      </main>
    </div>
  );
}
