import { useTranslation } from "@/i18n/context";

/**
 * Full-width signature strip pinned just under the main header.
 * Surfaces the strategic 4-zero promise (0 mSv · 0 contrast · 0 helium · BoM <€15k)
 * the moment a visitor lands on the page, mirroring the v9 architecture diagram.
 */
export function FourZeroBanner() {
  const { t } = useTranslation();
  return (
    <div
      role="region"
      aria-label={t("home.fourZeroBanner.ariaLabel")}
      className="fixed left-0 right-0 top-16 z-40 w-full border-b border-white/10 bg-[#1F8A70] text-white shadow-md"
    >
      <div className="container mx-auto flex min-h-[3.25rem] flex-col items-center justify-center gap-x-3 gap-y-0.5 px-4 py-2 text-center sm:min-h-[3.5rem] sm:flex-row sm:py-2.5">
        <span className="text-sm font-semibold uppercase tracking-[0.14em] sm:text-[0.95rem]">
          {t("home.fourZeroBanner.title")}
        </span>
        <span aria-hidden="true" className="hidden text-white/70 sm:inline">
          —
        </span>
        <span className="text-xs font-medium leading-tight text-white/95 sm:text-sm">
          {t("home.fourZeroBanner.pillars")}
        </span>
      </div>
    </div>
  );
}
