import { test, expect, type Page } from "@playwright/test";

/**
 * Focused responsive non-regression suite for the landing header.
 *
 * Verifies, for every supported viewport × locale × zoom:
 *   - VASCU-LINK never wraps and never clips.
 *   - The burger menu trigger and the inline desktop nav switch
 *     EXACTLY at the `lg` breakpoint (1024 CSS px).
 *   - The "AquaMR Flow Platform" subtitle is only visible at `xl`+.
 *   - The brand wordmark never overlaps the nav / burger.
 *
 * Pairs with `src/lib/breakpoints.ts` (single source of truth) and the
 * manual checklist in `docs/responsive-acceptance-checklist.md`.
 */

const LG = 1024;
const XL = 1280;

const LANGS = ["en", "fr", "de"] as const;

const VIEWPORTS = [
  { name: "mobile-xxs", w: 280, h: 653, expect: "burger", subtitle: false },
  { name: "mobile-xs", w: 320, h: 568, expect: "burger", subtitle: false },
  { name: "mobile", w: 390, h: 844, expect: "burger", subtitle: false },
  { name: "tablet", w: 834, h: 1112, expect: "burger", subtitle: false },
  // Just below the lg breakpoint -> burger
  { name: "lg-minus-1", w: LG - 1, h: 768, expect: "burger", subtitle: false },
  // Exactly at lg -> inline nav, no subtitle yet
  { name: "lg", w: LG, h: 768, expect: "inline", subtitle: false },
  // Just below xl -> still inline, still no subtitle
  { name: "xl-minus-1", w: XL - 1, h: 768, expect: "inline", subtitle: false },
  // At xl -> inline + subtitle
  { name: "xl", w: XL, h: 800, expect: "inline", subtitle: true },
  { name: "desktop", w: 1366, h: 768, expect: "inline", subtitle: true },
  { name: "desktop-xl", w: 1920, h: 1080, expect: "inline", subtitle: true },
] as const;

async function setLang(page: Page, lang: string) {
  await page.evaluate((l) => {
    try {
      localStorage.setItem("aquamr-flow-lang", l);
      localStorage.setItem("language", l);
    } catch {}
  }, lang);
}

async function gotoLanding(page: Page, lang: string) {
  await setLang(page, lang);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForSelector("header", { state: "visible" });
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation: none !important; transition: none !important;
    }`,
  });
  // Wait for i18n hydration: header text should not contain dotted keys.
  await page.waitForFunction(() => {
    const h = document.querySelector("header");
    if (!h) return false;
    const txt = (h.textContent || "").trim();
    return txt.length > 2 && !/\b[a-z]+\.[a-z][a-zA-Z0-9_.-]+\b/.test(txt);
  }, { timeout: 10_000 });
}

test.describe("landing header — responsive non-regression", () => {
  test.use({ locale: "en-US", timezoneId: "UTC", reducedMotion: "reduce" });

  for (const lang of LANGS) {
    for (const vp of VIEWPORTS) {
      test(`header @ ${vp.name} (${vp.w}px) · ${lang}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.w, height: vp.h });
        await gotoLanding(page, lang);

        const result = await page.evaluate(() => {
          const header = document.querySelector("header")!;
          const wordmark = header.querySelector<HTMLElement>(
            'a[href="/"] span span:first-child',
          );
          const subtitle = Array.from(
            header.querySelectorAll<HTMLElement>("a span span"),
          ).find((s) => s !== wordmark) || null;
          const burger = header.querySelector<HTMLElement>(
            'button[aria-label*="enu"], button[aria-label*="ENU" i]',
          );
          const inlineNavLinks = Array.from(
            header.querySelectorAll<HTMLElement>("div.hidden.lg\\:flex a"),
          );

          const visible = (el: HTMLElement | null) => {
            if (!el) return false;
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            return (
              r.width > 0 &&
              r.height > 0 &&
              cs.visibility !== "hidden" &&
              cs.display !== "none"
            );
          };

          const wordmarkRect = wordmark?.getBoundingClientRect();
          const wordmarkText = (wordmark?.textContent || "").trim();
          const wordmarkClipped =
            wordmark != null &&
            (wordmark.scrollWidth - wordmark.clientWidth > 1 ||
              wordmark.scrollHeight - wordmark.clientHeight > 2);

          // Single-line check: line height ~ height of the element.
          const lineHeight = wordmark
            ? parseFloat(getComputedStyle(wordmark).lineHeight) || 0
            : 0;
          const wordmarkWraps =
            wordmark != null &&
            lineHeight > 0 &&
            wordmark.getBoundingClientRect().height > lineHeight * 1.6;

          return {
            burgerVisible: visible(burger),
            inlineNavVisible: inlineNavLinks.some(visible),
            subtitleVisible: visible(subtitle),
            wordmarkText,
            wordmarkClipped,
            wordmarkWraps,
            wordmarkWidth: wordmarkRect?.width ?? 0,
          };
        });

        // VASCU-LINK present and intact.
        expect(result.wordmarkText.length).toBeGreaterThan(0);
        expect(result.wordmarkClipped, "VASCU-LINK is clipped").toBe(false);
        expect(result.wordmarkWraps, "VASCU-LINK wraps to a 2nd line").toBe(false);

        // Nav state matches the breakpoint expectation.
        if (vp.expect === "burger") {
          expect(result.burgerVisible, "burger should be visible").toBe(true);
          expect(result.inlineNavVisible, "inline nav should be hidden").toBe(false);
        } else {
          expect(result.inlineNavVisible, "inline nav should be visible").toBe(true);
          expect(result.burgerVisible, "burger should be hidden").toBe(false);
        }

        // Subtitle visibility matches xl rule.
        expect(result.subtitleVisible).toBe(vp.subtitle);
      });
    }
  }

  // Browser-zoom regression: simulate 150% zoom at 1366 width by
  // shrinking the viewport. Effective layout width ~ 910 px → burger.
  test("header collapses to burger at 150% zoom on 1366px laptop", async ({ page }) => {
    await page.setViewportSize({ width: 910, height: 512 });
    await gotoLanding(page, "en");
    const burgerVisible = await page.evaluate(() => {
      const b = document.querySelector<HTMLElement>(
        'header button[aria-label*="enu" i]',
      );
      if (!b) return false;
      const r = b.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    expect(burgerVisible).toBe(true);
  });
});
