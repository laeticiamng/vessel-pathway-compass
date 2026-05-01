/**
 * Build-time feature flags driven by Vite env variables.
 *
 * Defaults are tuned for the doctoral / pre-MDR phase: anything commercial
 * stays hidden unless the institution explicitly opts in. Stripe/checkout
 * code remains in the bundle (used post-MDR), but the public surface stays
 * sober.
 */

/**
 * Public pricing surface (USD plans, Stripe checkout CTAs).
 *
 * Off by default. Set `VITE_PUBLIC_PRICING_ENABLED=true` to re-enable the
 * three-tier card layout once the platform leaves the validation phase.
 */
export const PUBLIC_PRICING_ENABLED =
  import.meta.env.VITE_PUBLIC_PRICING_ENABLED === "true";
