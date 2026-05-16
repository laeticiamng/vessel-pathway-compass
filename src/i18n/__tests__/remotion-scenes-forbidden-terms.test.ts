/**
 * Forbidden-terms guard for Remotion presentation video scenes.
 *
 * Ensures that the rendered MP4 (built from Scene1Title → Scene6Closing) can
 * never re-introduce the institutional names "CHUV" / "UNIL" or the French
 * word "unilatéral" — neither in literal JSX text, in string props, nor in
 * any module-level constant used by the scenes.
 *
 * The test scans the raw .tsx source AND extracts every string literal /
 * template literal, so a term hidden inside a `const TEXT = "..."` block
 * still fails the test.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const SCENES_DIR = resolve(__dirname, "../../../remotion-video/src/scenes");

const FORBIDDEN = [
  { name: "CHUV", pattern: /\bCHUV\b/i },
  { name: "UNIL", pattern: /\bUNIL\b/i },
  { name: "unilatéral", pattern: /unilat[ée]ral/i },
];

const EXPECTED_SCENES = [
  "Scene1Title.tsx",
  "Scene2Problem.tsx",
  "Scene3FourZero.tsx",
  "Scene4Platform.tsx",
  "Scene5Trajectory.tsx",
  "Scene6Closing.tsx",
];

function listSceneFiles(): string[] {
  return readdirSync(SCENES_DIR)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => join(SCENES_DIR, f));
}

function extractStringLiterals(source: string): string[] {
  // Matches "...", '...', and `...` (including multi-line template literals).
  const literals: string[] = [];
  const re = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/gs;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) literals.push(m[0]);
  return literals;
}

describe("Remotion scenes forbidden-terms guard", () => {
  it("all six expected scene files are present", () => {
    const present = readdirSync(SCENES_DIR).filter((f) => f.endsWith(".tsx")).sort();
    expect(present).toEqual([...EXPECTED_SCENES].sort());
  });

  it("scene source files must not contain CHUV / UNIL / unilatéral", () => {
    const hits: string[] = [];
    for (const file of listSceneFiles()) {
      const text = readFileSync(file, "utf8");
      const lines = text.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        for (const { name, pattern } of FORBIDDEN) {
          if (pattern.test(lines[i])) {
            hits.push(`${file}:${i + 1} contains "${name}" → ${lines[i].trim().slice(0, 160)}`);
          }
        }
      }
    }
    expect(hits, hits.join("\n")).toEqual([]);
  });

  it("rendered text (string literals only) must not contain CHUV / UNIL / unilatéral", () => {
    // Defence-in-depth: even if a forbidden term were obfuscated by being
    // stored inside a constant and rendered via {VAR}, it would still appear
    // in a string literal here and be caught.
    const hits: string[] = [];
    for (const file of listSceneFiles()) {
      const source = readFileSync(file, "utf8");
      const literals = extractStringLiterals(source);
      for (const lit of literals) {
        for (const { name, pattern } of FORBIDDEN) {
          if (pattern.test(lit)) {
            hits.push(`${file} literal contains "${name}" → ${lit.slice(0, 160)}`);
          }
        }
      }
    }
    expect(hits, hits.join("\n")).toEqual([]);
  });
});
