/**
 * Snapshot-style guards for the homepage in FR / EN / DE.
 *
 * Goal: detect typography regressions and overflow risk when switching
 * languages. We do NOT render the full DOM (heavy) — we render a compact
 * "home strings" panel that pulls every public-facing key the homepage
 * uses, then assert:
 *
 *   1. All key strings exist (no dotted-path fallback).
 *   2. No string exceeds a soft ceiling that would overflow nav/buttons.
 *   3. The number of items in arrays (FAQ, audience, steps, use cases,
 *      en-bref) is identical across locales — prevents layout shift.
 *   4. A snapshot of the trimmed string set, per language, so any diff
 *      surfaces the change for human review.
 */

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LanguageProvider, useTranslation, type Language } from "@/i18n/context";

// Soft ceilings tuned for the actual homepage layout. Crossing them is a
// signal — not necessarily a bug — to review for overflow / wrapping.
const CEILINGS: Record<string, number> = {
  "home.hero.title1": 80,
  "home.hero.title2": 80,
  "home.hero.subtitle": 240,
  "home.hero.ctaPrimary": 40,
  "home.hero.ctaSecondary": 40,
  "home.hero.betaBadge": 60,
  "home.hero.perkNoCard": 40,
  "home.hero.perkBetaAccess": 50,
  "home.hero.perkGdpr": 40,
  "landing.nav.explore": 24,
  "landing.nav.pricing": 24,
  "landing.nav.signIn": 24,
  "common.getStarted": 28,
  "home.enBref.title": 30,
  "home.audience.title": 50,
  "home.howItWorks.title": 40,
  "home.useCases.title": 30,
  "home.faq.title": 40,
  "home.vasculink.title": 60,
  "home.footerNav.features": 24,
  "home.footerNav.security": 36,
  "landing.footer.legal": 24,
  "landing.footer.product": 24,
  "home.misc.scrollTop": 40,
  "home.nav.simpleAria": 24,
  "home.nav.mainAria": 30,
};

const ARRAY_KEYS = [
  "home.enBref.items",
  "home.audience.items",
  "home.howItWorks.steps",
  "home.useCases.items",
  "home.faq.items",
] as const;

function HomeStringsHarness({ onReady }: { onReady: (data: { strings: Record<string, string>; arrays: Record<string, unknown[]> }) => void }) {
  const { t } = useTranslation();
  const strings: Record<string, string> = {};
  for (const k of Object.keys(CEILINGS)) {
    strings[k] = t(k) as string;
  }
  const arrays: Record<string, unknown[]> = {};
  for (const k of ARRAY_KEYS) {
    arrays[k] = t<unknown[]>(k, "array");
  }
  onReady({ strings, arrays });
  return null;
}

function collect(language: Language) {
  let captured: { strings: Record<string, string>; arrays: Record<string, unknown[]> } = {
    strings: {},
    arrays: {},
  };
  // Pre-set localStorage so the provider boots in the right language.
  window.localStorage.setItem("language", language);
  render(
    <LanguageProvider>
      <HomeStringsHarness onReady={(d) => (captured = d)} />
    </LanguageProvider>,
  );
  return captured;
}

describe("homepage i18n snapshot", () => {
  const captures: Record<Language, ReturnType<typeof collect>> = {
    en: collect("en"),
    fr: collect("fr"),
    de: collect("de"),
  };

  describe.each(["fr", "en", "de"] as Language[])("locale: %s", (lang) => {
    const { strings, arrays } = captures[lang];

    it("never falls back to dotted-path keys", () => {
      for (const [key, value] of Object.entries(strings)) {
        expect(value, `key=${key}`).not.toEqual(key);
        expect(value.length, `empty for key=${key}`).toBeGreaterThan(0);
      }
    });

    it("structured arrays resolve to non-empty arrays", () => {
      for (const k of ARRAY_KEYS) {
        expect(Array.isArray(arrays[k]), `${k} is not an array`).toBe(true);
        expect(arrays[k].length, `${k} is empty`).toBeGreaterThan(0);
      }
    });

    it("string lengths stay within layout ceilings", () => {
      const overflows: string[] = [];
      for (const [key, ceiling] of Object.entries(CEILINGS)) {
        if (strings[key].length > ceiling) {
          overflows.push(`${key}: ${strings[key].length} > ${ceiling} ("${strings[key]}")`);
        }
      }
      expect(overflows, `overflow risk in ${lang}:\n${overflows.join("\n")}`).toEqual([]);
    });
  });

  it("array lengths stay identical across FR/EN/DE (prevents layout shift)", () => {
    for (const k of ARRAY_KEYS) {
      const lengths = {
        fr: captures.fr.arrays[k].length,
        en: captures.en.arrays[k].length,
        de: captures.de.arrays[k].length,
      };
      expect(lengths.fr).toBe(lengths.en);
      expect(lengths.en).toBe(lengths.de);
    }
  });

  it("snapshot of FR homepage strings", () => {
    expect(captures.fr.strings).toMatchSnapshot();
  });
  it("snapshot of EN homepage strings", () => {
    expect(captures.en.strings).toMatchSnapshot();
  });
  it("snapshot of DE homepage strings", () => {
    expect(captures.de.strings).toMatchSnapshot();
  });
});
