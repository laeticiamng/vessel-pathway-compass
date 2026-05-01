#!/usr/bin/env node
/**
 * CI guard for i18n contracts.
 *
 * Runs as a pre-build / CI step. Fails (exit 1) when:
 *   - A locale fails the zod LocaleSchema (shape regression).
 *   - A registered structured key falls back to its dotted-path string.
 *   - A registered structured key changes type (e.g. array → object).
 *
 * Usage:
 *   node scripts/i18n-ci-check.mjs
 *
 * Recommended: wire as `prebuild` in package.json or as a CI workflow step.
 */
import { register } from "node:module";
import { pathToFileURL } from "node:url";

// Use tsx loader so we can import the .ts dictionaries directly.
register("tsx/esm", pathToFileURL("./"));

const { fr } = await import("../src/i18n/fr.ts");
const { en } = await import("../src/i18n/en.ts");
const { de } = await import("../src/i18n/de.ts");
const { LocaleSchema, FaqItemSchema, LimitsSectionSchema, LegalSectionSchema } = await import(
  "../src/i18n/schema.ts"
);

const dicts = { fr, en, de };
const locales = Object.keys(dicts);

function getNested(obj, path) {
  return path.split(".").reduce((acc, part) => (acc && typeof acc === "object" ? acc[part] : undefined), obj);
}

const errors = [];
const log = (msg) => errors.push(msg);

// 1) Schema validation
for (const locale of locales) {
  const result = LocaleSchema.safeParse(dicts[locale]);
  if (!result.success) {
    for (const iss of result.error.issues) {
      log(`[schema] [${locale}] ${iss.path.join(".")}: ${iss.message}`);
    }
  }
}

// 2) Structured array keys must resolve to non-empty arrays
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
for (const locale of locales) {
  for (const key of arrayKeys) {
    const v = getNested(dicts[locale], key);
    if (!Array.isArray(v)) log(`[shape] [${locale}] ${key} → expected array, got ${typeof v}`);
    else if (v.length === 0) log(`[shape] [${locale}] ${key} → empty array`);
  }
}

// 3) Structured object keys
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
for (const locale of locales) {
  for (const key of objectKeys) {
    const v = getNested(dicts[locale], key);
    if (typeof v !== "object" || v === null || Array.isArray(v))
      log(`[shape] [${locale}] ${key} → expected object, got ${Array.isArray(v) ? "array" : typeof v}`);
  }
}

// 4) FAQ items must validate FaqItemSchema
for (const locale of locales) {
  for (const key of ["pages.faq.items", "support.faq.items"]) {
    const items = getNested(dicts[locale], key);
    if (!Array.isArray(items)) continue;
    items.forEach((item, idx) => {
      const r = FaqItemSchema.safeParse(item);
      if (!r.success) log(`[faq] [${locale}] ${key}[${idx}] invalid: ${r.error.issues.map((i) => i.message).join("; ")}`);
    });
  }
}

// 5) Limits sections must validate LimitsSectionSchema
const limitSections = ["regulatory", "clinical", "technical", "usage"];
for (const locale of locales) {
  for (const s of limitSections) {
    const v = getNested(dicts[locale], `pages.limits.sections.${s}`);
    const r = LimitsSectionSchema.safeParse(v);
    if (!r.success)
      log(`[limits] [${locale}] sections.${s} invalid: ${r.error.issues.map((i) => i.message).join("; ")}`);
  }
}

// 6) Legal sections must validate LegalSectionSchema
for (const locale of locales) {
  for (const page of ["notice", "privacy", "terms"]) {
    const items = getNested(dicts[locale], `legal.${page}.sections`);
    if (!Array.isArray(items)) continue;
    items.forEach((item, idx) => {
      const r = LegalSectionSchema.safeParse(item);
      if (!r.success)
        log(`[legal] [${locale}] ${page}.sections[${idx}] invalid: ${r.error.issues.map((i) => i.message).join("; ")}`);
    });
  }
}

// 7) Cross-locale parity (count consistency)
const parityKeys = ["pages.faq.items", "support.faq.items", "legal.notice.sections"];
for (const key of parityKeys) {
  const counts = locales.map((l) => {
    const v = getNested(dicts[l], key);
    return Array.isArray(v) ? v.length : -1;
  });
  if (new Set(counts).size > 1) {
    log(
      `[parity] ${key} length differs: ${JSON.stringify(
        Object.fromEntries(locales.map((l, i) => [l, counts[i]]))
      )}`
    );
  }
}

if (errors.length > 0) {
  console.error("\n❌ i18n CI check failed:\n");
  for (const e of errors) console.error("  " + e);
  console.error(`\n${errors.length} issue(s). Fix the dictionaries before merging.\n`);
  process.exit(1);
}
console.log(
  `✅ i18n CI check passed — ${arrayKeys.length} array keys · ${objectKeys.length} object keys · ${locales.length} locales validated against zod schemas.`
);
