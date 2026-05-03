import { useTranslation, type Language } from "@/i18n/context";

const COPY: Record<Language, { title: string; pillars: string }> = {
  en: {
    title: "Vascular cockpit 4-zero",
    pillars: "0 mSv · 0 contrast · 0 helium · BoM target < 15 k€ · recycled & biosourced materials",
  },
  fr: {
    title: "Cockpit vasculaire 4-zéro",
    pillars: "0 mSv · 0 contraste · 0 hélium · BoM cible < 15 k€ · matériaux recyclés et biosourcés",
  },
  de: {
    title: "Vaskuläres Cockpit 4-Null",
    pillars: "0 mSv · 0 Kontrast · 0 Helium · BoM-Ziel < 15 k€ · recycelte & biobasierte Materialien",
  },
};

/**
 * Sticky 4-zero signature banner sitting under the fixed header on the landing.
 * Uses a deep teal (health green) palette consistent with VASCU-LINK schema v9.
 */
export function FourZeroBanner() {
  const { language } = useTranslation();
  const copy = COPY[language] ?? COPY.en;

  return (
    <aside
      role="note"
      aria-label={copy.title}
      className="sticky top-16 z-40 w-full text-white shadow-md"
      style={{ background: "linear-gradient(90deg, #1F8A70 0%, #196B58 100%)" }}
    >
      <div className="container mx-auto px-6 py-2.5 flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-1 text-center">
        <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em]">
          {copy.title}
        </span>
        <span className="hidden sm:inline text-white/50" aria-hidden="true">·</span>
        <span className="text-xs sm:text-sm text-white/95 font-medium">
          {copy.pillars}
        </span>
      </div>
    </aside>
  );
}

export default FourZeroBanner;
