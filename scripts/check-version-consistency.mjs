#!/usr/bin/env node
/**
 * CI check: ensure CHANGELOG.md, README.md and src/lib/appVersion.ts
 * agree on the current version and date.
 *
 * Also verifies that the most recent CHANGELOG entry follows the
 * structured release-notes template (see RELEASE_TEMPLATE.md).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd());
const errors = [];
const ok = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => {
  errors.push(msg);
  console.log(`  ✗ ${msg}`);
};

console.log("→ Checking version consistency\n");

// 1. Read appVersion.ts (source of truth)
const appVersionSrc = readFileSync(resolve(ROOT, "src/lib/appVersion.ts"), "utf8");
const vMatch = appVersionSrc.match(/APP_VERSION\s*=\s*"([^"]+)"/);
const dMatch = appVersionSrc.match(/APP_VERSION_DATE\s*=\s*"([^"]+)"/);
if (!vMatch || !dMatch) {
  fail("src/lib/appVersion.ts missing APP_VERSION / APP_VERSION_DATE");
  process.exit(1);
}
const version = vMatch[1];
const date = dMatch[1];
ok(`appVersion.ts → v${version} (${date})`);

// 2. CHANGELOG.md — first H2 must match version + date
const changelog = readFileSync(resolve(ROOT, "CHANGELOG.md"), "utf8");
const headerRe = /^## v(\d+\.\d+\.\d+) — (.+?) \((\d{4}-\d{2}-\d{2})\)\s*$/m;
const cMatch = changelog.match(headerRe);
if (!cMatch) {
  fail("CHANGELOG.md: first version header missing or malformed");
} else {
  if (cMatch[1] !== version) fail(`CHANGELOG version (${cMatch[1]}) ≠ APP_VERSION (${version})`);
  else ok(`CHANGELOG version matches → v${cMatch[1]}`);
  if (cMatch[3] !== date) fail(`CHANGELOG date (${cMatch[3]}) ≠ APP_VERSION_DATE (${date})`);
  else ok(`CHANGELOG date matches → ${cMatch[3]}`);

  // Required structured sections in latest entry
  const startIdx = changelog.indexOf(cMatch[0]);
  const next = changelog.slice(startIdx + cMatch[0].length);
  const endIdx = next.search(/^## v\d+\.\d+\.\d+/m);
  const block = endIdx === -1 ? next : next.slice(0, endIdx);

  const required = ["Added", "Security"];
  const recommended = ["Methodology framing", "Guardrails", "Changed"];
  for (const sect of required) {
    if (!new RegExp(`^### ${sect}\\b`, "m").test(block)) {
      fail(`CHANGELOG latest entry missing required section: ### ${sect}`);
    } else ok(`CHANGELOG has required section: ${sect}`);
  }
  for (const sect of recommended) {
    if (!new RegExp(`^### ${sect}\\b`, "m").test(block)) {
      console.log(`  ⚠ recommended section missing: ### ${sect}`);
    }
  }
}

// 3. README.md — must contain version stamp line
const readme = readFileSync(resolve(ROOT, "README.md"), "utf8");
const stampRe = /<!-- VERSION-STAMP -->[\s\S]*?Version\s+`?v?([\d.]+)`?[\s\S]*?(\d{4}-\d{2}-\d{2})[\s\S]*?<!-- \/VERSION-STAMP -->/;
const sMatch = readme.match(stampRe);
if (!sMatch) {
  fail("README.md missing <!-- VERSION-STAMP --> ... <!-- /VERSION-STAMP --> block");
} else {
  if (sMatch[1] !== version) fail(`README version (${sMatch[1]}) ≠ APP_VERSION (${version})`);
  else ok(`README version stamp matches → v${sMatch[1]}`);
  if (sMatch[2] !== date) fail(`README date (${sMatch[2]}) ≠ APP_VERSION_DATE (${date})`);
  else ok(`README date stamp matches → ${sMatch[2]}`);
}

console.log();
if (errors.length) {
  console.error(`✗ Version consistency check failed (${errors.length} error${errors.length > 1 ? "s" : ""})`);
  process.exit(1);
}
console.log("✓ Version consistency check passed");
