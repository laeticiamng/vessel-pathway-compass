import { useCallback } from "react";
import { useTranslation } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import type { PatientRiskProfile, ScreeningRecommendation, ABIInterpretation } from "@/lib/vascscreen/esc2024-criteria";

interface ReferralPDFProps {
  patient: PatientRiskProfile;
  recommendation: ScreeningRecommendation;
  riskScore: number;
  abiRight?: number;
  abiLeft?: number;
  abiInterpretation?: ABIInterpretation;
}

export function ReferralPDF({
  patient,
  recommendation,
  riskScore,
  abiRight,
  abiLeft,
  abiInterpretation,
}: ReferralPDFProps) {
  const { t } = useTranslation();

  const generatePDF = useCallback(async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(t("vascscreen.pdf.header"), margin, y);
    y += 10;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
    y += 12;

    // Patient data
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(t("vascscreen.pdf.patientData"), margin, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${t("vascscreen.form.age")}: ${patient.age}`, margin, y);
    y += 5;
    doc.text(`${t("vascscreen.form.sex")}: ${t(`vascscreen.form.${patient.sex}`)}`, margin, y);
    y += 10;

    // Risk factors
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(t("vascscreen.pdf.riskFactorsIdentified"), margin, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const riskFactors: string[] = [];
    if (patient.smokingStatus !== "never") riskFactors.push(`Tabac: ${patient.smokingStatus}`);
    if (patient.diabetes) riskFactors.push(t("vascscreen.form.diabetes"));
    if (patient.hypertension) riskFactors.push(t("vascscreen.form.hypertension"));
    if (patient.dyslipidemia) riskFactors.push(t("vascscreen.form.dyslipidemia"));
    if (patient.familyHistoryCVD) riskFactors.push(t("vascscreen.form.familyHistoryCVD"));
    if (patient.knownCVD) riskFactors.push(t("vascscreen.form.knownCVD"));
    if (patient.ckd) riskFactors.push(t("vascscreen.form.ckd"));

    riskFactors.forEach((rf) => {
      doc.text(`- ${rf}`, margin + 5, y);
      y += 5;
    });
    if (riskFactors.length === 0) {
      doc.text("- Aucun", margin + 5, y);
      y += 5;
    }
    y += 5;

    // Risk score
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${t("vascscreen.assessment.riskScore")}: ${riskScore.toFixed(1)} / 10`, margin, y);
    y += 10;

    // ABI
    if (abiRight || abiLeft) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(t("vascscreen.pdf.abiResult"), margin, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      if (abiRight) {
        doc.text(`${t("vascscreen.abi.rightABI")}: ${abiRight.toFixed(2)}`, margin, y);
        y += 5;
      }
      if (abiLeft) {
        doc.text(`${t("vascscreen.abi.leftABI")}: ${abiLeft.toFixed(2)}`, margin, y);
        y += 5;
      }
      if (abiInterpretation) {
        doc.text(`Interpretation: ${abiInterpretation.interpretation}`, margin, y);
        y += 5;
        doc.text(`Action: ${abiInterpretation.action}`, margin, y);
        y += 5;
      }
      y += 5;
    }

    // Recommendation
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(t("vascscreen.pdf.managementRecommendation"), margin, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    recommendation.recommendedActions.forEach((a) => {
      doc.text(`- ${a}`, margin + 5, y);
      y += 5;
    });
    y += 10;

    // Guideline reference
    doc.setFontSize(8);
    doc.text(recommendation.guidelineReference, margin, y, { maxWidth: 170 });
    y += 10;

    // Footer
    doc.setFontSize(8);
    doc.text(t("vascscreen.pdf.generatedBy"), margin, 280);

    doc.save("vascscreen-referral-report.pdf");
    toast.success(t("vascscreen.results.reportGenerated"));
  }, [patient, recommendation, riskScore, abiRight, abiLeft, abiInterpretation, t]);

  return (
    <Button onClick={generatePDF} variant="outline" className="gap-2">
      <FileText className="h-4 w-4" />
      {t("vascscreen.results.downloadPDF")}
    </Button>
  );
}
