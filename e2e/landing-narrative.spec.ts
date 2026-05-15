import { test, expect } from "@playwright/test";

/**
 * Sculptural narrative sections — Materials parchment + Engineering exploded.
 * Asserts presence, headings, scroll progression and reduced-motion safety.
 */
test.describe("Landing sculptural narrative", () => {
  test("renders Materials and Engineering sections", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const materials = page.locator('[data-section="materials-scroll"]');
    const engineering = page.locator('[data-section="engineering-exploded"]');

    await materials.scrollIntoViewIfNeeded();
    await expect(materials).toBeVisible();
    await expect(materials.locator("h2")).toBeVisible();
    // 4 strata layers
    await expect(materials.locator("[data-stratum]")).toHaveCount(4);

    await engineering.scrollIntoViewIfNeeded();
    await expect(engineering).toBeVisible();
    await expect(engineering.locator("h2")).toBeVisible();
    // 5 interactive pieces
    await expect(engineering.locator('button[aria-pressed]')).toHaveCount(5);
  });

  test("Engineering exploded reveals detail on hover", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const engineering = page.locator('[data-section="engineering-exploded"]');
    await engineering.scrollIntoViewIfNeeded();

    const firstPiece = engineering.locator('button[aria-pressed]').first();
    await firstPiece.hover();
    await expect(firstPiece).toHaveAttribute("aria-pressed", "true");
  });

  test("respects reduced-motion (no clip animation, content visible immediately)", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const materials = page.locator('[data-section="materials-scroll"]');
    await materials.scrollIntoViewIfNeeded();
    await expect(materials.locator("[data-stratum] h3").first()).toBeVisible();
    await context.close();
  });
});
