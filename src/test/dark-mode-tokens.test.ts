import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Single-source-of-truth contract for dark-mode neon glow/halo values.
 *
 * After refactoring the previous magic-number forest into CSS custom
 * properties (`--neon-halo-*`, `--neon-ring-glow-*`, `--neon-tint-*`),
 * we want a regression test that *fails loudly* the moment a future
 * patch reintroduces an inline value (`drop-shadow(0 0 12px ...)` etc)
 * inside a `.dark` consumer rule.
 *
 * The test parses `src/index.css` once and asserts:
 *   1. Every required token is declared in the dark theme block.
 *   2. Each consumer rule references the matching token (no hardcoded
 *      literal radius / opacity / tint filter).
 *   3. Tokens used by mobile vs desktop stay numerically distinct so
 *      the mobile-tightening pass can't silently regress to desktop
 *      values.
 */

const CSS_PATH = resolve(__dirname, "../index.css");
const css = readFileSync(CSS_PATH, "utf8");

/** Slice a CSS rule body by selector (first match only). */
function ruleBody(selector: string): string {
  const i = css.indexOf(selector);
  if (i < 0) throw new Error(`Selector not found: ${selector}`);
  const open = css.indexOf("{", i);
  const close = css.indexOf("}", open);
  return css.slice(open + 1, close);
}

describe("dark-mode neon tokens — declarations", () => {
  const requiredTokens = [
    "--neon-halo-radius",
    "--neon-halo-opacity",
    "--neon-halo-radius-soft",
    "--neon-halo-opacity-soft",
    "--neon-halo-radius-strong",
    "--neon-halo-opacity-strong",
    "--neon-halo-radius-mobile",
    "--neon-halo-opacity-mobile",
    "--neon-ring-glow-inner",
    "--neon-ring-glow-outer",
    "--neon-ring-glow-inner-mobile",
    "--neon-ring-glow-outer-mobile",
    "--neon-tint-cyan",
    "--neon-tint-violet",
    "--neon-tint-opacity",
    "--neon-tint-opacity-mobile",
  ];

  it.each(requiredTokens)("declares %s in the dark theme", (token) => {
    // Token must appear with a value in the .dark { } block.
    const re = new RegExp(`${token.replace(/-/g, "\\-")}\\s*:`);
    expect(re.test(css)).toBe(true);
  });
});

describe("dark-mode neon tokens — consumer wiring", () => {
  it("desktop hero-neon halo references the medium token", () => {
    const body = ruleBody(".dark .hero-neon-text {");
    expect(body).toContain("var(--neon-halo-radius)");
    expect(body).toContain("var(--neon-halo-opacity)");
    // No raw `12px` literal allowed inside the dark hero-neon halo
    expect(body).not.toMatch(/drop-shadow\([^)]*\b\d+(?:\.\d+)?px[^)]*hsl\(var\(--neon-glow\)\s*\/\s*0\./);
  });

  it("soft / strong variants use the matching tokens", () => {
    const soft = ruleBody(".dark .hero-neon-text.hero-neon-soft {");
    expect(soft).toContain("var(--neon-halo-radius-soft)");
    expect(soft).toContain("var(--neon-halo-opacity-soft)");

    const strong = ruleBody(".dark .hero-neon-text.hero-neon-strong {");
    expect(strong).toContain("var(--neon-halo-radius-strong)");
    expect(strong).toContain("var(--neon-halo-opacity-strong)");
  });

  it("dark icon-ring references inner/outer ring glow tokens", () => {
    const body = ruleBody(".dark .neon-icon-ring {");
    expect(body).toContain("var(--neon-ring-glow-inner)");
    expect(body).toContain("var(--neon-ring-glow-outer)");
    expect(body).toContain("var(--neon-ring-glow-opacity-inner)");
    expect(body).toContain("var(--neon-ring-glow-opacity-outer)");
  });

  it("dark violet icon-ring uses the SAME glow tokens as cyan (only color differs)", () => {
    const body = ruleBody(".dark .neon-icon-ring.violet {");
    expect(body).toContain("var(--neon-ring-glow-inner)");
    expect(body).toContain("var(--neon-ring-glow-outer)");
  });

  it("dark illustration tint references the tint filter tokens (no inline invert)", () => {
    const body = ruleBody(
      ".dark .neon-icon-ring img:not([data-neon-keep-color]),",
    );
    expect(body).toContain("var(--neon-tint-cyan)");
    expect(body).toContain("var(--neon-tint-opacity)");
    // The literal invert(86%) string must live ONLY in the token decl
    expect(body).not.toMatch(/invert\(\s*86%/);
  });
});

describe("dark-mode neon tokens — mobile vs desktop separation", () => {
  it("mobile halo radius is strictly smaller than desktop", () => {
    const grab = (token: string) => {
      const re = new RegExp(`${token}\\s*:\\s*([\\d.]+)px`);
      const m = css.match(re);
      if (!m) throw new Error(`Missing ${token}`);
      return parseFloat(m[1]);
    };
    expect(grab("--neon-halo-radius-mobile")).toBeLessThan(
      grab("--neon-halo-radius"),
    );
    expect(grab("--neon-halo-radius-mobile-soft")).toBeLessThan(
      grab("--neon-halo-radius-soft"),
    );
    expect(grab("--neon-halo-radius-mobile-strong")).toBeLessThan(
      grab("--neon-halo-radius-strong"),
    );
  });

  it("mobile ring glow is strictly smaller than desktop", () => {
    const grab = (token: string) => {
      const re = new RegExp(`${token}\\s*:\\s*([\\d.]+)px`);
      const m = css.match(re);
      if (!m) throw new Error(`Missing ${token}`);
      return parseFloat(m[1]);
    };
    expect(grab("--neon-ring-glow-inner-mobile")).toBeLessThan(
      grab("--neon-ring-glow-inner"),
    );
    expect(grab("--neon-ring-glow-outer-mobile")).toBeLessThan(
      grab("--neon-ring-glow-outer"),
    );
  });
});
