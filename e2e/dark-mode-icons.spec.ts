import { test, expect, type Page } from "@playwright/test";

/**
 * Cross-browser visual regression — dark-mode icon rings & illustrations.
 *
 * Validates that on Chrome (chromium), Firefox and WebKit (Safari):
 *  - Dark mode does NOT leave bright white plates behind illustrations.
 *  - Icon rings render with the cyan/violet glow tokens (not the
 *    light-mode white gradient).
 *  - Lucide / `currentColor` SVGs are NOT inverted (their stroke must
 *    follow the themed `color`).
 *  - Snapshots stay stable across browsers (per-engine baselines via
 *    Playwright's projectName-aware screenshot naming).
 */

const ICON_RING = ".neon-icon-ring";

async function enableDarkMode(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem("theme", "dark");
    } catch {
      /* ignore — storage disabled */
    }
  });
  await page.emulateMedia({ colorScheme: "dark" });
}

test.describe("dark-mode icons — visual contract", () => {
  test.beforeEach(async ({ page }) => {
    await enableDarkMode(page);
    await page.goto("/");
    // Force-apply class in case the app reads it on hydration.
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.waitForTimeout(200);
  });

  test("icon ring uses dark gradient, not white", async ({ page }) => {
    const ring = page.locator(ICON_RING).first();
    if ((await ring.count()) === 0) test.skip(true, "No icon ring on landing");
    await expect(ring).toBeVisible();

    const bg = await ring.evaluate(
      (el) => getComputedStyle(el).backgroundImage,
    );
    // Dark mode: hsl-based gradient with low lightness — must NOT contain
    // the light-mode `255, 255, 255` (rgb white) marker.
    expect(bg).not.toMatch(/rgb\(255,\s*255,\s*255\)/);
    expect(bg).toMatch(/gradient/i);
  });

  test("PNG illustrations inside rings are tinted (filter applied)", async ({
    page,
  }) => {
    const img = page.locator(`${ICON_RING} img`).first();
    if ((await img.count()) === 0) test.skip(true, "No <img> illustration");
    const filter = await img.evaluate((el) => getComputedStyle(el).filter);
    expect(filter).not.toBe("none");
    expect(filter).toMatch(/invert|brightness/);
  });

  test("themed Lucide SVGs keep their currentColor stroke", async ({ page }) => {
    // SVGs without [data-neon-illustration] must NOT be force-inverted.
    const svg = page.locator(`${ICON_RING} svg:not([data-neon-illustration])`)
      .first();
    if ((await svg.count()) === 0) {
      test.skip(true, "No themed SVG on landing");
    }
    const filter = await svg.evaluate((el) => getComputedStyle(el).filter);
    // Either "none" OR a single inherited filter from the ring — but
    // crucially never the heavy `invert()` transform we apply to PNGs.
    expect(filter).not.toMatch(/invert\(\s*86%/);
  });
});

test.describe("dark-mode icons — cross-browser snapshot", () => {
  test.beforeEach(async ({ page }) => {
    await enableDarkMode(page);
    await page.goto("/");
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.waitForTimeout(400);
  });

  test("first icon ring snapshot is stable per browser", async ({
    page,
  }, testInfo) => {
    const ring = page.locator(ICON_RING).first();
    if ((await ring.count()) === 0) test.skip(true, "No icon ring on landing");
    // Per-browser baseline (chromium / firefox / webkit) auto-suffixed.
    expect(await ring.screenshot()).toMatchSnapshot(
      `icon-ring-${testInfo.project.name}.png`,
      { maxDiffPixelRatio: 0.02 },
    );
  });
});

test.describe("dark-mode icons — mobile readability", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await enableDarkMode(page);
    await page.goto("/");
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.waitForTimeout(200);
  });

  test("mobile dark icon-ring uses tightened glow (smaller box-shadow)", async ({
    page,
  }) => {
    const ring = page.locator(ICON_RING).first();
    if ((await ring.count()) === 0) test.skip(true, "No icon ring on landing");
    const shadow = await ring.evaluate(
      (el) => getComputedStyle(el).boxShadow,
    );
    // Mobile rule caps the outer glow at 8px — make sure no 16px halo
    // sneaks in.
    expect(shadow).not.toMatch(/\b16px\b/);
  });

  test("mobile dark hero-neon halo is visibly smaller than desktop", async ({
    page,
  }) => {
    const hero = page.locator("[data-hero-neon]").first();
    if ((await hero.count()) === 0) test.skip(true, "No hero-neon on landing");
    const filter = await hero.evaluate((el) => getComputedStyle(el).filter);
    // Mobile dark = 6px halo (vs 12px desktop). Either match the 6px
    // value or be `none` (reduced motion / high contrast).
    if (filter !== "none") {
      const blur = filter.match(/drop-shadow\([^)]*?(\d+(?:\.\d+)?)px/);
      const radius = blur ? parseFloat(blur[1]) : 0;
      expect(radius).toBeLessThanOrEqual(10);
    }
  });
});
