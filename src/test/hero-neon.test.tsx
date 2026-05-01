/**
 * Visual regression — hero-neon headline + cross-browser / a11y.
 *
 * 1. GPU cost is bounded — ≤1 drop-shadow per state (light/dark/strong/soft).
 * 2. `@supports not (-webkit-text-stroke)` fallback forces solid color + no filter.
 * 3. `html.high-contrast` renders the headline flat, no halo, both modes.
 * 4. Dark-mode rule cancels `-webkit-text-stroke` (no double outline).
 * 5. Browser-specific:
 *      • Chrome/Safari: text-stroke supported → relief active.
 *      • Firefox: `@-moz-document` rule restores edge crispness via text-shadow.
 *      • Browsers without text-stroke at all: solid fallback path.
 * 6. Lazy-load: `[data-hero-neon-active="false"]` drops `filter` & GPU hints.
 * 7. Skeleton shimmer hidden under reduced-motion.
 * 8. Focus ring visible in light/dark/high-contrast (and dark+high-contrast).
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { NeonGradientText } from "@/components/ui/neon-gradient-text";

let css = "";

beforeAll(() => {
  css = readFileSync(join(process.cwd(), "src/index.css"), "utf8");
});

function ruleBody(selector: string): string {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${esc}\\s*\\{([^}]*)\\}`, "m");
  const m = css.match(re);
  return m ? m[1] : "";
}

function countDropShadows(body: string): number {
  const filterMatch = body.match(/filter\s*:\s*([^;]+);/);
  if (!filterMatch) return 0;
  const value = filterMatch[1];
  if (value.trim().startsWith("none")) return 0;
  return (value.match(/drop-shadow\(/g) ?? []).length;
}

describe("hero-neon — GPU & contract", () => {
  it("light: ≤1 drop-shadow per variant", () => {
    expect(countDropShadows(ruleBody(".hero-neon-text"))).toBeLessThanOrEqual(1);
    expect(countDropShadows(ruleBody(".hero-neon-text.hero-neon-soft"))).toBeLessThanOrEqual(1);
    expect(countDropShadows(ruleBody(".hero-neon-text.hero-neon-strong"))).toBeLessThanOrEqual(1);
  });

  it("dark: ≤1 drop-shadow per variant", () => {
    expect(countDropShadows(ruleBody(".dark .hero-neon-text"))).toBeLessThanOrEqual(1);
    expect(countDropShadows(ruleBody(".dark .hero-neon-text.hero-neon-soft"))).toBeLessThanOrEqual(1);
    expect(countDropShadows(ruleBody(".dark .hero-neon-text.hero-neon-strong"))).toBeLessThanOrEqual(1);
  });

  it("dark cancels -webkit-text-stroke (no double outline)", () => {
    expect(ruleBody(".dark .hero-neon-text")).toMatch(/-webkit-text-stroke\s*:\s*0\b/);
  });

  it("uses GPU layer hints to keep scroll smooth", () => {
    const base = ruleBody(".hero-neon-text");
    expect(base).toMatch(/will-change\s*:\s*filter/);
    expect(base).toMatch(/transform\s*:\s*translateZ\(0\)/);
  });
});

describe("hero-neon — cross-browser rendering", () => {
  it("Chrome / Safari path: -webkit-text-stroke is the active relief", () => {
    const body = ruleBody(".hero-neon-text");
    expect(body).toMatch(/-webkit-text-stroke\s*:\s*0\.4px/);
    expect(body).toMatch(/paint-order\s*:\s*stroke fill/);
  });

  it("Firefox path: @-moz-document supplies a text-shadow fallback", () => {
    expect(css).toMatch(/@-moz-document\s+url-prefix\(\s*\)\s*\{[\s\S]*hero-neon-text[\s\S]*text-shadow/);
    const moz = css.match(/@-moz-document[\s\S]*?\n\s*\}\s*\n\s*\}/);
    expect(moz, "@-moz-document block must exist").toBeTruthy();
    expect(moz![0]).toMatch(/high-contrast[\s\S]*text-shadow\s*:\s*none/);
  });

  it("legacy browsers WITHOUT text-stroke: @supports fallback flattens the headline", () => {
    expect(css).toMatch(/@supports\s+not\s*\(-webkit-text-stroke[^)]*\)/);
    // Walk the @supports block by tracking braces (handles nested rules).
    const start = css.search(/@supports\s+not\s*\(-webkit-text-stroke[^)]*\)\s*\{/);
    expect(start).toBeGreaterThan(-1);
    const openIdx = css.indexOf("{", start);
    let depth = 1;
    let i = openIdx + 1;
    for (; i < css.length && depth > 0; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}") depth--;
    }
    const body = css.slice(openIdx + 1, i - 1);
    expect(body).toMatch(/-webkit-text-fill-color\s*:\s*currentColor/);
    expect(body).toMatch(/filter\s*:\s*none/);
    expect(body).toMatch(/color\s*:\s*hsl\(var\(--text-strong\)\)/);
    expect(body).toMatch(/color\s*:\s*hsl\(var\(--accent-cyan\)\)/);
  });

  it("high-contrast (light + dark): flat, no halo, no stroke", () => {
    const block = (() => {
      const m = css.match(/\.high-contrast\s+\.hero-neon-text[\s\S]*?\{([^}]*)\}/);
      return m ? m[1] : "";
    })();
    expect(block).toMatch(/filter\s*:\s*none/);
    expect(block).toMatch(/-webkit-text-stroke\s*:\s*0/);
    expect(block).toMatch(/text-shadow\s*:\s*none/);
    expect(block).toMatch(/color\s*:\s*hsl\(var\(--contrast-strong\)\)/);
  });
});

describe("hero-neon — lazy-load + scroll pause + reduced motion", () => {
  it("lazy: data-hero-neon-active='false' strips filter & GPU hints", () => {
    const block = (() => {
      const m = css.match(
        /\[data-hero-neon\]\[data-hero-neon-active="false"\]\s*\{([^}]*)\}/,
      );
      return m ? m[1] : "";
    })();
    expect(block).toMatch(/filter\s*:\s*none/);
    expect(block).toMatch(/will-change\s*:\s*auto/);
    expect(block).toMatch(/transform\s*:\s*none/);
  });

  it("scroll pause: data-hero-neon-scrolling='true' suspends filter", () => {
    const block = (() => {
      const m = css.match(
        /\[data-hero-neon\]\[data-hero-neon-scrolling="true"\]\s*\{([^}]*)\}/,
      );
      return m ? m[1] : "";
    })();
    expect(block).toMatch(/filter\s*:\s*none/);
    expect(block).toMatch(/transition\s*:\s*none/);
  });

  it("reduced-motion media query disables skeleton shimmer", () => {
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*hero-neon-skeleton[\s\S]*animation\s*:\s*none/,
    );
  });

  it("skeleton has its own shimmer keyframes", () => {
    expect(css).toMatch(/@keyframes\s+hero-neon-shimmer/);
  });
});

describe("hero-neon — keyboard focus & a11y", () => {
  it("focus ring rules exist for light, dark and high-contrast", () => {
    expect(ruleBody(".hero-neon-focusable:focus-visible")).toMatch(/outline\s*:\s*2px solid/);
    expect(ruleBody(".dark .hero-neon-focusable:focus-visible")).toMatch(/outline-color/);
    expect(ruleBody(".high-contrast .hero-neon-focusable:focus-visible"))
      .toMatch(/outline\s*:\s*3px solid/);
  });

  it("component renders with focusable + ariaLabel correctly", () => {
    render(
      <NeonGradientText focusable ariaLabel="Hero headline" lazy={false}>
        Vascular control
      </NeonGradientText>,
    );
    const el = screen.getByLabelText("Hero headline");
    expect(el.tagName).toBe("SPAN");
    expect(el.getAttribute("tabindex")).toBe("0");
    expect(el.className).toMatch(/hero-neon-focusable/);
  });

  it("non-focusable headline is not in the tab order", () => {
    render(<NeonGradientText lazy={false}>Title</NeonGradientText>);
    const el = screen.getByText("Title");
    expect(el.getAttribute("tabindex")).toBeNull();
  });

  it("lazy=false skips the skeleton on first paint", () => {
    render(<NeonGradientText lazy={false}>Title</NeonGradientText>);
    const el = screen.getByText("Title");
    expect(el.getAttribute("data-hero-neon-active")).toBe("true");
    expect(el.className).not.toMatch(/hero-neon-skeleton/);
  });
});
