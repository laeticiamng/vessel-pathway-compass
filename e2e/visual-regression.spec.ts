import { test, expect, type Page } from "@playwright/test";

/**
 * Pin rendering environment for snapshot determinism:
 *  - locale `en-US` so Intl.* (dates/numbers) never shifts layout
 *  - timezone `UTC` so any rendered timestamp is stable across CI/local
 *  - deviceScaleFactor 1 so screenshots aren't 2x on Retina dev machines
 *  - reduced-motion to freeze CSS animations declared via media queries
 *  - color scheme `light` to avoid OS-driven dark-mode flips
 */
test.use({
  locale: "en-US",
  timezoneId: "UTC",
  deviceScaleFactor: 1,
  colorScheme: "light",
  reducedMotion: "reduce",
});

/**
 * Visual regression + DOM overlap/duplication suite.
 *
 * Two complementary mechanisms:
 *
 *  1. `toHaveScreenshot()` snapshots of the public pages at desktop, tablet,
 *     mobile and small-mobile breakpoints in EN/FR/DE. Per-route pixel diff
 *     thresholds keep noise low on content-heavy pages while staying strict
 *     on the landing hero.
 *
 *  2. A DOM heuristic that scans the sticky landing header for:
 *       - duplicated visible labels in the same row, and
 *       - bounding-box overlaps between sibling links/buttons (configurable
 *         per-route tolerance), which is what produced the
 *         "Protocole & Validation" double-CTA regression.
 *
 *  Determinism hardening:
 *    - Force a single web-safe font stack via injected CSS so snapshots no
 *      longer depend on the browser's font-loading order.
 *    - Wait for `document.fonts.ready` AND network idle before capture.
 *    - Disable animations, transitions, caret blink and smooth scroll.
 *
 *  Run locally:
 *    npm run dev
 *    npx playwright test e2e/visual-regression.spec.ts
 *    npx playwright test e2e/visual-regression.spec.ts --update-snapshots
 */

type Route = "/" | "/protocol" | "/changelog";

const ROUTES: readonly Route[] = ["/", "/protocol", "/changelog"] as const;
const LANGS = ["en", "fr", "de"] as const;

const BREAKPOINTS = [
  { name: "desktop", width: 1366, height: 768 },
  { name: "tablet", width: 834, height: 1112 },
  { name: "mobile", width: 390, height: 844 },
  { name: "mobile-sm", width: 320, height: 568 },
] as const;

/**
 * Per-route tolerances. Content-heavy routes (protocol, changelog) tolerate
 * slightly more pixel noise from re-flowable text and benefit from a looser
 * DOM overlap threshold for inline badges. The landing route stays strict.
 */
const ROUTE_TOLERANCE: Record<
  Route,
  { maxDiffPixelRatio: number; overlapPx: number }
> = {
  "/":          { maxDiffPixelRatio: 0.01, overlapPx: 2 },
  "/protocol":  { maxDiffPixelRatio: 0.03, overlapPx: 4 },
  "/changelog": { maxDiffPixelRatio: 0.04, overlapPx: 4 },
};

async function setLanguage(page: Page, lang: string) {
  await page.evaluate((l) => {
    try {
      localStorage.setItem("aquamr-language", l);
      localStorage.setItem("language", l);
    } catch {}
  }, lang);
}

