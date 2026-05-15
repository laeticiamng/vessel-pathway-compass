import { test, expect, type Page } from "@playwright/test";

/**
 * Visual regression for the sculptural header primitives.
 *
 * Captures the /dev/sculptural-header QA page in light + dark themes,
 * across the key interactive states (rest / hover / focus-visible /
 * active / mobile-menu-open). The QA page is a hermetic scene — no
 * network data, no auth — so snapshots are deterministic.
 *
 * Update baselines with:
 *   npx playwright test e2e/sculptural-header-states-visual.spec.ts --update-snapshots
 */

const VIEWPORT = { width: 1280, height: 900 };
const MOBILE = { width: 390, height: 844 };
const TOLERANCE = { maxDiffPixelRatio: 0.02, threshold: 0.2 } as const;

async function setTheme(page: Page, theme: "light" | "dark") {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem("theme", t);
      localStorage.setItem("vite-ui-theme", t);
    } catch {}
  }, theme);
  await page.emulateMedia({ colorScheme: theme });
}

async function gotoQa(page: Page) {
  await page.goto("/dev/sculptural-header");
  await page.waitForLoadState("networkidle");
  // Settle font loading & any layout transitions.
  await page.evaluate(() => document.fonts && (document.fonts as FontFaceSet).ready);
  await page.waitForTimeout(150);
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`Sculptural header — visual states (${theme})`, () => {
    test.use({ viewport: VIEWPORT, colorScheme: theme });

    test(`rest state @${theme}`, async ({ page }) => {
      await setTheme(page, theme);
      await gotoQa(page);
      await expect(page.locator("[data-qa-demo-region]")).toHaveScreenshot(
        `qa-rest-${theme}.png`,
        TOLERANCE,
      );
    });

    test(`hover on link @${theme}`, async ({ page }) => {
      await setTheme(page, theme);
      await gotoQa(page);
      await page.locator("[data-sculptural-link]").nth(3).hover();
      await page.waitForTimeout(500); // let underline finish
      await expect(page.locator("[data-qa-demo-region]")).toHaveScreenshot(
        `qa-hover-${theme}.png`,
        TOLERANCE,
      );
    });

    test(`focus-visible on link @${theme}`, async ({ page }) => {
      await setTheme(page, theme);
      await gotoQa(page);
      // Tab into the demo: skip past header chrome by focusing directly.
      await page.locator("[data-sculptural-link]").nth(4).focus();
      await page.waitForTimeout(500);
      await expect(page.locator("[data-qa-demo-region]")).toHaveScreenshot(
        `qa-focus-${theme}.png`,
        TOLERANCE,
      );
    });

    test(`active route link @${theme}`, async ({ page }) => {
      await setTheme(page, theme);
      await gotoQa(page);
      const active = page.locator('[data-sculptural-link][data-active="true"]').first();
      await expect(active).toBeVisible();
      await expect(active).toHaveScreenshot(`qa-active-link-${theme}.png`, TOLERANCE);
    });
  });

  test.describe(`Mobile menu — visual (${theme})`, () => {
    test.use({ viewport: MOBILE, colorScheme: theme });

    test(`mobile menu open on landing @${theme}`, async ({ page }) => {
      await setTheme(page, theme);
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.getByRole("button", { name: /menu/i }).first().click();
      const sheet = page.locator("[data-sculptural-mobile-menu]");
      await expect(sheet).toBeVisible();
      await page.waitForTimeout(500);
      await expect(sheet).toHaveScreenshot(`mobile-menu-${theme}.png`, TOLERANCE);
    });
  });
}
