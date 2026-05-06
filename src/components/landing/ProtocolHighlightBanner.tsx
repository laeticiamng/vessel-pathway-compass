import { Link } from "react-router-dom";
import { FileText, ArrowRight, ShieldCheck, FlaskConical } from "lucide-react";
import { useTranslation, type Language } from "@/i18n/context";

/**
 * Protocol Highlight Banner
 *
 * Institutional band placed directly under the hero so any thesis chair,
 * scientific reviewer or invited clinician immediately sees:
 *  - the research subject
 *  - the L1 protocol identity
 *  - a one-click route to the full research protocol page.
 *
 * Tone: academic, sober, non-commercial.
 */

type Content = {
  badge: string;
  title: string;
  description: string;
  bullets: string[];
  cta: string;
  status: string;
};

const CONTENT: Record<Language, Content> = {
  fr: {
    badge: "Protocole de recherche · L1",
    title: "Sujet de thèse — Concordance diagnostique AquaMR vs imagerie de référence (CTA / MRA / DSA) en AOMI fragile",
    description:
      "Étude prospective monocentrique évaluant la cartographie segmentaire artérielle non irradiante chez le patient fragile (insuffisance rénale, diabète, polymorbidité), en comparaison à l'imagerie de référence (angio-CT, ARM ou angiographie cathéter selon indication).",
    bullets: [
      "Endpoint primaire : κ pondéré quadratiquement ≥ 0,65 (IC 95 % borne inf. ≥ 0,50)",
      "Population : 320 inclus, 250 analysables — AOMI fragile",
      "Sécurité : bascule documentée vers imagerie standard si qualité insuffisante",
    ],
    cta: "Lire le protocole de recherche complet",
    status: "Étude déclarée · Prototype de recherche, non dispositif médical certifié",
  },
  en: {
    badge: "Research protocol · L1",
    title: "Thesis subject — Diagnostic concordance AquaMR vs reference imaging (CTA / MRA / DSA) in frail PAD",
    description:
      "Prospective single-centre study evaluating non-ionising segmental arterial mapping in frail patients (renal impairment, diabetes, polymorbidity), benchmarked against reference imaging (CT angiography, MR angiography or catheter angiography per indication).",
    bullets: [
      "Primary endpoint: quadratically weighted κ ≥ 0.65 (95% CI lower bound ≥ 0.50)",
      "Population: 320 enrolled, 250 analysable — frail PAD",
      "Safety: documented fallback to standard imaging if quality insufficient",
    ],
    cta: "Read the full research protocol",
    status: "Declared study · Research prototype, not a certified medical device",
  },
  de: {
    badge: "Forschungsprotokoll · L1",
    title:
      "Dissertationsthema — Diagnostische Konkordanz AquaMR vs Referenzbildgebung (CTA / MRA / DSA) bei fragiler pAVK",
    description:
      "Prospektive monozentrische Studie zur nicht-ionisierenden segmentalen arteriellen Kartierung bei fragilen Patientinnen und Patienten (Niereninsuffizienz, Diabetes, Polymorbidität), verglichen mit der Referenzbildgebung (CT-Angiographie, MR-Angiographie oder Katheter-Angiographie je nach Indikation).",
    bullets: [
      "Primärer Endpunkt: quadratisch gewichtetes κ ≥ 0,65 (untere 95 %-KI-Grenze ≥ 0,50)",
      "Population: 320 Eingeschlossene, 250 Auswertbare — fragile pAVK",
      "Sicherheit: dokumentierter Fallback auf Standardbildgebung bei unzureichender Qualität",
    ],
    cta: "Vollständiges Forschungsprotokoll lesen",
    status: "Angemeldete Studie · Forschungsprototyp, kein zertifiziertes Medizinprodukt",
  },
};

export function ProtocolHighlightBanner() {
  const { language } = useTranslation();
  const c = CONTENT[language] ?? CONTENT.en;

  return (
    <section
      aria-labelledby="protocol-highlight-title"
      className="border-y bg-muted/40"
    >
      <div className="container mx-auto px-6 py-10 md:py-14 max-w-6xl">
        <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 mb-4">
              <FlaskConical className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-semibold tracking-wide text-primary uppercase">
                {c.badge}
              </span>
            </div>
            <h2
              id="protocol-highlight-title"
              className="text-2xl md:text-3xl font-bold mb-3 leading-tight"
            >
              {c.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-5 max-w-3xl">
              {c.description}
            </p>
            <ul className="space-y-2 mb-5">
              {c.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                  />
                  <span className="text-foreground/90">{b}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              {c.status}
            </p>
          </div>
          <div className="lg:border-l lg:pl-8">
            <Link
              to="/protocol"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-4 text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
            >
              <FileText className="h-5 w-5" />
              {c.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
