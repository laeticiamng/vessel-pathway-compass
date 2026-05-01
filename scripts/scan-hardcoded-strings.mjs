#!/usr/bin/env node
/**
 * Hardcoded user-facing string detector.
 *
 * Scans .tsx files for likely-untranslated UI strings and groups results
 * by translation wave + language coverage. Produces a Markdown report at
 * `scripts/reports/i18n-hardcoded.md`.
 *
 * Detection heuristics (intentionally conservative — favors recall):
 *   - JSX text nodes containing ≥2 letters and at least one space, OR a
 *     single capitalized word ≥4 chars, that look like sentences.
 *   - String literals passed to common UI props: title, label, placeholder,
 *     description, aria-label, alt, tooltip, message.
 *   - String literals passed to toast.success/error/info/warning/loading and
 *     toast({ title/description }).
 *
 * Filters (skip):
 *   - Strings already wrapped in `t("...")` on the same line.
 *   - className / data-* / id / href / src / svg paths.
 *   - Pure numerics, units (mmHg, mm, %, kg, etc), single chars, hex/HSL.
 *   - Code identifiers (camelCase / snake_case / dotted paths).
 *   - Clinical questionnaire instrument names that MUST stay English by
 *     project rule (VascuQol-6, CIVIQ-14, WIQ, 6-MWT, ABI, TBI, …).
 *   - Imports, type-only string literals, console.*, throw new Error(…).
 */

import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");
const REPORT_DIR = join(__dirname, "reports");
const REPORT_PATH = join(REPORT_DIR, "i18n-hardcoded.md");

// =====================================================================
// Wave definitions — files grouped by user-facing translation rollout.
// =====================================================================
const WAVES = {
  "Wave 1 — Public site (landing / pricing / legal / FAQ / support)": [
    /^src\/pages\/(Landing|Pricing|FAQ|Support|Contact|Legal|SecurityPrivacy|CheckoutCancel|CheckoutSuccess|ResetPassword|NotFound|Index|Auth|Onboarding)\.tsx$/,
    /^src\/components\/landing\//,
    /^src\/components\/(ContentGate|CookieConsent|UsageLimitBanner|SubscriptionSettingsCard|PremiumGate|SEOHead|NavLink|CommandPalette|ErrorBoundary)\.tsx$/,
  ],
  "Wave 2 — Patient flow + L1 / VASCU-LINK / Power": [
    /^src\/components\/l1\//,
    /^src\/components\/vasculink\/(PowerCalculation|VasculinkArchitecture)\.tsx$/,
    /^src\/components\/patient\//,
    /^src\/pages\/app\/(Patients|PatientDetail|L1DecisionBoard)\.tsx$/,
  ],
  "Wave 3 — VascScreen + Digital Twin + Dashboard + Analytics": [
    /^src\/components\/vascscreen\//,
    /^src\/components\/digital-twin\//,
    /^src\/components\/dashboard\//,
    /^src\/components\/analytics\//,
    /^src\/pages\/app\/(VascScreen|Digital|Dashboard|Analytics)/,
  ],
  "Wave 4 — Research / Education / Simulation / Governance / Admin": [
    /^src\/components\/(research|education|simulation|governance|admin|network|notifications)\//,
    /^src\/pages\/app\/(Research|Education|Simulation|Governance|Admin|Network|Logbook|Registry|Compliance|IEC|Dpia|Lifecycle|SystemHealth|UsersAdmin|InstitutionAdmin|AuditSearch|ExportsAudit|Settings|FusionViewer|ProcedurePlanner|CIAKIEngine)/,
  ],
  "Wave 5 — Remaining VASCU-LINK scientific components": [
    /^src\/components\/vasculink\/(?!PowerCalculation|VasculinkArchitecture).+\.tsx$/,
  ],
  "Wave 6 — Layout, navigation & misc": [
    /^src\/components\/layout\//,
    /^src\/components\/(ProtectedRoute|PublicAppRoute)\.tsx$/,
  ],
};

