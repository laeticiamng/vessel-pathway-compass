/**
 * Multi-currency pricing helpers (CHF / EUR).
 *
 * VASCU-LINK is in academic validation: the values returned here are
 * **indicative post-launch tariffs**. They MUST always be paired with a
 * "indicative / post-launch" qualifier in the UI.
 *
 * Rounding: prices are rounded to the nearest whole unit (no cents) to keep
 * the messaging "round-number, indicative" — never to suggest precise
 * commercial offers. CHF and EUR are 1:1 in our indicative grid (a deliberate
 * editorial choice, not an FX claim).
 */

import type { Language } from "@/i18n/context";

export type Currency = "CHF" | "EUR";

export const SUPPORTED_CURRENCIES: Currency[] = ["CHF", "EUR"];

/** Default currency per UI language. Swiss → CHF, others → EUR. */
export function defaultCurrencyForLanguage(lang: Language): Currency {
  return lang === "de" ? "CHF" : "EUR";
}

/** Locale BCP-47 used by `Intl.NumberFormat` for each UI language. */
function localeFor(lang: Language, currency: Currency): string {
  if (currency === "CHF") {
    if (lang === "de") return "de-CH";
    if (lang === "fr") return "fr-CH";
    return "en-CH";
  }
  // EUR
  if (lang === "de") return "de-DE";
  if (lang === "fr") return "fr-FR";
  return "en-IE";
}

/**
 * Format an indicative monthly price.
 *
 * @param amount whole-unit amount (e.g. 99). We deliberately strip fractions.
 * @param currency CHF | EUR
 * @param lang UI language for locale-aware separators / currency placement
 */
export function formatIndicativePrice(
  amount: number,
  currency: Currency,
  lang: Language,
): string {
  const rounded = Math.round(amount);
  return new Intl.NumberFormat(localeFor(lang, currency), {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
}
