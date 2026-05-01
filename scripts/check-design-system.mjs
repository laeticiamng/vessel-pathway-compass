#!/usr/bin/env node
/**
 * Design-system gatekeeper.
 *
 * Fails the build (exit 1) when components contain:
 *   • Hardcoded color classes (text-white, bg-black, text-gray-500, …)
 *   • Inline hex/rgb()/hsl() literals in JSX className/style
 *   • Low-opacity text utilities (text-foreground/40, text-muted-foreground/50, …)
 *   • Aggressive neon-glow utilities outside of dedicated /neon files
 *
 * Whitelisted paths:
 *   • src/index.css, tailwind.config.ts (where tokens are defined)
 *   • src/components/neon/* (controlled neon components)
 *   • src/integrations/supabase/* (auto-generated)
 *   • test files (__tests__ folders, *.test.tsx)
 *
 * Usage:
 *   node scripts/check-design-system.mjs [--fix-suggest]
 */

import { readFileSync, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const WHITELIST = [
  /[\\/]src[\\/]index\.css$/,
  /tailwind\.config\.(ts|js)$/,
  /[\\/]src[\\/]components[\\/]neon[\\/]/,
  /[\\/]src[\\/]integrations[\\/]supabase[\\/]/,
  /[\\/]__tests__[\\/]/,
  /\.test\.(ts|tsx)$/,
];

const HARDCODED_COLORS = [
  // Tailwind palette colors that bypass the design system
  /\b(text|bg|border|ring|fill|stroke|from|to|via)-(white|black|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)\b/,
  // Pure white/black utilities
  /\b(text|bg|border)-white\b/,
  /\b(text|bg|border)-black\b/,
];

const HEX_OR_RGB = /(?:#[0-9a-fA-F]{3,8}\b|\brgb\(|\brgba\(|\bhsl\(|\bhsla\()/;

const LOW_OPACITY_TEXT =
  /\btext-(foreground|muted-foreground|primary|secondary|destructive|accent)\/(?:[0-5]?\d)\b/;

const NEON_OUTSIDE = /\bneon-(kpi|card|icon-ring|bg)\b/;

const RULES = [
  {
    id: "no-hardcoded-color",
    label: "Hardcoded Tailwind color (use semantic token)",
    test: (line) => HARDCODED_COLORS.some((r) => r.test(line)),
  },
  {
    id: "no-inline-color-literal",
    label: "Inline hex / rgb() / hsl() literal in TSX (use design token)",
    test: (line) => {
      // Only flag in style/className attribute area, not in CSS-in-JS comments
      if (!/(className|style)\s*=/.test(line) && !/(color|background|border)\s*:/.test(line)) {
        return false;
      }
      return HEX_OR_RGB.test(line);
    },
  },
  {
    id: "no-low-opacity-text",
    label: "Low-opacity text utility ≤ 59 % (breaks WCAG AA)",
    test: (line) => LOW_OPACITY_TEXT.test(line),
  },
  {
    id: "no-neon-outside-neon-folder",
    label: "Neon utility used outside src/components/neon (centralize the effect)",
    test: (line) => NEON_OUTSIDE.test(line),
  },
];

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(tsx?|css)$/.test(e.name)) yield p;
  }
}

function isWhitelisted(path) {
  return WHITELIST.some((r) => r.test(path));
}

const errors = [];

for await (const file of walk(SRC)) {
  if (isWhitelisted(file)) continue;
  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");
  lines.forEach((line, i) => {
    // Skip pure comments
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) return;

    for (const rule of RULES) {
      if (rule.test(line)) {
        errors.push({
          file: relative(ROOT, file),
          line: i + 1,
          rule: rule.id,
          label: rule.label,
          excerpt: trimmed.slice(0, 140),
        });
      }
    }
  });
}

if (errors.length === 0) {
  console.log("✓ design-system check passed (0 violations)");
  process.exit(0);
}

// Group by rule for readability
const byRule = errors.reduce((acc, e) => {
  (acc[e.rule] ??= []).push(e);
  return acc;
}, {});

// Strict mode = fail the build. Otherwise: report-only (warnings).
// Strict is enabled with --strict, DESIGN_SYSTEM_STRICT=1, or CI=true.
const strict =
  process.argv.includes("--strict") ||
  process.env.DESIGN_SYSTEM_STRICT === "1" ||
  process.env.CI === "true";

const head = strict ? "✗ design-system check failed" : "⚠ design-system warnings";
console.error(`\n${head} — ${errors.length} violation(s)\n`);
for (const [rule, items] of Object.entries(byRule)) {
  console.error(`  ▸ ${rule} — ${items[0].label}  (${items.length})`);
  for (const it of items.slice(0, 8)) {
    console.error(`      ${it.file}:${it.line}  ${it.excerpt}`);
  }
  if (items.length > 8) console.error(`      … +${items.length - 8} more`);
  console.error("");
}
console.error("Tip: replace hardcoded colors with semantic tokens (text-foreground, bg-card, …)");
console.error("     low-opacity text → use text-foreground/70 minimum, or text-muted-foreground.");

// Always emit a JSON report for CI dashboards.
try {
  const fs = await import("node:fs");
  fs.mkdirSync("dist", { recursive: true });
  fs.writeFileSync("dist/design-system-report.json", JSON.stringify({
    total: errors.length,
    byRule: Object.fromEntries(Object.entries(byRule).map(([k,v]) => [k, v.length])),
    items: errors,
    generatedAt: new Date().toISOString(),
    strict,
  }, null, 2));
} catch {}

process.exit(strict ? 1 : 0);
