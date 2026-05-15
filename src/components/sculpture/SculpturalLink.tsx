import { Link, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SculpturalLinkProps {
  to?: string;
  href?: string;
  children: ReactNode;
  className?: string;
  activePaths?: string[];
  onClick?: () => void;
  /** Visual weight: `primary` is heavier, `muted` is the default nav weight. */
  tone?: "primary" | "muted";
  /** Visual size — `md` (default) for desktop nav, `lg` for mobile sheet rows. */
  size?: "md" | "lg";
}

/**
 * SculpturalLink — nav link with an Awwwards mask-reveal underline.
 *
 * Behaviour:
 *  - Hover: underline grows from the left.
 *  - Focus-visible (keyboard): same underline + a clearly visible ring
 *    that uses the design-system `--ring` token.
 *  - Active route: underline locked in (origin-left, scale-x-100).
 *  - prefers-reduced-motion: animation duration collapses, the underline
 *    appears/disappears instantly, no transform-based motion.
 *
 * Sets `aria-current="page"` when the current location matches `to`
 * (or any of `activePaths`) so AT users get the same active cue.
 */
export function SculpturalLink({
  to,
  href,
  children,
  className,
  activePaths = [],
  onClick,
  tone = "muted",
  size = "md",
}: SculpturalLinkProps) {
  const location = useLocation();
  const isActive =
    (to && location.pathname === to) || activePaths.includes(location.pathname);

  const baseClasses = cn(
    "group relative inline-block transition-colors",
    "rounded-sm outline-none",
    // Visible focus ring honoring the design system token. Always rendered
    // for keyboard users — does not depend on prefers-reduced-motion.
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    size === "lg" ? "text-base py-1" : "text-sm",
    tone === "primary"
      ? "font-semibold text-foreground hover:text-primary"
      : "text-muted-foreground hover:text-foreground",
    isActive && (tone === "primary" ? "text-primary" : "text-foreground"),
    className,
  );

  const inner = (
    <>
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-0 -bottom-1 h-px w-full origin-right scale-x-0",
          "bg-current transition-transform duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          "group-hover:origin-left group-hover:scale-x-100",
          "group-focus-visible:origin-left group-focus-visible:scale-x-100",
          // Reduced motion: collapse the easing to an instant swap so users
          // who opt out of motion still see the active/hover state.
          "motion-reduce:transition-none motion-reduce:duration-0",
          isActive && "scale-x-100 origin-left bg-primary",
        )}
      />
    </>
  );

  const ariaCurrent = isActive ? ("page" as const) : undefined;

  if (href) {
    return (
      <a
        href={href}
        className={baseClasses}
        onClick={onClick}
        data-sculptural-link
        data-active={isActive ? "true" : "false"}
        aria-current={ariaCurrent}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link
      to={to ?? "#"}
      className={baseClasses}
      onClick={onClick}
      data-sculptural-link
      data-active={isActive ? "true" : "false"}
      aria-current={ariaCurrent}
    >
      {inner}
    </Link>
  );
}
