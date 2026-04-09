import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import type { PatientRiskProfile, ScreeningRecommendation, ABIInterpretation } from "@/lib/vascscreen/esc2024-criteria";

interface ReferralReportProps {
  patient: PatientRiskProfile;
  recommendation: ScreeningRecommendation;
  riskScore: number;
  abiRight?: number;
  abiLeft?: number;
  abiInterpretation?: ABIInterpretation;
}

export function ReferralReport({
  patient,
  recommendation,
  riskScore,
  abiRight,
  abiLeft,
  abiInterpretation,
}: ReferralReportProps) {
  const { t } = useTranslation();

  const riskFactors: string[] = [];
  if (patient.smokingStatus === "current") riskFactors.push(t("vascscreen.form.current"));
  if (patient.smokingStatus === "former") riskFactors.push(t("vascscreen.form.former"));
  if (patient.diabetes) riskFactors.push(t("vascscreen.form.diabetes"));
  if (patient.hypertension) riskFactors.push(t("vascscreen.form.hypertension"));
  if (patient.dyslipidemia) riskFactors.push(t("vascscreen.form.dyslipidemia"));
  if (patient.familyHistoryCVD) riskFactors.push(t("vascscreen.form.familyHistoryCVD"));
  if (patient.knownCVD) riskFactors.push(t("vascscreen.form.knownCVD"));
  if (patient.ckd) riskFactors.push(t("vascscreen.form.ckd"));

  const symptoms: string[] = [];
  if (patient.claudication) symptoms.push(t("vascscreen.form.claudication"));
  if (patient.restPain) symptoms.push(t("vascscreen.form.restPain"));
  if (patient.nonHealingWounds) symptoms.push(t("vascscreen.form.nonHealingWounds"));
  if (patient.erectileDysfunction) symptoms.push(t("vascscreen.form.erectileDysfunction"));

  return (
    <Card id="referral-report">
      <CardHeader className="border-b">
        <CardTitle className="text-base">{t("vascscreen.pdf.header")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Patient demographics */}
        <section>
          <h4 className="text-sm font-semibold mb-1">{t("vascscreen.pdf.patientData")}</h4>
          <div className="text-sm grid grid-cols-2 gap-1">
            <span>{t("vascscreen.form.age")}: {patient.age}</span>
            <span>{t("vascscreen.form.sex")}: {t(`vascscreen.form.${patient.sex}`)}</span>
          </div>
        </section>

        {/* Risk factors */}
        <section>
          <h4 className="text-sm font-semibold mb-1">{t("vascscreen.pdf.riskFactorsIdentified")}</h4>
          {riskFactors.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {riskFactors.map((rf) => (
                <Badge key={rf} variant="outline" className="text-xs">{rf}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">-</p>
          )}
        </section>

        {/* Symptoms */}
        {symptoms.length > 0 && (
          <section>
            <h4 className="text-sm font-semibold mb-1">{t("vascscreen.form.symptoms")}</h4>
            <div className="flex flex-wrap gap-1.5">
              {symptoms.map((s) => (
                <Badge key={s} variant="destructive" className="text-xs">{s}</Badge>
              ))}
            </div>
          </section>
        )}

        {/* Risk score */}
        <section>
          <h4 className="text-sm font-semibold mb-1">{t("vascscreen.assessment.riskScore")}</h4>
          <p className="text-sm">{riskScore.toFixed(1)} / 10</p>
        </section>

        {/* ABI */}
        {(abiRight || abiLeft) && (
          <section>
            <h4 className="text-sm font-semibold mb-1">{t("vascscreen.pdf.abiResult")}</h4>
            <div className="text-sm grid grid-cols-2 gap-1">
              {abiRight && <span>{t("vascscreen.abi.rightABI")}: {abiRight.toFixed(2)}</span>}
              {abiLeft && <span>{t("vascscreen.abi.leftABI")}: {abiLeft.toFixed(2)}</span>}
            </div>
            {abiInterpretation && (
              <Badge
                className="mt-1"
                style={{
                  backgroundColor: abiInterpretation.color === "darkred" ? "#991b1b" : abiInterpretation.color,
                  color: "white",
                }}
              >
                {abiInterpretation.interpretation}
              </Badge>
            )}
          </section>
        )}

        {/* Recommendation */}
        <section>
          <h4 className="text-sm font-semibold mb-1">{t("vascscreen.pdf.managementRecommendation")}</h4>
          <ul className="text-sm space-y-1">
            {recommendation.recommendedActions.map((a, i) => (
              <li key={i}>- {a}</li>
            ))}
          </ul>
        </section>

        {/* Guideline reference */}
        <div className="flex items-start gap-2 pt-3 border-t text-xs text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{recommendation.guidelineReference}</span>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          {t("vascscreen.pdf.generatedBy")}
        </p>
      </CardContent>
    </Card>
  );
}
