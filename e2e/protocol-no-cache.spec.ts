import { test, expect, type Route } from "@playwright/test";

/**
 * /protocol must never serve internal-audit data through any cache layer
 * (CDN, proxy, browser bfcache) for unauthorized users.
 *
 * This spec simulates:
 *  - First visit (anonymous) — must NOT contain audit DOM markers.
 *  - Multiple refreshes — payload must remain identical (no cache-leaked
 *    snapshot from a privileged hit).
 *  - A request via a forged "CDN proxy" by adding caching headers on the
 *    request side and inspecting the HTML response.
 *  - The protocol-access-guard endpoint must respond 401 for anonymous
 *    callers and never include audit data in its body.
 */

const PROJECT_ID = process.env.VITE_SUPABASE_PROJECT_ID ?? "julrbfxpmrysodtnvizb";
const FN_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/protocol-access-guard`;

test.describe("/protocol — anti-cache leak", () => {
  test("anonymous visit shows no internal audit markers", async ({ page }) => {
    const resp = await page.goto("/protocol", { waitUntil: "networkidle" });
    expect(resp?.status()).toBeLessThan(400);

    // None of the audit-only test ids / aria labels must appear.
    await expect(page.locator("[data-testid='compliance-badge-skeleton']")).toHaveCount(0);
    await expect(page.locator("[data-testid='audit-log-skeleton']")).toHaveCount(0);
    await expect(page.locator("[data-testid='completeness-skeleton']")).toHaveCount(0);
    await expect(page.locator("text=protocol.compliance.snapshot")).toHaveCount(0);
    await expect(page.locator("text=Export CSV")).toHaveCount(0);
    await expect(page.locator("text=Export PDF")).toHaveCount(0);
  });

  test("repeated refreshes never leak audit data", async ({ page }) => {
    const sigs: string[] = [];
    for (let i = 0; i < 5; i++) {
      await page.goto("/protocol", { waitUntil: "networkidle" });
      const html = await page.content();
      // Capture a fingerprint of audit-related substrings if any
      const sig = [
        html.includes("compliance-badge-title"),
        html.includes("protocol-audit-log-title"),
        html.includes("protocol-completeness-title"),
        html.includes("vasculink-protocol-audit-"),
      ].join(",");
      sigs.push(sig);
    }
    // All five refreshes must be identical AND audit markers absent.
    expect(new Set(sigs).size).toBe(1);
    expect(sigs[0]).toBe("false,false,false,false");
  });

  test("CDN/proxy-style cached request still excludes audit data", async ({ page }) => {
    // Force the browser to send proxy-style caching headers as if behind
    // a CDN edge, and ensure the response body never contains audit DOM.
    await page.route("**/protocol*", async (route: Route) => {
      const headers = {
        ...route.request().headers(),
        "cache-control": "public, max-age=31536000",
        "x-forwarded-for": "203.0.113.10",
        "x-forwarded-proto": "https",
        "via": "1.1 fake-cdn-edge",
      };
      await route.continue({ headers });
    });

    const resp = await page.goto("/protocol", { waitUntil: "networkidle" });
    expect(resp?.status()).toBeLessThan(400);

    const html = await page.content();
    expect(html).not.toContain("compliance-badge-title");
    expect(html).not.toContain("protocol-audit-log-title");
    expect(html).not.toContain("protocol-completeness-title");
  });

  test("CSP + cache meta tags are present on /protocol", async ({ page }) => {
    await page.goto("/protocol");
    const csp = page.locator('meta[http-equiv="Content-Security-Policy"]');
    await expect(csp).toHaveCount(1);
    const cspContent = await csp.getAttribute("content");
    expect(cspContent).toContain("default-src 'self'");
    expect(cspContent).toContain("object-src 'none'");

    await expect(page.locator('meta[http-equiv="X-Content-Type-Options"]')).toHaveCount(1);
    await expect(page.locator('meta[http-equiv="Referrer-Policy"]')).toHaveCount(1);
  });

  test("protocol-access-guard refuses anonymous callers (401) without leaking audit data", async ({ request }) => {
    const resp = await request.post(FN_URL, {
      data: { action: "protocol.view" },
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    });
    // Must NOT be 200 — server-side guard requires a JWT
    expect([401, 403]).toContain(resp.status());

    // Cache-Control on the response must forbid intermediaries from caching.
    const cc = resp.headers()["cache-control"] ?? "";
    expect(cc).toMatch(/no-store|no-cache|private/i);

    const body = await resp.text();
    // Body must NOT contain any audit data — only an error envelope.
    expect(body).not.toContain("compliance");
    expect(body).not.toContain("audit_log");
    expect(body).not.toContain("evidence");
  });

  test("protocol-access-guard refuses unsupported actions with 400 + request-id", async ({ request }) => {
    const resp = await request.post(FN_URL, {
      data: { action: "protocol.evil.dump" },
      headers: {
        "Content-Type": "application/json",
        // Even with a fake bearer, action validation should still fire as 401 first.
        "Authorization": "Bearer not-a-real-token",
      },
      failOnStatusCode: false,
    });
    // Either 401 (invalid jwt) or 400 (bad action) — never 200, never 5xx.
    expect([400, 401]).toContain(resp.status());
    const reqId = resp.headers()["x-request-id"];
    expect(reqId, "every guard response must carry a request-id").toBeTruthy();
  });
});
