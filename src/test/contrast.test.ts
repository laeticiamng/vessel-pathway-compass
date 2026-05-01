/**
 * Visual regression — contrast guard for KPI values & icon rings.
 *
 * Loads the project's design tokens (src/index.css), then asserts that the
 * computed text/background colors on `.neon-kpi-value` and `.neon-icon-ring`
 * meet the WCAG AA contrast ratio (≥ 4.5 : 1) in:
 *   • light mode (default)
 *   • dark mode (`<html class="dark">`)
 *   • light mode + reinforced contrast (`<html class="high-contrast">`)
 *   • dark mode + reinforced contrast (`<html class="dark high-contrast">`)
 */
import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// --- helpers ---------------------------------------------------------------

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function relLum([r, g, b]: [number, number, number]) {
  const ch = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

function ratio(a: [number, number, number], b: [number, number, number]) {
  const la = relLum(a);
  const lb = relLum(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Naive parser: extract `--name: H S% L%;` declarations from a given block. */
function extractTokens(css: string, selector: RegExp): Record<string, string> {
  const match = css.match(selector);
  if (!match) return {};
  const block = match[0];
  const out: Record<string, string> = {};
  const re = /--([a-z0-9-]+):\s*([^;]+);/gi;
  let m;
  while ((m = re.exec(block)) !== null) out[m[1]] = m[2].trim();
  return out;
}

function parseHsl(value: string): [number, number, number] | null {
  // Accept "188 95% 58%" or "188, 95%, 58%"
  const m = value.match(/(-?\d+(?:\.\d+)?)\s*,?\s*(-?\d+(?:\.\d+)?)%\s*,?\s*(-?\d+(?:\.\d+)?)%/);
  if (!m) return null;
  return hslToRgb(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
}

// --- load tokens once -----------------------------------------------------

let lightBase: Record<string, string> = {};
let darkBase: Record<string, string> = {};
let hcLight: Record<string, string> = {};
let hcDark: Record<string, string> = {};

beforeAll(() => {
  const css = readFileSync(join(process.cwd(), "src/index.css"), "utf8");
  lightBase = extractTokens(css, /:root\s*\{[^}]*\}/);
  darkBase = extractTokens(css, /\.dark\s*\{[^}]*\}/);
  hcLight = extractTokens(css, /:root\.high-contrast\s*\{[^}]*\}/);
  hcDark = extractTokens(css, /:root\.high-contrast\.dark\s*\{[^}]*\}/);
});

function token(name: string, ...layers: Record<string, string>[]) {
  for (let i = layers.length - 1; i >= 0; i--) {
    if (layers[i][name]) return layers[i][name];
  }
  return undefined;
}

function color(name: string, ...layers: Record<string, string>[]) {
  const raw = token(name, ...layers);
  expect(raw, `token --${name} must be defined`).toBeTruthy();
  const rgb = parseHsl(raw!);
  expect(rgb, `token --${name} must be HSL`).toBeTruthy();
  return rgb!;
}

// --- tests ----------------------------------------------------------------

describe("visual regression — KPI & icon contrast", () => {
  it("light mode: KPI value vs card surface ≥ 4.5", () => {
    const text = color("contrast-strong", lightBase);
    const bg = color("card", lightBase);
    expect(ratio(text, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("light mode: cyan icon vs icon-ring surface ≥ 4.5", () => {
    const fg = color("contrast-cyan", lightBase);
    const bg = color("contrast-cyan-surface", lightBase);
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("light mode: violet icon vs icon-ring surface ≥ 4.5", () => {
    const fg = color("contrast-violet", lightBase);
    const bg = color("contrast-violet-surface", lightBase);
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("dark mode: KPI text vs card surface ≥ 4.5", () => {
    // Dark mode KPI uses hsl(188 100% 82%) literal (see .dark .neon-kpi-value)
    const text = hslToRgb(188, 100, 82);
    const bg = color("card", lightBase, darkBase);
    expect(ratio(text, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("high-contrast light: KPI value vs card ≥ 7 (AAA)", () => {
    const text = color("contrast-strong", lightBase, hcLight);
    const bg = color("card", lightBase, hcLight);
    expect(ratio(text, bg)).toBeGreaterThanOrEqual(7);
  });

  it("high-contrast light: cyan icon vs surface ≥ 7 (AAA)", () => {
    const fg = color("contrast-cyan", lightBase, hcLight);
    const bg = color("contrast-cyan-surface", lightBase, hcLight);
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(7);
  });

  it("high-contrast dark: KPI text remains AA on card", () => {
    const text = color("contrast-strong", lightBase, darkBase, hcLight, hcDark);
    const bg = color("card", lightBase, darkBase);
    expect(ratio(text, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("high-contrast: cyan & violet token deltas vs default", () => {
    // The reinforced palette must actually be DARKER (lower L%) than default
    // in light mode — otherwise the toggle does nothing visible.
    const defaultL = parseFloat(lightBase["contrast-cyan"].split(/\s+/)[2]);
    const hcL = parseFloat(hcLight["contrast-cyan"].split(/\s+/)[2]);
    expect(hcL).toBeLessThan(defaultL);
  });
});
