#!/usr/bin/env node
/**
 * i18n Audit Report
 *
 * Generates `scripts/reports/i18n-audit.md` with three sections:
 *
 *   1. **Per-locale missing keys** — keys used in code via `t("…")` but missing
 *      from a given locale dictionary (or where the leaf is empty).
 *   2. **Orphan keys** — keys present in dictionaries but no longer referenced
 *      by any `t("key")` call in the codebase. Cleanup candidates.
 *   3. **Hardcoded strings on public pages** — refined detector that filters
 *      false positives (lines that already contain `t(`, brand tokens,
 *      questionnaire instruments, native language names, …) and groups by
 *      page + locale.
 *
 * Run: `node scripts/i18n-audit-report.mjs`
 */

import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");
const REPORT_DIR = join(__dirname, "reports");
const REPORT_PATH = join(REPORT_DIR, "i18n-audit.md");

// Public pages we want to enforce zero-hardcoded-string for.
const PUBLIC_FILE_RE =
  /^src\/(pages\/(Landing|Pricing|FAQ|Support|Contact|Legal|SecurityPrivacy|NotFound|Auth|ResetPassword|CheckoutSuccess|CheckoutCancel|Index)\.tsx|components\/landing\/.+\.tsx|components\/(SEOHead|ContentGate|CookieConsent|UsageLimitBanner|SubscriptionSettingsCard|MedRegBadge|NavLink|ErrorBoundary)\.tsx)$/;

// ---------------------------------------------------------------------------
// File walker
// ---------------------------------------------------------------------------
function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (entry === "ui" || entry === "__tests__" || entry === "node_modules") continue;
      walk(p, files);
    } else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) {
      files.push(p);
    }
  }
  return files;
}

// ---------------------------------------------------------------------------
// Dict loading + flattening
// ---------------------------------------------------------------------------
async function loadDicts() {
  const fr = (await import(`file://${SRC}/i18n/fr.ts`)).fr;
  const en = (await import(`file://${SRC}/i18n/en.ts`)).en;
  const de = (await import(`file://${SRC}/i18n/de.ts`)).de;
  return { fr, en, de };
}

