import { test, expect } from "@playwright/test";

/**
 * Sculptural header — verifies that the dynamic glass treatment is wired
 * up on both the public Landing and the authenticated AppLayout.
 *
 * Asserts:
 *   - data-sculptural-header marker is present
 *   - data-scrolled flips from "false" to "true" after the user scrolls
 *   - sculptural nav links carry the data-sculptural-link marker on Landing
 */
test.describe("Sculptural header", () => {
  test("Landing: glass header opacifies on scroll + sculptural links present", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const header = page.locator('[data-sculptural-header]').first();
    await expect(header).toBeVisible();
    await expect(header).toHaveAttribute("data-scrolled", "false");

    // Sculptural links wired
    const links = page.locator('[data-sculptural-link]');
    await expect(links.first()).toBeVisible();
    expect(await links.count()).toBeGreaterThanOrEqual(3);

    await page.mouse.wheel(0, 400);
    await expect(header).toHaveAttribute("data-scrolled", "true");
  });

  test("App layout: header marker present on /app", async ({ page }) => {
    await page.goto("/app");
    // App routes are gated; the gate itself renders within AppLayout.
    await page.waitForLoadState("networkidle");
    const header = page.locator('[data-sculptural-header]').first();
    await expect(header).toBeVisible();
  });
});
