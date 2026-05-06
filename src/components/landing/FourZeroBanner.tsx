import { Link } from "react-router-dom";
import { FlaskConical, ArrowRight } from "lucide-react";
import { useTranslation, type Language } from "@/i18n/context";

const COPY: Record<Language, { eyebrow: string; message: string; cta: string }> = {
  en: {
    eyebrow: "Research protocol · L1",
    message:
      "Prospective study — diagnostic concordance AquaMR vs reference imaging (CTA / MRA / DSA) in frail PAD",
    cta: "Read the protocol",
  },
  fr: {
    eyebrow: "Protocole de recherche · L1",
    message:
      "Étude prospective — concordance diagnostique AquaMR vs imagerie de référence (CTA / MRA / DSA) en AOMI fragile",
    cta: "Lire le protocole",
  },
  de: {
    eyebrow: "Forschungsprotokoll · L1",
    message:
      "Prospektive Studie — diagnostische Konkordanz AquaMR vs Referenzbildgebung (CTA / MRA / DSA) bei fragiler pAVK",
    cta: "Protokoll lesen",
  },
};

/**
 * Top institutional banner. Replaces the previous commercial "free, no credit card"
 * message with the research protocol identity, so any thesis chair or scientific
 * reviewer landing on the homepage immediately sees the academic context.
 */
export function FourZeroBanner() {
  const { language } = useTranslation();
  const copy = COPY[language] ?? COPY.en;

  return (
    <aside
      role="note"
      aria-label={copy.eyebrow}
      className="relative z-30 w-full text-white shadow-md"
      style={{ background: "linear-gradient(90deg, #0F4C81 0%, #0B3A66 100%)" }}
    >
      <div className="container mx-auto px-6 py-2 flex items-center justify-center gap-x-3 gap-y-1 text-center flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] bg-white/20 rounded-full px-2.5 py-0.5">
          <FlaskConical className="h-3 w-3" aria-hidden="true" />
          {copy.eyebrow}
        </span>
        <span className="text-xs sm:text-sm text-white font-medium">
          {copy.message}
        </span>
        <Link
          to="/protocol"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold underline-offset-2 hover:underline"
        >
          {copy.cta}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}

export default FourZeroBanner;
