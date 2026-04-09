import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/context";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ABIGuide } from "@/components/vascscreen/ABIGuide";
import { ABIInterpreter } from "@/components/vascscreen/ABIInterpreter";
import { ScreeningTimeline } from "@/components/vascscreen/ScreeningTimeline";
import type { ABIInterpretation, PatientRiskProfile, ScreeningRecommendation } from "@/lib/vascscreen/esc2024-criteria";

export default function VascScreenABI() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [abiDone, setAbiDone] = useState(false);

  const handleABIResult = (right: number, left: number, interpretation: ABIInterpretation) => {
    // Update stored patient data with ABI values
    const stored = sessionStorage.getItem("vascscreen-current-patient");
    if (stored) {
      const data = JSON.parse(stored);
      data.abiRight = right;
      data.abiLeft = left;
      data.abiInterpretation = interpretation;
      sessionStorage.setItem("vascscreen-current-patient", JSON.stringify(data));
    }
    setAbiDone(true);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <SEOHead
        title={t("vascscreen.abiMeasurement")}
        description={t("vascscreen.abi.subtitle")}
        path="/app/vascscreen/abi"
        noindex
      />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/vascscreen/patient-entry")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{t("vascscreen.abi.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("vascscreen.abi.subtitle")}</p>
        </div>
      </div>

      <ScreeningTimeline currentStep="abi" />

      <div className="grid lg:grid-cols-2 gap-6">
        <ABIGuide />
        <div className="space-y-4">
          <ABIInterpreter onResult={handleABIResult} />
          {abiDone && (
            <Button onClick={() => navigate("/app/vascscreen/results")} className="w-full gap-2">
              {t("vascscreen.results.title")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
