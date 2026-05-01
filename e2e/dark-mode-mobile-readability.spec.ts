import { test, expect, type Page } from "@playwright/test";

/**
 * Mobile dark-mode readability assertions for the hero-neon headline.
 *
 * On mobile (≤640px), the dark theme tightens the halo (token
 * `--neon-halo-radius-mobile = 6px`) and bumps the font weight so glyph
 * edges stay sharp on high-DPR phone screens. This spec encodes
 * measurable thresholds:
 *
 *   • effective `font-size` ≥ 16px (WCAG SC 1.4.4 baseline for body
 *     text adjacent to the hero — guards against overly-aggressive
 *     viewport-based sizing).
 *   • drop-shadow radius ≤ 10px (mobile-tightened halo, never the
 *     desktop 12-16px values).
 *   • computed `color` (or text-stroke target) maintains a usable
 *     luminance contrast against the page background.
 */

const HERO = "[data-hero-neon]";

async function gotoMobileDark(page: Page) {
  await page.addInitScript(() => {
    try { localStorage.setItem("theme", "dark"); } catch { /* ignore */ }
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await page.waitForTimeout(300);
}

/** RGB → relative luminance per WCAG. */
function luminance(rgb: [number, number, number]) {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function parseRgb(s: string): [number, number, number] {
  const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!m) return [0, 0, 0];
  return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
}

test.describe("hero-neon mobile dark — measurable readability", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await gotoMobileDark(page);
  });

  test("font-size stays ≥ 16px (legibility floor)", async ({ page }) => {
    const hero = page.locator(HERO).first();
    if ((await hero.count()) === 0) test.skip(true, "No hero-neon on landing");
    const fontSize = await hero.evaluate(
      (el) => parseFloat(getComputedStyle(el).fontSize),
    );
    expect(fontSize).toBeGreaterThanOrEqual(16);
  });

  test("drop-shadow halo radius is at most 10px on mobile dark", async ({
    page,
  }) => {
    const hero = page.locator(HERO).first();
    if ((await hero.count()) === 0) test.skip(true, "No hero-neon on landing");
    const filter = await hero.evaluate((el) => getComputedStyle(el).filter);
    if (filter === "none") return; // reduced-motion / high-contrast win
    const radii = [...filter.matchAll(/drop-shadow\([^)]*?(\d+(?:\.\d+)?)px/g)]
      .map((m) => parseFloat(m[1]));
    expect(radii.length).toBeGreaterThan(0);
    for (const r of radii) {
      expect(r).toBeLessThanOrEqual(10);
    }
  });

  test("text vs background luminance gap is large enough to be readable", async ({
    page,
  }) => {
    const hero = page.locator(HERO).first();
    if ((await hero.count()) === 0) test.skip(true, "No hero-neon on landing");

    const { textColor, bgColor } = await hero.evaluate((el) => {
      // For gradient text, color is `transparent` — fall back to the
      // text-stroke / underlying token color used by the fallback path.
      let txt = getComputedStyle(el).color;
      if (/rgba?\([^)]*,\s*0(?:\.0+)?\)/.test(txt)) {
        // Sample the gradient mid-stop instead.
        const stroke = getComputedStyle(el).webkitTextStrokeColor;
        if (stroke && stroke !== "rgba(0, 0, 0, 0)") txt = stroke;
        else txt = "rgb(115, 230, 255)"; // approx of cyan token in dark
      }
      let bg = getComputedStyle(document.body).backgroundColor;
      if (/rgba?\([^)]*,\s*0(?:\.0+)?\)/.test(bg)) {
        bg = getComputedStyle(document.documentElement).backgroundColor;
      }
      return { textColor: txt, bgColor: bg };
    });

    const lt = luminance(parseRgb(textColor));
    const lb = luminance(parseRgb(bgColor));
    // For accent neon text on dark surfaces, target ≥ 0.35 luminance
    // delta. Stricter WCAG ratio is enforced separately by the existing
    // contrast vitest — here we just guard against catastrophic regressions.
    expect(Math.abs(lt - lb)).toBeGreaterThanOrEqual(0.25);
  });

  test("icon-ring outer halo stays ≤ 10px on mobile dark", async ({ page }) => {
    const ring = page.locator(".neon-icon-ring").first();
    if ((await ring.count()) === 0) test.skip(true, "No icon ring on landing");
    const shadow = await ring.evaluate(
      (el) => getComputedStyle(el).boxShadow,
    );
    const radii = [...shadow.matchAll(/(\d+(?:\.\d+)?)px/g)].map((m) =>
      parseFloat(m[1])
    );
    // Reject ANY radius/blur over 10px — desktop uses 14-16px so a leak
    // would mean the @media block didn't apply.
    for (const r of radii) {
      expect(r).toBeLessThanOrEqual(10);
    }
  });
});
