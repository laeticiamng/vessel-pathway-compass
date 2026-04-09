import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { PatientRiskForm } from "@/components/vascscreen/PatientRiskForm";
import { ESC2024Criteria } from "@/components/vascscreen/ESC2024Criteria";
import { RiskScoreCalculator } from "@/components/vascscreen/RiskScoreCalculator";
import { ScreeningRecommendation } from "@/components/vascscreen/ScreeningRecommendation";
import { ScreeningTimeline } from "@/components/vascscreen/ScreeningTimeline";
import {
  evaluateScreeningEligibility,
  calculateRiskScore,
  type PatientRiskProfile,
  type ScreeningRecommendation as ScreeningRec,
} from "@/lib/vascscreen/esc2024-criteria";

export default function VascScreenPatientEntry() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recommendation, setRecommendation] = useState<ScreeningRec | null>(null);
  const [riskScore, setRiskScore] = useState<number>(0);
  const [patientData, setPatientData] = useState<PatientRiskProfile | null>(null);

  const handleSubmit = (data: PatientRiskProfile) => {
    const rec = evaluateScreeningEligibility(data);
    const score = calculateRiskScore(data);
    setRecommendation(rec);
    setRiskScore(score);
    setPatientData(data);
    toast.success(t("vascscreen.patientCreated"));
  };

  const handleProceedToABI = () => {
    // Store patient data in sessionStorage for the ABI page
    if (patientData && recommendation) {
      sessionStorage.setItem(
        "vascscreen-current-patient",
        JSON.stringify({ patient: patientData, recommendation, riskScore })
      );
      navigate("/app/vascscreen/abi");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <SEOHead
        title={t("vascscreen.patientEntry")}
        description={t("vascscreen.newPatientDesc")}
        path="/app/vascscreen/patient-entry"
        noindex
      />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/vascscreen")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{t("vascscreen.patientEntry")}</h1>
          <p className="text-sm text-muted-foreground">{t("vascscreen.guidelineReference")}</p>
        </div>
      </div>

      <ScreeningTimeline currentStep={recommendation ? "assessment" : "entry"} />

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <PatientRiskForm onSubmit={handleSubmit} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          {recommendation && (
            <>
              <RiskScoreCalculator score={riskScore} />
              <ESC2024Criteria recommendation={recommendation} />
              <ScreeningRecommendation
                recommendation={recommendation}
                riskScore={riskScore}
                onProceedToABI={handleProceedToABI}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
