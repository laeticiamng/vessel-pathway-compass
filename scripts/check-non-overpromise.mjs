#!/usr/bin/env node
/**
 * Non-overpromise content check
 * --------------------------------
 * Scans the public-facing Landing + Protocol surface (pages, landing
 * components, and i18n EN/FR/DE bundles) for marketing-like phrases that
 * would contradict the project's "diagnostic concordance, pragmatic
 * non-inferiority" framing.
 *
 * A finding is only flagged when the matched phrase is NOT preceded by a
 * negation marker on the same sentence ("not", "no ", "never", "doesn't",
 * "does not", "ne ... pas", "jamais", "kein", "nicht", "niemals").
 *
 * Exit code:
 *   0 — no overpromise content found
 *   1 — at least one finding (CI/publish blocker)
 *
 * Run:  node scripts/check-non-overpromise.mjs
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");

// ── Forbidden phrases (case-insensitive) ────────────────────────────────────
// Each entry MUST express a superiority / replacement / hype claim.
const PATTERNS = [
  // EN
  /\bbetter than (mri|mra|cta|ct angiography|catheter angiography|hospital imaging)\b/i,
  /\b(out\s?perform[s]?|surpass(?:es)?) (?:hospital )?(?:mri|mra|cta|ct|catheter angiography|standard imaging)\b/i,
  /\breplaces? (?:hospital )?(?:mri|mra|cta|catheter )?angiography\b/i,
  /\breplaces? (?:hospital )?(?:mri|mra|cta)\b/i,
  /\b(world['’]?s )?best (?:vascular |peripheral )?(?:imaging|mri|mra|platform)\b/i,
  /\bsuperior (?:to|than) (?:mri|mra|cta|catheter angiography|hospital imaging)\b/i,
  /\bdiagnostic accuracy (?:above|greater than|superior to) (?:mri|mra|cta)\b/i,
  /\b(?:guarantee[ds]?|guaranteed) (?:diagnosis|outcome|cure|accuracy)\b/i,
  /\b(?:revolutionary|game[- ]changing|disruptive) (?:imaging|mri|platform|technology)\b/i,
  /\b(?:fda|ce[- ]mark) (?:cleared|approved)\b/i,
  /\b(?:replaces? )?duplex\b.*\b(?:obsolete|unnecessary|no longer needed)\b/i,
  // FR
  /\bmieux que (?:l['’]?irm|l['’]?angio[- ]ct|l['’]?angiographie|l['’]?imagerie hospitali[èe]re)\b/i,
  /\bsup[ée]rieur(?:e)? (?:à|a) (?:l['’]?irm|l['’]?angio[- ]ct|l['’]?angiographie)\b/i,
  /\bremplace(?:r|nt)? (?:l['’]?irm|l['’]?angio[- ]ct|l['’]?angiographie|le doppler)\b/i,
  /\bgaranti(?:e|t|r) (?:le )?(?:diagnostic|r[ée]sultat|gu[ée]rison|pr[ée]cision)\b/i,
  /\b(?:r[ée]volutionnaire|disruptif|disruptive) (?:imagerie|irm|plateforme|technologie)\b/i,
  // DE
  /\bbesser als (?:mrt|mra|ct[- ]angiographie|katheter[- ]angiographie|klinische bildgebung)\b/i,
  /\b[üu]berlegen (?:gegen[üu]ber|als) (?:mrt|mra|cta|katheter[- ]angiographie)\b/i,
  /\bersetzt? (?:mrt|mra|cta|angiographie|duplex)\b/i,
  /\bgarantiert(?:e|er|en)? (?:diagnose|ergebnis|heilung|genauigkeit)\b/i,
  /\b(?:revolution[äa]r|bahnbrechend|disruptiv) (?:bildgebung|mrt|plattform|technologie)\b/i,
];

// Negation markers that, if present in the SAME sentence before the match,
// neutralize the finding (the phrase is being explicitly denied).
const NEGATION_RE =
  /\b(not|no|never|doesn['’]?t|does not|do not|do n['’]?t|cannot|can ?not|n['’]?est pas|ne (?:vise|cherche|remplace|prétend|pretend)|jamais|pas (?:une?|de|à|le|la)|aucun(?:e)?|kein(?:e|er|es)?|nicht|niemals|keinerlei)\b/i;

// File globs
const SCAN_TARGETS = [
  "src/pages/Landing.tsx",
  "src/pages/Protocol.tsx",
  "src/components/landing",
  "src/i18n/en.ts",
  "src/i18n/fr.ts",
  "src/i18n/de.ts",
];

function walk(p, acc = []) {
  const s = statSync(p);
  if (s.isDirectory()) {
    for (const name of readdirSync(p)) walk(join(p, name), acc);
  } else if (/\.(t|j)sx?$/.test(p)) {
    acc.push(p);
  }
  return acc;
}

function collectFiles() {
  const out = [];
  for (const t of SCAN_TARGETS) {
    const abs = join(ROOT, t);
    try {
      walk(abs, out);
    } catch {
      // missing path — silently skip
    }
  }
  return out;
}

function splitSentences(line) {
  // Split on sentence boundaries; keep enough context to detect negation.
  return line.split(/(?<=[.!?…])\s+/);
}

function scanFile(file) {
  const findings = [];
  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("//") || line.trim().startsWith("*")) continue;
    for (const sentence of splitSentences(line)) {
      for (const re of PATTERNS) {
        const m = sentence.match(re);
        if (!m) continue;
        const before = sentence.slice(0, m.index ?? 0);
        if (NEGATION_RE.test(before)) continue; // explicit denial — OK
        findings.push({
          file: relative(ROOT, file),
          line: i + 1,
          phrase: m[0],
          excerpt: sentence.trim().slice(0, 200),
        });
      }
    }
  }
  return findings;
}

function main() {
  const files = collectFiles();
  const all = [];
  for (const f of files) all.push(...scanFile(f));

  if (all.length === 0) {
    console.log(
      `✅ Non-overpromise check passed — scanned ${files.length} files, no marketing-like superiority claims found.`,
    );
    process.exit(0);
  }

  console.error(`❌ Non-overpromise check FAILED — ${all.length} potential overpromise phrase(s):`);
  for (const f of all) {
    console.error(`  • ${f.file}:${f.line}  → "${f.phrase}"`);
    console.error(`      ${f.excerpt}`);
  }
  console.error(
    "\nFix: rephrase to non-superiority framing, or wrap the claim in an explicit negation (e.g. 'not better than MRI', 'ne remplace pas l'IRM').",
  );
  process.exit(1);
}

main();
