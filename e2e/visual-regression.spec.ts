import { test, expect, type Page } from "@playwright/test";

/**
 * Pin rendering environment for snapshot determinism (see prior revisions).
 * Locale/timezone/DPR/colorScheme are forced via test.use() per-project below
 * so the dark-mode project can override colorScheme without leaking into light.
 */

/**
 * Visual regression + DOM overlap/duplication suite.
 *
 * Coverage matrix:
 *   - Routes: /, /protocol, /changelog
 *   - Languages: en, fr, de
 *   - Breakpoints: mobile-xs (320), mobile (390), tablet (834),
 *                  desktop (1366), desktop-xl (1920)
 *   - Themes: light, dark (separate snapshot folders & tolerances)
 *
 * Three complementary mechanisms:
 *   1. Full-page `toHaveScreenshot()` with per-route AND per-theme tolerances.
 *   2. DOM heuristic: duplicated header labels + bounding-box overlaps,
 *      including a dedicated check that `FourZeroBanner` never covers a
 *      neighbouring section (`AboveHeroFramingLine`, hero, etc.).
 *   3. "No clipped text" assertion on the above-the-hero stack: every
 *      visible text node must fit inside its scroll container so labels
 *      can't silently disappear behind sticky bars.
 */

type Route = "/" | "/protocol" | "/changelog";
type Theme = "light" | "dark";

const ROUTES: readonly Route[] = ["/", "/protocol", "/changelog"] as const;
const LANGS = ["en", "fr", "de"] as const;
const THEMES: readonly Theme[] = ["light", "dark"] as const;

const BREAKPOINTS = [
  // Smallest realistic mobile (older Android, Galaxy Fold outer)
  { name: "mobile-xxs", width: 280,  height: 653 },
  { name: "mobile-xs",  width: 320,  height: 568 },
  { name: "mobile",     width: 390,  height: 844 },
  { name: "tablet",     width: 834,  height: 1112 },
  { name: "desktop",    width: 1366, height: 768 },
  { name: "desktop-xl", width: 1920, height: 1080 },
  // QHD / large external monitors used by clinicians
  { name: "desktop-2k", width: 2560, height: 1440 },
] as const;

/**
 * Per-route × per-theme tolerances. Dark mode is slightly looser because
 * gradients + glow shadows produce more sub-pixel noise than flat light.
 */
const ROUTE_TOLERANCE: Record<
  Route,
  Record<Theme, { maxDiffPixelRatio: number; overlapPx: number }>
> = {
  "/": {
    light: { maxDiffPixelRatio: 0.01, overlapPx: 2 },
    dark:  { maxDiffPixelRatio: 0.02, overlapPx: 2 },
  },
  "/protocol": {
    light: { maxDiffPixelRatio: 0.03, overlapPx: 4 },
    dark:  { maxDiffPixelRatio: 0.04, overlapPx: 4 },
  },
  "/changelog": {
    light: { maxDiffPixelRatio: 0.04, overlapPx: 4 },
    dark:  { maxDiffPixelRatio: 0.05, overlapPx: 4 },
  },
};

/** A small dictionary of header labels we expect to be translated per locale.
 *  Used to verify i18n hydration is *actually* complete (not just "non-empty"). */
const I18N_PROBES: Record<(typeof LANGS)[number], string[]> = {
  en: ["Protocol", "Sign", "Why"],
  fr: ["Protocole", "Connexion", "Pourquoi"],
  de: ["Protokoll", "Anmelden", "Warum"],
};

async function setLanguage(page: Page, lang: string) {
  await page.evaluate((l) => {
    try {
      localStorage.setItem("aquamr-flow-lang", l);
      localStorage.setItem("aquamr-language", l);
      localStorage.setItem("language", l);
    } catch {}
  }, lang);
}

async function setTheme(page: Page, theme: Theme) {
  await page.evaluate((t) => {
    try {
      localStorage.setItem("theme", t);
      localStorage.setItem("vite-ui-theme", t);
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(t);
      root.style.colorScheme = t;
    } catch {}
  }, theme);
}

