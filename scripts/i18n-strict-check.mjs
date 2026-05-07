#!/usr/bin/env node
/**
 * Strict CI gate for i18n.
 *
 * Fails the build if:
 *   - Any used translation key (`t("…")`) is missing in any locale (FR/EN/DE).
 *   - Any changelog section title (in `src/generated/changelog.json`) maps to a
 *     `pages.changelog.sections.<slug>` key that isn't defined in every locale.
 *
 * Wired into `prebuild` via package.json so misconfigured locales never reach
 * production.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const REPORT = join(ROOT, "src", "generated", "i18nQa.json");

const gen = spawnSync("node", [join(__dirname, "i18n-qa-report.mjs")], {
  stdio: "inherit",
});
if (gen.status !== 0) process.exit(gen.status ?? 1);

const report = JSON.parse(readFileSync(REPORT, "utf8"));
let failed = false;

for (const loc of ["en", "fr", "de"]) {
  const list = report.missingByLocale[loc] ?? [];
  if (list.length) {
    failed = true;
    console.error(`\n❌ [${loc}] ${list.length} missing translation key(s):`);
    for (const entry of list.slice(0, 25)) {
      console.error(`  - ${entry.key}  (used in ${entry.files.slice(0, 2).join(", ")}${entry.files.length > 2 ? ` +${entry.files.length - 2}` : ""})`);
    }
    if (list.length > 25) console.error(`  … and ${list.length - 25} more`);
  }
}

if (report.changelog.issues.length) {
  failed = true;
  console.error(`\n❌ Changelog section variants missing in some locales:`);
  for (const issue of report.changelog.issues) {
    console.error(
      `  - ${issue.key}  missing in: ${issue.missingLocales.join(", ")}  (observed titles: ${JSON.stringify(issue.observedTitles)})`
    );
  }
}

if (failed) {
  console.error(
    `\nFix the issues above (add the missing keys to src/i18n/{en,fr,de}.ts) then re-run \`npm run i18n:strict\`.`
  );
  process.exit(1);
}

console.log(`\n✅ i18n strict check passed — all keys present in en/fr/de and all changelog section variants resolved.`);
