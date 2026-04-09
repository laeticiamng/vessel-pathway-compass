import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ReferralReport } from "@/components/vascscreen/ReferralReport";
import { ReferralPDF } from "@/components/vascscreen/ReferralPDF";
import { ScreeningTimeline } from "@/components/vascscreen/ScreeningTimeline";
import type { PatientRiskProfile, ScreeningRecommendation, ABIInterpretation } from "@/lib/vascscreen/esc2024-criteria";

interface StoredData {
  patient: PatientRiskProfile;
  recommendation: ScreeningRecommendation;
  riskScore: number;
  abiRight?: number;
  abiLeft?: number;
  abiInterpretation?: ABIInterpretation;
}

export default function VascScreenResults() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<StoredData | null>(null);
  const [referToAngiologist, setReferToAngiologist] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("vascscreen-current-patient");
    if (stored) {
      const parsed = JSON.parse(stored);
      setData(parsed);
      // Auto-suggest referral for abnormal ABI
      if (parsed.abiInterpretation && parsed.abiInterpretation.category !== "normal" && parsed.abiInterpretation.category !== "borderline") {
        setReferToAngiologist(true);
      }
    }
  }, []);

  const handleSave = async () => {
    if (!data || !user) return;
    setSaving(true);

    try {
      const { error } = await supabase.from("vascscreen_patients" as any).insert({
        created_by: user.id,
        age: data.patient.age,
        sex: data.patient.sex,
        smoking_status: data.patient.smokingStatus,
        diabetes: data.patient.diabetes,
        hypertension: data.patient.hypertension,
        dyslipidemia: data.patient.dyslipidemia,
        family_history_cvd: data.patient.familyHistoryCVD,
        known_cvd: data.patient.knownCVD,
        ckd: data.patient.ckd,
        claudication: data.patient.claudication,
        rest_pain: data.patient.restPain,
        non_healing_wounds: data.patient.nonHealingWounds,
        erectile_dysfunction: data.patient.erectileDysfunction,
        screening_eligible: data.recommendation.eligible,
        screening_recommendation: data.recommendation.urgency,
        risk_score: data.riskScore,
        abi_right: data.abiRight,
        abi_left: data.abiLeft,
        abi_interpretation: data.abiInterpretation?.category,
        referred_to_angiologist: referToAngiologist,
        referral_date: referToAngiologist ? new Date().toISOString() : null,
      });

      if (error) throw error;
      toast.success(t("vascscreen.patientCreated"));
      sessionStorage.removeItem("vascscreen-current-patient");
      navigate("/app/vascscreen/dashboard");
    } catch (err) {
      toast.error("Failed to save screening result");
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/vascscreen/patient-entry")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">{t("vascscreen.results.title")}</h1>
        </div>
        <p className="text-muted-foreground">No patient data found. Please start with patient entry.</p>
        <Button onClick={() => navigate("/app/vascscreen/patient-entry")}>
          {t("vascscreen.patientEntry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <SEOHead
        title={t("vascscreen.results.title")}
        description={t("vascscreen.results.subtitle")}
        path="/app/vascscreen/results"
        noindex
      />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/vascscreen/abi")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{t("vascscreen.results.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("vascscreen.results.subtitle")}</p>
        </div>
      </div>

      <ScreeningTimeline currentStep="results" />

      {/* Report preview */}
      <ReferralReport
        patient={data.patient}
        recommendation={data.recommendation}
        riskScore={data.riskScore}
        abiRight={data.abiRight}
        abiLeft={data.abiLeft}
        abiInterpretation={data.abiInterpretation}
      />

      {/* Referral toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="refer" className="cursor-pointer">
              {t("vascscreen.results.referToAngiologist")}
            </Label>
            <Switch
              id="refer"
              checked={referToAngiologist}
              onCheckedChange={setReferToAngiologist}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <ReferralPDF
          patient={data.patient}
          recommendation={data.recommendation}
          riskScore={data.riskScore}
          abiRight={data.abiRight}
          abiLeft={data.abiLeft}
          abiInterpretation={data.abiInterpretation}
        />
        <Button onClick={handleSave} disabled={saving} className="gap-2 flex-1">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t("common.save")}
        </Button>
      </div>
    </div>
  );
}