function flattenKeys(obj, prefix = "", out = new Map()) {
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v == null) {
      out.set(path, { type: "null", value: v });
    } else if (Array.isArray(v)) {
      // Arrays are leaves for our purposes (used via t<T[]>(key, "array"))
      out.set(path, { type: "array", value: v, length: v.length });
    } else if (typeof v === "object") {
      flattenKeys(v, path, out);
    } else {
      out.set(path, { type: typeof v, value: v });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Used-key extractor
// ---------------------------------------------------------------------------
// Match `t(`, `t<…>(`, `tString(`-style is excluded. The `(?<![A-Za-z0-9_$])`
// negative lookbehind guarantees `t` is not part of a longer identifier
// (e.g. `toLocaleDateString` no longer matches).
const T_LITERAL_RE = /(?<![A-Za-z0-9_$])t(?:<[^>]+>)?\(\s*["'`]([\w.]+)["'`]/g;
const T_TEMPLATE_RE = /(?<![A-Za-z0-9_$])t(?:<[^>]+>)?\(\s*`([\w.]+)`/g;

function extractUsedKeys(files) {
  const used = new Map(); // key -> Set(files)
  const dynamicPrefixes = new Set(); // for keys built via template like seo.legal.${section}.title
  for (const f of files) {
    if (f.endsWith("/i18n/fr.ts") || f.endsWith("/i18n/en.ts") || f.endsWith("/i18n/de.ts") || f.endsWith("/i18n/schema.ts")) continue;
    // Skip test files — they intentionally exercise miss/fallback paths
    // and contain unrelated `t(…)`-shaped assertions (e.g. assert(t.eq("en", …))).
    if (/\.(test|spec)\.(ts|tsx)$/.test(f) || f.includes("/__tests__/") || f.includes("/test/")) continue;
    const code = readFileSync(f, "utf8");
    const rel = relative(ROOT, f).replaceAll("\\", "/");
    const codeLines = code.split("\n");
    const isCommentLine = (idx) => {
      const ln = codeLines[code.slice(0, idx).split("\n").length - 1] ?? "";
      return /^\s*(\/\/|\*|\/\*)/.test(ln);
    };
    let m;
    T_LITERAL_RE.lastIndex = 0;
    while ((m = T_LITERAL_RE.exec(code)) !== null) {
      if (isCommentLine(m.index)) continue;
      const key = m[1];
      if (!used.has(key)) used.set(key, new Set());
      used.get(key).add(rel);
    }
    T_TEMPLATE_RE.lastIndex = 0;
    while ((m = T_TEMPLATE_RE.exec(code)) !== null) {
      if (isCommentLine(m.index)) continue;
      const key = m[1];
      if (!used.has(key)) used.set(key, new Set());
      used.get(key).add(rel);
    }
    // Dynamic template literals like `seo.legal.${current}.title`
    const tplDyn = /(?<![A-Za-z0-9_$])t(?:<[^>]+>)?\(\s*`([\w.]*\$\{[^}]+\}[\w.]*)`/g;
    while ((m = tplDyn.exec(code)) !== null) {
      // Capture the static prefix ending before ${
      const prefix = m[1].split("${")[0].replace(/\.$/, "");
      if (prefix.length > 1) dynamicPrefixes.add(prefix);
    }
  }
  return { used, dynamicPrefixes };
}

// ---------------------------------------------------------------------------
// Hardcoded detector (refined)
// ---------------------------------------------------------------------------
const KEEP_AS_IS = new Set([
  "AquaMR Flow", "AquaMR", "VASCU-LINK", "VASCU-LINK®",
  "VascuQol-6", "VascuQoL-6", "CIVIQ-14", "WIQ", "6-MWT",
  "ABI", "TBI", "TcPO2", "TcPO₂", "ESC", "MDR", "GDPR",
  "RGPD", "HDS", "DICOM", "FHIR", "PACS", "DPI", "EHR",
  "PHI", "TLS", "RLS", "DSGVO", "CSV", "JSON", "PDF", "URL",
  "API", "JWT", "SQL", "HTTP", "HTTPS", "SaaS", "MRA", "MRI",
  "CT", "IVUS", "OCT", "SVG", "HTML", "ID", "UI", "UX", "QA",
  "AI", "ML", "CI-AKI", "C4-i", "ADR", "PROMs", "DSMB", "DPIA",
  "FAQ", "EMOTIONSCARE SASU", "Lovable", "Supabase",
  "Français", "Deutsch", "English", "EN", "FR", "DE",
]);

const SKIP_LINE_RE = [
  /\bt\s*[<(]/,                  // line uses t() somewhere
  /^\s*(\/\/|\*|\/\*)/,           // comment
  /^\s*(import|export)\s/,        // import/export
  /console\.|throw new |new Error\(/,
  /className\s*=/,                // className (handled separately)
  /aria-labelledby/,              // referencing IDs
];

const HARDCODED_RE = [
  /(?<!t\()(?:>|\s)([A-ZÀ-Ý][^<>{}\n"'`]{4,80}[.!?])(?:<|\s*<|\s)/g, // sentence-y text in JSX
];

// Looser heuristic: scan JSX text + key props only when line passes filter
const PROP_RE = /\b(title|placeholder|description|aria-label|alt|tooltip|caption|subtitle|heading)\s*=\s*["'`]([^"'`]{3,})["'`]/g;
const JSX_TEXT_RE = />([^<>{}\n]{3,})</g;

function lineOf(content, idx) {
  return content.slice(0, idx).split("\n").length;
}
function getLine(content, lineNum) {
  return content.split("\n")[lineNum - 1] ?? "";
}

function looksLikeCopy(s) {
  const t = s.trim();
  if (t.length < 4) return false;
  if (KEEP_AS_IS.has(t)) return false;
  if (/^[A-Z]{2,5}$/.test(t)) return false;          // acronym
  if (/^\d+(\.\d+)?\s*(mm|cm|kg|mg|ml|mmHg|mSv|°C|%|px|rem|s|ms|€|\$)?$/i.test(t)) return false;
  if (/^[\w\-/.]+$/.test(t)) return false;           // identifier-like
  if (/^[#@/.]/.test(t)) return false;
  // Must have at least one letter and look sentence-ish
  if (!/[A-Za-zÀ-ÿ]/.test(t)) return false;
  // Has a space OR ends with punctuation OR has accented chars
  if (/\s/.test(t) || /[.!?…:]$/.test(t) || /[À-ÿ]/.test(t)) return true;
  // Single capitalized word ≥6 chars
  if (/^[A-Z][a-zA-Z]{5,}$/.test(t)) return true;
  return false;
}

function scanFileForHardcoded(absPath) {
  const code = readFileSync(absPath, "utf8");
  const findings = [];
  const push = (line, kind, value) => {
    const lineContent = getLine(code, line);
    if (SKIP_LINE_RE.some((re) => re.test(lineContent))) return;
    if (!looksLikeCopy(value)) return;
    findings.push({ line, kind, value: value.trim().replace(/\s+/g, " ").slice(0, 100) });
  };
  let m;
  PROP_RE.lastIndex = 0;
  while ((m = PROP_RE.exec(code)) !== null) push(lineOf(code, m.index), `prop:${m[1]}`, m[2]);
  JSX_TEXT_RE.lastIndex = 0;
  while ((m = JSX_TEXT_RE.exec(code)) !== null) push(lineOf(code, m.index), "jsx-text", m[1]);
  // Dedupe
  const seen = new Set();
  return findings.filter((f) => {
    const k = `${f.line}|${f.value}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const allFiles = walk(SRC);
  const dicts = await loadDicts();
  const dictKeys = {
    fr: flattenKeys(dicts.fr),
    en: flattenKeys(dicts.en),
    de: flattenKeys(dicts.de),
  };

  const { used, dynamicPrefixes } = extractUsedKeys(allFiles);

  // ---------------- Missing keys per locale ----------------
  const missing = { fr: [], en: [], de: [] };
  for (const [key] of used) {
    for (const lang of ["fr", "en", "de"]) {
      const entry = dictKeys[lang].get(key);
      if (!entry) {
        missing[lang].push({ key, reason: "absent" });
      } else if (entry.type === "string" && (entry.value === "" || entry.value == null)) {
        missing[lang].push({ key, reason: "empty" });
      } else if (entry.type === "array" && entry.length === 0) {
        missing[lang].push({ key, reason: "empty array" });
      }
    }
  }

  // ---------------- Orphan keys (defined but never referenced) ----------------
  // A key is considered referenced if it (or any prefix-extension) is used,
  // or matches a dynamic prefix, or its parent is used as an array/object.
  const usedPrefixSet = new Set();
  for (const k of used.keys()) {
    const parts = k.split(".");
    for (let i = 1; i <= parts.length; i++) usedPrefixSet.add(parts.slice(0, i).join("."));
  }
  function isReferenced(key) {
    if (used.has(key)) return true;
    // any used key starts with this key + "."  OR  this key starts with any used key + "."
    for (const u of used.keys()) {
      if (u === key) return true;
      if (u.startsWith(key + ".")) return true;
      if (key.startsWith(u + ".")) return true;
    }
    for (const p of dynamicPrefixes) {
      if (key.startsWith(p + ".") || key === p) return true;
    }
    return false;
  }
  // Compute orphans only on FR (canonical) — orphans across all 3 will mostly overlap.
  const orphans = [];
  for (const [key] of dictKeys.fr) {
    if (!isReferenced(key)) orphans.push(key);
  }

  // ---------------- Hardcoded on public pages ----------------
  const hardcodedByFile = [];
  for (const f of allFiles) {
    const rel = relative(ROOT, f).replaceAll("\\", "/");
    if (!PUBLIC_FILE_RE.test(rel)) continue;
    const findings = scanFileForHardcoded(f);
    if (findings.length) hardcodedByFile.push({ file: rel, findings });
  }

  // ---------------- Build report ----------------
  const lines = [];
  lines.push("# i18n Audit Report");
  lines.push("");
  lines.push(`_Generated: ${new Date().toISOString()}_`);
  lines.push("");
  lines.push(
    "Three views for one purpose: **(1)** find translation keys called from the codebase but missing/empty in a locale, **(2)** detect dictionary keys never used in code (orphans) so we can prune, **(3)** flag remaining hardcoded strings on **public pages** (after filtering brand tokens, native language names, clinical instruments and lines already wrapped in `t()`).",
  );
  lines.push("");

  // Summary
  lines.push("## Summary");
  lines.push("");
  lines.push("| Metric | Count |");
  lines.push("|---|---:|");
  lines.push(`| Translation keys referenced from code | ${used.size} |`);
  lines.push(`| Dynamic key prefixes detected | ${dynamicPrefixes.size} |`);
  lines.push(`| Keys missing in FR | ${missing.fr.length} |`);
  lines.push(`| Keys missing in EN | ${missing.en.length} |`);
  lines.push(`| Keys missing in DE | ${missing.de.length} |`);
  lines.push(`| Orphan keys (defined, unused) | ${orphans.length} |`);
  lines.push(
    `| Public pages with hardcoded candidates | ${hardcodedByFile.length} (${hardcodedByFile.reduce((a, e) => a + e.findings.length, 0)} findings) |`,
  );
  lines.push("");

  // Missing per locale
  for (const lang of ["fr", "en", "de"]) {
    lines.push(`## Missing keys — ${lang.toUpperCase()}`);
    lines.push("");
    if (!missing[lang].length) {
      lines.push("_None ✅_");
      lines.push("");
      continue;
    }
    lines.push("| Key | Reason | Used in |");
    lines.push("|---|---|---|");
    for (const m of missing[lang].slice(0, 200)) {
      const files = [...(used.get(m.key) ?? new Set())].slice(0, 3).join(", ");
      lines.push(`| \`${m.key}\` | ${m.reason} | ${files} |`);
    }
    if (missing[lang].length > 200) {
      lines.push(`| … | … | (${missing[lang].length - 200} more) |`);
    }
    lines.push("");
  }

  // Orphans
  lines.push("## Orphan keys (defined in FR dictionary but never referenced)");
  lines.push("");
  if (!orphans.length) {
    lines.push("_None ✅_");
    lines.push("");
  } else {
    lines.push(
      `_${orphans.length} keys are present in the dictionary but no \`t("…")\` call references them. Some may be intentional (placeholders for upcoming features) — review before pruning._`,
    );
    lines.push("");
    lines.push("```");
    for (const k of orphans.slice(0, 300)) lines.push(k);
    if (orphans.length > 300) lines.push(`… (${orphans.length - 300} more)`);
    lines.push("```");
    lines.push("");
  }

  // Hardcoded
  lines.push("## Hardcoded strings on public pages (refined)");
  lines.push("");
  lines.push(
    "_Filters applied: lines already containing `t(`, brand/clinical tokens, native language names, `className=` / SVG paths / units. Remaining items are real candidates to wire through `t()`._",
  );
  lines.push("");
  if (!hardcodedByFile.length) {
    lines.push("_None ✅_");
  } else {
    for (const e of hardcodedByFile.sort((a, b) => b.findings.length - a.findings.length)) {
      lines.push(`### \`${e.file}\` — ${e.findings.length}`);
      lines.push("");
      lines.push("| Line | Kind | Value |");
      lines.push("|---:|---|---|");
      for (const f of e.findings.sort((a, b) => a.line - b.line)) {
        lines.push(`| ${f.line} | ${f.kind} | ${f.value.replace(/\|/g, "\\|")} |`);
      }
      lines.push("");
    }
  }

  mkdirSync(REPORT_DIR, { recursive: true });
  writeFileSync(REPORT_PATH, lines.join("\n"), "utf8");
  console.log(`✅ Report written to ${relative(ROOT, REPORT_PATH)}`);
  console.log(
    `   used=${used.size} · missing FR=${missing.fr.length} EN=${missing.en.length} DE=${missing.de.length} · orphans=${orphans.length} · hardcoded findings=${hardcodedByFile.reduce((a, e) => a + e.findings.length, 0)}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
