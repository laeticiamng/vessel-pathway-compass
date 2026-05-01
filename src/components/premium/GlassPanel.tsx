import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Stronger blur + slightly more opaque background. */
  intensity?: "soft" | "medium" | "strong";
}

/**
 * Translucent glass panel for headers, search bars, side rails, sticky toolbars.
 * Themed for both light & dark modes via CSS tokens.
 */
export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, intensity = "medium", children, ...rest }, ref) => (
    <div
      ref={ref}
      data-glass-panel
      data-intensity={intensity}
      className={cn(
        "glass-panel rounded-xl",
        intensity === "soft" && "glass-panel-soft",
        intensity === "strong" && "glass-panel-strong",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  ),
);
GlassPanel.displayName = "GlassPanel";
