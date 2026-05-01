/**
 * i18n structural contract tests.
 *
 * These guard the structured (non-string) parts of the dictionaries so that
 * `t()` callers using `expected="array" | "object"` always get the right
 * shape in every locale. Pure dictionary tests — no React rendering needed.
 */
import { describe, expect, it } from "vitest";
import { fr } from "../fr";
import { en } from "../en";
import { de } from "../de";
import {
  validateLocale,
  LocaleSchema,
  FaqItemSchema,
  LimitsSectionSchema,
  LegalSectionSchema,
} from "../schema";

const dicts = { fr, en, de } as const;
type LocaleKey = keyof typeof dicts;
const locales = Object.keys(dicts) as LocaleKey[];

function getNested(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, part) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined),
      obj
    );
}

describe("i18n schema validation", () => {
  it.each(locales)("[%s] satisfies the LocaleSchema contract", (locale) => {
    const errors = validateLocale(dicts[locale], locale);
    if (errors.length > 0) {
      // Make failures easy to read in CI logs
      const formatted = errors.map((e) => `  - ${e.path}: ${e.message}`).join("\n");
      throw new Error(`Locale "${locale}" failed schema validation:\n${formatted}`);
    }
    expect(errors).toEqual([]);
  });

  it("LocaleSchema parses each locale without throwing", () => {
    for (const locale of locales) {
      expect(() => LocaleSchema.parse(dicts[locale])).not.toThrow();
    }
  });
});

describe("i18n nested t() lookups — Arrays", () => {
  const arrayKeys = [
    "pages.faq.items",
    "support.faq.items",
    "pages.limits.sections.regulatory.items",
    "pages.limits.sections.clinical.items",
    "pages.limits.sections.technical.items",
    "pages.limits.sections.usage.items",
    "legal.notice.sections",
    "legal.privacy.sections",
    "legal.terms.sections",
  ];

  it.each(
    locales.flatMap((locale) => arrayKeys.map((key) => [locale, key] as const))
  )("[%s] %s resolves to a non-empty array", (locale, key) => {
    const v = getNested(dicts[locale], key);
    expect(Array.isArray(v), `${key} in ${locale} must be an array`).toBe(true);
    expect((v as unknown[]).length).toBeGreaterThan(0);
  });
});

describe("i18n nested t() lookups — Objects", () => {
  const objectKeys = [
    "pages.faq",
    "support.faq",
    "pages.limits.sections.regulatory",
    "pages.limits.sections.clinical",
    "pages.limits.sections.technical",
    "pages.limits.sections.usage",
    "landing.about.medreg",
    "landing.about.highlights",
  ];

  it.each(
    locales.flatMap((locale) => objectKeys.map((key) => [locale, key] as const))
  )("[%s] %s resolves to a plain object", (locale, key) => {
    const v = getNested(dicts[locale], key);
    expect(v, `${key} in ${locale} should exist`).toBeDefined();
    expect(typeof v).toBe("object");
    expect(Array.isArray(v)).toBe(false);
    expect(Object.keys(v as Record<string, unknown>).length).toBeGreaterThan(0);
  });
});

describe("i18n FAQ item shape", () => {
  it.each(locales)("[%s] every pages.faq.items entry matches FaqItemSchema", (locale) => {
    const items = getNested(dicts[locale], "pages.faq.items") as unknown[];
    items.forEach((item, idx) => {
      const result = FaqItemSchema.safeParse(item);
      if (!result.success) {
        throw new Error(`pages.faq.items[${idx}] in ${locale} invalid: ${JSON.stringify(item)}`);
      }
    });
  });

  it.each(locales)("[%s] every support.faq.items entry matches FaqItemSchema", (locale) => {
    const items = getNested(dicts[locale], "support.faq.items") as unknown[];
    items.forEach((item) => {
      expect(FaqItemSchema.safeParse(item).success).toBe(true);
    });
  });
});

describe("i18n Limits section shape", () => {
  const sections = ["regulatory", "clinical", "technical", "usage"] as const;
  it.each(locales.flatMap((l) => sections.map((s) => [l, s] as const)))(
    "[%s] limits.%s matches LimitsSectionSchema",
    (locale, section) => {
      const v = getNested(dicts[locale], `pages.limits.sections.${section}`);
      const result = LimitsSectionSchema.safeParse(v);
      if (!result.success) {
        throw new Error(`limits.${section} in ${locale}: ${JSON.stringify(result.error.issues)}`);
      }
    }
  );
});

describe("i18n Legal section shape", () => {
  const pages = ["notice", "privacy", "terms"] as const;
  it.each(locales.flatMap((l) => pages.map((p) => [l, p] as const)))(
    "[%s] legal.%s.sections entries match LegalSectionSchema",
    (locale, page) => {
      const items = getNested(dicts[locale], `legal.${page}.sections`) as unknown[];
      items.forEach((item) => {
        expect(LegalSectionSchema.safeParse(item).success).toBe(true);
      });
    }
  );
});

describe("i18n leaf strings — no dotted-path fallback", () => {
  const stringKeys = [
    "common.save",
    "landing.about.medreg.label",
    "landing.about.medreg.identity",
    "landing.about.medreg.gln",
    "landing.about.medreg.short",
    "pages.limits.title",
    "support.faq.title",
  ];
  it.each(
    locales.flatMap((l) => stringKeys.map((k) => [l, k] as const))
  )("[%s] %s exists and is a non-empty string", (locale, key) => {
    const v = getNested(dicts[locale], key);
    expect(typeof v, `${key} in ${locale}`).toBe("string");
    expect((v as string).length).toBeGreaterThan(0);
  });
});

describe("i18n cross-locale parity", () => {
  it("FAQ item count is consistent across locales", () => {
    const counts = locales.map((l) => (getNested(dicts[l], "pages.faq.items") as unknown[]).length);
    const allEqual = counts.every((c) => c === counts[0]);
    expect(
      allEqual,
      `pages.faq.items length differs across locales: ${JSON.stringify(
        Object.fromEntries(locales.map((l, i) => [l, counts[i]]))
      )}`
    ).toBe(true);
  });

  it("Legal notice section count is consistent across locales", () => {
    const counts = locales.map(
      (l) => (getNested(dicts[l], "legal.notice.sections") as unknown[]).length
    );
    expect(counts.every((c) => c === counts[0])).toBe(true);
  });
});
