import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for hero-neon visual + behavioural regression.
 *
 * Run locally:
 *   npx playwright install            # one-time browser download
 *   npm run dev                       # in another terminal
 *   npx playwright test
 *
 * Browsers cover Chrome (chromium), Firefox and Safari (webkit) — the
 * three engines whose -webkit-text-stroke / drop-shadow rasterization
 * differ enough to require dedicated coverage.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
