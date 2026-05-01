#!/usr/bin/env node
/**
 * Schema.org / JSON-LD validation gate.
 *
 * Runs at build time (or in CI) to detect malformed structured data,
 * required-field omissions and duplicates across:
 *   1. Static <script type="application/ld+json"> blocks in index.html
 *   2. Per-page jsonLd props passed to <SEOHead> across src/**
 *
 * Validation philosophy: no network calls. We mirror the contract of
 * Google's Rich Results Test for the schema types we actually ship
 * (Organization, WebSite, SoftwareApplication, WebPage, FAQPage,
 * BreadcrumbList, Product, ItemList).
 *
 * Usage:
 *   node scripts/validate-jsonld.mjs            # warn-only
 *   node scripts/validate-jsonld.mjs --strict   # exit 1 on error
 *   CI=true node scripts/validate-jsonld.mjs    # strict in CI
 *
 * Exit codes: 0 = OK or warn-only; 1 = strict errors.
 * Always writes dist/jsonld-report.json for downstream tooling.
 */

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const STRICT =
  process.argv.includes("--strict") ||
  process.env.JSONLD_STRICT === "1" ||
  process.env.CI === "true";

// -------------------------------------------------------------- 1) Helpers
const REQUIRED_FIELDS = {
  Organization:        ["@context", "@type", "name", "url"],
  WebSite:             ["@context", "@type", "name", "url"],
  SoftwareApplication: ["@context", "@type", "name", "applicationCategory"],
  WebPage:             ["@type", "name"],
  FAQPage:             ["@type", "mainEntity"],
  BreadcrumbList:      ["@type", "itemListElement"],
  Product:             ["@type", "name"],
  ItemList:            ["@type", "itemListElement"],
  MedicalGuideline:    ["@type", "name"],
  Dataset:             ["@type", "name"],
  ContactPage:         ["@type"],
  PrivacyPolicy:       ["@type"],
  CollectionPage:      ["@type"],
};

const errors = [];
const warnings = [];
const seen = new Map(); // (type+name+url) → [locations]

function record(level, file, msg, extra = {}) {
  (level === "error" ? errors : warnings).push({ file, message: msg, ...extra });
}

function dedupeKey(node) {
  const t = node["@type"];
  const id = node["@id"] || node.url || "";
  const name = node.name || "";
  return `${Array.isArray(t) ? t.join("+") : t}::${name}::${id}`;
}

function validateNode(node, file, path = "") {
  if (!node || typeof node !== "object") return;
  const t = node["@type"];
  if (!t) {
    record("error", file, `Missing @type at ${path || "root"}`);
    return;
  }
  const types = Array.isArray(t) ? t : [t];
  for (const type of types) {
    const required = REQUIRED_FIELDS[type];
    if (!required) {
      // Unknown type — keep as warning, not error (Schema.org has many types).
      record("warning", file, `Unknown @type "${type}" at ${path || "root"} (no validation rules)`);
      continue;
    }
    for (const field of required) {
      if (node[field] === undefined || node[field] === null || node[field] === "") {
        record("error", file, `${type} missing required field "${field}" at ${path || "root"}`);
      }
    }
  }
  // Per-type structural checks
  if (types.includes("FAQPage")) {
    const me = node.mainEntity;
    if (!Array.isArray(me) || me.length === 0) {
      record("error", file, "FAQPage.mainEntity must be a non-empty array of Question");
    } else {
      me.forEach((q, i) => {
        if (q["@type"] !== "Question")
          record("error", file, `FAQPage.mainEntity[${i}] must be @type Question`);
        const a = q.acceptedAnswer;
        if (!a || a["@type"] !== "Answer" || !a.text)
          record("error", file, `FAQPage.mainEntity[${i}].acceptedAnswer must be Answer with text`);
      });
    }
  }
  if (types.includes("BreadcrumbList")) {
    const items = node.itemListElement;
    if (!Array.isArray(items) || items.length === 0) {
      record("error", file, "BreadcrumbList.itemListElement must be a non-empty array");
    }
  }
  // Track for duplicate detection
  const key = dedupeKey(node);
  const arr = seen.get(key) || [];
  arr.push(file);
  seen.set(key, arr);
}

function walkGraph(jsonld, file) {
  if (!jsonld) return;
  // Allow array of nodes
  if (Array.isArray(jsonld)) {
    jsonld.forEach((n) => walkGraph(n, file));
    return;
  }
  if (jsonld["@graph"] && Array.isArray(jsonld["@graph"])) {
    jsonld["@graph"].forEach((n, i) => validateNode(n, file, `@graph[${i}]`));
    return;
  }
  validateNode(jsonld, file);
}

// -------------------------------------------- 2) Extract from index.html
function checkIndexHtml() {
  const file = "index.html";
  let html;
  try { html = readFileSync(join(ROOT, file), "utf8"); }
  catch { record("error", file, "index.html not found"); return; }
  const re = /<script\s+type=["']application\/ld\+json["']\s*>([\s\S]*?)<\/script>/g;
  let m, count = 0;
  while ((m = re.exec(html))) {
    count++;
    try {
      const parsed = JSON.parse(m[1].trim());
      walkGraph(parsed, `${file}#block${count}`);
    } catch (e) {
      record("error", `${file}#block${count}`, `Invalid JSON: ${e.message}`);
    }
  }
  if (count === 0) record("warning", file, "No <script type=\"application/ld+json\"> blocks found in index.html");
}

// -------------------------------------------- 3) Extract from <SEOHead jsonLd={...}/>
async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(tsx?|jsx?)$/.test(e.name)) yield p;
  }
}

