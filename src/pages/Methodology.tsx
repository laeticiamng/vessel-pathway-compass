import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileCheck2, ShieldCheck, ScanSearch, Brain, Globe2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { SEOHead } from "@/components/SEOHead";
import { AquaMRLogo } from "@/components/branding/AquaMRLogo";
import { RegulatoryDisclaimer } from "@/components/RegulatoryDisclaimer";
import { useTranslation, type Language } from "@/i18n/context";

interface Bias { type: string; risk: string; mitigation: string; reference: string; }
interface Standard { name: string; href: string; }

const COPY: Record<Language, {
  seoTitle: string; seoDescription: string;
  kicker: string; title: string; intro: string;
  back: string;
  s1Title: string; s1Body: string; standards: Standard[];
  s2Title: string; s2Body: string; biasCols: { type: string; risk: string; mitigation: string; reference: string; }; biases: Bias[];
  s3Title: string; s3Body: string; safetyItems: string[];
  s4Title: string; s4Body: string; aiItems: string[];
  s5Title: string; s5Body: string; openItems: string[];
  ctaTitle: string; ctaSubtitle: string; ctaSap: string; ctaDmp: string; ctaIncidental: string;
}> = {
  en: {
    seoTitle: "Methodology — VASCU-LINK reporting & compliance standards",
    seoDescription: "VASCU-LINK methodology aligned with SPIRIT-AI, STARD-AI, TRIPOD+AI, AGREE, PROBAST, ACR MR safety, IEC 60601-2-33 and FNS Open Research Data Policy.",
    kicker: "Reporting · Bias · Safety · AI audit · Open Science",
    title: "Methodology & compliance",
    intro: "VASCU-LINK is designed to comply with international reporting standards. The complete checklists are available in Annex G of the full thesis dossier.",
    back: "Back home",
    s1Title: "Reporting standards",
    s1Body: "Each clinical and AI deliverable is mapped to the international checklist that governs it. Click a badge to open the source checklist.",
    standards: [
      { name: "SPIRIT-AI 2020", href: "https://www.spirit-statement.org/spirit-ai/" },
      { name: "STARD-AI 2025", href: "https://www.equator-network.org/reporting-guidelines/stard/" },
      { name: "TRIPOD+AI 2024", href: "https://www.tripod-statement.org/" },
      { name: "CONSORT-AI 2020", href: "https://www.consort-statement.org/extensions/overview/ai-extension" },
      { name: "AGREE II", href: "https://www.agreetrust.org/" },
      { name: "PROBAST", href: "https://www.equator-network.org/reporting-guidelines/probast/" },
    ],
    s2Title: "Bias identification & mitigation",
    s2Body: "Five biases pre-specified in the SAP, with mitigation strategy and reference.",
    biasCols: { type: "Bias type", risk: "Risk", mitigation: "Mitigation strategy", reference: "Reference" },
    biases: [
      { type: "Spectrum bias", risk: "Cohort skewed toward typical AOMI presentations", mitigation: "Standardised inclusion across CHUV referral channels; report Table 1 by subgroup", reference: "Begg & Greenes 1983" },
      { type: "Verification bias", risk: "Reference standard performed only in subset", mitigation: "Begg-Greenes correction; pre-specified verification rule", reference: "STARD-AI 2025" },
      { type: "Measurement bias", risk: "Reader variability on AquaMR images", mitigation: "Two independent readers, κ calibration, adjudication", reference: "Cohen 1968" },
      { type: "AI hallucination", risk: "AI reconstruction introduces non-physical features", mitigation: "3% random audit re-read without AI; DSMB flag if diagnosis changes", reference: "TRIPOD+AI 2024" },
      { type: "Publication bias", risk: "Selective reporting of positive endpoints", mitigation: "Pre-registration ClinicalTrials.gov + ISRCTN; SAP frozen before unblinding", reference: "ICMJE 2023" },
    ],
    s3Title: "MR & device safety",
    s3Body: "Safety architecture follows ACR MR Manual 2024 and IEC 60601 family.",
    safetyItems: [
      "ACR Manual on MR Safety 2024",
      "IEC 60601-1 — general electrical safety",
      "IEC 60601-2-33 — particular requirements for MR equipment",
      "IEC 60601-1-2 — electromagnetic compatibility (EMC)",
      "Implant screening procedure (downloadable PDF — placeholder)",
      "MR safety officer designated for the prototype site",
    ],
    s4Title: "AI audit framework",
    s4Body: "TRIPOD+AI alignment for the reconstruction and decision-support chain.",
    aiItems: [
      "Architecture — open description, model card",
      "Training data — origin, size, ethics approvals",
      "Validation data — independent set, sample-size justification",
      "Performance — PSNR, SSIM, perceptual & clinical concordance",
      "Robustness — adversarial and out-of-distribution probes",
      "Calibration & uncertainty quantification",
      "Hallucination policy — 3% random re-read without AI",
      "Code & weights — Zenodo DOI placeholder, BSD-3 / MIT license",
    ],
    s5Title: "Open Science & FAIR data",
    s5Body: "Five commitments aligned with the Swiss National Science Foundation Open Research Data Policy 2024.",
    openItems: [
      "Pre-registration on ClinicalTrials.gov and ISRCTN",
      "Protocol open access (BMJ Open / EJVES target)",
      "Statistical Analysis Plan deposited before unblinding",
      "Data on demand post-publication via a Data Access Committee",
      "Code (R + Quarto) and AI weights published on a public repository (BSD-3 / MIT)",
    ],
    ctaTitle: "Continue exploring the methodology",
    ctaSubtitle: "Open the SAP preview, the incidental-findings policy, or the full data-management plan.",
    ctaSap: "Statistical Analysis Plan",
    ctaDmp: "Data Management Plan",
    ctaIncidental: "Incidental Findings policy",
  },
  fr: {
    seoTitle: "Méthodologie — standards de reporting & conformité VASCU-LINK",
    seoDescription: "Méthodologie VASCU-LINK alignée sur SPIRIT-AI, STARD-AI, TRIPOD+AI, AGREE, PROBAST, ACR MR safety, IEC 60601-2-33 et politique FNS Open Research Data.",
    kicker: "Reporting · Biais · Sécurité · Audit IA · Science ouverte",
    title: "Méthodologie & conformité",
    intro: "VASCU-LINK est conçu pour respecter les standards internationaux de reporting. Les checklists complètes sont disponibles en Annexe G du dossier de thèse.",
    back: "Retour à l'accueil",
    s1Title: "Standards de reporting",
    s1Body: "Chaque livrable clinique et IA est rattaché à la checklist internationale qui le gouverne. Cliquez sur un badge pour ouvrir la checklist source.",
    standards: [
      { name: "SPIRIT-AI 2020", href: "https://www.spirit-statement.org/spirit-ai/" },
      { name: "STARD-AI 2025", href: "https://www.equator-network.org/reporting-guidelines/stard/" },
      { name: "TRIPOD+AI 2024", href: "https://www.tripod-statement.org/" },
      { name: "CONSORT-AI 2020", href: "https://www.consort-statement.org/extensions/overview/ai-extension" },
      { name: "AGREE II", href: "https://www.agreetrust.org/" },
      { name: "PROBAST", href: "https://www.equator-network.org/reporting-guidelines/probast/" },
    ],
    s2Title: "Identification & mitigation des biais",
    s2Body: "Cinq biais pré-spécifiés dans le SAP, avec stratégie de mitigation et référence.",
    biasCols: { type: "Type de biais", risk: "Risque", mitigation: "Stratégie de mitigation", reference: "Référence" },
    biases: [
      { type: "Biais de spectre", risk: "Cohorte biaisée vers les présentations AOMI typiques", mitigation: "Inclusion standardisée multi-canaux CHUV ; Table 1 par sous-groupe", reference: "Begg & Greenes 1983" },
      { type: "Biais de vérification", risk: "Référence non réalisée chez tous les patients", mitigation: "Correction Begg-Greenes ; règle de vérification pré-spécifiée", reference: "STARD-AI 2025" },
      { type: "Biais de mesure", risk: "Variabilité inter-lecteur sur images AquaMR", mitigation: "Deux lecteurs indépendants, calibration κ, adjudication", reference: "Cohen 1968" },
      { type: "Hallucination IA", risk: "La reconstruction IA introduit des éléments non physiques", mitigation: "Re-lecture aléatoire 3 % sans IA ; flag DSMB si le diagnostic change", reference: "TRIPOD+AI 2024" },
      { type: "Biais de publication", risk: "Reporting sélectif des critères positifs", mitigation: "Pré-enregistrement ClinicalTrials.gov + ISRCTN ; SAP gelé avant levée d'aveugle", reference: "ICMJE 2023" },
    ],
    s3Title: "Sécurité MR & dispositif",
    s3Body: "Architecture de sécurité conforme ACR MR Manual 2024 et famille IEC 60601.",
    safetyItems: [
      "ACR Manual on MR Safety 2024",
      "IEC 60601-1 — sécurité électrique générale",
      "IEC 60601-2-33 — exigences particulières aux équipements MR",
      "IEC 60601-1-2 — compatibilité électromagnétique (CEM)",
      "Procédure de screening implant (PDF téléchargeable — placeholder)",
      "Responsable sécurité MR désigné sur le site prototype",
    ],
    s4Title: "Cadre d'audit IA",
    s4Body: "Alignement TRIPOD+AI pour la chaîne de reconstruction et d'aide à la décision.",
    aiItems: [
      "Architecture — description ouverte, model card",
      "Données d'entraînement — origine, taille, approbations éthiques",
      "Données de validation — jeu indépendant, justification de la taille",
      "Performance — PSNR, SSIM, perceptuel & concordance clinique",
      "Robustesse — sondes adversarial et out-of-distribution",
      "Calibration & quantification d'incertitude",
      "Politique hallucination — re-lecture aléatoire 3 % sans IA",
      "Code & poids — DOI Zenodo placeholder, licence BSD-3 / MIT",
    ],
    s5Title: "Science ouverte & données FAIR",
    s5Body: "Cinq engagements alignés sur la politique FNS Open Research Data 2024.",
    openItems: [
      "Pré-enregistrement ClinicalTrials.gov et ISRCTN",
      "Protocole open access (cible BMJ Open / EJVES)",
      "Plan d'analyse statistique déposé avant levée d'aveugle",
      "Données sur demande post-publication via Data Access Committee",
      "Code (R + Quarto) et poids IA publiés sur dépôt public (BSD-3 / MIT)",
    ],
    ctaTitle: "Continuer l'exploration méthodologique",
    ctaSubtitle: "Ouvrez l'aperçu du SAP, la politique de découvertes fortuites ou le plan complet de gestion des données.",
    ctaSap: "Plan d'analyse statistique",
    ctaDmp: "Plan de gestion des données",
    ctaIncidental: "Politique découvertes fortuites",
  },
  de: {
    seoTitle: "Methodik — VASCU-LINK Reporting- & Compliance-Standards",
    seoDescription: "VASCU-LINK-Methodik ausgerichtet an SPIRIT-AI, STARD-AI, TRIPOD+AI, AGREE, PROBAST, ACR MR Safety, IEC 60601-2-33 und SNF Open Research Data Policy.",
    kicker: "Reporting · Bias · Sicherheit · KI-Audit · Open Science",
    title: "Methodik & Compliance",
    intro: "VASCU-LINK ist auf internationale Reporting-Standards ausgelegt. Die vollständigen Checklisten finden sich in Anhang G des Thesis-Dossiers.",
    back: "Zur Startseite",
    s1Title: "Reporting-Standards",
    s1Body: "Jedes klinische und KI-Deliverable ist der Checkliste zugeordnet, die es regelt. Badge anklicken, um die Quell-Checkliste zu öffnen.",
    standards: [
      { name: "SPIRIT-AI 2020", href: "https://www.spirit-statement.org/spirit-ai/" },
      { name: "STARD-AI 2025", href: "https://www.equator-network.org/reporting-guidelines/stard/" },
      { name: "TRIPOD+AI 2024", href: "https://www.tripod-statement.org/" },
      { name: "CONSORT-AI 2020", href: "https://www.consort-statement.org/extensions/overview/ai-extension" },
      { name: "AGREE II", href: "https://www.agreetrust.org/" },
      { name: "PROBAST", href: "https://www.equator-network.org/reporting-guidelines/probast/" },
    ],
    s2Title: "Bias-Identifikation & -Mitigation",
    s2Body: "Fünf vorab spezifizierte Bias-Typen mit Mitigationsstrategie und Referenz.",
    biasCols: { type: "Bias-Typ", risk: "Risiko", mitigation: "Mitigationsstrategie", reference: "Referenz" },
    biases: [
      { type: "Spektrum-Bias", risk: "Kohorte zu typischen PAVK-Präsentationen verzerrt", mitigation: "Standardisierte Einschluss-Kanäle CHUV; Tabelle 1 nach Subgruppe", reference: "Begg & Greenes 1983" },
      { type: "Verifikations-Bias", risk: "Referenzstandard nur in Teilkohorte", mitigation: "Begg-Greenes-Korrektur; vorab spezifizierte Verifikationsregel", reference: "STARD-AI 2025" },
      { type: "Mess-Bias", risk: "Inter-Reader-Variabilität auf AquaMR-Bildern", mitigation: "Zwei unabhängige Reader, κ-Kalibrierung, Adjudikation", reference: "Cohen 1968" },
      { type: "KI-Halluzination", risk: "KI-Rekonstruktion erzeugt nicht-physische Merkmale", mitigation: "3 % Zufalls-Re-Read ohne KI; DSMB-Flag bei Diagnoseänderung", reference: "TRIPOD+AI 2024" },
      { type: "Publikations-Bias", risk: "Selektives Reporting positiver Endpunkte", mitigation: "Pre-Registration ClinicalTrials.gov + ISRCTN; SAP vor Entblindung eingefroren", reference: "ICMJE 2023" },
    ],
    s3Title: "MR- & Geräte-Sicherheit",
    s3Body: "Sicherheitsarchitektur gemäß ACR MR Manual 2024 und IEC-60601-Familie.",
    safetyItems: [
      "ACR Manual on MR Safety 2024",
      "IEC 60601-1 — allgemeine elektrische Sicherheit",
      "IEC 60601-2-33 — Anforderungen MR-Geräte",
      "IEC 60601-1-2 — elektromagnetische Verträglichkeit (EMV)",
      "Implantat-Screening-Verfahren (PDF-Download — Platzhalter)",
      "MR-Sicherheitsbeauftragter am Prototyp-Standort benannt",
    ],
    s4Title: "KI-Audit-Rahmen",
    s4Body: "TRIPOD+AI-Ausrichtung für Rekonstruktion und Entscheidungsunterstützung.",
    aiItems: [
      "Architektur — offene Beschreibung, Model Card",
      "Trainingsdaten — Herkunft, Größe, Ethik-Genehmigungen",
      "Validierungsdaten — unabhängiges Set, Stichprobenbegründung",
      "Leistung — PSNR, SSIM, perzeptuell & klinische Konkordanz",
      "Robustheit — Adversarial- und Out-of-Distribution-Sonden",
      "Kalibrierung & Unsicherheitsquantifizierung",
      "Halluzinations-Policy — 3 % Zufalls-Re-Read ohne KI",
      "Code & Gewichte — Zenodo-DOI-Platzhalter, BSD-3-/MIT-Lizenz",
    ],
    s5Title: "Open Science & FAIR-Daten",
    s5Body: "Fünf Verpflichtungen gemäß SNF Open Research Data Policy 2024.",
    openItems: [
      "Pre-Registration auf ClinicalTrials.gov und ISRCTN",
      "Protokoll Open Access (Ziel BMJ Open / EJVES)",
      "Statistical Analysis Plan vor Entblindung hinterlegt",
      "Daten auf Anfrage post-publication via Data Access Committee",
      "Code (R + Quarto) und KI-Gewichte in öffentlichem Repo (BSD-3 / MIT)",
    ],
    ctaTitle: "Methodik weiter erkunden",
    ctaSubtitle: "Öffnen Sie die SAP-Vorschau, die Zufallsbefund-Policy oder den vollständigen Datenmanagement-Plan.",
    ctaSap: "Statistical Analysis Plan",
    ctaDmp: "Datenmanagement-Plan",
    ctaIncidental: "Zufallsbefund-Policy",
  },
};

