import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/context";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ESC2024Criteria } from "@/components/vascscreen/ESC2024Criteria";
import { RiskScoreCalculator } from "@/components/vascscreen/RiskScoreCalculator";
import { ScreeningRecommendation } from "@/components/vascscreen/ScreeningRecommendation";
import { PatientFlowChart } from "@/components/vascscreen/PatientFlowChart";
import { ScreeningTimeline } from "@/components/vascscreen/ScreeningTimeline";
import type { PatientRiskProfile, ScreeningRecommendation as ScreeningRec } from "@/lib/vascscreen/esc2024-criteria";

export default function VascScreenAssessment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<{
    patient: PatientRiskProfile;
    recommendation: ScreeningRec;
    riskScore: number;
  } | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("vascscreen-current-patient");
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  if (!data) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/vascscreen/patient-entry")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">{t("vascscreen.assessment.title")}</h1>
        </div>
        <p className="text-muted-foreground">
          No patient data found. Please start with patient entry.
        </p>
        <Button onClick={() => navigate("/app/vascscreen/patient-entry")}>
          {t("vascscreen.patientEntry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <SEOHead
        title={t("vascscreen.assessment.title")}
        description={t("vascscreen.assessment.subtitle")}
        path="/app/vascscreen/assessment"
        noindex
      />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/vascscreen/patient-entry")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{t("vascscreen.assessment.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("vascscreen.assessment.subtitle")}</p>
        </div>
      </div>

      <ScreeningTimeline currentStep="assessment" />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <RiskScoreCalculator score={data.riskScore} />
          <ESC2024Criteria recommendation={data.recommendation} />
        </div>
        <div className="space-y-4">
          <ScreeningRecommendation
            recommendation={data.recommendation}
            riskScore={data.riskScore}
            onProceedToABI={() => navigate("/app/vascscreen/abi")}
          />
          <PatientFlowChart />
        </div>
      </div>
    </div>
  );
}