function extractJsonLdLiterals(source) {
  // Find every `jsonLd={...}` JSX prop and try to balance braces.
  const out = [];
  const re = /jsonLd\s*=\s*\{/g;
  let m;
  while ((m = re.exec(source))) {
    let depth = 1, i = m.index + m[0].length;
    while (i < source.length && depth > 0) {
      const c = source[i];
      if (c === "{") depth++;
      else if (c === "}") depth--;
      i++;
    }
    if (depth === 0) out.push({ start: m.index, body: source.slice(m.index + m[0].length, i - 1) });
  }
  return out;
}

function tryEvalJsonLdLiteral(body) {
  // The literal can be: a JS object literal, an identifier reference (variable),
  // or an expression. We only attempt to JSON.parse object-literals that happen
  // to be valid JSON. Otherwise we record it as "dynamic" (skipped from schema
  // validation but still counted for coverage).
  const trimmed = body.trim().replace(/,\s*$/, "");
  // Quick filter: must start with `{`
  if (!trimmed.startsWith("{")) return { dynamic: true, snippet: trimmed.slice(0, 60) };
  // Replace simple JS object syntax with JSON: unquoted keys & single quotes.
  // This is heuristic, but works for our generated JSON-LD literals.
  const jsonish = trimmed
    .replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')   // key: → "key":
    .replace(/'([^']*)'/g, '"$1"')                            // 'x' → "x"
    .replace(/,(\s*[}\]])/g, "$1");                           // trailing commas
  try { return { dynamic: false, value: JSON.parse(jsonish) }; }
  catch { return { dynamic: true, snippet: trimmed.slice(0, 60) }; }
}

const pageCoverage = []; // { file, types[] }

async function checkSourceTree() {
  const SRC = join(ROOT, "src");
  for await (const file of walk(SRC)) {
    let src;
    try { src = readFileSync(file, "utf8"); } catch { continue; }
    if (!src.includes("jsonLd=")) continue;
    const literals = extractJsonLdLiterals(src);
    for (const lit of literals) {
      const rel = relative(ROOT, file);
      const r = tryEvalJsonLdLiteral(lit.body);
      if (r.dynamic) {
        record("warning", rel, `Dynamic jsonLd expression — not statically validated (${r.snippet}…)`);
        pageCoverage.push({ file: rel, types: ["<dynamic>"] });
        continue;
      }
      walkGraph(r.value, rel);
      const types = [];
      const collect = (n) => {
        if (!n) return;
        if (Array.isArray(n)) return n.forEach(collect);
        if (n["@graph"]) return n["@graph"].forEach(collect);
        if (n["@type"]) types.push(...(Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]]));
      };
      collect(r.value);
      pageCoverage.push({ file: rel, types });
    }
  }
}

// -------------------------------------------- 4) Run + report
checkIndexHtml();
await checkSourceTree();

// Duplicate detection — same node appearing in 2+ places.
const duplicates = [];
for (const [key, files] of seen.entries()) {
  if (files.length > 1) {
    duplicates.push({ key, occurrences: files });
  }
}

// Print
const ico = (lvl) => (lvl === "error" ? "✗" : "⚠");
console.log(`\n— Schema.org validation —\n`);
console.log(`Pages with JSON-LD : ${pageCoverage.length}`);
console.log(`Duplicate nodes    : ${duplicates.length}`);
console.log(`Warnings           : ${warnings.length}`);
console.log(`Errors             : ${errors.length}\n`);

const allIssues = [
  ...errors.map((e) => ({ ...e, level: "error" })),
  ...warnings.map((w) => ({ ...w, level: "warning" })),
];
for (const it of allIssues) {
  console.log(`  ${ico(it.level)} [${it.level}] ${it.file} — ${it.message}`);
}

if (duplicates.length) {
  console.log("\n  Duplicate nodes (same @type+name+url found in multiple places):");
  for (const d of duplicates) {
    console.log(`   • ${d.key}`);
    for (const f of d.occurrences) console.log(`       ${f}`);
  }
}

// Per-page coverage table (compact)
console.log("\n  Per-page coverage:");
for (const p of pageCoverage.slice(0, 40)) {
  console.log(`   • ${p.file}  →  ${p.types.join(", ")}`);
}
if (pageCoverage.length > 40) console.log(`   … +${pageCoverage.length - 40} more`);

// JSON report for CI / dashboards
mkdirSync("dist", { recursive: true });
writeFileSync("dist/jsonld-report.json", JSON.stringify({
  generatedAt: new Date().toISOString(),
  strict: STRICT,
  summary: {
    pages: pageCoverage.length,
    errors: errors.length,
    warnings: warnings.length,
    duplicates: duplicates.length,
  },
  errors, warnings, duplicates, pageCoverage,
}, null, 2));

const head = STRICT ? "✗ Schema.org validation failed" : "⚠ Schema.org validation report";
const fail = STRICT && (errors.length > 0 || duplicates.length > 0);
console.log(`\n${fail ? head : "✓ Schema.org validation OK"} — report: dist/jsonld-report.json\n`);
process.exit(fail ? 1 : 0);
