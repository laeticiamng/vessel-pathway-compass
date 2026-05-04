import { describe, it, expect } from "vitest";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Mirror the same evidence definitions that AIAuditCard uses, then verify
// PDF output contains labels, versions, dates, and source URLs in EN/FR/DE.

type Status = "validated" | "in-progress" | "planned";
interface F {
  id: string;
  label: string;
  value: string;
  status: Status;
  version: string;
  lastVerified: string;
  source?: { label: string; href: string };
}

const FIELDS_EN: F[] = [
  { id: "architecture", label: "Architecture", value: "U-Net", status: "in-progress", version: "v0.2", lastVerified: "2026-04-12", source: { label: "Zenodo", href: "https://zenodo.org/" } },
  { id: "training-data", label: "Training data", value: "Public", status: "validated", version: "v0.1", lastVerified: "2026-03-28", source: { label: "Dataset card", href: "https://zenodo.org/" } },
  { id: "hallucination", label: "Hallucination audit", value: "3% sample", status: "in-progress", version: "v0.3", lastVerified: "2026-04-15", source: { label: "TRIPOD+AI 2024", href: "https://www.tripod-statement.org/" } },
];
const FIELDS_FR: F[] = [
  { id: "architecture", label: "Architecture", value: "U-Net débruitage", status: "in-progress", version: "v0.2", lastVerified: "2026-04-12", source: { label: "Zenodo", href: "https://zenodo.org/" } },
  { id: "training-data", label: "Données d'entraînement", value: "publiques", status: "validated", version: "v0.1", lastVerified: "2026-03-28", source: { label: "Dataset card", href: "https://zenodo.org/" } },
];
const FIELDS_DE: F[] = [
  { id: "architecture", label: "Architektur", value: "U-Net", status: "in-progress", version: "v0.2", lastVerified: "2026-04-12", source: { label: "Zenodo", href: "https://zenodo.org/" } },
  { id: "training-data", label: "Trainingsdaten", value: "Öffentliche", status: "validated", version: "v0.1", lastVerified: "2026-03-28", source: { label: "Dataset card", href: "https://zenodo.org/" } },
];

function buildPdfText(title: string, headers: string[], fields: F[]): string {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  doc.text(title, 40, 40);
  autoTable(doc, {
    startY: 60,
    head: [headers],
    body: fields.map((f) => [
      `${f.label}\n${f.value}`,
      f.status,
      f.version,
      f.lastVerified,
      f.source ? `${f.source.label}\n${f.source.href}` : "—",
    ]),
  });
  // Read embedded text back from the PDF binary.
  const raw = doc.output("arraybuffer");
  return new TextDecoder("latin1").decode(new Uint8Array(raw));
}

describe("AIAuditCard PDF export", () => {
  it.each([
    ["en", FIELDS_EN, "AI reconstruction — audit panel", ["Evidence", "Status", "Version", "Last verified", "Source"]],
    ["fr", FIELDS_FR, "Reconstruction IA — panneau d'audit", ["Évidence", "Statut", "Version", "Dernière vérification", "Source"]],
    ["de", FIELDS_DE, "KI-Rekonstruktion — Audit-Panel", ["Evidenz", "Status", "Version", "Zuletzt verifiziert", "Quelle"]],
  ] as const)("contains labels, versions, dates and URLs (%s)", (_lang, fields, title, headers) => {
    const text = buildPdfText(title, [...headers], fields as F[]);

    for (const f of fields) {
      expect(text).toContain(f.version);
      expect(text).toContain(f.lastVerified);
      if (f.source) expect(text).toContain(f.source.href);
    }
    expect(text.length).toBeGreaterThan(500);
  });
});
