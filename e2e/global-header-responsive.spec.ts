import { test, expect, type Page } from "@playwright/test";

/**
 * Cross-page responsive non-regression suite for the GLOBAL public header.
 *
 * Goes beyond `landing-responsive.spec.ts` by:
 *   - Iterating over every public page that mounts the global header
 *     (not just `/`) so a regression on, e.g., the Pricing page is caught.
 *   - Covering dark mode, high-contrast, and `prefers-reduced-motion`
 *     so theme/accessibility toggles don't break the layout.
 *   - Asserting the header NEVER overlaps the hero / first interactive
 *     CTA at any breakpoint or browser zoom level.
 *   - Asserting hero CTA text is not clipped or hidden behind the header.
 *
 * Pairs with `e2e/landing-responsive.spec.ts` (which focuses narrowly on
 * the landing brand wordmark + nav switch breakpoint).
 */

const LG = 1024;
const XL = 1280;

const LANGS = ["en", "fr", "de"] as const;

/** Routes that mount the public global header. */
const ROUTES = [
  "/",
  "/protocol",
  "/changelog",
  "/pricing",
  "/why-vasculink",
  "/trajectory",
  "/about",
  "/faq",
  "/contact",
  "/legal",
] as const;

const VIEWPORTS = [
  { name: "mobile-xxs", w: 280, h: 653, expect: "burger" as const },
  { name: "mobile-xs", w: 320, h: 568, expect: "burger" as const },
  { name: "mobile", w: 390, h: 844, expect: "burger" as const },
  { name: "tablet", w: 834, h: 1112, expect: "burger" as const },
  { name: "lg-minus-1", w: LG - 1, h: 768, expect: "burger" as const },
  { name: "lg", w: LG, h: 768, expect: "inline" as const },
  { name: "xl-minus-1", w: XL - 1, h: 768, expect: "inline" as const },
  { name: "xl", w: XL, h: 800, expect: "inline" as const },
  { name: "desktop", w: 1366, h: 768, expect: "inline" as const },
  { name: "desktop-xl", w: 1920, h: 1080, expect: "inline" as const },
  // Simulated browser zoom — narrow viewport at desktop DPR mimics 150% zoom.
  { name: "zoom-150-on-1366", w: 910, h: 512, expect: "burger" as const },
  { name: "zoom-200-on-1920", w: 960, h: 540, expect: "burger" as const },
] as const;

type Mode = "light" | "dark" | "high-contrast" | "reduced-motion";
const MODES: readonly Mode[] = ["light", "dark", "high-contrast", "reduced-motion"];

async function setLang(page: Page, lang: string) {
  await page.evaluate((l) => {
    try {
      localStorage.setItem("aquamr-flow-lang", l);
      localStorage.setItem("language", l);
    } catch {}
  }, lang);
}

async function applyMode(page: Page, mode: Mode) {
  if (mode === "dark") {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.evaluate(() => {
      try {
        localStorage.setItem("theme", "dark");
        localStorage.setItem("vite-ui-theme", "dark");
        const r = document.documentElement;
        r.classList.remove("light");
        r.classList.add("dark");
        r.style.colorScheme = "dark";
      } catch {}
    });
  } else if (mode === "high-contrast") {
    await page.evaluate(() => {
      try {
        localStorage.setItem("aquamr-high-contrast", "true");
        document.documentElement.classList.add("high-contrast");
      } catch {}
    });
  } else if (mode === "reduced-motion") {
    await page.emulateMedia({ reducedMotion: "reduce" });
  } else {
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "no-preference" });
  }
}

