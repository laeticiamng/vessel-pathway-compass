import { test, expect, type Page } from "@playwright/test";

/**
 * Visual regression + DOM overlap/duplication suite.
 *
 * Two complementary mechanisms:
 *
 *  1. `toHaveScreenshot()` snapshots of the public pages at desktop + mobile
 *     breakpoints in EN/FR/DE. Pixel diffs above the threshold fail the build
 *     and surface as artifacts in the GitHub Actions summary.
 *
 *  2. A DOM heuristic that scans the sticky landing header for:
 *       - duplicated visible labels (same trimmed text appearing twice in the
 *         same row), and
 *       - bounding-box overlaps between sibling links/buttons (>2px overlap on
 *         both axes), which is what produced the "Protocole & Validation"
 *         double-CTA regression.
 *
 *  Run locally:
 *    npm run dev
 *    npx playwright test e2e/visual-regression.spec.ts
 *    npx playwright test e2e/visual-regression.spec.ts --update-snapshots
 */

const ROUTES = ["/", "/protocol", "/changelog"] as const;
const LANGS = ["en", "fr", "de"] as const;
const BREAKPOINTS = [
  { name: "desktop", width: 1366, height: 768 },
  { name: "mobile", width: 390, height: 844 },
] as const;

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
  // Disable animations for deterministic snapshots
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
      html { scroll-behavior: auto !important; }
    `,
  });
  await page.waitForTimeout(250);
}

for (const bp of BREAKPOINTS) {
  for (const lang of LANGS) {
    for (const route of ROUTES) {
      test(`screenshot ${route} · ${lang} · ${bp.name}`, async ({ page }) => {
        await page.setViewportSize({ width: bp.width, height: bp.height });
        await gotoStable(page, route, lang);
        await expect(page).toHaveScreenshot(
          `${route.replace(/\//g, "_") || "_root"}-${lang}-${bp.name}.png`,
          { fullPage: true, maxDiffPixelRatio: 0.02 },
        );
      });
    }
  }
}

/**
 * DOM heuristic: detect duplicated header CTAs and bounding-box overlaps in
 * the sticky landing navigation. This is the layer that catches semantic
 * regressions that pixel diffs may smooth over (e.g. two CTAs with identical
 * label sitting side by side).
 */
for (const bp of BREAKPOINTS) {
  for (const lang of LANGS) {
    test(`landing header — no duplicated label · ${lang} · ${bp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await gotoStable(page, "/", lang);

      const result = await page.evaluate(() => {
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

        // 1. Duplicated visible labels
        const seen = new Map<string, number>();
        for (const el of interactive) {
          const label = (el.innerText || "").trim().replace(/\s+/g, " ");
          if (label.length < 2) continue;
          seen.set(label, (seen.get(label) ?? 0) + 1);
        }
        const duplicates = [...seen.entries()]
          .filter(([, n]) => n > 1)
          .map(([label, n]) => ({ label, count: n }));

        // 2. Bounding-box overlaps (pairs)
        const overlaps: Array<{ a: string; b: string; dx: number; dy: number }> =
          [];
        for (let i = 0; i < interactive.length; i++) {
          for (let j = i + 1; j < interactive.length; j++) {
            const a = interactive[i];
            const b = interactive[j];
            // Skip nested pairs (parent/child)
            if (a.contains(b) || b.contains(a)) continue;
            const ra = a.getBoundingClientRect();
            const rb = b.getBoundingClientRect();
            const dx = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
            const dy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
            if (dx > 2 && dy > 2) {
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
      });

      expect(
        result.duplicates,
        `Duplicated header labels detected: ${JSON.stringify(result.duplicates)}`,
      ).toEqual([]);
      expect(
        result.overlaps,
        `Header element overlaps detected: ${JSON.stringify(result.overlaps)}`,
      ).toEqual([]);
    });
  }
}
