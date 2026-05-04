import { test, expect, type Page } from "@playwright/test";

/**
 * T12 — Methodology / SAP / Incidental findings / DMP pages must:
 *  - Load with HTTP 200 and show the H1 in EN/FR/DE
 *  - Expose a canonical link matching the route
 *  - Be reachable from the public footer in all three languages
 */

const T12_PAGES = [
  { path: "/methodology", titleRe: /Methodology|Méthodologie|Methodik/i, footer: { en: "Methodology", fr: "Methodology", de: "Methodology" } },
  { path: "/sap", titleRe: /Statistical Analysis Plan/i, footer: { en: "SAP", fr: "SAP", de: "SAP" } },
  { path: "/data-management-plan", titleRe: /Data Management Plan|Plan de gestion|Datenmanagement/i, footer: { en: "DMP (FAIR)", fr: "DMP (FAIR)", de: "DMP (FAIR)" } },
  { path: "/incidental-findings", titleRe: /Incidental findings|découvertes fortuites|Zufallsbefund/i, footer: { en: "Incidental findings", fr: "Incidental findings", de: "Incidental findings" } },
];

const LANGS = ["en", "fr", "de"] as const;
type Lang = typeof LANGS[number];

async function setLang(page: Page, lang: Lang) {
  await page.addInitScript((l) => {
    try { localStorage.setItem("aquamr-flow-lang", l); } catch { /* ignore */ }
  }, lang);
}

test.describe("T12 pages — load + SEO", () => {
  for (const p of T12_PAGES) {
    test(`${p.path} renders an H1 and a canonical link`, async ({ page }) => {
      const resp = await page.goto(p.path);
      expect(resp?.status()).toBeLessThan(400);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("h1")).toContainText(p.titleRe);

      const canonical = page.locator('link[rel="canonical"]');
      await expect(canonical).toHaveAttribute(
        "href",
        new RegExp(`${p.path}$`)
      );

      const ld = page.locator('script[type="application/ld+json"]').first();
      const json = await ld.textContent();
      expect(json && JSON.parse(json)["@type"]).toBeTruthy();
    });
  }
});

test.describe("T12 pages — footer navigation across EN/FR/DE", () => {
  for (const lang of LANGS) {
    for (const p of T12_PAGES) {
      test(`[${lang}] footer link to ${p.path} navigates correctly`, async ({ page }) => {
        await setLang(page, lang);
        await page.goto("/");
        // Scroll to footer to make sure it's in view
        await page.locator("footer").scrollIntoViewIfNeeded();
        const link = page
          .locator("footer")
          .getByRole("link", { name: p.footer[lang], exact: false })
          .first();
        await expect(link).toBeVisible();
        await link.click();
        await expect(page).toHaveURL(new RegExp(`${p.path}$`));
        await expect(page.locator("h1")).toBeVisible();
      });
    }
  }
});

test.describe("Compliance banner", () => {
  test("compliance banner links to /methodology", async ({ page }) => {
    await page.goto("/");
    const banner = page.getByRole("link", { name: /compliance|conformité|Compliance-/i }).first();
    await expect(banner).toBeVisible();
    await banner.click();
    await expect(page).toHaveURL(/\/methodology$/);
  });
});
