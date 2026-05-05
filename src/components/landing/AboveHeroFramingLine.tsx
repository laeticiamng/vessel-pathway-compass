import { FlaskConical } from "lucide-react";
import { useTranslation, type Language } from "@/i18n/context";

/**
 * Above-hero framing line — one short sentence rendered above the home hero
 * to make the non-superiority / research prototype framing immediately
 * understood, before the main hero copy is read.
 *
 * Self-contained trilingual copy (EN/FR/DE), academic tone, no marketing.
 */

const COPY: Record<Language, { eyebrow: string; line: string }> = {
  en: {
    eyebrow: "Research prototype",
    line:
      "Research prototype — diagnostic concordance study with a pragmatic non-inferiority rationale. Not a replacement for hospital MRI / CTA / catheter angiography.",
  },
  fr: {
    eyebrow: "Prototype de recherche",
    line:
      "Prototype de recherche — étude de concordance diagnostique avec logique de non-infériorité pragmatique. Ne remplace pas l'IRM hospitalière, l'angio-CT ni l'angiographie cathéter.",
  },
  de: {
    eyebrow: "Forschungsprototyp",
    line:
      "Forschungsprototyp — diagnostische Konkordanzstudie mit pragmatischer Nicht-Unterlegenheits-Logik. Kein Ersatz für Klinik-MRT, CT-Angiographie oder Katheter-Angiographie.",
  },
};

export function AboveHeroFramingLine() {
  const { language } = useTranslation();
  const c = COPY[language] ?? COPY.en;

  return (
    <div
      role="note"
      aria-label={c.eyebrow}
      className="relative z-20 border-b border-primary/15 bg-primary/[0.06] backdrop-blur-sm"
    >
      <div className="container mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-start sm:items-center justify-center gap-2 sm:gap-3 text-center">
        <FlaskConical
          className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0 mt-0.5 sm:mt-0"
          aria-hidden="true"
        />
        <p className="text-[11px] sm:text-xs md:text-sm leading-snug text-foreground/85">
          <span className="font-semibold uppercase tracking-wider text-primary mr-1.5">
            {c.eyebrow}
          </span>
          <span>{c.line}</span>
        </p>
      </div>
    </div>
  );
}
