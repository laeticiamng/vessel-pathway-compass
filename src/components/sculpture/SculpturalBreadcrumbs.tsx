import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbCrumb {
  label: string;
  to?: string;
}

interface Props {
  crumbs: BreadcrumbCrumb[];
  className?: string;
  /** Optional aria-label override (defaults to "Breadcrumb"). */
  ariaLabel?: string;
}

/**
 * SculpturalBreadcrumbs — accessible breadcrumb trail that mirrors
 * SculpturalLink semantics: focus-visible ring on `--ring`, current
 * page marked with `aria-current="page"`, mask-reveal underline on
 * hover/focus, and graceful behaviour under prefers-reduced-motion.
 *
 * Always renders an implicit "Home" crumb at index 0 unless the first
 * crumb already targets "/".
 */
export function SculpturalBreadcrumbs({ crumbs, className, ariaLabel = "Breadcrumb" }: Props) {
  const location = useLocation();
  const items: BreadcrumbCrumb[] =
    crumbs[0]?.to === "/" ? crumbs : [{ label: "Home", to: "/" }, ...crumbs];

  return (
    <nav aria-label={ariaLabel} className={cn("min-w-0", className)} data-sculptural-breadcrumbs>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground sm:gap-2">
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          const isCurrent = isLast || (c.to && location.pathname === c.to);
          return (
            <li key={`${c.label}-${i}`} className="inline-flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight
                  className="h-3 w-3 text-muted-foreground/60 shrink-0"
                  aria-hidden="true"
                />
              )}
              {isCurrent || !c.to ? (
                <span
                  className="font-medium text-foreground"
                  aria-current={isCurrent ? "page" : undefined}
                  data-active="true"
                >
                  {i === 0 ? <Home className="h-3 w-3 inline mr-1" aria-hidden /> : null}
                  {c.label}
                </span>
              ) : (
                <Link
                  to={c.to}
                  className={cn(
                    "group relative inline-flex items-center rounded-sm",
                    "transition-colors hover:text-foreground",
                    "outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  )}
                  data-sculptural-breadcrumb-link
                >
                  {i === 0 ? <Home className="h-3 w-3 inline mr-1" aria-hidden /> : null}
                  <span className="relative">
                    {c.label}
                    <span
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute left-0 -bottom-0.5 h-px w-full origin-right scale-x-0",
                        "bg-current transition-transform duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                        "group-hover:origin-left group-hover:scale-x-100",
                        "group-focus-visible:origin-left group-focus-visible:scale-x-100",
                        "motion-reduce:transition-none motion-reduce:duration-0",
                      )}
                    />
                  </span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
