import { test, expect, type Page } from "@playwright/test";

/**
 * Visual + DOM regression for header / top-banner clipping.
 *
 * Goal: every page that renders a sticky/fixed header followed by one or
 * more "RESEARCH PROTOCOL" style banners must keep the FIRST banner fully
 * visible below the header, on every supported viewport.
 *
 * Two complementary assertions per case:
 *  1. Geometric — first banner's top edge must be >= header's bottom edge
 *     (no overlap, no clipping by the fixed/sticky header).
 *  2. Pixel — screenshot of the top ~260px region is diffed against a
 *     committed baseline, so any future regression of padding / spacer /
 *     z-index is caught automatically.
 */

const VIEWPORTS = [
  { name: "iphone-se", width: 375, height: 667 },
  { name: "android-pixel", width: 360, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1366, height: 768 },
] as const;

const SCENARIOS = [
  {
    name: "landing",
    path: "/",
    headerSelector: 'nav[data-sculptural-header]',
    bannerSelector: 'aside[aria-label*="rotocol"], aside[aria-label*="rotokoll"], aside[role="note"]',
  },
  {
    name: "research-dashboard",
    path: "/app/research/dashboard",
    headerSelector: 'header[data-sculptural-header]',
    bannerSelector: 'div[role="alert"]',
  },
] as const;

async function dismissCookieBanner(page: Page) {
  // The cookie banner can overlap the bottom but we still need it gone for
  // deterministic top-region screenshots. Click "Accept" if present.
  const accept = page.getByRole("button", { name: /accept|accepter|akzept/i }).first();
  if (await accept.isVisible().catch(() => false)) {
    await accept.click().catch(() => {});
  }
}

for (const scenario of SCENARIOS) {
  test.describe(`Top banner not clipped — ${scenario.name}`, () => {
    for (const vp of VIEWPORTS) {
      test(`${scenario.name} @ ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(scenario.path);
        await page.waitForLoadState("networkidle").catch(() => {});
        await dismissCookieBanner(page);
        await page.evaluate(() => window.scrollTo(0, 0));
        // Wait one frame so sticky/fixed positioning settles.
        await page.waitForTimeout(150);

        const header = page.locator(scenario.headerSelector).first();
        const banner = page.locator(scenario.bannerSelector).first();

        await expect(header, "header must render").toBeVisible();
        await expect(banner, "first banner must render").toBeVisible();

        const headerBox = await header.boundingBox();
        const bannerBox = await banner.boundingBox();
        expect(headerBox).not.toBeNull();
        expect(bannerBox).not.toBeNull();

        // 1. Geometric assertion: no clipping by the header.
        //    The first banner's top edge MUST sit at or below the header's
        //    bottom edge. A 1px tolerance covers sub-pixel rounding.
        expect(
          bannerBox!.y,
          `banner top (${bannerBox!.y}) must be >= header bottom (${headerBox!.y + headerBox!.height})`,
        ).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height - 1);

        // The banner must also be at least partly inside the viewport top.
        expect(bannerBox!.y).toBeLessThan(vp.height);
        expect(bannerBox!.height).toBeGreaterThan(8);

        // 2. Pixel regression: snapshot the top region (header + banners).
        const clipHeight = Math.min(280, vp.height);
        await expect(page).toHaveScreenshot(
          `${scenario.name}-${vp.name}-top.png`,
          {
            clip: { x: 0, y: 0, width: vp.width, height: clipHeight },
            animations: "disabled",
            maxDiffPixelRatio: 0.02,
          },
        );
      });
    }
  });
}
