import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ============================================================================
 * Audit export utility — shared by Visual Chain (P1) and RSVP (P2)
 * Produces CSV and PDF files with timestamp, layers/levels, and rationale.
 * ========================================================================== */

export type AuditExportRow = {
  created_at: string;
  recommended: string;
  current: string;
  rationale: string | null;
  extra?: Record<string, string | undefined>;
};

const csvEscape = (v: string | null | undefined) => {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function downloadCsv(filename: string, rows: AuditExportRow[], headers: {
  timestamp: string;
  recommended: string;
  current: string;
  rationale: string;
}) {
  const extraKeys = Array.from(
    new Set(rows.flatMap((r) => Object.keys(r.extra ?? {}))),
  );
  const head = [
    headers.timestamp,
    headers.recommended,
    headers.current,
    headers.rationale,
    ...extraKeys,
  ];
  const lines = [head.map(csvEscape).join(",")];
  for (const r of rows) {
    const row = [
      r.created_at,
      r.recommended,
      r.current,
      r.rationale ?? "",
      ...extraKeys.map((k) => r.extra?.[k] ?? ""),
    ];
    lines.push(row.map(csvEscape).join(","));
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadPdf(
  filename: string,
  title: string,
  rows: AuditExportRow[],
  headers: {
    timestamp: string;
    recommended: string;
    current: string;
    rationale: string;
  },
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setFontSize(14);
  doc.text(title, 40, 40);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated: ${new Date().toISOString()} · ${rows.length} rows`, 40, 56);
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 72,
    head: [[
      headers.timestamp,
      headers.recommended,
      headers.current,
      headers.rationale,
    ]],
    body: rows.map((r) => [
      r.created_at,
      r.recommended,
      r.current,
      r.rationale ?? "",
    ]),
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [30, 30, 30] },
    columnStyles: {
      0: { cellWidth: 110 },
      1: { cellWidth: 60 },
      2: { cellWidth: 60 },
      3: { cellWidth: "auto" },
    },
  });

  doc.save(filename);
}
