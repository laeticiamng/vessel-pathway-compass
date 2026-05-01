import { describe, it, expect } from "vitest";
import { buildDsmbDoc, buildAuditPackDoc } from "@/lib/vasculink/pdf-builders";
import {
  ADRS, DSMB_MEMBERS, DSMB_TRIGGERS, LCA_STAGES, QALY_PARAMS, POWER_DEFAULTS,
} from "@/lib/vasculink/adr-data";

/**
 * jsPDF stores raw page content streams in `doc.internal.pages` (array
 * of strings). They contain text drawing commands like "(some text) Tj"
 * before any FlateEncode compression is applied at output time, so we can
 * inspect them directly without decoding the binary PDF.
 */
function pageTexts(doc: { internal: { pages: string[] } }): string[] {
  // index 0 is empty in jsPDF
  return doc.internal.pages.slice(1);
}

function allText(doc: { internal: { pages: string[] } }): string {
  return pageTexts(doc).join("\n");
}

describe("DSMB Charter PDF", () => {
  const doc = buildDsmbDoc(new Date("2026-05-01T00:00:00Z"));
  const text = allText(doc as never);

  it("has a single page with the charter title", () => {
    expect(pageTexts(doc as never)).toHaveLength(1);
    expect(text).toContain("DSMB Charter");
    expect(text).toContain("VASCU-LINK");
  });

  it("includes a generated timestamp", () => {
    expect(text).toContain("2026-05-01");
  });

  it("renders the 4 numbered sections", () => {
    expect(text).toContain("1. Purpose");
    expect(text).toContain("2. Composition");
    expect(text).toContain("3. Stop / pause / continue triggers");
    expect(text).toContain("4. Operating rules");
  });

  it("includes every DSMB member role", () => {
    for (const m of DSMB_MEMBERS) {
      // jsPDF escapes parentheses, but role labels are plain ASCII otherwise.
      expect(text).toContain(m.role.replace(/\(/g, "\\(").replace(/\)/g, "\\)"));
    }
  });

  it("includes every stop / pause trigger", () => {
    for (const trig of DSMB_TRIGGERS) {
      // Only assert on a unique substring to avoid escaping issues.
      const head = trig.split(/[(>]/)[0].trim().slice(0, 25);
      expect(text).toContain(head);
    }
  });

  it("ends with placeholder citations", () => {
    expect(text).toContain("DSMB-CHUV-2025-01");
    expect(text).toContain("CER-VD");
  });
});

describe("Audit-ready compliance pack PDF", () => {
  const doc = buildAuditPackDoc(new Date("2026-05-01T00:00:00Z"));
  const pages = pageTexts(doc as never);
  const text = pages.join("\n");

  it("produces 6 pages (cover/TOC + 5 sections)", () => {
    expect(pages).toHaveLength(6);
  });

  it("first page contains the cover and a Table of contents", () => {
    expect(pages[0]).toContain("VASCU-LINK");
    expect(pages[0]).toContain("Audit-ready compliance pack");
    expect(pages[0]).toContain("Table of contents");
    expect(pages[0]).toContain("Architecture Decision Records");
    expect(pages[0]).toContain("Power calculation");
    expect(pages[0]).toContain("DSMB charter");
    expect(pages[0]).toContain("LCA + QALY");
  });

  it("ADR section lists every ADR id with its status", () => {
    for (const a of ADRS) {
      expect(pages[1]).toContain(a.id);
      expect(pages[1]).toContain(a.status);
    }
  });

  it("Power section reflects the default computed parameters", () => {
    expect(pages[2]).toContain("Power calculation");
    expect(pages[2]).toContain(String(POWER_DEFAULTS.pi0));
    expect(pages[2]).toContain(String(POWER_DEFAULTS.delta));
    expect(pages[2]).toContain(String(POWER_DEFAULTS.alpha));
    expect(pages[2]).toContain(String(POWER_DEFAULTS.power));
    expect(pages[2]).toContain(String(POWER_DEFAULTS.nAnalysable));
    expect(pages[2]).toContain(String(POWER_DEFAULTS.nEnrolment));
  });

  it("DSMB section contains the members table and trigger list", () => {
    expect(pages[3]).toContain("DSMB charter");
    expect(pages[3]).toContain("Independent biostatistician");
    expect(pages[3]).toContain("Patient representative");
    expect(pages[3]).toContain("Stop / pause triggers");
  });

  it("LCA / QALY section contains both tables", () => {
    expect(pages[4]).toContain("LCA + QALY");
    for (const s of LCA_STAGES) expect(pages[4]).toContain(s.stage);
    for (const q of QALY_PARAMS.slice(0, 3)) expect(pages[4]).toContain(q.p);
  });

  it("citations page references ESC, ISO, IEC, MDR and GDPR", () => {
    expect(pages[5]).toContain("ESC 2024");
    expect(pages[5]).toContain("ISO 14040");
    expect(pages[5]).toContain("IEC 62304");
    expect(pages[5]).toContain("MDR");
    expect(pages[5]).toContain("GDPR");
  });

  it("every page carries a paginated footer", () => {
    for (let i = 0; i < pages.length; i++) {
      expect(pages[i]).toContain(`page ${i + 1}/${pages.length}`);
    }
  });

  it("includes a generated-at timestamp", () => {
    expect(text).toContain("2026-05-01");
  });
});
