import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, MessageSquare, UserCheck, FileSignature } from "lucide-react";
import { motion } from "framer-motion";
import { SEOHead } from "@/components/SEOHead";
import { AquaMRLogo } from "@/components/branding/AquaMRLogo";
import { RegulatoryDisclaimer } from "@/components/RegulatoryDisclaimer";
import { useTranslation, type Language } from "@/i18n/context";

interface Block { title: string; body: string; }

const COPY: Record<Language, {
  seoTitle: string; seoDescription: string;
  kicker: string; title: string; intro: string; back: string;
  definition: Block; communication: Block; information: Block; consent: Block;
  reference: string;
}> = {
  en: {
    seoTitle: "Incidental findings policy — VASCU-LINK",
    seoDescription: "Pre-specified incidental-findings policy aligned with Wolf et al. 2008: definition, communication circuit, patient information, consent.",
    kicker: "Pre-specified · Wolf et al. 2008",
    title: "Incidental findings policy",
    intro: "VASCU-LINK applies a pre-specified policy for incidental findings on AquaMR images, aligned with Wolf et al. 2008 and Swiss research-ethics guidance.",
    back: "Back to methodology",
    definition: { title: "Definition", body: "Three categories: (i) immediate — requires action within 24h; (ii) deferred — to be discussed at the next consultation; (iii) non-actionable — no clinical consequence, documented only." },
    communication: { title: "Communication circuit", body: "Findings are reported by the investigator to the referring physician through a tracked channel within the time window matching the category." },
    information: { title: "Patient information", body: "A dedicated consultation is offered for any actionable finding. The patient receives written information adapted to their literacy level." },
    consent: { title: "Consent form mention", body: "The informed-consent document explicitly mentions the incidental-findings policy and offers the patient a documented opt-out for non-actionable findings." },
    reference: "Reference: Wolf SM et al. Managing incidental findings in human subjects research. J Law Med Ethics 2008;36(2):219-48.",
  },
  fr: {
    seoTitle: "Politique découvertes fortuites — VASCU-LINK",
    seoDescription: "Politique pré-spécifiée des découvertes fortuites alignée sur Wolf et al. 2008 : définition, circuit de communication, information patient, consentement.",
    kicker: "Pré-spécifiée · Wolf et al. 2008",
    title: "Politique des découvertes fortuites",
    intro: "VASCU-LINK applique une politique pré-spécifiée des découvertes fortuites sur les images AquaMR, alignée sur Wolf et al. 2008 et les recommandations swissethics.",
    back: "Retour méthodologie",
    definition: { title: "Définition", body: "Trois catégories : (i) immédiate — action sous 24 h ; (ii) différée — à discuter à la prochaine consultation ; (iii) non actionnable — sans conséquence clinique, documentation seule." },
    communication: { title: "Circuit de communication", body: "L'investigateur signale toute découverte au médecin référent via un canal tracé, dans la fenêtre temporelle correspondant à la catégorie." },
    information: { title: "Information du patient", body: "Une consultation dédiée est proposée pour toute découverte actionnable. Le patient reçoit une information écrite adaptée à son niveau de littératie." },
    consent: { title: "Mention dans le consentement", body: "Le document de consentement éclairé mentionne explicitement la politique de découvertes fortuites et propose un opt-out documenté pour les découvertes non actionnables." },
    reference: "Référence : Wolf SM et al. Managing incidental findings in human subjects research. J Law Med Ethics 2008;36(2):219-48.",
  },
  de: {
    seoTitle: "Zufallsbefund-Policy — VASCU-LINK",
    seoDescription: "Vorab spezifizierte Zufallsbefund-Policy gemäß Wolf et al. 2008: Definition, Kommunikationsweg, Patienteninformation, Einwilligung.",
    kicker: "Vorab spezifiziert · Wolf et al. 2008",
    title: "Zufallsbefund-Policy",
    intro: "VASCU-LINK wendet eine vorab spezifizierte Zufallsbefund-Policy auf AquaMR-Bilder an, ausgerichtet an Wolf et al. 2008 und swissethics-Empfehlungen.",
    back: "Zurück zur Methodik",
    definition: { title: "Definition", body: "Drei Kategorien: (i) sofort — Handlung innerhalb 24 h; (ii) aufschiebbar — bei nächster Konsultation zu besprechen; (iii) nicht handelbar — keine klinische Konsequenz, nur Dokumentation." },
    communication: { title: "Kommunikationsweg", body: "Der Prüfer meldet jeden Befund an den überweisenden Arzt über einen nachvollziehbaren Kanal innerhalb des kategoriengerechten Zeitfensters." },
    information: { title: "Patienteninformation", body: "Bei jedem handelbaren Befund wird eine dedizierte Konsultation angeboten. Der Patient erhält schriftliche Information passend zum Literacy-Level." },
    consent: { title: "Hinweis im Einwilligungsformular", body: "Das Einwilligungsdokument erwähnt die Zufallsbefund-Policy explizit und bietet ein dokumentiertes Opt-out für nicht handelbare Befunde." },
    reference: "Referenz: Wolf SM et al. Managing incidental findings in human subjects research. J Law Med Ethics 2008;36(2):219-48.",
  },
};

const ICONS = [AlertTriangle, MessageSquare, UserCheck, FileSignature];

export default function IncidentalFindings() {
  const { language, t } = useTranslation();
  const c = COPY[language] ?? COPY.en;
  const blocks = [c.definition, c.communication, c.information, c.consent];

  const jsonLd = { "@context": "https://schema.org", "@type": "TechArticle", headline: c.seoTitle, description: c.seoDescription, inLanguage: language };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={c.seoTitle} description={c.seoDescription} path="/incidental-findings" jsonLd={jsonLd} />
      <header className="border-b sticky top-0 z-40 bg-background/90 backdrop-blur-sm">
        <nav className="container mx-auto flex items-center justify-between h-16 px-6" aria-label="Incidental findings navigation">
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
            <AlertTriangle className="h-3.5 w-3.5 text-primary" aria-hidden />
            <span className="text-xs font-medium text-primary">{c.kicker}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{c.title}</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">{c.intro}</p>
        </motion.section>

        <div className="space-y-4 mb-8">
          {blocks.map((b, i) => {
            const Icon = ICONS[i];
            return (
              <article key={i} className="rounded-2xl border bg-card p-5 flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <div>
                  <h2 className="font-semibold mb-1">{b.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.body}</p>
                </div>
              </article>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground italic text-center border-t pt-4">{c.reference}</p>

        <RegulatoryDisclaimer className="mt-12" />
      </main>
    </div>
  );
}
