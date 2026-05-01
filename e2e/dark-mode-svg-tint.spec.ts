import { test, expect, type Page } from "@playwright/test";

/**
 * Cross-browser visual contract for `data-neon-illustration` SVGs in
 * dark mode. Verifies that:
 *
 *   • Inline SVGs marked with `data-neon-illustration` receive the
 *     cyan tint filter (or violet via `data-neon-tone="violet"`).
 *   • The tint output is stable per engine (chromium / firefox /
 *     webkit baselines auto-suffixed by Playwright).
 *   • Lucide-style themed SVGs (no marker) stay untouched — already
 *     covered by `dark-mode-icons.spec.ts`, asserted again here as a
 *     control to prevent drift.
 */

async function enableDarkMode(page: Page) {
  await page.addInitScript(() => {
    try { localStorage.setItem("theme", "dark"); } catch { /* ignore */ }
  });
  await page.emulateMedia({ colorScheme: "dark" });
}

const SVG_FIXTURE = `
  <div id="svg-tint-fixture" style="display:flex;gap:16px;padding:24px;background:#0a0a0f;">
    <svg id="svg-cyan" data-neon-illustration
         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
      <circle cx="24" cy="24" r="20" fill="#fff"/>
      <path d="M14 24l8 8 14-16" stroke="#000" stroke-width="3" fill="none"/>
    </svg>
    <svg id="svg-violet" data-neon-illustration data-neon-tone="violet"
         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
      <rect x="6" y="6" width="36" height="36" rx="6" fill="#fff"/>
      <path d="M16 24h16M24 16v16" stroke="#000" stroke-width="3"/>
    </svg>
    <svg id="svg-lucide-control"
         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48"
         fill="none" stroke="currentColor" stroke-width="2" style="color:#7be9ff;">
      <circle cx="12" cy="12" r="10"/>
    </svg>
  </div>
`;

test.describe("data-neon-illustration SVG tint — cross-browser", () => {
  test.beforeEach(async ({ page }) => {
    await enableDarkMode(page);
    await page.goto("/");
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.evaluate((html) => {
      const wrap = document.createElement("div");
      wrap.innerHTML = html;
      document.body.appendChild(wrap);
    }, SVG_FIXTURE);
  });

  test("cyan illustration SVG carries the tint filter", async ({ page }) => {
    const filter = await page.locator("#svg-cyan").evaluate(
      (el) => getComputedStyle(el).filter,
    );
    expect(filter).not.toBe("none");
    expect(filter).toMatch(/invert/);
    // Token uses `hue-rotate(155deg)` for cyan — guards against accidental
    // swap with the violet token (232deg).
    expect(filter).toMatch(/hue-rotate\(155deg\)/);
  });

  test("violet illustration SVG uses the violet hue-rotate", async ({
    page,
  }) => {
    const filter = await page.locator("#svg-violet").evaluate(
      (el) => getComputedStyle(el).filter,
    );
    expect(filter).not.toBe("none");
    expect(filter).toMatch(/hue-rotate\(232deg\)/);
  });

  test("control: themed Lucide SVG without marker is untouched", async ({
    page,
  }) => {
    const filter = await page.locator("#svg-lucide-control").evaluate(
      (el) => getComputedStyle(el).filter,
    );
    expect(filter).toBe("none");
  });

  test("snapshot of tinted SVG row is stable per browser", async ({
    page,
  }, testInfo) => {
    const fixture = page.locator("#svg-tint-fixture");
    expect(await fixture.screenshot()).toMatchSnapshot(
      `svg-tint-${testInfo.project.name}.png`,
      { maxDiffPixelRatio: 0.03 },
    );
  });
});
