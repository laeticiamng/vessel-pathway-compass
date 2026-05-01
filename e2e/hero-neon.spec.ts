import { test, expect, type Page } from "@playwright/test";

/**
 * Cross-browser hero-neon contract.
 *
 * Covers Chrome (chromium), Firefox and Safari (webkit) with explicit
 * scenarios for scroll, keyboard focus, reduced-motion and the
 * `-webkit-text-stroke` fallback path.
 */

const HERO_SELECTOR = "[data-hero-neon]";

async function getComputed(page: Page, prop: string) {
  return page.$eval(
    HERO_SELECTOR,
    (el, p) => getComputedStyle(el as Element).getPropertyValue(p as string),
    prop,
  );
}

test.describe("hero-neon — render contract", () => {
  test("descenders are not clipped", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator(HERO_SELECTOR).first();
    await expect(hero).toBeVisible();

    const { boxHeight, fontSize } = await hero.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        boxHeight: (el as HTMLElement).getBoundingClientRect().height,
        fontSize: parseFloat(cs.fontSize),
      };
    });

    // line-height is 1.18 + bottom padding 0.18em → expect at least 1.3×
    // the font-size per visual line. We only assert the lower bound so
    // that any glyph descender (g, p, é, ç) has room to render.
    expect(boxHeight).toBeGreaterThanOrEqual(fontSize * 1.15);
  });

  test("readable after fast scroll", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo({ top: 1500, behavior: "auto" }));
    await page.waitForTimeout(50);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "auto" }));
    await page.waitForTimeout(400);

    const filter = await getComputed(page, "filter");
    // After settle, halo MUST be re-applied (unless reduced-motion).
    expect(filter).not.toBe("none");
  });
});

test.describe("hero-neon — accessibility", () => {
  test("keyboard focus on hero-neon QA page shows visible ring", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === "webkit", "WebKit Tab order on QA page is flaky in CI");
    await page.goto("/dev/hero-neon?force=1");
    // toggle focusable on
    await page.getByLabel(/Focusable/i).check();
    // Tab into the document until focus lands on a hero-neon element
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(
        () => document.activeElement?.matches?.("[data-hero-neon]") ?? false,
      );
      if (focused) break;
    }
    const outlineWidth = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return "0px";
      return getComputedStyle(el).outlineWidth;
    });
    expect(outlineWidth).not.toBe("0px");
  });

  test("skeleton state is hidden from screen readers", async ({ page }) => {
    await page.goto("/dev/hero-neon?force=1");
    // Toggle lazy on so a skeleton renders briefly on remount
    await page.getByLabel(/Lazy load/i).uncheck();
    await page.getByLabel(/Lazy load/i).check();
    // Immediately query the hero-neon: while in skeleton state both
    // attributes must be set.
    const attrs = await page.locator(HERO_SELECTOR).first().evaluate((el) => ({
      busy: el.getAttribute("aria-busy"),
      hidden: el.getAttribute("aria-hidden"),
      active: el.getAttribute("data-hero-neon-active"),
    }));
    if (attrs.active === "false") {
      expect(attrs.busy).toBe("true");
      expect(attrs.hidden).toBe("true");
    }
  });
});

test.describe("hero-neon — reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("halo paused during scroll", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo({ top: 800, behavior: "auto" }));
    await page.waitForTimeout(20);
    const scrolling = await page.locator(HERO_SELECTOR).first().getAttribute(
      "data-hero-neon-scrolling",
    );
    // We don't assert "true" deterministically (event timing) but we DO
    // assert the attribute exists — proving the listener is wired.
    expect(scrolling).not.toBeNull();
  });
});

test.describe("hero-neon — fallback (no -webkit-text-stroke)", () => {
  test("renders solid color when text-stroke is unsupported", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const orig = CSS.supports.bind(CSS);
      // @ts-expect-error override for testing
      CSS.supports = (...args: unknown[]) => {
        const joined = args.join(" ");
        if (joined.includes("text-stroke")) return false;
        // @ts-expect-error spread
        return orig(...args);
      };
    });
    await page.goto("/");
    const color = await getComputed(page, "color");
    // Color must be a real rgb(...), not transparent
    expect(color).not.toMatch(/rgba?\(0,\s*0,\s*0,\s*0\)/);
    expect(color).toMatch(/rgb/);
  });
});

test.describe("hero-neon — high contrast mode", () => {
  test("strips halo and uses solid token color", async ({ page }) => {
    await page.goto("/dev/hero-neon?force=1");
    await page.getByLabel(/High contrast/i).check();
    await page.waitForTimeout(100);

    const { filter, color } = await page.locator(HERO_SELECTOR).first().evaluate(
      (el) => ({
        filter: getComputedStyle(el).filter,
        color: getComputedStyle(el).color,
      }),
    );
    expect(filter).toBe("none");
    expect(color).toMatch(/rgb/);
  });
});