// =====================================================================
// File walker
// =====================================================================
function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      // skip ui/ (shadcn primitives — generated, no user copy)
      if (entry === "ui" || entry === "__tests__") continue;
      walk(p, files);
    } else if (entry.endsWith(".tsx")) {
      files.push(p);
    }
  }
  return files;
}

function classifyWave(relPath) {
  for (const [wave, patterns] of Object.entries(WAVES)) {
    if (patterns.some((re) => re.test(relPath))) return wave;
  }
  return "Unassigned";
}

// =====================================================================
// Skip rules
// =====================================================================
const SKIP_TOKENS = new Set([
  // Clinical instruments — MUST stay English (project rule)
  "VascuQol-6", "VascuQoL-6", "CIVIQ-14", "WIQ", "6-MWT", "ABI", "TBI",
  "TcPO2", "TcPO₂", "ESC", "MDR", "IEC", "GDPR", "RGPD", "HDS",
  "DSMB", "AquaMR", "VASCU-LINK", "FHIR", "DICOM", "DPIA", "PROMs",
  "CKD", "AOMI", "PAD", "CI-AKI", "C4-i", "ADR",
  // Brand
  "AquaMR Flow", "Vessel Pathway Compass", "Lovable", "Supabase",
  // Tech tokens
  "CSV", "JSON", "PDF", "URL", "API", "JWT", "RLS", "SQL", "HTTP", "HTTPS", "SaaS",
  "MRA", "MRI", "CT", "SVG", "HTML", "ID", "UI", "UX", "QA", "AI", "ML",
]);

const SKIP_REGEX = [
  /^\d+(\.\d+)?$/,                  // pure number
  /^[a-z][a-zA-Z0-9]*$/,            // camelCase identifier
  /^[a-z]+(_[a-z0-9]+)+$/,          // snake_case
  /^[A-Z][A-Z0-9_]*$/,              // CONSTANT
  /^#[0-9a-fA-F]{3,8}$/,            // hex color
  /^hsl\(/,                         // HSL
  /^[a-z]+\.[a-z][\w.]+$/i,         // dotted path / i18n key
  /^\/[a-z0-9\-_/]*$/i,             // route path
  /^https?:\/\//,                   // URL
  /^[A-Za-z]+\([^)]*\)$/,           // function call literal
  /^M ?[\d\s,.\-]+$/,               // SVG path (starts with M)
  /^[\d\s.,\-]+$/,                  // numeric / unit string
  /^\d+\s*(mm|cm|m|kg|mg|ml|mmHg|mSv|°C|%|px|rem|em|s|ms)$/i,
  /^[\w\-]+\.(tsx?|jsx?|css|svg|png|jpg|json)$/, // filenames
  /^@?[\w\-/]+$/,                   // import-like
];

function shouldSkipString(s) {
  const trimmed = s.trim();
  if (!trimmed) return true;
  if (trimmed.length < 3) return true;
  if (SKIP_TOKENS.has(trimmed)) return true;
  // Strings without any letter
  if (!/[A-Za-zÀ-ÿ]/.test(trimmed)) return true;
  // Single ALL-CAPS acronyms (≤4 chars) — code/medical
  if (trimmed.length <= 4 && /^[A-Z0-9\-]+$/.test(trimmed)) return true;
  for (const re of SKIP_REGEX) if (re.test(trimmed)) return true;
  // Looks like a className list (multiple class-like tokens separated by spaces)
  if (/^[\w:\[\]\-\/]+(\s+[\w:\[\]\-\/]+){2,}$/.test(trimmed)) return true;
  return false;
}

// Heuristic: does the string look like user-facing UI copy?
function looksLikeUserCopy(s) {
  const t = s.trim();
  // Sentence with space and ≥2 words
  if (/[A-Za-zÀ-ÿ].*\s+.*[A-Za-zÀ-ÿ]/.test(t) && t.length >= 5) return true;
  // Single capitalized word ≥4 chars (Button, Cancel, …) — but only if pure letters
  if (/^[A-ZÀ-Ý][a-zà-ÿ]{3,}$/.test(t)) return true;
  return false;
}