const SECTION_ICONS = [FileCheck2, ScanSearch, ShieldCheck, Brain, Globe2];

export default function Methodology() {
  const { language, t } = useTranslation();
  const c = COPY[language] ?? COPY.en;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: c.seoTitle,
    description: c.seoDescription,
    inLanguage: language,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={c.seoTitle} description={c.seoDescription} path="/methodology" jsonLd={jsonLd} />

      <header className="border-b sticky top-0 z-40 bg-background/90 backdrop-blur-sm">
        <nav className="container mx-auto flex items-center justify-between h-16 px-6" aria-label="Methodology navigation">
          <Link to="/" className="flex items-center gap-2.5">
            <AquaMRLogo variant="badge" />
            <span className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight">{t("branding.programName")}</span>
              <span className="hidden sm:inline text-[10px] font-medium tracking-[0.18em] text-muted-foreground/80 mt-0.5">
                {t("branding.platformName")}
              </span>
            </span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-1.5" />{c.back}</Link>
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 mb-5">
            <FileCheck2 className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span className="text-xs font-medium text-primary">{c.kicker}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{c.title}</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">{c.intro}</p>
        </motion.section>

        {/* 1. Reporting standards */}
        <Section index={0} title={c.s1Title} body={c.s1Body}>
          <ul className="flex flex-wrap gap-2">
            {c.standards.map(s => (
              <li key={s.name}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 hover:bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition"
                >
                  {s.name}
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </Section>

        {/* 2. Bias */}
        <Section index={1} title={c.s2Title} body={c.s2Body}>
          <div className="rounded-xl border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold">{c.biasCols.type}</th>
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold">{c.biasCols.risk}</th>
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold">{c.biasCols.mitigation}</th>
                  <th scope="col" className="text-left px-4 py-2.5 font-semibold">{c.biasCols.reference}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {c.biases.map(b => (
                  <tr key={b.type}>
                    <td className="px-4 py-2.5 font-medium">{b.type}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{b.risk}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{b.mitigation}</td>
                    <td className="px-4 py-2.5 text-muted-foreground italic text-xs">{b.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* 3. MR safety */}
        <Section index={2} title={c.s3Title} body={c.s3Body}>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm">
            {c.safetyItems.map((s, i) => (
              <li key={i} className="flex gap-2 rounded-lg border bg-card px-3 py-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* 4. AI audit */}
        <Section index={3} title={c.s4Title} body={c.s4Body}>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm">
            {c.aiItems.map((s, i) => (
              <li key={i} className="flex gap-2 rounded-lg border bg-card px-3 py-2">
                <Brain className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* 5. Open Science */}
        <Section index={4} title={c.s5Title} body={c.s5Body}>
          <ol className="space-y-2 text-sm">
            {c.openItems.map((s, i) => (
              <li key={i} className="flex gap-3 rounded-lg border bg-card px-3 py-2.5">
                <span className="font-bold text-primary tabular-nums">{i + 1}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </Section>

        {/* CTA */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-bold mb-3">{c.ctaTitle}</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">{c.ctaSubtitle}</p>
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Button asChild size="lg"><Link to="/sap">{c.ctaSap}</Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/data-management-plan">{c.ctaDmp}</Link></Button>
            <Button asChild size="lg" variant="ghost"><Link to="/incidental-findings">{c.ctaIncidental}</Link></Button>
          </div>
        </section>

        <RegulatoryDisclaimer />
      </main>
    </div>
  );
}

function Section({ index, title, body, children }: { index: number; title: string; body: string; children: React.ReactNode; }) {
  const Icon = SECTION_ICONS[index] ?? FileCheck2;
  return (
    <article className="mb-10">
      <header className="flex items-start gap-3 mb-4">
        <div className="h-11 w-11 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold text-primary mb-0.5">{String(index + 1).padStart(2, "0")}</p>
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{body}</p>
        </div>
      </header>
      <div className="md:pl-14">{children}</div>
    </article>
  );
}
