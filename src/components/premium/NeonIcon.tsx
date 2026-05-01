import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NeonIconProps {
  icon: LucideIcon;
  /** Color tone of the stroke + glow. */
  tone?: "cyan" | "violet" | "teal";
  /** Visual size of the surrounding ring. */
  size?: "sm" | "md" | "lg";
  /** When true, renders a square ring with subtle inner glow. */
  ring?: boolean;
  className?: string;
  ariaLabel?: string;
}

const ringSize = {
  sm: "h-8 w-8 rounded-lg",
  md: "h-10 w-10 rounded-xl",
  lg: "h-14 w-14 rounded-2xl",
} as const;

const iconSize = {
  sm: 16,
  md: 18,
  lg: 26,
} as const;

/**
 * Cohesive neon icon — line-art Lucide icon with consistent stroke width
 * and an optional glowing ring. Replaces ad-hoc icon styling across pages.
 */
export function NeonIcon({
  icon: Icon,
  tone = "cyan",
  size = "md",
  ring = true,
  className,
  ariaLabel,
}: NeonIconProps) {
  if (!ring) {
    return (
      <Icon
        aria-label={ariaLabel}
        className={cn(
          "text-accent-cyan",
          tone === "violet" && "text-accent",
          tone === "teal" && "text-accent-teal",
          className,
        )}
        strokeWidth={1.6}
      />
    );
  }
  return (
    <div
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      className={cn(
        "neon-icon-ring inline-flex items-center justify-center",
        ringSize[size],
        tone === "violet" && "violet",
        tone === "teal" && "teal",
        className,
      )}
    >
      <Icon size={iconSize[size]} strokeWidth={1.6} />
    </div>
  );
}
