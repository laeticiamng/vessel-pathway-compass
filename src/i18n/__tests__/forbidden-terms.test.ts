/**
 * Forbidden-terms guard.
 *
 * After the v8.3 neutralisation pass, the user-facing surface MUST NOT mention
 * the institutional names "CHUV" or "UNIL" — those have been replaced with
 * neutral wording ("Lausanne", "academic partner", "scientific reviewer", …).
 *
 * The French word "unilatéral" is also forbidden in i18n strings because it
 * embeds "UNIL" and reads like the institution. Statistical contexts must use
 * "à une queue" / "à une seule queue" instead.
 *
 * Scope: i18n bundles + HTML / Markdown templates shipped in /public.
 * If a new mention is introduced, this test fails with the offending file +
 * line so it cannot land silently.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, extname } from "node:path";

const ROOT = resolve(__dirname, "../../..");

const I18N_DIR = resolve(__dirname, "..");
const TEMPLATE_DIRS = [resolve(ROOT, "public")];
const TEMPLATE_EXTENSIONS = new Set([".html", ".htm", ".md", ".txt", ".svg"]);

// Word-boundary, case-insensitive. "Unilatéral" handled separately to keep
// the message specific.
const FORBIDDEN = [
  { name: "CHUV", pattern: /\bCHUV\b/i },
  { name: "UNIL", pattern: /\bUNIL\b/i },
  { name: "unilatéral", pattern: /unilat[ée]ral/i },
];

function listFiles(dir: string, accept: (path: string) => boolean): string[] {
  let entries: string[];
  try { entries = readdirSync(dir); } catch { return []; }
  const out: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      // Skip the test directory itself so this file's literals aren't scanned.
      if (entry === "__tests__") continue;
      out.push(...listFiles(full, accept));
    } else if (accept(full)) {
      out.push(full);
    }
  }
  return out;
}

function scan(files: string[]) {
  const hits: string[] = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      for (const { name, pattern } of FORBIDDEN) {
        if (pattern.test(lines[i])) {
          hits.push(`${file}:${i + 1} contains forbidden term "${name}" → ${lines[i].trim().slice(0, 160)}`);
        }
      }
    }
  }
  return hits;
}

describe("forbidden terms guard", () => {
  it("i18n bundles must not contain CHUV / UNIL / unilatéral", () => {
    const files = listFiles(I18N_DIR, (p) => /\.(ts|tsx|json)$/.test(p));
    const hits = scan(files);
    expect(hits, hits.join("\n")).toEqual([]);
  });

  it("public templates must not contain CHUV / UNIL / unilatéral", () => {
    const files = TEMPLATE_DIRS.flatMap((dir) =>
      listFiles(dir, (p) => TEMPLATE_EXTENSIONS.has(extname(p))),
    );
    const hits = scan(files);
    expect(hits, hits.join("\n")).toEqual([]);
  });
});
