import { test, expect, type Page } from "@playwright/test";

/**
 * Role-based e2e for /protocol audit panels and the protocol-access-guard
 * edge function. Validates:
 *  - admin & research_lead can see internal audit panels and call the
 *    guard for exports successfully (200 + role echoed).
 *  - other authenticated roles get a 403 with X-Request-Id, but the
 *    same client-issued correlation id round-trips back to them.
 *
 * NOTE: Requires three test accounts seeded in the target environment
 * with roles `admin`, `research_lead`, `physician`. Provide their
 * credentials via env vars; tests are skipped if missing.
 */

const PROJECT_ID = process.env.VITE_SUPABASE_PROJECT_ID ?? "julrbfxpmrysodtnvizb";
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;
const FN_URL = `${SUPABASE_URL}/functions/v1/protocol-access-guard`;
const ANON = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

type Creds = { email: string; password: string };

const ACCOUNTS: Record<"admin" | "research_lead" | "physician", Creds | null> = {
  admin: process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD
    ? { email: process.env.E2E_ADMIN_EMAIL, password: process.env.E2E_ADMIN_PASSWORD } : null,
  research_lead: process.env.E2E_RESEARCH_LEAD_EMAIL && process.env.E2E_RESEARCH_LEAD_PASSWORD
    ? { email: process.env.E2E_RESEARCH_LEAD_EMAIL, password: process.env.E2E_RESEARCH_LEAD_PASSWORD } : null,
  physician: process.env.E2E_PHYSICIAN_EMAIL && process.env.E2E_PHYSICIAN_PASSWORD
    ? { email: process.env.E2E_PHYSICIAN_EMAIL, password: process.env.E2E_PHYSICIAN_PASSWORD } : null,
};

async function getJwt(creds: Creds): Promise<string> {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: ANON, Authorization: `Bearer ${ANON}` },
    body: JSON.stringify({ email: creds.email, password: creds.password }),
  });
  const body = await r.json();
  if (!r.ok || !body.access_token) throw new Error(`auth failed: ${JSON.stringify(body)}`);
  return body.access_token as string;
}

async function loginViaUi(page: Page, creds: Creds) {
  await page.goto("/auth");
  await page.getByLabel(/email/i).first().fill(creds.email);
  await page.getByLabel(/password/i).first().fill(creds.password);
  await page.getByRole("button", { name: /sign in|log in|connexion/i }).first().click();
  await page.waitForURL((u) => !u.pathname.startsWith("/auth"), { timeout: 15_000 });
}

test.describe("Protocol guard — role-based access", () => {
  for (const role of ["admin", "research_lead"] as const) {
    test(`${role}: guard returns 200 for view + exports`, async () => {
      test.skip(!ACCOUNTS[role] || !ANON, `Missing E2E credentials for ${role}`);
      const jwt = await getJwt(ACCOUNTS[role]!);
      const reqId = `e2e-${role}-${Date.now()}`;
      for (const action of [
        "protocol.view",
        "protocol.export.compliance.json",
        "protocol.export.audit_log.csv",
        "protocol.export.audit_log.pdf",
      ]) {
        const r = await fetch(FN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: ANON,
            Authorization: `Bearer ${jwt}`,
            "x-request-id": reqId,
          },
          body: JSON.stringify({ action }),
        });
        const body = await r.json();
        expect(r.status, `${role} ${action}`).toBe(200);
        expect(body.ok).toBe(true);
        expect([role, "admin", "super_admin", "research_lead"]).toContain(body.role);
        // Server echoes back the request-id we sent.
        expect(body.request_id).toBe(reqId);
        expect(r.headers.get("x-request-id")).toBe(reqId);
        // Cache must never be reusable between users.
        expect(r.headers.get("cache-control") ?? "").toMatch(/no-store|private/i);
      }
    });
  }

  test("physician: guard returns 403 with same X-Request-Id", async () => {
    test.skip(!ACCOUNTS.physician || !ANON, "Missing physician credentials");
    const jwt = await getJwt(ACCOUNTS.physician!);
    const reqId = `e2e-physician-${Date.now()}`;
    const r = await fetch(FN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: ANON,
        Authorization: `Bearer ${jwt}`,
        "x-request-id": reqId,
      },
      body: JSON.stringify({ action: "protocol.export.audit_log.csv" }),
    });
    const body = await r.json();
    expect(r.status).toBe(403);
    expect(body.error).toMatch(/forbidden/i);
    expect(body.request_id).toBe(reqId);
    expect(r.headers.get("x-request-id")).toBe(reqId);
  });

  test("admin sees internal audit panels on /protocol", async ({ page }) => {
    test.skip(!ACCOUNTS.admin, "Missing admin credentials");
    await loginViaUi(page, ACCOUNTS.admin!);
    await page.goto("/protocol", { waitUntil: "networkidle" });
    await expect(page.locator("[id='compliance-badge-title']")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("[id='protocol-completeness-title']")).toBeVisible();
    await expect(page.locator("[id='protocol-audit-log-title']")).toBeVisible();
  });

  test("physician does NOT see audit panels on /protocol", async ({ page }) => {
    test.skip(!ACCOUNTS.physician, "Missing physician credentials");
    await loginViaUi(page, ACCOUNTS.physician!);
    await page.goto("/protocol", { waitUntil: "networkidle" });
    await expect(page.locator("[id='compliance-badge-title']")).toHaveCount(0);
    await expect(page.locator("[id='protocol-completeness-title']")).toHaveCount(0);
    await expect(page.locator("[id='protocol-audit-log-title']")).toHaveCount(0);
  });
});
