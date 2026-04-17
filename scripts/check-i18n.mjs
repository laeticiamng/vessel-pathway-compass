#!/usr/bin/env node
/**
 * i18n consistency check.
 *
 * Scans `src/**` for `t("some.key")` usages and compares against the keys
 * defined in `src/i18n/{fr,en,de}.ts`. Exits with code 1 if any used key is
 * missing from at least one locale.
 *
 * Run with: `node scripts/check-i18n.mjs` (also wired as `prebuild`).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src");
const I18N_DIR = join(SRC, "i18n");
const LOCALES = ["fr", "en", "de"];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, files);
    else if (/\.(tsx?|jsx?)$/.test(entry)) files.push(p);
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
      // Skip clearly non-i18n usages (single segment, no dot — likely not a translation key)
      if (!key.includes(".")) continue;
      if (!used.has(key)) used.set(key, new Set());
      used.get(key).add(relative(ROOT, f));
    }
  }
  return used;
}

function flatten(obj, prefix = "", out = {}) {
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const nk = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, nk, out);
    else out[nk] = v;
  }
  return out;
}

function loadLocale(locale) {
  const file = join(I18N_DIR, `${locale}.ts`);
  const src = readFileSync(file, "utf8");
  const m = src.match(/export const \w+\s*=\s*(\{[\s\S]*?\});?\s*$/);
  if (!m) throw new Error(`Could not parse object literal in ${file}`);
  // Object literal is plain data (no function values) — eval is safe enough here.
  // eslint-disable-next-line no-eval
  const obj = eval(`(${m[1]})`);
  return flatten(obj);
}

function main() {
  const used = extractUsedKeys();
  const locales = Object.fromEntries(LOCALES.map((l) => [l, loadLocale(l)]));

  /** @type {Record<string, {locales: string[], files: string[]}>} */
  const missing = {};
  for (const [key, fileSet] of used.entries()) {
    const missingIn = LOCALES.filter((l) => !(key in locales[l]));
    if (missingIn.length) {
      missing[key] = { locales: missingIn, files: [...fileSet] };
    }
  }

  const total = Object.keys(missing).length;
  if (total === 0) {
    console.log(
      `\u2705 i18n check passed — ${used.size} keys used, all present in ${LOCALES.join(
        "/"
      )}.`
    );
    return;
  }

  console.error(`\u274C i18n check failed — ${total} key(s) missing:\n`);
  for (const [key, info] of Object.entries(missing)) {
    console.error(`  - ${key}`);
    console.error(`      missing in: ${info.locales.join(", ")}`);
    console.error(`      used in:    ${info.files.slice(0, 3).join(", ")}${info.files.length > 3 ? ` (+${info.files.length - 3} more)` : ""}`);
  }
  console.error(
    `\nAdd the missing keys to src/i18n/{${LOCALES.join(",")}}.ts then re-run \`node scripts/check-i18n.mjs\`.`
  );
  process.exit(1);
}

main();
