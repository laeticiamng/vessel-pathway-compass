// Verify that t()-style nested lookups returning objects/arrays work in all 3 locales,
// and that no critical structured key falls back to its dotted-path string.

import { fr } from "../src/i18n/fr.ts";
import { en } from "../src/i18n/en.ts";
import { de } from "../src/i18n/de.ts";

const dicts: Record<string, any> = { fr, en, de };

function getNestedValue(obj: any, path: string): any {
  const val = path.split(".").reduce((acc, part) => acc?.[part], obj);
  if (val === undefined || val === null) return path; // mimics context.tsx fallback
  if (typeof val === "string" || typeof val === "object") return val;
  return path;
}

// Structured keys (must resolve to an Array)
const arrayKeys = [
  "pages.faq.items",
  "support.faq.items",
  "landing.trust.signals",
  "contentGate.benefits",
  "pages.limits.sections.regulatory.items",
  "pages.limits.sections.clinical.items",
  "pages.limits.sections.technical.items",
  "pages.limits.sections.usage.items",
];

// Structured keys (must resolve to an Object — not array, not string)
const objectKeys = [
  "pages.faq",
  "support.faq",
  "pages.limits.sections.regulatory",
  "pages.limits.sections.clinical",
  "pages.limits.sections.technical",
  "pages.limits.sections.usage",
  "l1.patientContext",
  "l1.aquaMR",
  "l1.c4i",
  "l1.decision",
  "l1.summary",
  "l1.exports",
  "vasculink.arch",
  "power",
  "patientDetail.riskFactors",
  "patientDetail.tabs",
  "patientDetail.editDialog",
];

let failures = 0;
const checkArray = (locale: string, key: string) => {
  const v = getNestedValue(dicts[locale], key);
  if (!Array.isArray(v)) {
    console.error(`❌ [${locale}] ${key} → expected Array, got ${typeof v} (${JSON.stringify(v).slice(0, 80)})`);
    failures++;
    return;
  }
  if (v.length === 0) {
    console.error(`⚠️  [${locale}] ${key} → empty array`);
    failures++;
    return;
  }
  // FAQ items expect {q,a} shape
  if (key.endsWith(".items") && (key.includes("faq"))) {
    for (const [i, item] of v.entries()) {
      if (!item || typeof item !== "object" || !("q" in item) || !("a" in item)) {
        console.error(`❌ [${locale}] ${key}[${i}] missing q/a:`, item);
        failures++;
      }
    }
  }
};

const checkObject = (locale: string, key: string) => {
  const v = getNestedValue(dicts[locale], key);
  if (typeof v !== "object" || v === null || Array.isArray(v)) {
    console.error(`❌ [${locale}] ${key} → expected plain Object, got ${Array.isArray(v) ? "Array" : typeof v}`);
    failures++;
    return;
  }
  if (Object.keys(v).length === 0) {
    console.error(`❌ [${locale}] ${key} → empty object`);
    failures++;
  }
};

// Also: ensure no key that should be a leaf string falls back to its path
const stringKeys = [
  "common.save",
  "l1.patientContext.title",
  "l1.aquaMR.nonInterpWarning",
  "vasculink.arch.cockpitBanner",
  "power.footnote",
  "pages.limits.title",
  "pages.limits.ctaTitle",
];
const checkString = (locale: string, key: string) => {
  const v = getNestedValue(dicts[locale], key);
  if (typeof v !== "string") {
    console.error(`❌ [${locale}] ${key} → expected string, got ${typeof v}`);
    failures++;
    return;
  }
  if (v === key) {
    console.error(`❌ [${locale}] ${key} → fell back to dotted-path (key missing!)`);
    failures++;
  }
};

for (const locale of ["fr", "en", "de"]) {
  for (const k of arrayKeys) checkArray(locale, k);
  for (const k of objectKeys) checkObject(locale, k);
  for (const k of stringKeys) checkString(locale, k);
}

if (failures === 0) {
  const arrChecks = arrayKeys.length * 3;
  const objChecks = objectKeys.length * 3;
  const strChecks = stringKeys.length * 3;
  console.log(`✅ All structured t() lookups resolve correctly.`);
  console.log(`   ${arrChecks} array checks · ${objChecks} object checks · ${strChecks} string checks across fr/en/de.`);
  process.exit(0);
} else {
  console.error(`\n❌ ${failures} failure(s) detected.`);
  process.exit(1);
}