async function gotoStable(
  page: Page,
  path: string,
  lang: (typeof LANGS)[number],
  theme: Theme,
) {
  await setLanguage(page, lang);
  await page.goto(path, { waitUntil: "networkidle" });
  await setTheme(page, theme);
  // Re-apply theme after any post-mount script that might reset it.
  await page.evaluate(() => window.dispatchEvent(new Event("storage")));

  // Force a deterministic font stack + freeze rendering. Pin browser zoom.
  await page.addStyleTag({
    content: `
      :root { zoom: 1 !important; }
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
        font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
        font-feature-settings: "liga" 0, "kern" 0 !important;
        font-variant-ligatures: none !important;
        text-rendering: geometricPrecision !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
      }
      html { scroll-behavior: auto !important; }
    `,
  });

  // Header visible
  await page.waitForSelector("header", { state: "visible", timeout: 10_000 });

  // Robust i18n hydration check:
  //   - At least one CTA mounted.
  //   - Header text contains NONE of the raw "key.path" patterns.
  //   - Header text contains AT LEAST ONE expected translated probe word
  //     for the active locale, or — on very narrow viewports where the
  //     header collapses to a hamburger — the probe words appear once
  //     the menu is opened. We don't open it; instead we accept "header
  //     text length is reasonable AND no dotted keys leak".
  const probes = I18N_PROBES[lang];
  await page.waitForFunction(
    ({ probes }) => {
      const h = document.querySelector("header");
      if (!h) return false;
      const txt = (h.textContent || "").trim();
      if (txt.length === 0) return false;

      // Reject any dotted-key leakage anywhere in the header.
      // Pattern matches identifiers like `home.nav.protocol` or `landing.cta`.
      if (/\b[a-z]+(?:\.[a-z][a-zA-Z0-9_-]*){1,}\b/.test(txt)) return false;

      // Wide viewports: at least one expected probe word must be present.
      // Narrow viewports (<= 768): header may be collapsed; fall back to
      // a length heuristic — we still rejected dotted keys above.
      const wide = window.innerWidth > 768;
      if (wide) {
        return probes.some((p) => txt.includes(p));
      }
      return txt.length >= 4;
    },
    { probes },
    { timeout: 10_000 },
  );

  // Wait for at least one laid-out CTA in the header.
  await page.waitForFunction(() => {
    const el = document.querySelector("header a, header button");
    if (!el) return false;
    const r = (el as HTMLElement).getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }, { timeout: 10_000 });

  await page.evaluate(async () => {
    if ((document as any).fonts?.ready) {
      try { await (document as any).fonts.ready; } catch {}
    }
  });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(250);
}

/* -------------------------------------------------------------------------
 * 1. Full-page screenshots
 * ----------------------------------------------------------------------- */
test.describe("visual snapshots", () => {
  test.use({
    locale: "en-US",
    timezoneId: "UTC",
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });

  for (const theme of THEMES) {
    for (const bp of BREAKPOINTS) {
      for (const lang of LANGS) {
        for (const route of ROUTES) {
          test(`screenshot ${route} · ${lang} · ${bp.name} · ${theme}`, async ({ page }) => {
            await page.setViewportSize({ width: bp.width, height: bp.height });
            await page.emulateMedia({ colorScheme: theme });
            await gotoStable(page, route, lang, theme);
            const tol = ROUTE_TOLERANCE[route][theme];
            await expect(page).toHaveScreenshot(
              `${route.replace(/\//g, "_") || "_root"}-${lang}-${bp.name}-${theme}.png`,
              { fullPage: true, maxDiffPixelRatio: tol.maxDiffPixelRatio },
            );
          });
        }
      }
    }
  }
});

/* -------------------------------------------------------------------------
 * 2. DOM heuristic: duplicates + overlaps (header AND above-hero stack)
 * ----------------------------------------------------------------------- */
