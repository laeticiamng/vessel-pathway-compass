import { Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLowResourceMode } from "@/hooks/useLowResourceMode";
import { useTranslation } from "@/i18n/context";
import { cn } from "@/lib/utils";

interface LowResourceModeToggleProps {
  className?: string;
}

/**
 * v8.3 — Global toggle for "low-resource mode".
 * When enabled, RSVP and CDS modules default to Level 1 (no advanced imaging).
 * Persists in `localStorage['vlink_low_resource_mode']`.
 */
export function LowResourceModeToggle({ className }: LowResourceModeToggleProps) {
  const { enabled, toggle } = useLowResourceMode();
  const { t } = useTranslation();
  const label = t("lowResourceMode.toggleAriaLabel");
  const tooltip = `${t("lowResourceMode.label")} · ${
    enabled ? t("lowResourceMode.on") : t("lowResourceMode.off")
  }`;

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-9 w-9",
        enabled && "bg-primary/10 text-primary",
        className,
      )}
      onClick={toggle}
      aria-label={label}
      aria-pressed={enabled}
      title={tooltip}
      data-low-resource-toggle
      data-enabled={enabled ? "true" : "false"}
    >
      <Mountain className="h-4 w-4" aria-hidden />
    </Button>
  );
}

export default LowResourceModeToggle;
