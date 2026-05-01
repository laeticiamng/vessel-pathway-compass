#!/usr/bin/env node
/**
 * CI guard for i18n contracts.
 *
 * Lightweight wrapper that runs the i18n structural test suite and the
 * legacy `verify-i18n-structures` check, then exits non-zero on any failure.
 * Wire as a CI step (or as `prebuild`) to block merges that break the
 * structured i18n contracts (FAQ items, Limits sections, Legal sections,
 * MedReg block, etc.).
 *
 * Why a wrapper? The dictionaries are TypeScript files that import lazily;
 * vitest already has the right TS pipeline, so we delegate instead of
 * duplicating a tsx loader.
 */
import { spawn } from "node:child_process";

function run(cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: "inherit", shell: false });
    child.on("close", (code) => resolve(code ?? 1));
    child.on("error", () => resolve(1));
  });
}

console.log("→ Running i18n structural test suite (vitest)…\n");
const vitestCode = await run("npx", [
  "--yes",
  "vitest",
  "run",
  "src/i18n/__tests__/structures.test.ts",
  "--reporter=default",
]);

if (vitestCode !== 0) {
  console.error("\n❌ i18n vitest suite failed. Fix the dictionaries before merging.");
  process.exit(vitestCode);
}

console.log("\n✅ i18n CI check passed.");
