import { cn } from "@/lib/utils";
import { ElementType, ReactNode } from "react";

interface NeonGradientTextProps {
  children: ReactNode;
  /** Visual intensity of the glow */
  intensity?: "soft" | "medium" | "strong";
  /** Render as a different element (default: span) */
  as?: ElementType;
  className?: string;
}

/**
 * Premium futuristic gradient headline (cyan → teal → light blue).
 * - Dark mode: vivid neon glow (cockpit / vascular imaging vibe)
 * - Light mode: refined gradient with discreet glow, identity preserved
 *
 * Use it on signature headlines like the hero title, key section titles
 * or KPI banners across the platform.
 */
export function NeonGradientText({
  children,
  intensity = "medium",
  as: Tag = "span",
  className,
}: NeonGradientTextProps) {
  return (
    <Tag
      className={cn(
        "hero-neon-text",
        intensity === "soft" && "hero-neon-soft",
        intensity === "strong" && "hero-neon-strong",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
