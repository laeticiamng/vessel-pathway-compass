import { test, expect, type Page } from "@playwright/test";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

/**
 * Verifies the /audit-limitations PDF export contains, for each locale:
 *   - the localized table-of-contents heading
 *   - the content version + "last updated" date line
 *   - the localized "compliance-ready disclaimers" header
 *   - at least one explicit "no regulatory promise" denial token
 *
 * The PDF is generated client-side via jsPDF; we capture the download,
 * extract its text with `pdftotext` (poppler) and assert against the
 * expected locale-specific markers.
 */

type Locale = "en" | "fr" | "de";

interface Markers {
  toc: RegExp;
  versionLine: RegExp;
  disclaimerHeader: RegExp;
  denial: RegExp;
}

const MARKERS: Record<Locale, Markers> = {
  en: {
    toc: /Table of contents/i,
    versionLine: /Content version\s+\d+\.\d+\.\d+\s+—\s+last updated\s+\d{4}-\d{2}-\d{2}/i,
    disclaimerHeader: /Compliance-ready disclaimers/i,
    denial: /\b(NOT|NO)\b/,
  },
  fr: {
    toc: /Sommaire/i,
    versionLine: /Version du contenu\s+\d+\.\d+\.\d+\s+—\s+derni[èe]re mise à jour\s+\d{4}-\d{2}-\d{2}/i,
    disclaimerHeader: /Mentions\s+«?\s*compliance-ready/i,
    denial: /\b(PAS|AUCUNE?|N'EST PAS)\b/,
  },
  de: {
    toc: /Inhaltsverzeichnis/i,
    versionLine: /Inhaltsversion\s+\d+\.\d+\.\d+\s+—\s+zuletzt aktualisiert\s+\d{4}-\d{2}-\d{2}/i,
    disclaimerHeader: /Compliance-ready Hinweise/i,
    denial: /\b(KEIN|KEINE|NICHT)\b/,
  },
};

async function setLocale(page: Page, locale: Locale) {
  await page.addInitScript((l) => {
    window.localStorage.setItem("aquamr-flow-lang", l);
  }, locale);
}

async function pdfText(buf: Buffer): Promise<string> {
  const tmp = path.join(os.tmpdir(), `vascu-audit-${Date.now()}-${Math.random()}.pdf`);
  fs.writeFileSync(tmp, buf);
  try {
    return execSync(`pdftotext -layout "${tmp}" -`, { encoding: "utf8" });
  } finally {
    try { fs.unlinkSync(tmp); } catch { /* noop */ }
  }
}

for (const locale of ["en", "fr", "de"] as const) {
  test.describe(`Audit & Limitations PDF export — ${locale}`, () => {
    test(`contains TOC, version date and compliance-ready disclaimers (${locale})`, async ({ page }) => {
      await setLocale(page, locale);
      await page.goto("/audit-limitations");

      const button = page.getByTestId("audit-pdf-export");
      await expect(button).toBeVisible();

      const [download] = await Promise.all([
        page.waitForEvent("download"),
        button.click(),
      ]);

      const suggested = download.suggestedFilename();
      expect(suggested.toLowerCase()).toContain("vascu-link");
      // Version stamp + ISO date in filename.
      expect(suggested).toMatch(/v\d+\.\d+\.\d+/);
      expect(suggested).toMatch(/\d{4}-\d{2}-\d{2}\.pdf$/);

      const tmpPath = await download.path();
      expect(tmpPath, "download path").toBeTruthy();
      const buf = fs.readFileSync(tmpPath!);
      const text = await pdfText(buf);

      const m = MARKERS[locale];
      expect(text, "TOC heading").toMatch(m.toc);
      expect(text, "version line").toMatch(m.versionLine);
      expect(text, "disclaimer header").toMatch(m.disclaimerHeader);
      expect(text, "explicit denial token").toMatch(m.denial);

      // Hard guards: never affirm HIPAA / FDA / CE-mark / USD pricing.
      const lines = text.split("\n");
      for (const line of lines) {
        if (/HIPAA|FDA/.test(line)) {
          expect(
            /\b(NO|NOT|PAS|AUCUNE?|KEIN|KEINE|NICHT|N'EST PAS)\b/i.test(line),
            `affirmative HIPAA/FDA claim in PDF: ${line.trim()}`,
          ).toBe(true);
        }
        expect(line, "no USD pricing").not.toMatch(/\$\s?\d/);
      }
    });
  });
}
