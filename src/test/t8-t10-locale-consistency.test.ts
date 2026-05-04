/**
 * T8 / T10 multi-locale integrity test.
 *
 * T8 has been superseded: the platform no longer surfaces CHF/EUR (or any)
 * public pricing during the academic-validation phase. The currency block
 * is now a neutral "supervised access" descriptor, and the Professional
 * plan label is institutional. This test enforces that no monetary token
 * (USD, CHF, EUR, $, €) leaks into the public pricing surface.
 *
 * T10: no HIPAA / no MDR / no FDA affirmative claims.
 */

import { describe, it, expect } from "vitest";
import { en } from "@/i18n/en";
import { fr } from "@/i18n/fr";
import { de } from "@/i18n/de";
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

const MONETARY_TOKEN = /\b(USD|CHF|EUR)\b|\$|€/;

describe("T8 (superseded) — no monetary tokens on the public pricing surface", () => {
  it("currency block is institutional in every locale (no USD/CHF/EUR/$/€)", () => {
    for (const [lang, dict] of Object.entries(dicts)) {
      const label = get(dict, "pricing.currency.label") as string;
      const note = get(dict, "pricing.currency.indicativeNote") as string;
      const chf = get(dict, "pricing.currency.chf") as string;
      const eur = get(dict, "pricing.currency.eur") as string;

      for (const [k, v] of Object.entries({ label, note, chf, eur })) {
        expect(v, `${lang}.pricing.currency.${k} type`).toBeTypeOf("string");
        expect(v, `${lang}.pricing.currency.${k} monetary leak`).not.toMatch(
          MONETARY_TOKEN,
        );
      }
    }
  });

  it("Professional plan price/period strings carry no monetary token", () => {
    for (const [lang, dict] of Object.entries(dicts)) {
      const price = get(dict, "pricing.plans.professional.price") as string;
      const period = get(dict, "pricing.plans.professional.period") as string;
      expect(price, `${lang} professional price`).toBeTypeOf("string");
      expect(price).not.toMatch(MONETARY_TOKEN);
      expect(period).not.toMatch(MONETARY_TOKEN);
    }
  });
});

describe("T10 — no exaggerated regulatory / clinical claims", () => {
  it("FAQ pricing answer references the academic validation phase, not pricing", () => {
    for (const [lang, dict] of Object.entries(dicts)) {
      const items = get(dict, "landing.faq.items") as Array<{ q: string; a: string }>;
      expect(Array.isArray(items), `${lang} faq.items`).toBe(true);
      const priceItem = items.find((i) =>
        /coût|cost|kostet|preis/i.test(i.q),
      );
      expect(priceItem, `${lang} pricing FAQ`).toBeDefined();
      expect(priceItem!.a, `${lang} FAQ no monetary token`).not.toMatch(
        MONETARY_TOKEN,
      );
      expect(priceItem!.a).toMatch(
        /académique|academic|akademisch|validation|Validierung|protoco/i,
      );
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
      expect(src).not.toMatch(/\$\d/);
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
