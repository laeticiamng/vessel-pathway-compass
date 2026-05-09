/**
 * Single source of truth for the breakpoints that drive the header /
 * burger-menu switch. Keep this in sync with `tailwind.config.ts`
 * (we use Tailwind's defaults: lg=1024, xl=1280) and the
 * `e2e/landing-responsive.spec.ts` regression suite.
 *
 * Centralising these values lets us:
 *   - assert in tests that the burger appears strictly below `lg`
 *     and the inline nav appears strictly at/above `lg`;
 *   - reuse the same Tailwind class triplets across components instead
 *     of hand-typing `hidden lg:flex` / `lg:hidden` and drifting over
 *     time.
 */

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  /** Header switches from burger -> inline nav at this width. */
  lg: 1024,
  /** Brand subtitle "AquaMR Flow Platform" appears at this width. */
  xl: 1280,
  "2xl": 1536,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Class fragments used by the landing header. Components SHOULD import
 * these instead of writing `hidden lg:flex` inline so a future
 * breakpoint move is a one-file change.
 */
export const headerClasses = {
  /** Inline desktop navigation: hidden below `lg`, flex at/above `lg`. */
  desktopNav:
    "hidden lg:flex items-center gap-6 xl:gap-8 whitespace-nowrap min-w-0",
  /** Mobile burger trigger: visible below `lg`, hidden at/above `lg`. */
  mobileTrigger: "lg:hidden shrink-0",
  /** Brand subtitle: only visible at/above `xl`. */
  brandSubtitle:
    "hidden xl:inline text-[10px] font-medium tracking-[0.18em] text-muted-foreground/80 mt-0.5 whitespace-nowrap",
  /** Brand wordmark: never wraps, never clips, shrinks safely. */
  brandWordmark:
    "text-xl font-bold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis",
  /** Brand link wrapper: keeps logo + text on one line. */
  brandLink: "flex items-center gap-2.5 min-w-0 shrink",
  /** Brand text stack: column, no overflow, allows shrink. */
  brandStack: "flex flex-col leading-none min-w-0",
} as const;

/**
 * Programmatic check used by tests + the responsive QA panel.
 * Returns the expected nav state for a given viewport width.
 */
export function expectedNavState(width: number): "burger" | "inline" {
  return width < BREAKPOINTS.lg ? "burger" : "inline";
}

/** Returns true when the brand subtitle should be rendered. */
export function shouldShowBrandSubtitle(width: number): boolean {
  return width >= BREAKPOINTS.xl;
}
