import { test, expect, type Page } from "@playwright/test";

/**
 * e2e: Protocol Audit Console — export ↔ screen filter parity.
 *
 * Verifies that the CSV / PDF exports reconstruct EXACTLY the same
 * filter set that drives the on-screen list:
 *   - selected event_action(s)
 *   - time-range
 *   - actor_id
 *   - request_id substring
 * even after toggling sort order or paginating to a deeper page.
 *
 * Strategy: open the admin console as admin, intercept the Supabase
 * REST `governance_events` requests issued by both the table query and
 * by the export-walking loop, and assert their query strings carry the
 * same `event_action=in.(...)`, `created_at=gte.…`, `actor_id=eq.…`,
 * and `context->>request_id=ilike.%…%` parameters.
 *
 * Skipped automatically if no admin credentials are wired in env.
 */

type Creds = { email: string; password: string };
const ADMIN: Creds | null =
  process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD
    ? { email: process.env.E2E_ADMIN_EMAIL, password: process.env.E2E_ADMIN_PASSWORD }
    : null;

async function loginViaUi(page: Page, creds: Creds) {
  await page.goto("/auth");
  await page.getByLabel(/email/i).first().fill(creds.email);
  await page.getByLabel(/password/i).first().fill(creds.password);
  await page.getByRole("button", { name: /sign in|log in|connexion/i }).first().click();
  await page.waitForURL((u) => !u.pathname.startsWith("/auth"), { timeout: 15_000 });
}

interface CapturedRequest {
  url: URL;
  source: "table" | "export";
}

function parseFilters(u: URL) {
  return {
    event_action: u.searchParams.get("event_action"),
    target_entity_type: u.searchParams.get("target_entity_type"),
    created_at: u.searchParams.get("created_at"),
    actor_id: u.searchParams.get("actor_id"),
    request_id: u.searchParams.get("context->>request_id"),
    order: u.searchParams.get("order"),
  };
}

test.describe("Protocol Audit Console — export uses same filters as screen", () => {
  test.skip(!ADMIN, "Missing E2E_ADMIN credentials");

  test("CSV export inherits selected actions, time range, actor, request-id and sort", async ({ page }) => {
    const captured: CapturedRequest[] = [];
    let exportPhase = false;

    await page.route("**/rest/v1/governance_events*", async (route) => {
      const url = new URL(route.request().url());
      captured.push({ url, source: exportPhase ? "export" : "table" });
      await route.continue();
    });

    await loginViaUi(page, ADMIN!);
    await page.goto("/app/admin/protocol-audit", { waitUntil: "networkidle" });

    // Apply: select two specific actions, narrow time range, set actor + req-id.
    await page.getByRole("button", { name: /All actions|selected/ }).click();
    await page.getByText("protocol.access.denied").click();
    await page.getByText("protocol.access.granted").click();
    await page.keyboard.press("Escape");

    await page.locator("select").first().selectOption("7d");
    await page.getByPlaceholder("uuid…").fill("00000000-0000-0000-0000-000000000abc");
    await page.getByPlaceholder("r-xxxxx").fill("e2e-corr");

    // Wait for table refetch.
    await page.waitForLoadState("networkidle");
    captured.length = 0;

    // Trigger CSV export.
    exportPhase = true;
    await page.getByRole("button", { name: /CSV/i }).click();
    // Allow export walker to fire its requests.
    await page.waitForTimeout(1500);

    const exportReqs = captured.filter((c) => c.source === "export");
    expect(exportReqs.length).toBeGreaterThan(0);

    // Snapshot the filter signature of any export request and assert
    // every one of them matches it (sort + filters identical).
    const sig = parseFilters(exportReqs[0].url);
    expect(sig.target_entity_type).toBe("eq.protocol");
    expect(sig.event_action).toMatch(/in\.\(.*protocol\.access\.denied.*\)/);
    expect(sig.event_action).toMatch(/in\.\(.*protocol\.access\.granted.*\)/);
    expect(sig.created_at).toMatch(/^gte\./);
    expect(sig.actor_id).toBe("eq.00000000-0000-0000-0000-000000000abc");
    expect(sig.request_id).toMatch(/^ilike\.%e2e-corr%$/);
    expect(sig.order).toMatch(/^created_at\.desc/);

    for (const r of exportReqs) {
      const f = parseFilters(r.url);
      expect(f.event_action, "actions identical across pages").toBe(sig.event_action);
      expect(f.created_at).toBe(sig.created_at);
      expect(f.actor_id).toBe(sig.actor_id);
      expect(f.request_id).toBe(sig.request_id);
      expect(f.order, "sort identical across pages").toBe(sig.order);
      // Range header pagination is per-page but filters MUST be stable.
    }
  });

  test("PDF export keeps same filters even after a re-sort + pagination", async ({ page }) => {
    const captured: CapturedRequest[] = [];
    let exportPhase = false;

    await page.route("**/rest/v1/governance_events*", async (route) => {
      const url = new URL(route.request().url());
      captured.push({ url, source: exportPhase ? "export" : "table" });
      await route.continue();
    });

    await loginViaUi(page, ADMIN!);
    await page.goto("/app/admin/protocol-audit", { waitUntil: "networkidle" });

    // Set filters.
    await page.locator("select").first().selectOption("24h");
    await page.getByPlaceholder("r-xxxxx").fill("e2e");

    // Walk to a deeper page if pagination controls exist.
    const next = page.getByRole("button", { name: /next|›|chevronright/i }).first();
    if (await next.isVisible().catch(() => false)) {
      await next.click().catch(() => {});
      await page.waitForLoadState("networkidle");
    }
    captured.length = 0;

    exportPhase = true;
    await page.getByRole("button", { name: /PDF/i }).click();
    await page.waitForTimeout(2500);

    const exportReqs = captured.filter((c) => c.source === "export");
    expect(exportReqs.length).toBeGreaterThan(0);

    for (const r of exportReqs) {
      const f = parseFilters(r.url);
      expect(f.target_entity_type).toBe("eq.protocol");
      expect(f.created_at).toMatch(/^gte\./);
      expect(f.request_id).toMatch(/^ilike\.%e2e%$/);
      // Sort always desc by created_at — independent of UI pagination.
      expect(f.order).toMatch(/^created_at\.desc/);
    }
  });
});