// =====================================================================
// Source scanner
// =====================================================================
const PROP_RE =
  /\b(title|label|placeholder|description|aria-label|alt|tooltip|message|heading|subtitle|caption|name)\s*=\s*\{?\s*["'`]([^"'`]{3,})["'`]\s*\}?/g;
const TOAST_FN_RE =
  /\btoast(?:\.(?:success|error|info|warning|loading))?\(\s*["'`]([^"'`]{3,})["'`]/g;
const TOAST_OBJ_RE =
  /\btoast\(\s*\{[^}]*?\b(title|description)\s*:\s*["'`]([^"'`]{3,})["'`]/g;
const JSX_TEXT_RE = />([^<{}]{3,})</g;

function lineOf(content, index) {
  return content.slice(0, index).split("\n").length;
}

function isWrappedInT(lineContent) {
  return /\bt\(\s*["'][\w.]+["']/.test(lineContent);
}

function getLine(content, lineNum) {
  return content.split("\n")[lineNum - 1] ?? "";
}

function scanFile(absPath, relPath) {
  const code = readFileSync(absPath, "utf8");
  const findings = [];

  const push = (line, kind, value) => {
    const lineContent = getLine(code, line);
    if (isWrappedInT(lineContent)) return;
    // Skip lines that are comments
    if (/^\s*(\/\/|\*|\/\*)/.test(lineContent)) return;
    // Skip imports / exports
    if (/^\s*(import|export)\s/.test(lineContent)) return;
    // Skip console / throw / new Error
    if (/console\.|throw new |new Error\(/.test(lineContent)) return;
    if (shouldSkipString(value)) return;
    if (!looksLikeUserCopy(value)) return;
    findings.push({ line, kind, value: value.trim().replace(/\s+/g, " ").slice(0, 120) });
  };

  let m;
  while ((m = PROP_RE.exec(code)) !== null) push(lineOf(code, m.index), `prop:${m[1]}`, m[2]);
  while ((m = TOAST_FN_RE.exec(code)) !== null) push(lineOf(code, m.index), "toast", m[1]);
  while ((m = TOAST_OBJ_RE.exec(code)) !== null) push(lineOf(code, m.index), `toast.${m[1]}`, m[2]);
  while ((m = JSX_TEXT_RE.exec(code)) !== null) {
    const raw = m[1];
    // Skip pure whitespace/punctuation noise
    if (!/[A-Za-zÀ-ÿ]/.test(raw)) continue;
    push(lineOf(code, m.index), "jsx-text", raw);
  }

  // Dedupe by line+value
  const seen = new Set();
  return findings.filter((f) => {
    const k = `${f.line}|${f.value}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// =====================================================================
// Language coverage check (strings present in fr/en/de dictionaries?)
// =====================================================================
async function loadDicts() {
  const fr = (await import(`file://${SRC}/i18n/fr.ts`)).fr;
  const en = (await import(`file://${SRC}/i18n/en.ts`)).en;
  const de = (await import(`file://${SRC}/i18n/de.ts`)).de;
  return { fr, en, de };
}

function flatten(obj, prefix = "") {
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) out.push(...flatten(v, path));
    else if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) {
      for (const item of v) {
        if (typeof item === "string") out.push(item);
        else if (item && typeof item === "object") out.push(...flatten(item, path));
      }
    }
  }
  return out;
}

function buildPresenceIndex(dictValues) {
  const norm = new Set();
  for (const s of dictValues) norm.add(s.trim().toLowerCase());
  return norm;
}

// =====================================================================
// Main
// =====================================================================
async function main() {
  const files = walk(SRC).map((f) => ({
    abs: f,
    rel: relative(ROOT, f).replaceAll("\\", "/"),
  }));

  const dicts = await loadDicts().catch((err) => {
    console.error("Failed to load i18n dictionaries:", err.message);
    return null;
  });

  const presence = dicts
    ? {
        fr: buildPresenceIndex(flatten(dicts.fr)),
        en: buildPresenceIndex(flatten(dicts.en)),
        de: buildPresenceIndex(flatten(dicts.de)),
      }
    : null;

  // Scan
  const byWave = {};
  for (const wave of Object.keys(WAVES)) byWave[wave] = [];
  byWave["Unassigned"] = [];

  let totalFindings = 0;
  for (const f of files) {
    const findings = scanFile(f.abs, f.rel);
    if (!findings.length) continue;
    const wave = classifyWave(f.rel);
    byWave[wave].push({ file: f.rel, findings });
    totalFindings += findings.length;
  }

  // Coverage stats per wave (does the string already exist verbatim in some dict?)
  function coverage(value, locale) {
    if (!presence) return "?";
    return presence[locale].has(value.trim().toLowerCase()) ? "✓" : "✗";
  }

  // Build report
  const lines = [];
  lines.push("# Hardcoded UI Strings — i18n Audit");
  lines.push("");
  lines.push(`_Generated: ${new Date().toISOString()}_`);
  lines.push("");
  lines.push(
    `**Methodology:** static scan of \`.tsx\` files for JSX text, prop strings (title/label/placeholder/description/aria-label/alt/tooltip), and toast messages that look like user-facing copy. Strings already wrapped in \`t("…")\`, code identifiers, technical tokens, units, and clinical instrument names (VascuQol-6, CIVIQ-14, WIQ, 6-MWT, ABI, …) are filtered out per project i18n rules.`,
  );
  lines.push("");
  lines.push("**Coverage columns** (per language): `✓` = same literal already exists somewhere in the dictionary (likely just needs key-wiring), `✗` = the literal does not appear in that locale's dictionary (truly missing translation).");
  lines.push("");

  // Summary table
  lines.push("## Summary by wave");
  lines.push("");
  lines.push("| Wave | Files w/ hits | Findings | FR ✗ | EN ✗ | DE ✗ |");
  lines.push("|---|---:|---:|---:|---:|---:|");

  const waveOrder = [...Object.keys(WAVES), "Unassigned"];
  for (const wave of waveOrder) {
    const entries = byWave[wave];
    if (!entries.length) continue;
    let total = 0,
      missFr = 0,
      missEn = 0,
      missDe = 0;
    for (const e of entries) {
      total += e.findings.length;
      for (const f of e.findings) {
        if (coverage(f.value, "fr") === "✗") missFr++;
        if (coverage(f.value, "en") === "✗") missEn++;
        if (coverage(f.value, "de") === "✗") missDe++;
      }
    }
    lines.push(`| ${wave} | ${entries.length} | ${total} | ${missFr} | ${missEn} | ${missDe} |`);
  }
  lines.push("");
  lines.push(`**Total findings:** ${totalFindings} across ${files.length} scanned files.`);
  lines.push("");

  // Per-wave detail
  for (const wave of waveOrder) {
    const entries = byWave[wave];
    if (!entries.length) continue;
    lines.push(`## ${wave}`);
    lines.push("");
    entries.sort((a, b) => b.findings.length - a.findings.length);
    for (const e of entries) {
      lines.push(`### \`${e.file}\` — ${e.findings.length} finding${e.findings.length > 1 ? "s" : ""}`);
      lines.push("");
      lines.push("| Line | Kind | FR | EN | DE | String |");
      lines.push("|---:|---|:---:|:---:|:---:|---|");
      e.findings.sort((a, b) => a.line - b.line);
      for (const f of e.findings) {
        const safe = f.value.replace(/\|/g, "\\|");
        lines.push(
          `| ${f.line} | ${f.kind} | ${coverage(f.value, "fr")} | ${coverage(f.value, "en")} | ${coverage(f.value, "de")} | ${safe} |`,
        );
      }
      lines.push("");
    }
  }

  mkdirSync(REPORT_DIR, { recursive: true });
  writeFileSync(REPORT_PATH, lines.join("\n"), "utf8");
  console.log(`✅ Report written to ${relative(ROOT, REPORT_PATH)}`);
  console.log(`   ${totalFindings} findings · ${files.length} files scanned`);

  // Console summary
  console.log("");
  for (const wave of waveOrder) {
    const entries = byWave[wave];
    if (!entries.length) continue;
    const total = entries.reduce((acc, e) => acc + e.findings.length, 0);
    console.log(`   ${wave}: ${entries.length} files, ${total} findings`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
