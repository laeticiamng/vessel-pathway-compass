import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

/**
 * "Audit-ready" compliance pack consolidating ADR registry,
 * Power calculation, DSMB charter and LCA/QALY framework into a
 * single PDF with a table of contents and placeholder citations.
 */
export function AuditPackButton({ className }: { className?: string }) {
  const handleExport = async () => {
    try {
      const jsPDFmod = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDFmod();
      const ts = new Date().toISOString();
      const pageH = doc.internal.pageSize.getHeight();

      // ---- Cover ----
      doc.setFontSize(20);
      doc.text("VASCU-LINK · Audit-ready compliance pack", 14, 30);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated: ${ts}`, 14, 38);
      doc.text("Scope: ADR registry · Power calculation · DSMB charter · LCA / QALY framework", 14, 44);
      doc.text("Audience: regulatory reviewers (MDR Class IIa hypothesis), DSMB, ethics committee", 14, 50);
      doc.setTextColor(0);

      // ---- Table of contents ----
      doc.setFontSize(14);
      doc.text("Table of contents", 14, 70);
      doc.setFontSize(10);
      const toc = [
        ["1.", "Architecture Decision Records (15)", "p. 2"],
        ["2.", "Power calculation · CHUV cohort", "p. 3"],
        ["3.", "DSMB charter", "p. 4"],
        ["4.", "LCA + QALY framework", "p. 5"],
        ["5.", "Placeholder citations", "p. 6"],
      ];
      autoTable(doc, {
        startY: 76,
        body: toc,
        theme: "plain",
        styles: { fontSize: 10 },
        columnStyles: { 0: { cellWidth: 12 }, 2: { halign: "right", cellWidth: 30 } },
      });

      // ---- 1. ADR ----
      doc.addPage();
      doc.setFontSize(14);
      doc.text("1. Architecture Decision Records", 14, 18);
      autoTable(doc, {
        startY: 24,
        head: [["ID", "Decision", "Status", "Domain"]],
        body: [
          ["ADR-001", "Halbach NdFeB recycled magnet (no helium)",         "Accepted", "Hardware"],
          ["ADR-002", "Non-contrast angiographic function (0 Gd / iodine)", "Accepted", "Imaging"],
          ["ADR-003", "C4-i v11.1 framework",                               "Accepted", "Clinical"],
          ["ADR-004", "PROMs in English (WIQ · VascuQol-6 · 6-MWT)",        "Accepted", "Clinical"],
          ["ADR-005", "Soft-delete patients, 30-day grace period",          "Accepted", "Data"],
          ["ADR-006", "Server-side case_id filtering on PROMs",             "Accepted", "Security"],
          ["ADR-007", "Edge Functions: verify_jwt + role + esm.sh",         "Accepted", "Security"],
          ["ADR-008", "Lovable Cloud as managed backend",                   "Accepted", "Infra"],
          ["ADR-009", "i18n FR/EN/DE with build-time key check",            "Accepted", "UX"],
          ["ADR-010", "L1 mandatory · L2 conditional · L3 preclinical",     "Accepted", "Scientific"],
          ["ADR-011", "Doppler-first principle",                            "Accepted", "Clinical"],
          ["ADR-012", "Documented fallback to standard imaging",            "Accepted", "Safety"],
          ["ADR-013", "Independent DSMB + Data Access Committee",           "Accepted", "Governance"],
          ["ADR-014", "BoM target < €15k (engineering estimate)",           "Proposed", "Economic"],
          ["ADR-015", "AquaMR Registry · cohort n ≈ 250 (CHUV)",            "Accepted", "Scientific"],
        ],
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] },
      });

      // ---- 2. Power ----
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
          ["Expected proportion (π₀)", "0.80"],
          ["Non-inferiority margin (δ)", "0.10"],
          ["Two-sided α", "0.05"],
          ["Power (1 − β)", "0.80"],
          ["Required analysable n", "≈ 196"],
          ["Anticipated dropouts / unanalysable", "≈ 20%"],
          ["Target enrolment", "n ≈ 250 analysable"],
        ],
        styles: { fontSize: 9 },
        headStyles: { fillColor: [37, 99, 235] },
      });

      // ---- 3. DSMB ----
      doc.addPage();
      doc.setFontSize(14);
      doc.text("3. DSMB charter (summary)", 14, 18);
      autoTable(doc, {
        startY: 24,
        head: [["Role", "Affiliation"]],
        body: [
          ["Independent vascular physician (chair)", "External EU center, no AquaMR conflict"],
          ["Independent biostatistician", "Access to unblinded data, SAP custodian"],
          ["Independent radiologist / MRI physicist", "Image-quality and safety oversight"],
          ["Patient representative", "Voting on benefit/risk and acceptability"],
          ["Ethics observer (non-voting)", "CER-VD liaison"],
        ],
        styles: { fontSize: 8 }, headStyles: { fillColor: [37, 99, 235] },
      });
      const yT = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
      autoTable(doc, {
        startY: yT,
        head: [["Stop / pause triggers"]],
        body: [
          ["Serious adverse event potentially related to AquaMR workflow"],
          ["Image-quality failure rate > 15% (rolling 50-patient window)"],
          ["Unanticipated safety signal"],
          ["Pre-planned interim review at M24 (before J3)"],
          ["Any SAP deviation"],
        ],
        styles: { fontSize: 8 }, headStyles: { fillColor: [37, 99, 235] },
      });

      // ---- 4. LCA / QALY ----
      doc.addPage();
      doc.setFontSize(14);
      doc.text("4. LCA + QALY framework", 14, 18);
      doc.setFontSize(9);
      doc.text("ISO 14040/44 (LCA) · CHEERS 2022 (cost-utility). Quantitative values pending J1/J3.", 14, 26);
      autoTable(doc, {
        startY: 32,
        head: [["LCA stage", "Scope"]],
        body: [
          ["Raw materials", "NdFeB recycled magnets (WEEE), copper coils, FR-4 PCB"],
          ["Manufacturing", "Halbach assembly, EU site assumed"],
          ["Use phase", "0 He · 0 Gd / iodine · electricity per exam"],
          ["Maintenance", "No cryogen refill · modular spare parts"],
          ["End-of-life", "WEEE recycling target > 90% by mass"],
        ],
        styles: { fontSize: 8 }, headStyles: { fillColor: [37, 99, 235] },
      });
      const yL = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
      autoTable(doc, {
        startY: yL,
        head: [["Cost-utility parameter", "Value"]],
        body: [
          ["Comparator", "Doppler + angio-CT or contrast MRA"],
          ["Time horizon", "Lifetime"],
          ["Perspective", "Healthcare payer (CH) + societal sensitivity"],
          ["Discount rate", "3% costs and effects"],
          ["Health outcomes", "QALYs from VascuQol-6 → utility mapping (planned)"],
          ["ICER threshold", "CHF 100k / QALY"],
          ["Sensitivity", "PSA Monte-Carlo 10 000 it. + tornado on BoM"],
        ],
        styles: { fontSize: 8 }, headStyles: { fillColor: [37, 99, 235] },
      });

      // ---- 5. Citations ----
      doc.addPage();
      doc.setFontSize(14);
      doc.text("5. Placeholder citations", 14, 18);
      doc.setFontSize(9);
      const cites = [
        "[1] Mazzolai L. et al. ESC 2024 Guidelines on the management of PAD. Eur Heart J. 2024.",
        "[2] Mazzolai L., Lanzi S., Rodriguez-Palomares J. 10 Commandments for PAD. Eur Heart J. 2025.",
        "[3] CHEERS 2022 — Consolidated Health Economic Evaluation Reporting Standards.",
        "[4] ISO 14040:2006 / 14044:2006 — Environmental management — Life cycle assessment.",
        "[5] IEC 62304:2006/AMD1:2015 — Medical device software — Software life cycle processes.",
        "[6] EU MDR 2017/745 — Regulation on medical devices.",
        "[7] GDPR — Regulation (EU) 2016/679.",
        "[8] CHUV Biostatistics Unit — internal SAP draft v0.1 (placeholder).",
        "[9] CER-VD protocol number — to be assigned (placeholder).",
        "[10] ClinicalTrials.gov registration — planned at J1 (placeholder).",
      ];
      let y = 28;
      for (const c of cites) {
        const lines = doc.splitTextToSize(c, 180);
        doc.text(lines, 14, y);
        y += lines.length * 5;
      }

      // Footer on every page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(140);
        doc.text(`VASCU-LINK audit pack · ${ts} · page ${i}/${pageCount}`, 14, pageH - 8);
      }

      doc.save(`VASCU-LINK-Audit-Pack-${ts.slice(0, 10)}.pdf`);
      toast.success("Audit-ready compliance pack exported");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Export failed";
      toast.error(msg);
    }
  };

  return (
    <Button onClick={handleExport} variant="default" size="sm">
      <ShieldCheck className="h-4 w-4 mr-1" /> Audit-ready compliance pack (PDF)
    </Button>
  );
}
