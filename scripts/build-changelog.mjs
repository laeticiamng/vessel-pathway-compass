#!/usr/bin/env node
/**
 * Build-time generator: parses CHANGELOG.md (and optional CHANGELOG.fr.md /
 * CHANGELOG.de.md) into src/generated/changelog.json so the public /changelog
 * page can render directly from the markdown source and never drift.
 *
 * Wired into `predev` and `prebuild` (see package.json).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { parseChangelog } from "./parse-changelog.mjs";

const ROOT = process.cwd();
const SOURCES = {
  en: resolve(ROOT, "CHANGELOG.md"),
  fr: resolve(ROOT, "CHANGELOG.fr.md"),
  de: resolve(ROOT, "CHANGELOG.de.md"),
};
const OUT = resolve(ROOT, "src/generated/changelog.json");

const out = {};
for (const [lang, path] of Object.entries(SOURCES)) {
  if (!existsSync(path)) continue;
  out[lang] = parseChangelog(readFileSync(path, "utf8"));
}
if (!out.en) {
  console.error("✗ build-changelog: CHANGELOG.md is required");
  process.exit(1);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify(
    { generatedAt: new Date().toISOString(), locales: out },
    null,
    2,
  ),
);
const total = Object.values(out).reduce((n, r) => n + r.length, 0);
console.log(
  `✓ generated ${OUT.replace(ROOT + "/", "")} (${Object.keys(out).join("/")} · ${total} releases)`,
);
