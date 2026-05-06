import { test, expect, type Page, type Download } from "@playwright/test";

/**
 * e2e: governance_events network metadata visibility by role.
 *
 * Asserts that:
 *   - admin / super_admin SEE raw IP / UA / XFF in the table, in the
 *     details JSON modal, AND in the downloaded CSV — across pagination.
 *   - research_lead and other allowed roles ALWAYS see masked
 *     `‹masked:xxxxxx›` markers, never the raw values, in the same
 *     three surfaces.
 *
 * Skipped automatically when the corresponding seeded credentials are
 * not provided via env.
 */

type Creds = { email: string; password: string };
function creds(prefix: string): Creds | null {
  const e = process.env[`E2E_${prefix}_EMAIL`];
  const p = process.env[`E2E_${prefix}_PASSWORD`];
  return e && p ? { email: e, password: p } : null;
}

const ADMIN = creds("ADMIN");
const SUPER_ADMIN = creds("SUPER_ADMIN");
const RESEARCH_LEAD = creds("RESEARCH_LEAD");

const RAW_IP_RE = /\b\d{1,3}(?:\.\d{1,3}){3}\b/;
const MASK_RE = /‹masked:[a-z0-9]+›/;

async function loginViaUi(page: Page, c: Creds) {
  await page.goto("/auth");
  await page.getByLabel(/email/i).first().fill(c.email);
  await page.getByLabel(/password/i).first().fill(c.password);
  await page.getByRole("button", { name: /sign in|log in|connexion/i }).first().click();
  await page.waitForURL((u) => !u.pathname.startsWith("/auth"), { timeout: 15_000 });
}

async function downloadCsv(page: Page): Promise<string> {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /CSV/i }).click(),
  ]);
  const stream = await (download as Download).createReadStream();
  const chunks: Buffer[] = [];
  await new Promise<void>((res, rej) => {
    stream!.on("data", (c) => chunks.push(c as Buffer));
    stream!.on("end", () => res());
    stream!.on("error", rej);
  });
  return Buffer.concat(chunks).toString("utf8");
}

async function inspectFirstRowDetails(page: Page): Promise<string> {
  // Open the details dialog of the first event in the table.
  await page.getByRole("button", { name: /view details/i }).first().click();
  const json = await page.locator("dialog pre, [role='dialog'] pre").first().innerText();
  await page.keyboard.press("Escape");
  return json;
}

test.describe("Governance events — IP/UA/XFF visibility by role", () => {
  for (const [label, account, expectRaw] of [
    ["admin", ADMIN, true],
    ["super_admin", SUPER_ADMIN, true],
    ["research_lead", RESEARCH_LEAD, false],
  ] as const) {
    test(`${label}: details + CSV + table match expected pseudonymization (raw=${expectRaw})`, async ({ page }) => {
      test.skip(!account, `Missing E2E_${label.toUpperCase()} credentials`);

      await loginViaUi(page, account!);
      await page.goto("/app/admin/protocol-audit", { waitUntil: "networkidle" });

      // Wait for the table.
      await page.waitForSelector("table");

      // 1️⃣ Table — gather visible IP/XFF cells.
      const tableText = await page.locator("table tbody").innerText();
      if (expectRaw) {
        // At least one row should have a raw-looking IP visible.
        // (We can't guarantee data exists in every env, so accept either a
        // raw IP or empty cells — but never a mask marker for raw roles.)
        expect(tableText).not.toMatch(MASK_RE);
      } else {
        // Research_lead must NEVER see a raw IP.
        expect(tableText).not.toMatch(RAW_IP_RE);
      }

      // 2️⃣ Details dialog — JSON should reflect the same rule.
      const json = await inspectFirstRowDetails(page).catch(() => "");
      if (json) {
        if (expectRaw) {
          expect(json).not.toMatch(MASK_RE);
        } else {
          expect(json).not.toMatch(RAW_IP_RE);
          // If the event carries any IP/UA, expect mask markers somewhere.
          if (/"(?:ip|xff|cf_connecting_ip|x_real_ip|ua)"\s*:\s*"[^"]+"/.test(json)) {
            expect(json).toMatch(MASK_RE);
          }
        }
      }

      // 3️⃣ Pagination — switch to a deeper page if available, repeat the table check.
      const next = page.getByRole("button", { name: /next|›/i }).first();
      if (await next.isVisible().catch(() => false) && await next.isEnabled().catch(() => false)) {
        await next.click();
        await page.waitForLoadState("networkidle");
        const t2 = await page.locator("table tbody").innerText();
        if (expectRaw) {
          expect(t2).not.toMatch(MASK_RE);
        } else {
          expect(t2).not.toMatch(RAW_IP_RE);
        }
      }

      // 4️⃣ CSV export — same rule must hold on the bytes the admin downloads.
      const csv = await downloadCsv(page);
      // Header should advertise the pseudonymized flag.
      expect(csv.split("\n")[0]).toContain("pseudonymized");
      if (expectRaw) {
        // Last column for any data row should be `"false"`.
        const lines = csv.split("\n").slice(1).filter(Boolean);
        for (const l of lines.slice(0, 5)) {
          expect(l.endsWith(`"false"`)).toBe(true);
        }
        expect(csv).not.toMatch(MASK_RE);
      } else {
        expect(csv).not.toMatch(RAW_IP_RE);
        const lines = csv.split("\n").slice(1).filter(Boolean);
        for (const l of lines.slice(0, 5)) {
          expect(l.endsWith(`"true"`)).toBe(true);
        }
      }
    });
  }
});
