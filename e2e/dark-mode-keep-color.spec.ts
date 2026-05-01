import { test, expect, type Page } from "@playwright/test";

/**
 * `data-neon-keep-color` opt-out contract.
 *
 * Brand assets (logos, charts, photographs) marked with the
 * `data-neon-keep-color` attribute MUST NEVER be tinted by the
 * dark-mode illustration filter — neither when placed inside a
 * `.neon-icon-ring` (cyan or violet) nor when standalone elsewhere
 * in the document.
 *
 * Covers PNG (`<img>`) AND inline SVG, on Chrome / Firefox / WebKit.
 */

async function enableDarkMode(page: Page) {
  await page.addInitScript(() => {
    try { localStorage.setItem("theme", "dark"); } catch { /* ignore */ }
  });
  await page.emulateMedia({ colorScheme: "dark" });
}

const FIXTURE = `
  <html class="dark"><body style="background:#000;padding:24px;">
    <div class="neon-icon-ring" style="height:40px;width:40px;display:inline-flex;align-items:center;justify-content:center;">
      <img id="png-keep" data-neon-keep-color
           src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEX/AAAZ4gk3AAAAAXRSTlPM0jRW/QAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII="
           alt="" style="width:24px;height:24px;" />
    </div>
    <div class="neon-icon-ring violet" style="height:40px;width:40px;display:inline-flex;align-items:center;justify-content:center;">
      <svg id="svg-keep-ring" data-neon-illustration data-neon-keep-color
           xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
        <rect x="2" y="2" width="20" height="20" fill="#ff00ff"/>
      </svg>
    </div>
    <img id="png-tinted" data-neon-illustration
         src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEX/AAAZ4gk3AAAAAXRSTlPM0jRW/QAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII="
         alt="" style="width:24px;height:24px;" />
    <img id="png-keep-loose" data-neon-illustration data-neon-keep-color
         src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAAA1BMVEX/AAAZ4gk3AAAAAXRSTlPM0jRW/QAAAApJREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII="
         alt="" style="width:24px;height:24px;" />
    <svg id="svg-keep-loose" data-neon-illustration data-neon-keep-color
         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
      <rect x="2" y="2" width="20" height="20" fill="#00ff00"/>
    </svg>
  </body></html>
`;

test.describe("data-neon-keep-color — exempt from dark-mode tint", () => {
  test.beforeEach(async ({ page }) => {
    await enableDarkMode(page);
    // Visit the real app so the production stylesheet is applied,
    // then inject our fixture nodes inside <body>.
    await page.goto("/");
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.evaluate((html) => {
      const wrap = document.createElement("div");
      wrap.id = "keep-color-fixture";
      wrap.innerHTML = html;
      document.body.appendChild(wrap);
    }, FIXTURE);
  });

  for (const id of ["png-keep", "svg-keep-ring", "png-keep-loose", "svg-keep-loose"]) {
    test(`#${id} has no filter applied`, async ({ page }) => {
      const filter = await page.locator(`#${id}`).evaluate(
        (el) => getComputedStyle(el).filter,
      );
      // `none` is the canonical "untouched" computed value across engines.
      expect(filter).toBe("none");
    });
  }

  test("control: untagged tinted PNG DOES get the filter (sanity check)", async ({
    page,
  }) => {
    const filter = await page.locator("#png-tinted").evaluate(
      (el) => getComputedStyle(el).filter,
    );
    // The cyan tint contains `invert()` — this is what we DON'T want on
    // keep-color nodes but DO want on tagged illustrations.
    expect(filter).not.toBe("none");
    expect(filter).toMatch(/invert/);
  });
});
