import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { toast } from "sonner";

export function DSMBExportButton({ className }: { className?: string }) {
  const handleExport = async () => {
    try {
      const jsPDFmod = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDFmod();
      const ts = new Date().toISOString();

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
        "trial conduct for the prospective L1 validation cohort (n ≈ 250 analysable). " +
        "It operates in parallel with the Data Access Committee for registry queries.",
        180
      );
      doc.text(purpose, 14, 46);

      doc.setFontSize(11);
      doc.text("2. Composition (5 members, ≥3 voting)", 14, 70);
      autoTable(doc, {
        startY: 74,
        head: [["Role", "Affiliation"]],
        body: [
          ["Independent vascular physician (chair)", "External EU center, no AquaMR conflict"],
          ["Independent biostatistician", "Access to unblinded data, SAP custodian"],
          ["Independent radiologist / MRI physicist", "Image-quality and safety oversight"],
          ["Patient representative", "Voting on benefit/risk and acceptability"],
          ["Ethics observer (non-voting)", "CER-VD liaison"],
        ],
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] },
      });

      const y1 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
      doc.setFontSize(11);
      doc.text("3. Stop / pause / continue triggers", 14, y1);
      autoTable(doc, {
        startY: y1 + 4,
        head: [["Trigger"]],
        body: [
          ["Serious adverse event potentially related to AquaMR workflow"],
          ["Image-quality failure rate > 15% over a rolling 50-patient window"],
          ["Unanticipated safety signal raised by investigator or sponsor"],
          ["Pre-planned interim review at M24 (before J3 milestone)"],
          ["Any deviation from frozen Statistical Analysis Plan (SAP)"],
        ],
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] },
      });

      const y2 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
      doc.setFontSize(11);
      doc.text("4. Operating rules", 14, y2);
      doc.setFontSize(9);
      doc.text("• Quorum 3/5 · Cadence: every 6 months + on-trigger", 14, y2 + 6);
      doc.text("• Reports to sponsor + CER-VD · Charter reviewed annually", 14, y2 + 11);

      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(
        "Placeholder citations: [DSMB-CHUV-2025-01] · [SAP-AquaMR-v1] · [CER-VD-PB_2025-XXXXX]",
        14, 285
      );

      doc.save(`DSMB-Charter-${ts.slice(0, 10)}.pdf`);
      toast.success("DSMB Charter exported");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Export failed";
      toast.error(msg);
    }
  };

  return (
    <Button onClick={handleExport} variant="outline" size="sm" className={className}>
      <FileDown className="h-4 w-4 mr-1" /> Export DSMB Charter (PDF)
    </Button>
  );
}
