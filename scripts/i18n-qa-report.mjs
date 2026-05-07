#!/usr/bin/env node
/**
 * i18n QA Report Generator
 *
 * Produces `src/generated/i18nQa.json` consumed by the admin "Translation QA"
 * page. The report contains, for each missing translation key:
 *   - The source files that reference it (so the admin can drill straight to
 *     the affected component on disk)
 *   - The list of in-app routes that actually render those files. We compute
 *     this via a transitive import graph rooted at every <Route> element
 *     declared in `src/App.tsx`. This means a key used in a leaf component
 *     such as `src/components/admin/ProtocolAlertsWidget.tsx` correctly maps
 *     to `/app/admin/protocol-audit` (the screen that mounts it), not just
 *     to a guessed kebab-case slug.
 *   - For convenience, a `fileRoutes` map: file → routes[] so the UI can
 *     render per-file drill-down buttons.
 *
 * Also audits changelog section variants (every section title in
 * `src/generated/changelog.json` must have a translation key in every locale).
 *
 * Run: `node scripts/i18n-qa-report.mjs`
 */
import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, dirname, resolve } from "node:path";
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

function extractUsedKeys(files) {
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

// ---- Import graph ----------------------------------------------------------
// Resolve a TS-ish import specifier from `fromFile` to an absolute file path
// inside src/, or null if external/unresolved.
function resolveImport(fromFile, spec) {
  let base;
  if (spec.startsWith("@/")) base = join(SRC, spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(fromFile), spec);
  else return null;
  const candidates = [
    base + ".tsx", base + ".ts", base + ".jsx", base + ".js",
    join(base, "index.tsx"), join(base, "index.ts"),
    join(base, "index.jsx"), join(base, "index.js"),
  ];
  for (const c of candidates) {
    try { if (statSync(c).isFile()) return c; } catch { /* */ }
  }
  return null;
}

function buildImportGraph(files) {
  // file → Set<file> imported by it
  const graph = new Map();
  const re = /\bfrom\s+["']([^"']+)["']/g;
  for (const f of files) {
    const c = readFileSync(f, "utf8");
    const set = new Set();
    let m;
    while ((m = re.exec(c)) !== null) {
      const r = resolveImport(f, m[1]);
      if (r) set.add(r);
    }
    graph.set(f, set);
  }
  return graph;
}

// Parse <Route path="..." element={<Component />}> from App.tsx and resolve
// the page component's file path. Returns Map<absFile, routes[]>.
function extractRoutesFromApp(graph) {
  const appPath = join(SRC, "App.tsx");
  const src = readFileSync(appPath, "utf8");

  // Build a map of imported components in App.tsx: name → absFile
  const compMap = new Map();
  // Lazy: const Foo = lazy(() => import("./pages/Foo"))
  for (const m of src.matchAll(/const\s+(\w+)\s*=\s*lazy\(\s*\(\)\s*=>\s*import\(\s*["']([^"']+)["']/g)) {
    const r = resolveImport(appPath, m[2]);
    if (r) compMap.set(m[1], r);
  }
  // Static: import Foo from "./pages/Foo"
  for (const m of src.matchAll(/import\s+(\w+)\s+from\s+["']([^"']+)["']/g)) {
    const r = resolveImport(appPath, m[2]);
    if (r) compMap.set(m[1], r);
  }

  // Per-line scan. App.tsx convention: nested Routes live under a parent
  // <Route path="/app">…</Route> block. Track the active prefix.
  const fileToRoutes = new Map();
  const lines = src.split("\n");
  let prefix = "";
  for (const line of lines) {
    if (/<Route\s+path=["']\/app["']/.test(line)) prefix = "/app";
    if (/<\/Route>/.test(line)) prefix = "";

    if (!/<Route\b/.test(line)) continue;
    const pathAttr = line.match(/path=["']([^"']+)["']/);
    const isIndex = /\bindex\b/.test(line);

    let route;
    if (isIndex) route = prefix || "/";
    else if (pathAttr) {
      const p = pathAttr[1];
      route = p.startsWith("/") ? p : (prefix.replace(/\/$/, "") + "/" + p);
    } else continue;

    // Capture every JSX component name that appears AFTER `element=` on this line.
    const elemIdx = line.indexOf("element=");
    if (elemIdx < 0) continue;
    const tail = line.slice(elemIdx);
    for (const m of tail.matchAll(/<\s*(\w+)/g)) {
      const name = m[1];
      const f = compMap.get(name);
      if (!f) continue;
      if (!fileToRoutes.has(f)) fileToRoutes.set(f, new Set());
      fileToRoutes.get(f).add(route);
    }
  }

  return fileToRoutes;
}

// Compute reverse-transitive: for every file in graph, which page-files
// transitively import it. Then map those page-files → routes via fileToRoutes.
function computeReachableRoutes(graph, pageFileToRoutes) {
  // Reverse graph: file → Set<file that imports it>
  const rev = new Map();
  for (const [f, deps] of graph.entries()) {
    for (const d of deps) {
      if (!rev.has(d)) rev.set(d, new Set());
      rev.get(d).add(f);
    }
  }
  const memo = new Map();
  function pages(file, seen = new Set()) {
    if (memo.has(file)) return memo.get(file);
    if (seen.has(file)) return new Set();
    seen.add(file);
    const out = new Set();
    if (pageFileToRoutes.has(file)) {
      for (const r of pageFileToRoutes.get(file)) out.add(r);
    }
    for (const importer of rev.get(file) ?? []) {
      for (const r of pages(importer, seen)) out.add(r);
    }
    memo.set(file, out);
    return out;
  }
  const fileRoutes = new Map(); // relPath → routes[]
  for (const f of graph.keys()) {
    const rs = [...pages(f)].sort();
    if (rs.length) fileRoutes.set(relative(ROOT, f), rs);
  }
  return fileRoutes;
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
  if (!existsSync(path)) return { sections: [], issues: [] };
  const cl = JSON.parse(readFileSync(path, "utf8"));
  const sections = new Map();
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
      issues.push({ slug: entry.slug, key: entry.key, missingLocales: missing, observedTitles: entry.titles });
    }
  }
  return { sections: list, issues };
}

// ---- Main ------------------------------------------------------------------
async function main() {
  const dicts = await loadDicts();
  const flat = Object.fromEntries(LOCALES.map((l) => [l, flatten(dicts[l])]));
  const allFiles = walk(SRC).filter((f) => !f.startsWith(I18N_DIR));
  const used = extractUsedKeys(allFiles);

  const graph = buildImportGraph(allFiles);
  const pageFileToRoutes = extractRoutesFromApp(graph);
  const fileRoutesMap = computeReachableRoutes(graph, pageFileToRoutes);
  const fileRoutes = Object.fromEntries([...fileRoutesMap.entries()]);

  const perLocale = Object.fromEntries(LOCALES.map((l) => [l, []]));

  for (const [key, fileSet] of used.entries()) {
    for (const loc of LOCALES) {
      if (!(key in flat[loc]) || flat[loc][key] === "" || flat[loc][key] == null) {
        const files = [...fileSet];
        const routes = new Set();
        const perFile = {};
        for (const f of files) {
          const rs = fileRoutesMap.get(f) ?? [];
          perFile[f] = rs;
          for (const r of rs) routes.add(r);
        }
        const enFallback = flat.en[key];
        perLocale[loc].push({
          key,
          files,
          routes: [...routes].sort(),
          fileRoutes: perFile,
          enFallback: typeof enFallback === "string" ? enFallback : null,
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
      pagesIndexed: pageFileToRoutes.size,
    },
    missingByLocale: perLocale,
    fileRoutes,
    changelog,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));
  console.log(
    `i18n QA report → ${relative(ROOT, OUT_PATH)} | missing en=${report.totals.missing.en} fr=${report.totals.missing.fr} de=${report.totals.missing.de} | pages=${report.totals.pagesIndexed} | changelog issues=${report.totals.changelogSectionIssues}`
  );
}

main().catch((err) => { console.error(err); process.exit(1); });
