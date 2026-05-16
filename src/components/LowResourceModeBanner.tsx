import { Mountain } from "lucide-react";
import { useLowResourceMode } from "@/hooks/useLowResourceMode";
import { useTranslation } from "@/i18n/context";

/**
 * App-wide banner shown under the sticky header whenever the global
 * "Low financial-resource mode" toggle is active. Makes the
 * always-on adaptation of recommendations (low-cost imaging and
 * treatment options) visible at every screen, so clinicians never lose
 * track of the assumptions driving the suggestions they see.
 */
export function LowResourceModeBanner() {
  const { enabled } = useLowResourceMode();
  const { t } = useTranslation();

  if (!enabled) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="low-resource-banner"
      className="flex items-center gap-2 px-3 sm:px-4 py-2 border-b border-primary/30 bg-primary/10 text-primary text-xs sm:text-sm"
    >
      <Mountain className="h-4 w-4 shrink-0" aria-hidden />
      <span className="font-medium">{t("lowResourceMode.banner")}</span>
    </div>
  );
}

export default LowResourceModeBanner;
