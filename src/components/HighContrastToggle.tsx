import { Contrast } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHighContrast } from "@/hooks/useHighContrast";
import { useTranslation } from "@/i18n/context";
import { cn } from "@/lib/utils";

interface HighContrastToggleProps {
  className?: string;
}

/**
 * Toggle for the reinforced-contrast accessibility mode.
 * Renders as a single icon button — fits both desktop top-bar and mobile.
 */
export function HighContrastToggle({ className }: HighContrastToggleProps) {
  const { highContrast, toggle } = useHighContrast();
  const { t } = useTranslation();
  const label =
    (t("topBar.highContrast") as string) ||
    (highContrast ? "Disable high contrast" : "Enable high contrast");

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-9 w-9", highContrast && "bg-primary/10 text-primary", className)}
      onClick={toggle}
      aria-label={label}
      aria-pressed={highContrast}
      title={label}
    >
      <Contrast className="h-4 w-4" />
    </Button>
  );
}
