#!/usr/bin/env node
/**
 * i18n QA Report Generator
 *
 * Produces `src/generated/i18nQa.json` consumed by the admin "Translation QA"
 * page. The report contains:
 *   - Per-locale missing keys (used in code via t("…") but absent in dictionary)
 *   - For each missing key, the source files that reference it (so the admin
 *     can drill straight to the affected screen)
 *   - Changelog section variant audit: ensures every section title in
 *     `src/generated/changelog.json` has a translation key in every locale.
 *   - Aggregate counts.
 *
 * Run: `node scripts/i18n-qa-report.mjs`
 */
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");
const I18N_DIR = join(SRC, "i18n");
const OUT_DIR = join(SRC, "generated");
const OUT_PATH = join(OUT_DIR, "i18nQa.json");
const LOCALES = ["en", "fr", "de"];

// ---- Dict loading ----------------------------------------------------------
async function loadDicts() {
  const out = {};
  for (const loc of LOCALES) {
    const mod = await import(pathToFileURL(join(I18N_DIR, `${loc}.ts`)).href);
    out[loc] = mod[loc];
  }
  return out;
}

function flatten(obj, prefix = "", out = {}) {
  if (obj == null || typeof obj !== "object" || Array.isArray(obj)) {
    out[prefix] = obj;
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, p, out);
    else out[p] = v;
  }
  return out;
}

// ---- File scan -------------------------------------------------------------
function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (entry === "node_modules" || entry === "__tests__" || entry === "generated") continue;
      walk(p, files);
    } else if (/\.(tsx?|jsx?)$/.test(entry)) files.push(p);
  }
  return files;
}

function extractUsedKeys() {
  const files = walk(SRC).filter((f) => !f.startsWith(I18N_DIR));
  const used = new Map(); // key -> Set<file>
  const re = /\bt\(\s*["']([a-zA-Z0-9_.]+)["']/g;
  for (const f of files) {
    const c = readFileSync(f, "utf8");
    let m;
    while ((m = re.exec(c)) !== null) {
      const key = m[1];
      if (!key.includes(".")) continue;
      if (!used.has(key)) used.set(key, new Set());
      used.get(key).add(relative(ROOT, f));
    }
  }
  return used;
}

// Map a source file → an in-app route to drill into (best-effort).
function fileToRoute(file) {
  // src/pages/Foo.tsx → /foo (lowercased)
  let m = file.match(/^src\/pages\/([^/]+)\.tsx$/);
  if (m) {
    const name = m[1];
    if (name === "Index" || name === "Landing") return "/";
    return `/${name.toLowerCase()}`;
  }
  // src/pages/app/Foo.tsx → /app/foo
  m = file.match(/^src\/pages\/app\/([^/]+)\.tsx$/);
  if (m) {
    const name = m[1];
    // Best-effort camelCase → kebab
    const slug = name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
    return `/app/${slug}`;
  }
  return null;
}

// ---- Changelog audit -------------------------------------------------------
function slugify(title) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function auditChangelogSections(dicts) {
  const path = join(SRC, "generated", "changelog.json");
  if (!existsSync(path)) {
    return { sections: [], issues: [] };
  }
  const cl = JSON.parse(readFileSync(path, "utf8"));
  const sections = new Map(); // slug -> { titles: {en?,fr?,de?}, missing: locales[] }
  for (const loc of LOCALES) {
    for (const rel of cl.locales?.[loc] ?? []) {
      for (const s of rel.sections ?? []) {
        const slug = slugify(s.title);
        if (!sections.has(slug)) sections.set(slug, { slug, titles: {}, key: `pages.changelog.sections.${slug}` });
        sections.get(slug).titles[loc] = s.title;
      }
    }
  }
  const flat = Object.fromEntries(LOCALES.map((l) => [l, flatten(dicts[l])]));
  const issues = [];
  const list = [];
  for (const entry of sections.values()) {
    const missing = LOCALES.filter((l) => !(entry.key in flat[l]));
    list.push({ ...entry, missing });
    if (missing.length) {
      issues.push({
        slug: entry.slug,
        key: entry.key,
        missingLocales: missing,
        observedTitles: entry.titles,
      });
    }
  }
  return { sections: list, issues };
}

// ---- Main ------------------------------------------------------------------
async function main() {
  const dicts = await loadDicts();
  const flat = Object.fromEntries(LOCALES.map((l) => [l, flatten(dicts[l])]));
  const used = extractUsedKeys();

  const perLocale = Object.fromEntries(LOCALES.map((l) => [l, []]));

  for (const [key, fileSet] of used.entries()) {
    for (const loc of LOCALES) {
      if (!(key in flat[loc]) || flat[loc][key] === "" || flat[loc][key] == null) {
        const files = [...fileSet];
        perLocale[loc].push({
          key,
          files,
          routes: [...new Set(files.map(fileToRoute).filter(Boolean))],
        });
      }
    }
  }

  for (const loc of LOCALES) perLocale[loc].sort((a, b) => a.key.localeCompare(b.key));

  const changelog = auditChangelogSections(dicts);

  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      usedKeys: used.size,
      missing: Object.fromEntries(LOCALES.map((l) => [l, perLocale[l].length])),
      changelogSectionIssues: changelog.issues.length,
    },
    missingByLocale: perLocale,
    changelog,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));
  console.log(
    `i18n QA report → ${relative(ROOT, OUT_PATH)} | missing en=${report.totals.missing.en} fr=${report.totals.missing.fr} de=${report.totals.missing.de} | changelog issues=${report.totals.changelogSectionIssues}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
