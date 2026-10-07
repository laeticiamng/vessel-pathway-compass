import { test, expect, type Page } from "@playwright/test";

/**
 * Focused responsive non-regression suite for the landing header.
 *
 * Verifies, for every supported viewport × locale × zoom:
 *   - VASCU-LINK never wraps and never clips.
 *   - The burger menu trigger and the inline desktop nav switch
 *     EXACTLY at the `xl` breakpoint (1280 CSS px).
 *   - The "AquaMR Flow Platform" subtitle is only visible at `2xl`+.
 *   - The brand wordmark never overlaps the nav / burger.
 *
 * Pairs with `src/lib/breakpoints.ts` (single source of truth) and the
 * manual checklist in `docs/responsive-acceptance-checklist.md`.
 */

// Contrat aligné sur src/lib/breakpoints.ts : nav inline à partir de `xl`
// (1280 px), sous-titre de marque à partir de `2xl` (1536 px). À `lg`
// (1024 px) la nav inline FR écrasait le wordmark VASCU-LINK à 0 px.
const LG = 1024;
const XL = 1280;
const XXL = 1536;

const LANGS = ["en", "fr", "de"] as const;

/** home.nav.openMenu dans src/i18n/{en,fr,de}.ts */
const OPEN_MENU_LABEL: Record<string, string> = {
  en: "Open menu",
  fr: "Ouvrir le menu",
  de: "Menü öffnen",
};

const VIEWPORTS = [
  { name: "mobile-xxs", w: 280, h: 653, expect: "burger", subtitle: false },
  { name: "mobile-xs", w: 320, h: 568, expect: "burger", subtitle: false },
  { name: "mobile", w: 390, h: 844, expect: "burger", subtitle: false },
  { name: "tablet", w: 834, h: 1112, expect: "burger", subtitle: false },
  { name: "lg-minus-1", w: LG - 1, h: 768, expect: "burger", subtitle: false },
  // lg (1024) : encore le burger, la nav inline n'y tient pas en FR/DE
  { name: "lg", w: LG, h: 768, expect: "burger", subtitle: false },
  // Just below xl -> burger
  { name: "xl-minus-1", w: XL - 1, h: 768, expect: "burger", subtitle: false },
  // Exactly at xl -> inline nav, no subtitle yet
  { name: "xl", w: XL, h: 800, expect: "inline", subtitle: false },
  { name: "desktop", w: 1366, h: 768, expect: "inline", subtitle: false },
  // Just below 2xl -> still inline, still no subtitle
  { name: "2xl-minus-1", w: XXL - 1, h: 864, expect: "inline", subtitle: false },
  // At 2xl -> inline + subtitle
  { name: "2xl", w: XXL, h: 864, expect: "inline", subtitle: true },
  { name: "desktop-xl", w: 1920, h: 1080, expect: "inline", subtitle: true },
] as const;

async function setLang(page: Page, lang: string) {
  // addInitScript et non page.evaluate : appelé avant le premier goto, un
  // evaluate s'exécute sur about:blank où localStorage lève une exception
  // (avalée par le try/catch) — la langue n'était donc jamais appliquée et
  // les cas « fr » / « de » testaient en réalité l'anglais.
  await page.addInitScript((l) => {
    try {
      localStorage.setItem("aquamr-flow-lang", l);
      localStorage.setItem("language", l);
    } catch {}
  }, lang);
}

async function gotoLanding(page: Page, lang: string) {
  await setLang(page, lang);
  await page.goto("/", { waitUntil: "networkidle" });
  // Sur la landing, <header> ne contient qu'une <nav> en position fixed : sa
  // boîte fait 0 px de haut et Playwright ne la considère jamais « visible ».
  // On attend donc la barre de navigation réellement affichée.
  await page.locator("header nav").first().waitFor({ state: "visible" });
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation: none !important; transition: none !important;
    }`,
  });
  // La langue demandée est réellement appliquée (libellé localisé du burger).
  await expect(page.locator('header button[aria-haspopup="dialog"]').first()).toHaveAttribute(
    "aria-label",
    OPEN_MENU_LABEL[lang],
  );
  // Wait for i18n hydration: header text should not contain dotted keys.
  await page.waitForFunction(() => {
    const h = document.querySelector("header");
    if (!h) return false;
    const txt = (h.textContent || "").trim();
    return txt.length > 2 && !/\b[a-z]+\.[a-z][a-zA-Z0-9_.-]+\b/.test(txt);
  }, { timeout: 10_000 });
}

test.describe("landing header — responsive non-regression", () => {
  test.use({ locale: "en-US", timezoneId: "UTC", contextOptions: { reducedMotion: "reduce" } });

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
          // Déclencheur du Sheet (aria-haspopup="dialog") : le libellé
          // localisé « Menü öffnen » ne contient pas « enu », l'ancien
          // sélecteur ne trouvait donc jamais le burger en allemand.
          const burger = header.querySelector<HTMLElement>(
            'button[aria-haspopup="dialog"]',
          );
          const inlineNavLinks = Array.from(
            header.querySelectorAll<HTMLElement>("div.hidden.xl\\:flex a"),
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
        'header button[aria-haspopup="dialog"]',
      );
      if (!b) return false;
      const r = b.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
    expect(burgerVisible).toBe(true);
  });
});

/**
 * Hero : aucun titre / paragraphe / CTA ne déborde de l'écran.
 *
 * Remplace en conditions réelles les « plafonds de longueur » approximatifs
 * de src/i18n/__tests__/home-snapshot.test.tsx : avant correction, le CTA
 * secondaire allemand (410 px) dépassait l'écran à 390 px et le titre DE
 * (« Entscheidungsunterstützungs-Plattform ») sortait de son conteneur.
 */
test.describe("landing hero — pas de débordement de texte", () => {
  test.use({ locale: "en-US", timezoneId: "UTC", contextOptions: { reducedMotion: "reduce" } });

  const HERO_WIDTHS = [280, 320, 390, 834, 1024, 1280] as const;

  for (const lang of LANGS) {
    for (const w of HERO_WIDTHS) {
      test(`hero sans débordement @ ${w}px · ${lang}`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: 800 });
        await gotoLanding(page, lang);

        const overflows = await page.evaluate(() => {
          const h1 = document.querySelector("h1");
          const hero = h1?.closest("section");
          if (!hero) return ["section hero introuvable"];
          const vw = document.documentElement.clientWidth;
          const out: string[] = [];
          for (const el of hero.querySelectorAll<HTMLElement>("a, button, span, li, p, h1")) {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) continue;
            const label = (el.innerText || "").trim().slice(0, 50);
            if (r.left < -1 || r.right > vw + 1) {
              out.push(`${el.tagName} « ${label} » hors écran (${Math.round(r.left)}→${Math.round(r.right)} / ${vw})`);
            } else if (el.scrollWidth - el.clientWidth > 1) {
              out.push(`${el.tagName} « ${label} » déborde de sa boîte (${el.scrollWidth} > ${el.clientWidth})`);
            }
          }
          return out;
        });

        expect(overflows, overflows.join("\n")).toEqual([]);
      });
    }
  }
});
