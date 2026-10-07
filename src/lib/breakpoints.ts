/**
 * Single source of truth for the breakpoints that drive the header /
 * burger-menu switch. Keep this in sync with `tailwind.config.ts`
 * (we use Tailwind's defaults: lg=1024, xl=1280) and the
 * `e2e/landing-responsive.spec.ts` regression suite.
 *
 * Centralising these values lets us:
 *   - assert in tests that the burger appears strictly below `xl`
 *     and the inline nav appears strictly at/above `xl`;
 *   - reuse the same Tailwind class triplets across components instead
 *     of hand-typing `hidden xl:flex` / `xl:hidden` and drifting over
 *     time.
 */

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
    lg: 1024,
  /**
   * Header switches from burger -> inline nav at this width.
   * (Anciennement `lg` : avec 8 liens + langue + thème + mode sobre, la nav
   * inline mesure ~850 px en français ; entre 1024 et ~1370 px elle écrasait
   * le wordmark VASCU-LINK, réduit à 0 px à 1024 px.)
   */
  xl: 1280,
  /** Brand subtitle "AquaMR Flow Platform" appears at this width. */
  "2xl": 1536,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Class fragments used by the landing header. Components SHOULD import
 * these instead of writing `hidden lg:flex` inline so a future
 * breakpoint move is a one-file change.
 */
export const headerClasses = {
  /**
   * Inline desktop navigation: hidden below `xl`, flex at/above `xl`.
   * Espacement compact (gap-4) entre `xl` et `2xl` pour que la nav FR/DE
   * tienne à côté du wordmark sans le tronquer.
   */
  desktopNav:
    "hidden xl:flex items-center gap-4 2xl:gap-8 whitespace-nowrap min-w-0",
  /** Mobile burger trigger: visible below `xl`, hidden at/above `xl`. */
  mobileTrigger: "xl:hidden shrink-0",
  /** Brand subtitle: only visible at/above `2xl`. */
  brandSubtitle:
    "hidden 2xl:inline text-[10px] font-medium tracking-[0.18em] text-muted-foreground/80 mt-0.5 whitespace-nowrap",
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
  return width < BREAKPOINTS.xl ? "burger" : "inline";
}

/** Returns true when the brand subtitle should be rendered. */
export function shouldShowBrandSubtitle(width: number): boolean {
  return width >= BREAKPOINTS["2xl"];
}
