import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type PremiumCardTone = "cyan" | "violet" | "teal" | "neutral";

interface PremiumCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Accent color of the luminous border + hover glow. */
  tone?: PremiumCardTone;
  /** Removes interactive hover lift / glow. */
  static?: boolean;
  /** Padding preset. */
  padding?: "none" | "sm" | "md" | "lg";
}

const toneClass: Record<PremiumCardTone, string> = {
  cyan: "premium-card-cyan",
  violet: "premium-card-violet",
  teal: "premium-card-teal",
  neutral: "premium-card-neutral",
};

const paddingClass: Record<NonNullable<PremiumCardProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

/**
 * Premium glass card — cockpit clinical look.
 * Use for KPIs, modules, key sections. Honors light & dark themes.
 */
export const PremiumCard = forwardRef<HTMLDivElement, PremiumCardProps>(
  (
    { className, tone = "cyan", static: isStatic = false, padding = "md", children, ...rest },
    ref,
  ) => (
    <div
      ref={ref}
      data-premium-card
      data-tone={tone}
      className={cn(
        "premium-card rounded-2xl",
        toneClass[tone],
        paddingClass[padding],
        isStatic && "premium-card-static",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  ),
);
PremiumCard.displayName = "PremiumCard";
