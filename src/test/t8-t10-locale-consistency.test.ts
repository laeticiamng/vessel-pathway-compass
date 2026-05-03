/**
 * T8 / T10 multi-locale integrity test.
 *
 * Verifies that the editorial decisions taken in tickets T8 (CHF/EUR pricing,
 * no USD) and T10 (no HIPAA / no MDR / no FDA claims, explicit research-phase
 * positioning) are present and consistent across en/fr/de — including the
 * /audit-limitations page and the ComplianceLimitsFAQ landing section.
 */

import { describe, it, expect } from "vitest";
import { en } from "@/i18n/en";
import { fr } from "@/i18n/fr";
import { de } from "@/i18n/de";
import {
  formatIndicativePrice,
  defaultCurrencyForLanguage,
} from "@/lib/pricing";
import fs from "node:fs";
import path from "node:path";

const dicts = { en, fr, de } as const;

type AnyDict = Record<string, unknown>;

function get(obj: unknown, p: string): unknown {
  return p.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object") return (acc as AnyDict)[k];
    return undefined;
  }, obj);
}

describe("T8 — multi-currency pricing (CHF / EUR, no USD)", () => {
  it("exposes a CHF + EUR currency switcher in every locale", () => {
    for (const [lang, dict] of Object.entries(dicts)) {
      expect(get(dict, "pricing.currency.label"), `${lang}.pricing.currency.label`).toBeTypeOf("string");
      expect(get(dict, "pricing.currency.chf")).toBe("CHF");
      expect(get(dict, "pricing.currency.eur")).toBe("EUR");
      const note = get(dict, "pricing.currency.indicativeNote") as string;
      expect(note, `${lang}.indicativeNote`).toBeTypeOf("string");
      // USD may only appear inside an explicit denial ("no USD" / "pas de USD" / "kein USD").
      const usdMentions = note.match(/USD/gi) ?? [];
      if (usdMentions.length > 0) {
        expect(note).toMatch(/no USD|pas de USD|kein USD|kein\s+USD/i);
      }
      expect(note).toMatch(/CHF/);
      expect(note).toMatch(/EUR/);
    }
  });

  it("Professional plan price string never references USD", () => {
    for (const [lang, dict] of Object.entries(dicts)) {
      const price = get(dict, "pricing.plans.professional.price") as string;
      expect(price, `${lang} professional price`).toBeTypeOf("string");
      expect(price).not.toMatch(/\$|USD/);
      expect(price).toMatch(/CHF|€|EUR/);
    }
  });

  it("formats the indicative 99 price with locale-aware currency formatting", () => {
    // Each locale × currency must produce a non-empty, currency-tagged string.
    for (const lang of ["en", "fr", "de"] as const) {
      for (const cur of ["CHF", "EUR"] as const) {
        const out = formatIndicativePrice(99, cur, lang);
        expect(out.length, `${lang}/${cur}`).toBeGreaterThan(0);
        // No fractional digits (whole-unit rounding).
        expect(out).not.toMatch(/[.,]\d{2}\b/);
      }
    }
    // Default currency mapping: de → CHF, others → EUR.
    expect(defaultCurrencyForLanguage("de")).toBe("CHF");
    expect(defaultCurrencyForLanguage("fr")).toBe("EUR");
    expect(defaultCurrencyForLanguage("en")).toBe("EUR");
  });

  it("rounds prices to the nearest whole unit", () => {
    for (const cur of ["CHF", "EUR"] as const) {
      const out = formatIndicativePrice(98.7, cur, "en");
      expect(out).toMatch(/99/);
      expect(out).not.toMatch(/98/);
    }
  });
});

describe("T10 — no exaggerated regulatory / clinical claims", () => {
  it("FAQ pricing answer mentions academic validation in every locale", () => {
    for (const [lang, dict] of Object.entries(dicts)) {
      const items = get(dict, "landing.faq.items") as Array<{ q: string; a: string }>;
      expect(Array.isArray(items), `${lang} faq.items`).toBe(true);
      const priceItem = items.find((i) =>
        /coût|cost|kostet|preis/i.test(i.q),
      );
      expect(priceItem, `${lang} pricing FAQ`).toBeDefined();
      expect(priceItem!.a).not.toMatch(/\$99/);
      expect(priceItem!.a).toMatch(/CHF|EUR|académique|academic|akademisch|validation|Validierung/i);
    }
  });

  it("landing/about highlight no longer claims HIPAA compliance", () => {
    for (const [lang, dict] of Object.entries(dicts)) {
      const desc = get(dict, "landing.about.highlights.privacy.desc") as string;
      expect(desc, `${lang} privacy desc`).toBeTypeOf("string");
      expect(desc).not.toMatch(/HIPAA/i);
    }
  });

  it("compliance FAQ explicitly states the platform is NOT certified", () => {
    for (const [lang, dict] of Object.entries(dicts)) {
      const items = get(dict, "landing.faq.items") as Array<{ q: string; a: string }>;
      const compliance = items.find((i) => /HIPAA|RGPD|GDPR|DSGVO/.test(i.q));
      expect(compliance, `${lang} compliance FAQ`).toBeDefined();
      expect(compliance!.a).toMatch(/NOT|PAS|NICHT|nicht/);
    }
  });
});

describe("T10 — Audit & Limitations page + ComplianceLimitsFAQ ship in EN/FR/DE", () => {
  // These two components hold their own EN/FR/DE content tables (not in the
  // shared dictionary) — we parse them as text to guarantee the three locales
  // are present and that no localized block accidentally ships USD or HIPAA
  // affirmative claims.
  const files = [
    "src/components/landing/ComplianceLimitsFAQ.tsx",
    "src/pages/AuditLimitations.tsx",
  ];

  for (const rel of files) {
    it(`${rel} contains en/fr/de content blocks`, () => {
      const abs = path.resolve(process.cwd(), rel);
      const src = fs.readFileSync(abs, "utf8");
      expect(src).toMatch(/\ben:\s*\{/);
      expect(src).toMatch(/\bfr:\s*\{/);
      expect(src).toMatch(/\bde:\s*\{/);
    });

    it(`${rel} never claims HIPAA/FDA compliance affirmatively`, () => {
      const abs = path.resolve(process.cwd(), rel);
      const src = fs.readFileSync(abs, "utf8");
      // Allow mentions of HIPAA/FDA only if the same line either:
      //   - asks a question (?), OR
      //   - contains an explicit denial token.
      const denialTokens =
        /\b(No|NOT|Not|Pas|pas|aucun|AUCUNE|Aucune|NICHT|nicht|KEIN|KEINE|kein|keine|NO )\b/;
      const lines = src.split("\n");
      for (const line of lines) {
        if (/HIPAA|FDA/.test(line)) {
          const ok = line.includes("?") || denialTokens.test(line);
          expect(ok, `affirmative HIPAA/FDA claim in ${rel}: ${line.trim()}`).toBe(true);
        }
      }
    });

    it(`${rel} never affirmatively prices in USD`, () => {
      const abs = path.resolve(process.cwd(), rel);
      const src = fs.readFileSync(abs, "utf8");
      // No "$<digit>" pricing pattern anywhere.
      expect(src).not.toMatch(/\$\d/);
      // USD references are only allowed inside an explicit denial.
      const lines = src.split("\n");
      for (const line of lines) {
        if (/\bUSD\b/.test(line)) {
          expect(
            /\b(no|pas|aucun|aucune|kein|keine|nicht|not|never)\b[^"]{0,80}\bUSD\b/i.test(line),
            `affirmative USD reference in ${rel}: ${line.trim()}`,
          ).toBe(true);
        }
      }
    });
  }
});