async function gotoStable(page: Page, path: string, lang: string) {
  await setLanguage(page, lang);
  await page.goto(path, { waitUntil: "networkidle" });

  // Force a deterministic font stack + freeze rendering so snapshots don't
  // shift when a webfont swaps in mid-capture. Also pin browser zoom to 1.
  await page.addStyleTag({
    content: `
      :root { zoom: 1 !important; }
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
        font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
        font-feature-settings: "liga" 0, "kern" 0 !important;
        font-variant-ligatures: none !important;
        text-rendering: geometricPrecision !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
      }
      html { scroll-behavior: auto !important; }
    `,
  });

  // Explicit readiness gates before capture — avoid snapshotting mid
  // DOM-reconfiguration (i18n hydration, header mount, CTA render).
  await page.waitForSelector("header", { state: "visible", timeout: 10_000 });
  await page.waitForFunction(
    () => {
      // i18n is considered ready when at least one translated label is
      // rendered in the header (no raw "key.path" leaking through).
      const h = document.querySelector("header");
      if (!h) return false;
      const txt = (h.textContent || "").trim();
      if (txt.length === 0) return false;
      // Reject pseudo-keys like "home.nav.protocol"
      return !/\b\w+\.[\w.]+\b/.test(txt) || txt.length > 20;
    },
    { timeout: 10_000 },
  );
  // Wait until at least one CTA (link or button) is rendered & laid out.
  await page.waitForFunction(() => {
    const el = document.querySelector("header a, header button");
    if (!el) return false;
    const r = (el as HTMLElement).getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }, { timeout: 10_000 });

  // Wait for any pending fonts to load (or fail) so we don't capture a
  // FOUT mid-swap.
  await page.evaluate(async () => {
    if ((document as any).fonts?.ready) {
      try { await (document as any).fonts.ready; } catch {}
    }
  });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(250);
}

for (const bp of BREAKPOINTS) {
  for (const lang of LANGS) {
    for (const route of ROUTES) {
      test(`screenshot ${route} · ${lang} · ${bp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: bp.width, height: bp.height });
        await gotoStable(page, route, lang);
        const tol = ROUTE_TOLERANCE[route];
        await expect(page).toHaveScreenshot(
          `${route.replace(/\//g, "_") || "_root"}-${lang}-${bp.name}.png`,
          { fullPage: true, maxDiffPixelRatio: tol.maxDiffPixelRatio },
        );
      });
    }
  }
}

/**
 * DOM heuristic: detect duplicated header CTAs and bounding-box overlaps in
 * the sticky landing navigation. Per-route tolerance is applied to the
 * overlap threshold to reduce false positives from inline badges.
 */
for (const bp of BREAKPOINTS) {
  for (const lang of LANGS) {
    for (const route of ROUTES) {
      test(`header — no duplicate/overlap · ${route} · ${lang} · ${bp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: bp.width, height: bp.height });
        await gotoStable(page, route, lang);
        const overlapPx = ROUTE_TOLERANCE[route].overlapPx;

        const result = await page.evaluate((tol) => {
          const header = document.querySelector("header");
          if (!header) return { duplicates: [], overlaps: [] };

          const interactive = Array.from(
            header.querySelectorAll<HTMLElement>("a, button"),
          ).filter((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return false;
            const cs = getComputedStyle(el);
            if (cs.visibility === "hidden" || cs.display === "none") return false;
            return true;
          });

          const seen = new Map<string, number>();
          for (const el of interactive) {
            const label = (el.innerText || "").trim().replace(/\s+/g, " ");
            if (label.length < 2) continue;
            seen.set(label, (seen.get(label) ?? 0) + 1);
          }
          const duplicates = [...seen.entries()]
            .filter(([, n]) => n > 1)
            .map(([label, n]) => ({ label, count: n }));

          const overlaps: Array<{ a: string; b: string; dx: number; dy: number }> = [];
          for (let i = 0; i < interactive.length; i++) {
            for (let j = i + 1; j < interactive.length; j++) {
              const a = interactive[i];
              const b = interactive[j];
              if (a.contains(b) || b.contains(a)) continue;
              const ra = a.getBoundingClientRect();
              const rb = b.getBoundingClientRect();
              const dx = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
              const dy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
              if (dx > tol && dy > tol) {
                overlaps.push({
                  a: (a.innerText || a.getAttribute("aria-label") || "").trim().slice(0, 40),
                  b: (b.innerText || b.getAttribute("aria-label") || "").trim().slice(0, 40),
                  dx: Math.round(dx),
                  dy: Math.round(dy),
                });
              }
            }
          }
          return { duplicates, overlaps };
        }, overlapPx);

        expect(
          result.duplicates,
          `Duplicated header labels on ${route}: ${JSON.stringify(result.duplicates)}`,
        ).toEqual([]);
        expect(
          result.overlaps,
          `Header overlaps on ${route} (>${overlapPx}px): ${JSON.stringify(result.overlaps)}`,
        ).toEqual([]);
      });
    }
  }
}
