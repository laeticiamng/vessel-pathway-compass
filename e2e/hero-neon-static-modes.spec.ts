import { test, expect, type Page } from "@playwright/test";

/**
 * Static-rendering visual contract for hero-neon + neon icon rings
 * under accessibility preferences:
 *
 *   • `prefers-reduced-motion: reduce` → no shimmer, no halo
 *     pulsation, settled view is perfectly static (filter: none on
 *     hero; tightened/none on rings).
 *   • `prefers-contrast: more` (high-contrast / forced-colors-ish) →
 *     halo stripped, color fallback takes over, no excessive bloom.
 *
 * Captures per-browser baselines so future regressions (a halo
 * sneaking back into one of these modes) are caught immediately.
 */

const HERO = "[data-hero-neon]";

async function gotoStatic(page: Page, opts: { dark?: boolean; hc?: boolean }) {
  await page.addInitScript(() => {
    try { localStorage.setItem("theme", "dark"); } catch { /* ignore */ }
  });
  await page.goto("/");
  if (opts.dark) {
    await page.evaluate(() => document.documentElement.classList.add("dark"));
  }
  if (opts.hc) {
    await page.evaluate(() =>
      document.documentElement.classList.add("high-contrast")
    );
  }
  await page.waitForTimeout(300);
}

test.describe("hero-neon — reduced-motion static render", () => {
  test.use({ reducedMotion: "reduce" });

  test("hero-neon halo is removed (filter:none) in dark+reduced-motion", async ({
    page,
  }) => {
    await gotoStatic(page, { dark: true });
    const hero = page.locator(HERO).first();
    await expect(hero).toBeVisible();
    const filter = await hero.evaluate((el) => getComputedStyle(el).filter);
    expect(filter).toBe("none");
  });

  test("icon ring shadow is stripped under reduced-motion", async ({ page }) => {
    await gotoStatic(page, { dark: true });
    const ring = page.locator(".neon-icon-ring").first();
    if ((await ring.count()) === 0) test.skip(true, "No icon ring on landing");
    const shadow = await ring.evaluate(
      (el) => getComputedStyle(el).boxShadow,
    );
    // Existing rule sets `box-shadow: none !important;` for these classes
    // when `prefers-reduced-motion: reduce` matches.
    expect(shadow).toBe("none");
  });

  test("snapshot: hero-neon dark + reduced-motion is stable per browser", async ({
    page,
  }, testInfo) => {
    await gotoStatic(page, { dark: true });
    const hero = page.locator(HERO).first();
    if ((await hero.count()) === 0) test.skip(true, "No hero-neon on landing");
    expect(await hero.screenshot()).toMatchSnapshot(
      `hero-neon-reduced-motion-${testInfo.project.name}.png`,
      { maxDiffPixelRatio: 0.03 },
    );
  });
});

test.describe("hero-neon — high-contrast static render", () => {
  test("hero-neon halo is stripped under .high-contrast", async ({ page }) => {
    await gotoStatic(page, { dark: true, hc: true });
    const hero = page.locator(HERO).first();
    await expect(hero).toBeVisible();
    const filter = await hero.evaluate((el) => getComputedStyle(el).filter);
    expect(filter).toBe("none");
    const stroke = await hero.evaluate(
      (el) => getComputedStyle(el).webkitTextStrokeWidth,
    );
    // Token color path forces stroke-width 0 in high-contrast.
    expect(["0px", "0"]).toContain(stroke);
  });

  test("icon ring uses solid contrast color in high-contrast", async ({
    page,
  }) => {
    await gotoStatic(page, { dark: true, hc: true });
    const ring = page.locator(".neon-icon-ring").first();
    if ((await ring.count()) === 0) test.skip(true, "No icon ring on landing");
    const shadow = await ring.evaluate(
      (el) => getComputedStyle(el).boxShadow,
    );
    // High-contrast keeps a single tight focus shadow at most — never
    // the dark-mode 14-16px outer glow.
    const radii = [...shadow.matchAll(/(\d+(?:\.\d+)?)px/g)]
      .map((m) => parseFloat(m[1]));
    for (const r of radii) {
      expect(r).toBeLessThanOrEqual(8);
    }
  });

  test("snapshot: hero-neon dark + high-contrast is stable per browser", async ({
    page,
  }, testInfo) => {
    await gotoStatic(page, { dark: true, hc: true });
    const hero = page.locator(HERO).first();
    if ((await hero.count()) === 0) test.skip(true, "No hero-neon on landing");
    expect(await hero.screenshot()).toMatchSnapshot(
      `hero-neon-high-contrast-${testInfo.project.name}.png`,
      { maxDiffPixelRatio: 0.03 },
    );
  });
});
