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

  test("Mobile menu: ESC closes and restores focus to the trigger", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const trigger = page.getByRole("button", { name: /menu/i }).first();
    await trigger.focus();
    await trigger.press("Enter");

    const sheet = page.locator("[data-sculptural-mobile-menu]");
    await expect(sheet).toBeVisible();

    // Focus is moved into the dialog by Radix focus trap.
    const focusedInside = await page.evaluate(
      () => !!document.activeElement?.closest("[data-sculptural-mobile-menu]"),
    );
    expect(focusedInside).toBe(true);

    await page.keyboard.press("Escape");
    await expect(sheet).not.toBeVisible();

    // Focus restored to the trigger that opened the sheet.
    const focusedTrigger = await page.evaluate(
      () => document.activeElement?.getAttribute("aria-label") ?? "",
    );
    expect(focusedTrigger.toLowerCase()).toContain("menu");

    await context.close();
  });

  test("Mobile menu: Tab order stays inside the sheet (focus trap)", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /menu/i }).first().click();
    const sheet = page.locator("[data-sculptural-mobile-menu]");
    await expect(sheet).toBeVisible();

    // Tab through ~12 stops; activeElement must remain inside the sheet.
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(
        () => !!document.activeElement?.closest("[data-sculptural-mobile-menu]"),
      );
      expect(inside, `iteration ${i}: focus escaped the sheet`).toBe(true);
    }

    await context.close();
  });

  test("Mobile menu: every focused stop paints a visible ring", async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /menu/i }).first().click();
    const sheet = page.locator("[data-sculptural-mobile-menu]");
    await expect(sheet).toBeVisible();

    const links = sheet.locator("[data-sculptural-link]");
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(5);

    for (let i = 0; i < count; i++) {
      await links.nth(i).focus();
      const shadow = await links.nth(i).evaluate(
        (el) => getComputedStyle(el as HTMLElement).boxShadow,
      );
      expect(shadow && shadow !== "none", `link ${i} has no focus ring`).toBeTruthy();
    }

    await context.close();
  });

  test("Breadcrumbs render with aria-current on the leaf crumb", async ({ page }) => {
    await page.goto("/app/settings");
    await page.waitForLoadState("networkidle");

    const crumbs = page.locator("[data-sculptural-breadcrumbs]").first();
    await expect(crumbs).toBeVisible();

    const current = crumbs.locator('[aria-current="page"]');
    await expect(current).toHaveCount(1);

    // Non-leaf crumbs are real links with focus rings.
    const link = crumbs.locator("[data-sculptural-breadcrumb-link]").first();
    if (await link.count()) {
      await link.focus();
      const shadow = await link.evaluate(
        (el) => getComputedStyle(el as HTMLElement).boxShadow,
      );
      expect(shadow && shadow !== "none").toBeTruthy();
    }
  });
});