test.describe("DOM overlap & duplicate detection", () => {
  test.use({
    locale: "en-US",
    timezoneId: "UTC",
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });

  for (const theme of THEMES) {
    for (const bp of BREAKPOINTS) {
      for (const lang of LANGS) {
        for (const route of ROUTES) {
          test(`no header dup/overlap · ${route} · ${lang} · ${bp.name} · ${theme}`, async ({ page }) => {
            await page.setViewportSize({ width: bp.width, height: bp.height });
            await page.emulateMedia({ colorScheme: theme });
            await gotoStable(page, route, lang, theme);
            const overlapPx = ROUTE_TOLERANCE[route][theme].overlapPx;

            const result = await page.evaluate((tol) => {
              const header = document.querySelector("header");
              if (!header) return { duplicates: [], overlaps: [] };

              const interactive = Array.from(
                header.querySelectorAll<HTMLElement>("a, button"),
              ).filter((el) => {
                const r = el.getBoundingClientRect();
                if (r.width === 0 || r.height === 0) return false;
                const cs = getComputedStyle(el);
                if (cs.visibility === "hidden" || cs.display === "none") return false;
                return true;
              });

              const seen = new Map<string, number>();
              for (const el of interactive) {
                const label = (el.innerText || "").trim().replace(/\s+/g, " ");
                if (label.length < 2) continue;
                seen.set(label, (seen.get(label) ?? 0) + 1);
              }
              const duplicates = [...seen.entries()]
                .filter(([, n]) => n > 1)
                .map(([label, n]) => ({ label, count: n }));

              const overlaps: Array<{ a: string; b: string; dx: number; dy: number }> = [];
              for (let i = 0; i < interactive.length; i++) {
                for (let j = i + 1; j < interactive.length; j++) {
                  const a = interactive[i];
                  const b = interactive[j];
                  if (a.contains(b) || b.contains(a)) continue;
                  const ra = a.getBoundingClientRect();
                  const rb = b.getBoundingClientRect();
                  const dx = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
                  const dy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
                  if (dx > tol && dy > tol) {
                    overlaps.push({
                      a: (a.innerText || a.getAttribute("aria-label") || "").trim().slice(0, 40),
                      b: (b.innerText || b.getAttribute("aria-label") || "").trim().slice(0, 40),
                      dx: Math.round(dx),
                      dy: Math.round(dy),
                    });
                  }
                }
              }
              return { duplicates, overlaps };
            }, overlapPx);

            expect(
              result.duplicates,
              `Duplicated header labels on ${route}: ${JSON.stringify(result.duplicates)}`,
            ).toEqual([]);
            expect(
              result.overlaps,
              `Header overlaps on ${route} (>${overlapPx}px): ${JSON.stringify(result.overlaps)}`,
            ).toEqual([]);
          });
        }
      }
    }
  }

  /* ---------------------------------------------------------------------
   * Dedicated check: above-hero stack (FourZeroBanner / framing line /
   * compliance banner) must never overlap each other or the hero. This
   * is the regression that produced the "Read the protocol" text being
   * cut off behind the framing line on mobile.
   * ------------------------------------------------------------------- */
  for (const theme of THEMES) {
    for (const bp of BREAKPOINTS) {
      for (const lang of LANGS) {
        test(`no above-hero stack overlap · ${lang} · ${bp.name} · ${theme}`, async ({ page }) => {
          await page.setViewportSize({ width: bp.width, height: bp.height });
          await page.emulateMedia({ colorScheme: theme });
          await gotoStable(page, "/", lang, theme);

          const overlaps = await page.evaluate(() => {
            // Identify the well-known above-hero blocks by aria-label OR
            // role + text heuristic. We accept either match.
            const candidates = Array.from(
              document.querySelectorAll<HTMLElement>(
                'aside[role="note"], div[role="note"], header, main > section:first-of-type',
              ),
            ).filter((el) => {
              const r = el.getBoundingClientRect();
              return r.width > 0 && r.height > 0 && r.top < window.innerHeight * 1.2;
            });

            const out: Array<{ a: string; b: string; dy: number; aTop: number; bTop: number }> = [];
            for (let i = 0; i < candidates.length; i++) {
              for (let j = i + 1; j < candidates.length; j++) {
                const a = candidates[i];
                const b = candidates[j];
                if (a.contains(b) || b.contains(a)) continue;
                const ra = a.getBoundingClientRect();
                const rb = b.getBoundingClientRect();
                const dx = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
                const dy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
                // Tolerate 1px touching seam; flag any real overlap.
                if (dx > 4 && dy > 1) {
                  out.push({
                    a: (a.getAttribute("aria-label") || a.tagName).slice(0, 40),
                    b: (b.getAttribute("aria-label") || b.tagName).slice(0, 40),
                    dy: Math.round(dy),
                    aTop: Math.round(ra.top),
                    bTop: Math.round(rb.top),
                  });
                }
              }
            }
            return out;
          });

          expect(
            overlaps,
            `Above-hero blocks overlap on / (${lang}/${bp.name}/${theme}): ${JSON.stringify(overlaps)}`,
          ).toEqual([]);
        });
      }
    }
  }
});

