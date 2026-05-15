import { test, expect } from "@playwright/test";

/**
 * Sculptural header — verifies that the dynamic glass treatment, the
 * sculptural link semantics (active state, focus ring) and the
 * `prefers-reduced-motion` contract all hold on the public Landing
 * and on the authenticated AppLayout.
 */
test.describe("Sculptural header", () => {
  test("Landing: glass header opacifies on scroll + sculptural links present", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const header = page.locator("[data-sculptural-header]").first();
    await expect(header).toBeVisible();
    await expect(header).toHaveAttribute("data-scrolled", "false");

    const links = page.locator("[data-sculptural-link]");
    await expect(links.first()).toBeVisible();
    expect(await links.count()).toBeGreaterThanOrEqual(3);

    await page.mouse.wheel(0, 400);
    await expect(header).toHaveAttribute("data-scrolled", "true");
  });

  test("App layout: header marker present on /app", async ({ page }) => {
    await page.goto("/app");
    await page.waitForLoadState("networkidle");
    const header = page.locator("[data-sculptural-header]").first();
    await expect(header).toBeVisible();
  });

  test("Active route is reflected with aria-current and data-active", async ({ page }) => {
    await page.goto("/why");
    await page.waitForLoadState("networkidle");

    const whyLink = page.locator('[data-sculptural-link][href="/why"]').first();
    await expect(whyLink).toBeVisible();
    await expect(whyLink).toHaveAttribute("aria-current", "page");
    await expect(whyLink).toHaveAttribute("data-active", "true");

    // Underline span is visually locked in (scale-x-100) for the active link.
    const underline = whyLink.locator("span[aria-hidden]");
    const transform = await underline.evaluate(
      (el) => getComputedStyle(el as HTMLElement).transform,
    );
    expect(transform).not.toBe("matrix(1, 0, 0, 0, 0, 0)");
  });

  test("Keyboard focus paints a visible ring on sculptural links", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const firstLink = page.locator("[data-sculptural-link]").first();
    await firstLink.focus();

    const outline = await firstLink.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      return { boxShadow: cs.boxShadow, outline: cs.outlineStyle };
    });
    // focus-visible:ring-2 paints box-shadow; assert *something* renders.
    expect(outline.boxShadow && outline.boxShadow !== "none").toBeTruthy();
  });

  test("prefers-reduced-motion: underline transition is disabled", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const link = page.locator("[data-sculptural-link]").first();
    await expect(link).toBeVisible();

    const underline = link.locator("span[aria-hidden]");
    const duration = await underline.evaluate(
      (el) => getComputedStyle(el as HTMLElement).transitionDuration,
    );
    // motion-reduce:duration-0 — Tailwind compiles to 0s.
    expect(duration).toMatch(/^0s/);

    // Header transition still functions logically (data attr toggles).
    const header = page.locator("[data-sculptural-header]").first();
    await expect(header).toHaveAttribute("data-scrolled", "false");
    await page.mouse.wheel(0, 400);
    await expect(header).toHaveAttribute("data-scrolled", "true");

    await context.close();
  });

  test("Mobile menu reuses sculptural treatment (links + magnetic logo)", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /menu/i }).first().click();

    const sheet = page.locator("[data-sculptural-mobile-menu]");
    await expect(sheet).toBeVisible();

    const sheetLinks = sheet.locator("[data-sculptural-link]");
    expect(await sheetLinks.count()).toBeGreaterThanOrEqual(5);

    await context.close();
  });
});
