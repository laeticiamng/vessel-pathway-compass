import { useState } from "react";
import { useTranslation } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StudyCohortManager } from "@/components/vascscreen/StudyCohortManager";
import { StudyConsentForm } from "@/components/vascscreen/StudyConsentForm";
import { StudyExport } from "@/components/vascscreen/StudyExport";

export default function VascScreenStudy() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch cohorts
  const { data: cohorts, isLoading: cohortsLoading } = useQuery({
    queryKey: ["vascscreen-cohorts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vascscreen_study_cohorts" as any)
        .select("*")
        .eq("created_by", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get enrolled counts per cohort
      const enriched = await Promise.all(
        ((data || []) as any[]).map(async (cohort: any) => {
          const { count } = await supabase
            .from("vascscreen_patients" as any)
            .select("*", { count: "exact", head: true })
            .eq("study_cohort_id", cohort.id);

          return {
            id: cohort.id,
            name: cohort.name,
            description: cohort.description || "",
            principalInvestigator: cohort.principal_investigator || "",
            ethicsApprovalNumber: cohort.ethics_approval_number || "",
            status: cohort.status,
            startDate: cohort.start_date || "",
            patientsEnrolled: count || 0,
          };
        })
      );

      return enriched;
    },
    enabled: !!user,
  });

  // Fetch study patients (with consent)
  const { data: studyPatients, isLoading: patientsLoading } = useQuery({
    queryKey: ["vascscreen-study-patients", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vascscreen_patients" as any)
        .select("*")
        .eq("created_by", user!.id)
        .eq("study_consent", true);

      if (error) throw error;

      return ((data || []) as any[]).map((p: any) => ({
        pseudonym: p.pseudonym || `VS-${p.id.slice(0, 8)}`,
        age: p.age,
        sex: p.sex,
        smokingStatus: p.smoking_status,
        diabetes: p.diabetes,
        hypertension: p.hypertension,
        dyslipidemia: p.dyslipidemia,
        knownCVD: p.known_cvd,
        ckd: p.ckd,
        claudication: p.claudication,
        restPain: p.rest_pain,
        nonHealingWounds: p.non_healing_wounds,
        screeningEligible: p.screening_eligible,
        riskScore: p.risk_score,
        abiRight: p.abi_right,
        abiLeft: p.abi_left,
        abiInterpretation: p.abi_interpretation,
        referredToAngiologist: p.referred_to_angiologist,
        padConfirmed: p.pad_confirmed,
        padFontaineStage: p.pad_fontaine_stage,
        timeToDiagnosisDays: p.time_to_diagnosis_days,
      }));
    },
    enabled: !!user,
  });

  // Create cohort mutation
  const createCohort = useMutation({
    mutationFn: async (cohort: any) => {
      const { error } = await supabase.from("vascscreen_study_cohorts" as any).insert({
        name: cohort.name,
        description: cohort.description,
        principal_investigator: cohort.principalInvestigator,
        ethics_approval_number: cohort.ethicsApprovalNumber,
        status: cohort.status,
        start_date: cohort.startDate || null,
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vascscreen-cohorts"] });
      toast.success("Cohort created");
    },
    onError: () => {
      toast.error("Failed to create cohort");
    },
  });

  // Compute study outcomes
  const outcomes = studyPatients ? {
    totalEnrolled: studyPatients.length,
    padDetected: studyPatients.filter((p) => p.padConfirmed).length,
    referred: studyPatients.filter((p) => p.referredToAngiologist).length,
    meanRiskScore: studyPatients.length > 0
      ? (studyPatients.reduce((sum, p) => sum + (p.riskScore || 0), 0) / studyPatients.length).toFixed(1)
      : "N/A",
    diagnosisTimes: studyPatients
      .filter((p) => p.timeToDiagnosisDays != null)
      .map((p) => p.timeToDiagnosisDays!),
  } : null;

  const meanDiagnosisDelay = outcomes && outcomes.diagnosisTimes.length > 0
    ? (outcomes.diagnosisTimes.reduce((a, b) => a + b, 0) / outcomes.diagnosisTimes.length).toFixed(1)
    : "N/A";

  return (
    <div className="space-y-6 max-w-5xl">
      <SEOHead
        title={t("vascscreen.studyModule.title")}
        description={t("vascscreen.studyModule.subtitle")}
        path="/app/vascscreen/study"
        noindex
      />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/vascscreen")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold">{t("vascscreen.studyModule.title")}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{t("vascscreen.studyModule.subtitle")}</p>
        </div>
      </div>

      <Tabs defaultValue="cohorts">
        <TabsList>
          <TabsTrigger value="cohorts">{t("vascscreen.studyModule.cohorts")}</TabsTrigger>
          <TabsTrigger value="consent">{t("vascscreen.studyModule.consent")}</TabsTrigger>
          <TabsTrigger value="outcomes">{t("vascscreen.studyModule.outcomes")}</TabsTrigger>
          <TabsTrigger value="export">{t("common.export")}</TabsTrigger>
        </TabsList>

        <TabsContent value="cohorts" className="mt-4">
          {cohortsLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <StudyCohortManager
              cohorts={cohorts || []}
              onCreateCohort={(c) => createCohort.mutate(c)}
            />
          )}
        </TabsContent>

        <TabsContent value="consent" className="mt-4">
          <StudyConsentForm
            onConsent={(consented) => {
              toast.success(consented ? t("vascscreen.studyModule.consentObtained") : "Consent withdrawn");
            }}
          />
        </TabsContent>

        <TabsContent value="outcomes" className="mt-4 space-y-4">
          {/* Study outcomes summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("vascscreen.studyModule.outcomes")}</CardTitle>
              <CardDescription>Key study metrics for Dr. med. thesis</CardDescription>
            </CardHeader>
            <CardContent>
              {patientsLoading ? (
                <Skeleton className="h-32" />
              ) : outcomes ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{outcomes.totalEnrolled}</p>
                    <p className="text-xs text-muted-foreground">{t("vascscreen.studyModule.patientsEnrolled")}</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{outcomes.padDetected}</p>
                    <p className="text-xs text-muted-foreground">{t("vascscreen.studyModule.padDetectedCount")}</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{outcomes.meanRiskScore}</p>
                    <p className="text-xs text-muted-foreground">{t("vascscreen.assessment.riskScore")}</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{meanDiagnosisDelay}</p>
                    <p className="text-xs text-muted-foreground">{t("vascscreen.studyModule.meanDiagnosisDelay")}</p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="mt-4">
          {patientsLoading ? (
            <Skeleton className="h-48" />
          ) : (
            <StudyExport
              patients={studyPatients || []}
              cohortName="vascscreen-study"
            />
          )}
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-4 border-t">
        <BookOpen className="h-3.5 w-3.5" />
        <span>{t("vascscreen.guidelineReference")}</span>
      </div>
    </div>
  );
}