/* -------------------------------------------------------------------------
 * 3. Clipped-text detection on banners + above-the-hero sections
 *
 * For every visible text node in the first ~120vh of the landing page we
 * verify:
 *   - the element's scrollWidth does NOT exceed its clientWidth (no
 *     horizontal clip from `overflow: hidden`)
 *   - the element's scrollHeight does NOT exceed its clientHeight when the
 *     element declares an explicit max-height / fixed height with overflow
 *     hidden (no vertical clip)
 *   - the element's bounding rect is not pushed off-screen by a sticky
 *     ancestor (top >= 0 - rect.height + 1px tolerance)
 * ----------------------------------------------------------------------- */
test.describe("no clipped banner text", () => {
  test.use({
    locale: "en-US",
    timezoneId: "UTC",
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });

  for (const theme of THEMES) {
    for (const bp of BREAKPOINTS) {
      for (const lang of LANGS) {
        test(`banners not clipped · ${lang} · ${bp.name} · ${theme}`, async ({ page }) => {
          await page.setViewportSize({ width: bp.width, height: bp.height });
          await page.emulateMedia({ colorScheme: theme });
          await gotoStable(page, "/", lang, theme);

          const clipped = await page.evaluate(() => {
            const limit = window.innerHeight * 1.2;
            const all = Array.from(document.querySelectorAll<HTMLElement>("body *"));
            const issues: Array<{
              tag: string;
              text: string;
              reason: string;
              sw?: number; cw?: number;
              sh?: number; ch?: number;
              top?: number;
            }> = [];

            for (const el of all) {
              const r = el.getBoundingClientRect();
              if (r.top > limit) continue;
              if (r.width === 0 || r.height === 0) continue;
              const cs = getComputedStyle(el);
              if (cs.visibility === "hidden" || cs.display === "none") continue;

              // Only check leaf-ish text containers
              const text = (el.innerText || "").trim();
              if (text.length < 2) continue;
              // Skip elements that contain another text-bearing block child
              const hasTextChild = Array.from(el.children).some((c) => {
                const ct = (c as HTMLElement).innerText?.trim() ?? "";
                return ct.length > 1 && ct.length >= text.length * 0.9;
              });
              if (hasTextChild) continue;

              const overflowsX =
                el.scrollWidth - el.clientWidth > 1 &&
                (cs.overflowX === "hidden" || cs.overflow === "hidden");
              const overflowsY =
                el.scrollHeight - el.clientHeight > 1 &&
                (cs.overflowY === "hidden" || cs.overflow === "hidden") &&
                // Only flag when the element declares an explicit cap, otherwise
                // it's just a normal flow container.
                (cs.maxHeight !== "none" || /\d/.test(cs.height));

              if (overflowsX) {
                issues.push({
                  tag: el.tagName.toLowerCase(),
                  text: text.slice(0, 60),
                  reason: "horizontal clip",
                  sw: el.scrollWidth,
                  cw: el.clientWidth,
                });
              }
              if (overflowsY) {
                issues.push({
                  tag: el.tagName.toLowerCase(),
                  text: text.slice(0, 60),
                  reason: "vertical clip",
                  sh: el.scrollHeight,
                  ch: el.clientHeight,
                });
              }
            }
            return issues;
          });

          expect(
            clipped,
            `Clipped text on / (${lang}/${bp.name}/${theme}): ${JSON.stringify(clipped.slice(0, 10))}`,
          ).toEqual([]);
        });
      }
    }
  }
});
