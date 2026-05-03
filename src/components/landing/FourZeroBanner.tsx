import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { useTranslation, type Language } from "@/i18n/context";

const COPY: Record<Language, { eyebrow: string; message: string; cta: string }> = {
  en: {
    eyebrow: "Open beta",
    message: "Full access to all 10 modules — free, no credit card",
    cta: "Get started",
  },
  fr: {
    eyebrow: "Bêta ouverte",
    message: "Accès complet aux 10 modules — gratuit, sans carte bancaire",
    cta: "Commencer",
  },
  de: {
    eyebrow: "Offene Beta",
    message: "Voller Zugang zu allen 10 Modulen — kostenlos, ohne Kreditkarte",
    cta: "Loslegen",
  },
};

/**
 * Top announcement banner on the landing.
 * Replaces the previous jargon-heavy "4-zero" headline with a single, plain-language
 * value message + clear CTA. The "4-zero / BoM" technical signature now lives only
 * deeper on the page (FourZeroPillars) for the audience that actually understands it.
 */
export function FourZeroBanner() {
  const { language } = useTranslation();
  const copy = COPY[language] ?? COPY.en;

  return (
    <aside
      role="note"
      aria-label={copy.eyebrow}
      className="sticky top-16 z-40 w-full text-white shadow-md"
      style={{ background: "linear-gradient(90deg, #1F8A70 0%, #196B58 100%)" }}
    >
      <div className="container mx-auto px-6 py-2 flex items-center justify-center gap-x-3 gap-y-1 text-center flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] bg-white/15 rounded-full px-2.5 py-0.5">
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          {copy.eyebrow}
        </span>
        <span className="text-xs sm:text-sm text-white/95 font-medium">
          {copy.message}
        </span>
        <Link
          to="/auth?mode=signup"
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