async function gotoStable(page: Page, path: string, lang: string, mode: Mode) {
  await setLang(page, lang);
  await applyMode(page, mode);
  await page.goto(path, { waitUntil: "networkidle" });
  await applyMode(page, mode);
  await page.evaluate(() => window.dispatchEvent(new Event("storage")));
  await page.waitForSelector("header", { state: "visible", timeout: 10_000 });
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation: none !important;
      transition: none !important;
    }`,
  });
  // i18n hydration guard: no dotted-key leakage in header text.
  await page.waitForFunction(() => {
    const h = document.querySelector("header");
    if (!h) return false;
    const txt = (h.textContent || "").trim();
    return txt.length > 2 && !/\b[a-z]+\.[a-z][a-zA-Z0-9_.-]+\b/.test(txt);
  }, { timeout: 10_000 });
  await page.waitForLoadState("networkidle");
}

/* -----------------------------------------------------------------------
 * 1. Header switch (burger vs inline) on every public page in every mode.
 * --------------------------------------------------------------------- */
test.describe("global header — multi-page responsive switch", () => {
  test.use({ locale: "en-US", timezoneId: "UTC" });

  for (const mode of MODES) {
    for (const route of ROUTES) {
      for (const lang of LANGS) {
        for (const vp of VIEWPORTS) {
          test(`${route} · ${lang} · ${vp.name} · ${mode}`, async ({ page }) => {
            await page.setViewportSize({ width: vp.w, height: vp.h });
            await gotoStable(page, route, lang, mode);

            const result = await page.evaluate(() => {
              const header = document.querySelector("header")!;
              const burger = header.querySelector<HTMLElement>(
                'button[aria-label*="enu" i]',
              );
              const inlineNav = header.querySelector<HTMLElement>(
                "div.hidden.lg\\:flex",
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
              return {
                burger: visible(burger),
                inline: visible(inlineNav),
                headerHeight: header.getBoundingClientRect().height,
              };
            });

            expect(result.headerHeight).toBeGreaterThan(0);
            if (vp.expect === "burger") {
              expect(result.burger, "burger should be visible").toBe(true);
              expect(result.inline, "inline nav should be hidden").toBe(false);
            } else {
              expect(result.inline, "inline nav should be visible").toBe(true);
              expect(result.burger, "burger should be hidden").toBe(false);
            }
          });
        }
      }
    }
  }
});

/* -----------------------------------------------------------------------
 * 2. Header NEVER overlaps the hero / first CTA, and hero CTA text is
 *    never clipped at any size, zoom, locale, or mode.
 * --------------------------------------------------------------------- */
test.describe("global header — no hero overlap, CTAs readable", () => {
  test.use({ locale: "en-US", timezoneId: "UTC" });

  for (const mode of MODES) {
    for (const route of ROUTES) {
      for (const lang of LANGS) {
        for (const vp of VIEWPORTS) {
          test(`no header/hero overlap · ${route} · ${lang} · ${vp.name} · ${mode}`, async ({ page }) => {
            await page.setViewportSize({ width: vp.w, height: vp.h });
            await gotoStable(page, route, lang, mode);

            const report = await page.evaluate(() => {
              const header = document.querySelector("header")!;
              const hr = header.getBoundingClientRect();

              // Identify the first hero/main section and its first CTAs.
              const main = document.querySelector("main") || document.body;
              const firstSection =
                main.querySelector<HTMLElement>("section") ||
                (main as HTMLElement);
              const sr = firstSection.getBoundingClientRect();

              // Header must not vertically cover the hero section.
              const headerCoversSection =
                hr.bottom > sr.top + 1 && hr.top < sr.bottom - 1;

              // Inspect first ~3 CTAs in the hero (links/buttons).
              const ctas = Array.from(
                firstSection.querySelectorAll<HTMLElement>(
                  "a[href], button",
                ),
              )
                .filter((el) => {
                  const r = el.getBoundingClientRect();
                  const cs = getComputedStyle(el);
                  return (
                    r.width > 0 &&
                    r.height > 0 &&
                    cs.visibility !== "hidden" &&
                    cs.display !== "none"
                  );
                })
                .slice(0, 3);

              const ctaIssues: Array<{
                label: string;
                reason: string;
                top?: number;
                headerBottom?: number;
                sw?: number;
                cw?: number;
              }> = [];

              for (const cta of ctas) {
                const r = cta.getBoundingClientRect();
                // CTA top must be below the header bottom (allow 1px seam).
                if (r.top < hr.bottom - 1) {
                  ctaIssues.push({
                    label: (cta.innerText || cta.getAttribute("aria-label") || "")
                      .trim()
                      .slice(0, 50),
                    reason: "covered by header",
                    top: Math.round(r.top),
                    headerBottom: Math.round(hr.bottom),
                  });
                }
                // CTA text must not be horizontally clipped.
                if (cta.scrollWidth - cta.clientWidth > 1) {
                  const cs = getComputedStyle(cta);
                  if (cs.overflowX === "hidden" || cs.overflow === "hidden") {
                    ctaIssues.push({
                      label: (cta.innerText || "").trim().slice(0, 50),
                      reason: "horizontal clip",
                      sw: cta.scrollWidth,
                      cw: cta.clientWidth,
                    });
                  }
                }
                // CTA must have a meaningful accessible label.
                const label =
                  (cta.innerText || cta.getAttribute("aria-label") || "").trim();
                if (label.length === 0) {
                  ctaIssues.push({
                    label: "<empty>",
                    reason: "no accessible label",
                  });
                }
              }

              return {
                headerCoversSection,
                headerBottom: Math.round(hr.bottom),
                sectionTop: Math.round(sr.top),
                ctaIssues,
              };
            });

            expect(
              report.headerCoversSection,
              `Header (bottom=${report.headerBottom}) overlaps first section (top=${report.sectionTop})`,
            ).toBe(false);
            expect(
              report.ctaIssues,
              `Hero CTA issues: ${JSON.stringify(report.ctaIssues)}`,
            ).toEqual([]);
          });
        }
      }
    }
  }
});
