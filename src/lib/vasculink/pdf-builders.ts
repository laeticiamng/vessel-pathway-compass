import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ADRS, DSMB_MEMBERS, DSMB_TRIGGERS, LCA_STAGES, QALY_PARAMS, POWER_DEFAULTS,
} from "./adr-data";

const HEAD_BLUE: [number, number, number] = [37, 99, 235];
const last = (doc: jsPDF) =>
  (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

/** Build the DSMB Charter PDF (pure, testable). */
export function buildDsmbDoc(now: Date = new Date()): jsPDF {
  const ts = now.toISOString();
  const doc = new jsPDF();
  const pageH = doc.internal.pageSize.getHeight();

  doc.setFontSize(16);
  doc.text("DSMB Charter — VASCU-LINK / AquaMR Flow", 14, 18);
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generated: ${ts}`, 14, 24);
  doc.text("Independent Data Safety Monitoring Board · CHUV cohort", 14, 29);

  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text("1. Purpose", 14, 40);
  doc.setFontSize(9);
  const purpose = doc.splitTextToSize(
    "The DSMB provides independent oversight of safety, image-quality and " +
    "trial conduct for the prospective L1 validation cohort (n approx 250 analysable). " +
    "It operates in parallel with the Data Access Committee for registry queries.",
    180
  );
  doc.text(purpose, 14, 46);

  doc.setFontSize(11);
  doc.text("2. Composition (5 members, >=3 voting)", 14, 70);
  autoTable(doc, {
    startY: 74,
    head: [["Role", "Affiliation"]],
    body: DSMB_MEMBERS.map((m) => [m.role, m.affiliation]),
    styles: { fontSize: 8 }, headStyles: { fillColor: HEAD_BLUE },
  });

  const y1 = last(doc) + 8;
  doc.setFontSize(11);
  doc.text("3. Stop / pause / continue triggers", 14, y1);
  autoTable(doc, {
    startY: y1 + 4,
    head: [["Trigger"]],
    body: DSMB_TRIGGERS.map((t) => [t]),
    styles: { fontSize: 8 }, headStyles: { fillColor: HEAD_BLUE },
  });

  const y2 = last(doc) + 8;
  doc.setFontSize(11);
  doc.text("4. Operating rules", 14, y2);
  doc.setFontSize(9);
  doc.text("Quorum 3/5 · Cadence: every 6 months + on-trigger", 14, y2 + 6);
  doc.text("Reports to sponsor + CER-VD · Charter reviewed annually", 14, y2 + 11);

  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(
    "Placeholder citations: [DSMB-CHUV-2025-01] · [SAP-AquaMR-v1] · [CER-VD-PB_2025-XXXXX]",
    14, pageH - 12
  );
  return doc;
}

/** Build the Audit-ready compliance pack PDF (pure, testable). */
export function buildAuditPackDoc(now: Date = new Date()): jsPDF {
  const ts = now.toISOString();
  const doc = new jsPDF();
  const pageH = doc.internal.pageSize.getHeight();

  // Cover
  doc.setFontSize(20);
  doc.text("VASCU-LINK · Audit-ready compliance pack", 14, 30);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${ts}`, 14, 38);
  doc.text("Scope: ADR registry · Power calculation · DSMB charter · LCA / QALY framework", 14, 44);
  doc.text("Audience: regulatory reviewers (MDR Class IIa hypothesis), DSMB, ethics committee", 14, 50);
  doc.setTextColor(0);

  // TOC
  doc.setFontSize(14);
  doc.text("Table of contents", 14, 70);
  autoTable(doc, {
    startY: 76,
    body: [
      ["1.", "Architecture Decision Records (15)", "p. 2"],
      ["2.", "Power calculation · CHUV cohort", "p. 3"],
      ["3.", "DSMB charter", "p. 4"],
      ["4.", "LCA + QALY framework", "p. 5"],
      ["5.", "Placeholder citations", "p. 6"],
    ],
    theme: "plain",
    styles: { fontSize: 10 },
    columnStyles: { 0: { cellWidth: 12 }, 2: { halign: "right", cellWidth: 30 } },
  });

  // 1. ADR
  doc.addPage();
  doc.setFontSize(14);
  doc.text("1. Architecture Decision Records", 14, 18);
  autoTable(doc, {
    startY: 24,
    head: [["ID", "Status", "Domain", "Decided"]],
    body: ADRS.map((a) => [a.id, a.status, a.domain, a.decidedAt]),
    styles: { fontSize: 8 }, headStyles: { fillColor: HEAD_BLUE },
  });

  // 2. Power
  doc.addPage();
  doc.setFontSize(14);
  doc.text("2. Power calculation — CHUV main cohort", 14, 18);
  doc.setFontSize(9);
  doc.text("Primary endpoint: clinico-physiological concordance (C4-i v11.1).", 14, 26);
  doc.text("Test: one-sample non-inferiority on a single proportion (normal approximation).", 14, 31);
  autoTable(doc, {
    startY: 38,
    head: [["Parameter", "Value"]],
    body: [
      ["Expected proportion (pi0)", String(POWER_DEFAULTS.pi0)],
      ["Non-inferiority margin (delta)", String(POWER_DEFAULTS.delta)],
      ["Two-sided alpha", String(POWER_DEFAULTS.alpha)],
      ["Power (1 - beta)", String(POWER_DEFAULTS.power)],
      ["Required analysable n", `approx ${POWER_DEFAULTS.nAnalysable}`],
      ["Anticipated dropouts / unanalysable", `approx ${POWER_DEFAULTS.dropout * 100}%`],
      ["Target enrolment", `n approx ${POWER_DEFAULTS.nEnrolment} analysable`],
    ],
    styles: { fontSize: 9 }, headStyles: { fillColor: HEAD_BLUE },
  });

  // 3. DSMB
  doc.addPage();
  doc.setFontSize(14);
  doc.text("3. DSMB charter (summary)", 14, 18);
  autoTable(doc, {
    startY: 24,
    head: [["Role", "Affiliation"]],
    body: DSMB_MEMBERS.map((m) => [m.role, m.affiliation]),
    styles: { fontSize: 8 }, headStyles: { fillColor: HEAD_BLUE },
  });
  const yT = last(doc) + 6;
  autoTable(doc, {
    startY: yT,
    head: [["Stop / pause triggers"]],
    body: DSMB_TRIGGERS.map((t) => [t]),
    styles: { fontSize: 8 }, headStyles: { fillColor: HEAD_BLUE },
  });

  // 4. LCA / QALY
  doc.addPage();
  doc.setFontSize(14);
  doc.text("4. LCA + QALY framework", 14, 18);
  doc.setFontSize(9);
  doc.text("ISO 14040/44 (LCA) · CHEERS 2022 (cost-utility). Quantitative values pending J1/J3.", 14, 26);
  autoTable(doc, {
    startY: 32,
    head: [["LCA stage", "Scope"]],
    body: LCA_STAGES.map((s) => [s.stage, s.scope]),
    styles: { fontSize: 8 }, headStyles: { fillColor: HEAD_BLUE },
  });
  const yL = last(doc) + 6;
  autoTable(doc, {
    startY: yL,
    head: [["Cost-utility parameter", "Value"]],
    body: QALY_PARAMS.map((q) => [q.p, q.v]),
    styles: { fontSize: 8 }, headStyles: { fillColor: HEAD_BLUE },
  });

  // 5. Citations
  doc.addPage();
  doc.setFontSize(14);
  doc.text("5. Placeholder citations", 14, 18);
  doc.setFontSize(9);
  const cites = [
    "[1] Mazzolai L. et al. ESC 2024 Guidelines on the management of PAD. Eur Heart J. 2024.",
    "[2] Mazzolai L., Lanzi S., Rodriguez-Palomares J. 10 Commandments for PAD. Eur Heart J. 2025.",
    "[3] CHEERS 2022 - Consolidated Health Economic Evaluation Reporting Standards.",
    "[4] ISO 14040:2006 / 14044:2006 - Environmental management - Life cycle assessment.",
    "[5] IEC 62304:2006/AMD1:2015 - Medical device software - Software life cycle processes.",
    "[6] EU MDR 2017/745 - Regulation on medical devices.",
    "[7] GDPR - Regulation (EU) 2016/679.",
    "[8] CHUV Biostatistics Unit - internal SAP draft v0.1 (placeholder).",
    "[9] CER-VD protocol number - to be assigned (placeholder).",
    "[10] ClinicalTrials.gov registration - planned at J1 (placeholder).",
  ];
  let y = 28;
  for (const c of cites) {
    const lines = doc.splitTextToSize(c, 180);
    doc.text(lines, 14, y);
    y += lines.length * 5;
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(140);
    doc.text(`VASCU-LINK audit pack · ${ts} · page ${i}/${pageCount}`, 14, pageH - 8);
  }
  return doc;
}
