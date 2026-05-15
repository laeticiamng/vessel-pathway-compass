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
}

/**
 * SculpturalLink — nav link with an Awwwards mask-reveal underline.
 * The underline grows from left on hover and from right on un-hover,
 * giving a tactile "sculpted" feel. CSS-only — no JS animation cost.
 *
 * Use for header nav, footer nav, and any in-page anchor that wants a
 * cohesive premium underline behaviour.
 */
export function SculpturalLink({
  to,
  href,
  children,
  className,
  activePaths = [],
  onClick,
  tone = "muted",
}: SculpturalLinkProps) {
  const location = useLocation();
  const isActive =
    (to && location.pathname === to) || activePaths.includes(location.pathname);

  const baseClasses = cn(
    "group relative inline-block text-sm transition-colors",
    tone === "primary"
      ? "font-semibold text-foreground hover:text-primary"
      : "text-muted-foreground hover:text-foreground",
    isActive && "text-foreground",
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
          isActive && "scale-x-100 origin-left bg-primary",
        )}
      />
    </>
  );

  if (href) {
    return (
      <a href={href} className={baseClasses} onClick={onClick} data-sculptural-link>
        {inner}
      </a>
    );
  }

  return (
    <Link to={to ?? "#"} className={baseClasses} onClick={onClick} data-sculptural-link>
      {inner}
    </Link>
  );
}
