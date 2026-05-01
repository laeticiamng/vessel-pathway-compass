/**
 * Visual regression — hero-neon headline rendering rules.
 *
 * Parses src/index.css and asserts the contract for `.hero-neon-text`:
 *   1. GPU cost is bounded — at most 1 drop-shadow per state, in light
 *      AND dark mode (multiple stacked drop-shadows kill scroll FPS).
 *   2. A `@supports not (-webkit-text-stroke)` fallback exists and forces
 *      a solid color + no filter.
 *   3. Reinforced-contrast mode (`html.high-contrast`) renders the
 *      headline as a flat, AA-readable token — no halo, no broken outline,
 *      both in light and dark mode.
 *   4. The dark-mode rule explicitly cancels `-webkit-text-stroke`
 *      (prevents double-outline artefact reported by users).
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

let css = "";

beforeAll(() => {
  css = readFileSync(join(process.cwd(), "src/index.css"), "utf8");
});

/** Extract a CSS rule body for a given selector (first match, naive). */
function ruleBody(selector: string): string {
  // Escape regex metas in the selector
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${esc}\\s*\\{([^}]*)\\}`, "m");
  const m = css.match(re);
  return m ? m[1] : "";
}

function countDropShadows(body: string): number {
  // Count drop-shadow(...) occurrences inside the `filter:` declaration only
  const filterMatch = body.match(/filter\s*:\s*([^;]+);/);
  if (!filterMatch) return 0;
  const value = filterMatch[1];
  if (value.trim() === "none") return 0;
  return (value.match(/drop-shadow\(/g) ?? []).length;
}

describe("hero-neon visual regression", () => {
  it("light mode: at most 1 drop-shadow in the base filter", () => {
    expect(countDropShadows(ruleBody(".hero-neon-text"))).toBeLessThanOrEqual(1);
  });

  it("light mode soft variant: at most 1 drop-shadow", () => {
    expect(countDropShadows(ruleBody(".hero-neon-text.hero-neon-soft")))
      .toBeLessThanOrEqual(1);
  });

  it("light mode strong variant: at most 1 drop-shadow", () => {
    expect(countDropShadows(ruleBody(".hero-neon-text.hero-neon-strong")))
      .toBeLessThanOrEqual(1);
  });

  it("dark mode: at most 1 drop-shadow per variant", () => {
    expect(countDropShadows(ruleBody(".dark .hero-neon-text"))).toBeLessThanOrEqual(1);
    expect(countDropShadows(ruleBody(".dark .hero-neon-text.hero-neon-soft")))
      .toBeLessThanOrEqual(1);
    expect(countDropShadows(ruleBody(".dark .hero-neon-text.hero-neon-strong")))
      .toBeLessThanOrEqual(1);
  });

  it("dark mode cancels -webkit-text-stroke (no double outline)", () => {
    const body = ruleBody(".dark .hero-neon-text");
    expect(body).toMatch(/-webkit-text-stroke\s*:\s*0\b/);
  });

  it("declares a fallback for browsers without -webkit-text-stroke", () => {
    expect(css).toMatch(/@supports\s+not\s*\(-webkit-text-stroke[^)]*\)\s*\{[\s\S]*hero-neon-text[\s\S]*\}/);
    // Fallback must remove the gradient masking and any filter
    const fb = css.match(/@supports\s+not\s*\(-webkit-text-stroke[^)]*\)\s*\{([\s\S]*?)\n\s*\}\s*\n/);
    expect(fb, "fallback @supports block must exist").toBeTruthy();
    expect(fb![1]).toMatch(/-webkit-text-fill-color\s*:\s*currentColor/);
    expect(fb![1]).toMatch(/filter\s*:\s*none/);
  });

  it("high-contrast mode: hero-neon renders flat, no halo, no stroke", () => {
    const hc = ruleBody(
      ".high-contrast .hero-neon-text,\n  .high-contrast.dark .hero-neon-text,\n  .high-contrast .dark .hero-neon-text",
    );
    // Selector list may be re-formatted — fall back to a substring search
    const block = hc || (() => {
      const m = css.match(
        /\.high-contrast\s+\.hero-neon-text[^{]*\{([^}]*)\}/,
      );
      return m ? m[1] : "";
    })();
    expect(block).toMatch(/filter\s*:\s*none/);
    expect(block).toMatch(/-webkit-text-stroke\s*:\s*0/);
    expect(block).toMatch(/text-shadow\s*:\s*none/);
    // Must force a solid token color (not transparent)
    expect(block).toMatch(/color\s*:\s*hsl\(var\(--contrast-strong\)\)/);
  });

  it("uses GPU layer hints (will-change / transform) to keep scroll smooth", () => {
    const base = ruleBody(".hero-neon-text");
    expect(base).toMatch(/will-change\s*:\s*filter/);
    expect(base).toMatch(/transform\s*:\s*translateZ\(0\)/);
  });
});
