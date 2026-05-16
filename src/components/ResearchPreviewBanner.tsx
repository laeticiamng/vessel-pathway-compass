import { AlertTriangle } from "lucide-react";

/**
 * Sticky, NON-dismissible disclaimer shown on all /research/* and /collab pages.
 * V9 requirement — research preview, NOT a medical device.
 */
export function ResearchPreviewBanner() {
  return (
    <div
      role="alert"
      className="sticky z-20 w-full border-b border-amber-500/40 bg-amber-500/10 backdrop-blur supports-[backdrop-filter]:bg-amber-500/10"
      style={{ top: 'var(--header-h, 0px)' }}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 text-xs sm:text-sm min-h-10">
        <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <p className="font-medium text-amber-900 dark:text-amber-200">
          Research preview only — not a medical device. No diagnostic or therapeutic use.
          Outputs are simulations for academic exploration within the VASCU-LINK doctoral programme.
        </p>
      </div>
    </div>
  );
}
