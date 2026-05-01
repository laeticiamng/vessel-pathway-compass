import { describe, it, expect } from "vitest";
import { buildAuditCsv, buildAuditJson } from "@/components/vasculink/AuditDataExportButton";
import { ADRS, POWER_DEFAULTS, DSMB_MEMBERS, DSMB_TRIGGERS } from "@/lib/vasculink/adr-data";

describe("Audit pack data export", () => {
  const fixed = new Date("2026-05-01T00:00:00Z");

  it("CSV starts with metadata and contains ADR/Power/DSMB sections", () => {
    const csv = buildAuditCsv(fixed);
    expect(csv).toMatch(/^# VASCU-LINK audit pack export,generated=2026-05-01/);
    expect(csv).toContain("## ADR");
    expect(csv).toContain("## Power calculation");
    expect(csv).toContain("## DSMB members");
    expect(csv).toContain("## DSMB triggers");
    expect(csv).toContain("## LCA stages");
    expect(csv).toContain("## QALY parameters");
  });

  it("CSV includes every ADR id and decided_at", () => {
    const csv = buildAuditCsv(fixed);
    for (const a of ADRS) {
      expect(csv).toContain(a.id);
      expect(csv).toContain(a.decidedAt);
    }
  });

  it("CSV escapes commas correctly", () => {
    const csv = buildAuditCsv(fixed);
    // affiliations contain commas → must be wrapped in double quotes
    for (const m of DSMB_MEMBERS) {
      if (m.affiliation.includes(",")) {
        expect(csv).toContain(`"${m.affiliation}"`);
      }
    }
  });

  it("JSON contains all sections with the expected counts", () => {
    const json = JSON.parse(buildAuditJson(fixed));
    expect(json.generated_at).toBe("2026-05-01T00:00:00.000Z");
    expect(json.schema_version).toBe("1.0.0");
    expect(json.adr).toHaveLength(ADRS.length);
    expect(json.power).toEqual(POWER_DEFAULTS);
    expect(json.dsmb.members).toHaveLength(DSMB_MEMBERS.length);
    expect(json.dsmb.triggers).toEqual(DSMB_TRIGGERS);
  });
});
