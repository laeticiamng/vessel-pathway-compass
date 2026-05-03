/**
 * Integration test for:
 *  - PDF export + content versioning on /audit-limitations and /faq
 *  - Contextual "Audit & Limitations" links from the Evidence & Rationale
 *    panel of the procedure planner
 *  - i18n consistency of the related strings across en/fr/de
 *
 * The test reads the actual source files (not just the dictionaries) so it
 * also catches regressions where a link/key would silently disappear from the
 * UI even though the i18n entries still exist.
 */

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { en } from "@/i18n/en";
import { fr } from "@/i18n/fr";
import { de } from "@/i18n/de";
import { CONTENT_VERSIONS, getContentVersion } from "@/lib/contentVersions";

const dicts = { en, fr, de } as const;
type AnyDict = Record<string, unknown>;

function get(obj: unknown, p: string): unknown {
  return p.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object") return (acc as AnyDict)[k];
    return undefined;
  }, obj);
}

function read(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf8");
}

describe("Content versioning registry", () => {
  it("registers audit-limitations and faq with semantic versions + ISO dates", () => {
    for (const id of ["audit-limitations", "faq"] as const) {
      const meta = getContentVersion(id);
      expect(meta, `${id} content version`).toBeDefined();
      expect(meta!.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(meta!.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(meta!.changelog.length).toBeGreaterThan(0);
      // Each changelog entry is internally consistent.
      for (const entry of meta!.changelog) {
        expect(entry.version).toMatch(/^\d+\.\d+\.\d+$/);
        expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(entry.summary.length).toBeGreaterThan(10);
      }
      // Current version must appear at the top of its own changelog.
      expect(meta!.changelog[0].version).toBe(meta!.version);
    }
  });

  it("exposes both registry entries via CONTENT_VERSIONS", () => {
    expect(Object.keys(CONTENT_VERSIONS).sort()).toEqual(
      ["audit-limitations", "faq"].sort(),
    );
  });
});

describe("PDF export button on /audit-limitations", () => {
  const src = read("src/components/audit/AuditLimitationsPdfButton.tsx");

  it("uses the versioning registry as source of truth", () => {
    expect(src).toMatch(/getContentVersion\(["']audit-limitations["']\)/);
  });

  it("ships disclaimers in the three locales without regulatory promises", () => {
    expect(src).toMatch(/\ben:\s*\{|\ben:\s*\[/);
    expect(src).toMatch(/\bfr:\s*\{|\bfr:\s*\[/);
    expect(src).toMatch(/\bde:\s*\{|\bde:\s*\[/);
    // No CE-mark / FDA / HIPAA affirmative claims.
    for (const line of src.split("\n")) {
      if (/HIPAA|FDA|CE-mark/i.test(line)) {
        const denial = /\b(no|not|pas|aucun|aucune|kein|keine|nicht|never)\b/i;
        expect(
          line.includes("?") || denial.test(line),
          `affirmative regulatory claim in PDF disclaimer: ${line.trim()}`,
        ).toBe(true);
      }
    }
  });

  it("is mounted on the Audit & Limitations page", () => {
    const page = read("src/pages/AuditLimitations.tsx");
    expect(page).toMatch(/AuditLimitationsPdfButton/);
    expect(page).toMatch(/ContentVersionBadge[^]*contentId=["']audit-limitations["']/);
  });
});

describe("Version badge on /faq", () => {
  it("renders the versioning badge wired to the faq registry id", () => {
    const page = read("src/pages/FAQ.tsx");
    expect(page).toMatch(/ContentVersionBadge[^]*contentId=["']faq["']/);
  });
});

describe("Contextual Audit & Limitations links from Evidence & Rationale", () => {
  const src = read("src/pages/app/ProcedurePlanner.tsx");

  it("links the planner output to /audit-limitations and the compliance FAQ anchor", () => {
    expect(src).toMatch(/to=["']\/audit-limitations["']/);
    expect(src).toMatch(/to=["']\/audit-limitations#compliance-limits-faq["']/);
    expect(src).toMatch(/data-testid=["']evidence-link-audit-limitations["']/);
  });

  it("uses i18n keys (no hardcoded English copy in the link block)", () => {
    expect(src).toMatch(/procedurePlanner\.output\.openAuditLimits/);
    expect(src).toMatch(/procedurePlanner\.output\.openComplianceFaq/);
    expect(src).toMatch(/procedurePlanner\.output\.limitsLinkTitle/);
    expect(src).toMatch(/procedurePlanner\.output\.limitsLinkDesc/);
  });
});

describe("i18n consistency — en/fr/de Evidence & Rationale strings", () => {
  const requiredKeys = [
    "procedurePlanner.output.limitsLinkTitle",
    "procedurePlanner.output.limitsLinkDesc",
    "procedurePlanner.output.openAuditLimits",
    "procedurePlanner.output.openComplianceFaq",
    "procedurePlanner.output.clinicianRequired",
    "procedurePlanner.output.clinicianRequiredDesc",
  ];

  it("defines every key in all three locales as non-empty strings", () => {
    for (const key of requiredKeys) {
      for (const [lang, dict] of Object.entries(dicts)) {
        const v = get(dict, key);
        expect(typeof v, `${lang}:${key} is string`).toBe("string");
        expect((v as string).trim().length, `${lang}:${key} non-empty`).toBeGreaterThan(0);
      }
    }
  });

  it("clinician-confirmation wording is present across locales", () => {
    const patterns = {
      en: /clinician/i,
      fr: /clinicien|clinique/i,
      de: /Klinik|Bestätigung/i,
    } as const;
    for (const lang of ["en", "fr", "de"] as const) {
      const v = get(dicts[lang], "procedurePlanner.output.clinicianRequiredDesc") as string;
      expect(v, `${lang} clinician wording`).toMatch(patterns[lang]);
    }
  });

  it("limits link description does not promise regulatory certification", () => {
    for (const [lang, dict] of Object.entries(dicts)) {
      const v = get(dict, "procedurePlanner.output.limitsLinkDesc") as string;
      // Must NOT affirm CE-mark / HIPAA / FDA without a denial token.
      const denial = /\b(no|not|pas|aucun|aucune|kein|keine|nicht|never|n['’]est pas)\b/i;
      if (/HIPAA|FDA|CE-?mark|certifi/i.test(v)) {
        expect(denial.test(v), `${lang} limitsLinkDesc affirms certification`).toBe(true);
      }
    }
  });
});
