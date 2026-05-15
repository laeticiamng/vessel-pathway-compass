/**
 * Sculptural design tokens — Teenage Engineering / B&O / Sonos signature.
 *
 * All values are framework-agnostic primitives: easings, durations, spring
 * configs, depth layers. Colors live in index.css as HSL tokens — never
 * hard-coded here.
 */

/** Signature easing curves — used by Lenis + framer-motion + CSS transitions. */
export const EASE = {
  /** Teenage Engineering's signature out-expo. The "sculpture reveals itself" curve. */
  signature: [0.16, 1, 0.3, 1] as const,
  /** B&O smooth deceleration. */
  velvet: [0.22, 1, 0.36, 1] as const,
  /** Sonos confident snap. */
  precise: [0.65, 0, 0.35, 1] as const,
  /** Sculptural press depth. */
  press: [0.4, 0, 0.2, 1] as const,
} as const;

export type EaseName = keyof typeof EASE;

/** Durations in seconds. Keep short — Awwwards rule of thumb: < 600ms. */
export const DURATION = {
  micro: 0.18,
  short: 0.32,
  medium: 0.52,
  long: 0.84,
  reveal: 1.1,
} as const;

/** Spring presets for framer-motion. */
export const SPRING = {
  magnetic: { type: "spring" as const, stiffness: 320, damping: 28, mass: 0.6 },
  soft: { type: "spring" as const, stiffness: 180, damping: 24, mass: 0.8 },
  precise: { type: "spring" as const, stiffness: 420, damping: 32, mass: 0.5 },
} as const;

/**
 * Multi-layer depth shadows — B&O hardware-feel.
 * Use as `box-shadow` strings; HSL colors come from CSS vars so themes work.
 */
export const DEPTH = {
  /** Resting elevation. */
  rest: [
    "0 1px 2px hsl(var(--foreground) / 0.04)",
    "0 2px 6px hsl(var(--foreground) / 0.04)",
    "0 8px 24px hsl(var(--foreground) / 0.06)",
  ].join(", "),
  /** Hover lift. */
  hover: [
    "0 2px 4px hsl(var(--foreground) / 0.06)",
    "0 8px 20px hsl(var(--foreground) / 0.08)",
    "0 24px 48px hsl(var(--foreground) / 0.12)",
  ].join(", "),
  /** Pressed / active. */
  press: [
    "inset 0 1px 2px hsl(var(--foreground) / 0.08)",
    "0 1px 2px hsl(var(--foreground) / 0.04)",
  ].join(", "),
  /** Floating panel — modals, command palette. */
  floating: [
    "0 4px 8px hsl(var(--foreground) / 0.08)",
    "0 16px 32px hsl(var(--foreground) / 0.12)",
    "0 32px 64px hsl(var(--foreground) / 0.16)",
  ].join(", "),
} as const;

/** Magnetic hover amplitude in pixels. Subtle by default — sculpture, not jelly. */
export const MAGNETIC = {
  subtle: 4,
  medium: 8,
  strong: 14,
} as const;

/** Parallax layer speeds — relative to scroll velocity. */
export const PARALLAX = {
  back: 0.2,
  mid: 0.5,
  fore: 0.85,
} as const;

/**
 * Safe-motion guard — returns a no-op variant when reduced-motion is set.
 * Use in components: `prefersReducedMotion() ? STATIC : ANIMATED`.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
