import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Save, AlertTriangle, Compass } from "lucide-react";
import { toast } from "sonner";
import { SEOHead } from "@/components/SEOHead";
import { PatientContextCard, type ClinicalContext } from "@/components/l1/PatientContextCard";
import { HemodynamicsPanel, type Hemodynamics } from "@/components/l1/HemodynamicsPanel";
import { AquaMRFindingsPanel, type AquaMRFindings } from "@/components/l1/AquaMRFindingsPanel";
import {
  C4iAssessmentPanel,
  type C4iAssessment,
  type PromsSummary,
} from "@/components/l1/C4iAssessmentPanel";
import { DecisionComparisonPanel } from "@/components/l1/DecisionComparisonPanel";
import { L1SummaryCard } from "@/components/l1/L1SummaryCard";
import { L1ExportActions } from "@/components/l1/L1ExportActions";
import {
  l1AssessmentInputSchema,
  signoffInputSchema,
} from "@/lib/l1/schemas";
import { computeDecisionDelta } from "@/lib/l1/decision";
import {
  RevascularizationDecision,
  SignoffStatus,
} from "@/lib/l1/types";
import {
  buildExportPayload,
  exportToCsvRow,
  exportToJson,
  type L1ExportPayload,
} from "@/lib/l1/export";

const ALGORITHM_VERSION = "l1-decision-board/v1";

interface CaseOption {
  id: string;
  title: string;
  patient_id: string;
  status: string;
  category: string;
  institution_id: string | null;
}

const EMPTY_CONTEXT: ClinicalContext = {};
const EMPTY_HEMO: Hemodynamics = {};
const EMPTY_AQUA: AquaMRFindings = { image_quality: "unknown" };
const EMPTY_C4I: C4iAssessment = {};
const EMPTY_PROMS: PromsSummary = {};

function downloadFile(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function L1DecisionBoard() {
  const { user } = useAuth();
  const { log } = useAuditLog();
  const qc = useQueryClient();

  const [caseId, setCaseId] = useState<string>("");
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [clinicalContext, setClinicalContext] = useState<ClinicalContext>(EMPTY_CONTEXT);
  const [hemodynamics, setHemodynamics] = useState<Hemodynamics>(EMPTY_HEMO);
  const [aquamrFindings, setAquamrFindings] = useState<AquaMRFindings>(EMPTY_AQUA);
  const [c4i, setC4i] = useState<C4iAssessment>(EMPTY_C4I);
  const [proms, setProms] = useState<PromsSummary>(EMPTY_PROMS);
  const [decisionBefore, setDecisionBefore] = useState<RevascularizationDecision | null>(null);
  const [decisionAfter, setDecisionAfter] = useState<RevascularizationDecision | null>(null);
  const [clinicianSummary, setClinicianSummary] = useState<string>("");
  const [signoffStatus, setSignoffStatus] = useState<SignoffStatus>("draft");
  const [signedAt, setSignedAt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  const { data: cases, isLoading: loadingCases } = useQuery({
    queryKey: ["l1-cases", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<CaseOption[]> => {
      const { data, error } = await supabase
        .from("cases")
        .select("id, title, patient_id, status, category, institution_id")
        .order("updated_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as CaseOption[];
    },
  });

  const selectedCase = useMemo(
    () => cases?.find((c) => c.id === caseId) ?? null,
    [cases, caseId],
  );

  // Load existing assessment if one already exists for the chosen case.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!caseId) {
        setAssessmentId(null);
        setClinicalContext(EMPTY_CONTEXT);
        setHemodynamics(EMPTY_HEMO);
        setAquamrFindings(EMPTY_AQUA);
        setC4i(EMPTY_C4I);
        setProms(EMPTY_PROMS);
        setDecisionBefore(null);
        setDecisionAfter(null);
        setClinicianSummary("");
        setSignoffStatus("draft");
        setSignedAt(null);
        return;
      }
      const { data, error } = await supabase
        .from("l1_assessments" as never)
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        console.warn("[L1] load failed", error);
        return;
      }
      if (!data) {
        setAssessmentId(null);
        setClinicalContext(EMPTY_CONTEXT);
        setHemodynamics(EMPTY_HEMO);
        setAquamrFindings(EMPTY_AQUA);
        setC4i(EMPTY_C4I);
        setProms(EMPTY_PROMS);
        setDecisionBefore(null);
        setDecisionAfter(null);
        setClinicianSummary("");
        setSignoffStatus("draft");
        setSignedAt(null);
        return;
      }
      const row = data as Record<string, unknown>;
      setAssessmentId(row.id as string);
      setClinicalContext((row.clinical_context as ClinicalContext) ?? EMPTY_CONTEXT);
      setHemodynamics((row.hemodynamics as Hemodynamics) ?? EMPTY_HEMO);
      setAquamrFindings((row.aquamr_findings as AquaMRFindings) ?? EMPTY_AQUA);
      setC4i((row.c4i_assessment as C4iAssessment) ?? EMPTY_C4I);
      setProms((row.proms_summary as PromsSummary) ?? EMPTY_PROMS);
      setDecisionBefore((row.decision_before_aquamr as RevascularizationDecision | null) ?? null);
      setDecisionAfter((row.decision_after_aquamr as RevascularizationDecision | null) ?? null);
      setClinicianSummary((row.clinician_summary as string) ?? "");
      setSignoffStatus((row.signoff_status as SignoffStatus) ?? "draft");
      setSignedAt((row.signed_at as string | null) ?? null);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  const computed = useMemo(
    () =>
      computeDecisionDelta({
        before: decisionBefore,
        after: decisionAfter,
        imageQuality: aquamrFindings.image_quality,
      }),
    [decisionBefore, decisionAfter, aquamrFindings.image_quality],
  );

  const isSignedOff = signoffStatus === "signed" || signoffStatus === "cosigned";

  async function handleSave() {
    if (!user || !caseId) return;
    const parsed = l1AssessmentInputSchema.safeParse({
      case_id: caseId,
      patient_id: selectedCase?.patient_id ?? null,
      clinical_context: clinicalContext,
      hemodynamics,
      aquamr_findings: aquamrFindings,
      c4i_assessment: c4i,
      proms_summary: proms,
      decision_before_aquamr: decisionBefore ?? undefined,
      decision_after_aquamr: decisionAfter ?? undefined,
      clinician_summary: clinicianSummary,
      segment_findings: [],
    });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast.error(first ? `${first.path.join(".")}: ${first.message}` : "Invalid input");
      return;
    }

    setIsSaving(true);
    try {
      const recommended = computed.recommendedStrategy;
      const payload = {
        case_id: caseId,
        patient_id: selectedCase?.patient_id ?? null,
        clinical_context: parsed.data.clinical_context,
        hemodynamics: parsed.data.hemodynamics,
        aquamr_findings: parsed.data.aquamr_findings,
        c4i_assessment: parsed.data.c4i_assessment,
        proms_summary: parsed.data.proms_summary,
        decision_before_aquamr: decisionBefore,
        decision_after_aquamr: decisionAfter,
        decision_delta: computed.delta,
        recommended_strategy: recommended,
        failure_reason: computed.failureReason,
        image_quality: parsed.data.aquamr_findings.image_quality,
        is_interpretable:
          parsed.data.aquamr_findings.image_quality === "unknown"
            ? null
            : parsed.data.aquamr_findings.image_quality !== "non_interpretable",
        requires_standard_imaging: computed.requiresStandardImaging,
        clinician_summary: clinicianSummary || null,
        algorithm_version: ALGORITHM_VERSION,
        institution_id: selectedCase?.institution_id ?? null,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      };

      let nextId = assessmentId;
      if (assessmentId) {
        const { error } = await supabase
          .from("l1_assessments" as never)
          .update(payload as never)
          .eq("id", assessmentId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("l1_assessments" as never)
          .insert(payload as never)
          .select("id")
          .maybeSingle();
        if (error) throw error;
        nextId = (data as { id?: string } | null)?.id ?? null;
        setAssessmentId(nextId);
      }

      await log({
        category: "clinical",
        action: assessmentId ? "l1.updated" : "l1.created",
        severity: computed.requiresStandardImaging ? "warn" : "info",
        targetEntityType: "l1_assessment",
        targetEntityId: nextId ?? undefined,
        context: {
          caseId,
          delta: computed.delta,
          imageQuality: parsed.data.aquamr_findings.image_quality,
          algorithmVersion: ALGORITHM_VERSION,
        },
      });

      toast.success("L1 assessment saved");
      qc.invalidateQueries({ queryKey: ["l1-cases"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignoff() {
    if (!user || !assessmentId) {
      toast.error("Save the L1 assessment first");
      return;
    }
    const validated = signoffInputSchema.safeParse({
      assessment_id: assessmentId,
      clinician_summary: clinicianSummary,
      status: "signed",
    });
    if (!validated.success) {
      toast.error(validated.error.issues[0]?.message ?? "Invalid sign-off");
      return;
    }

    setIsSigning(true);
    try {
      const signedAtIso = new Date().toISOString();
      const { error } = await supabase
        .from("l1_assessments" as never)
        .update({
          signed_by: user.id,
          signed_at: signedAtIso,
          signoff_status: "signed",
          clinician_summary: clinicianSummary,
        } as never)
        .eq("id", assessmentId);
      if (error) throw error;

      setSignoffStatus("signed");
      setSignedAt(signedAtIso);

      await log({
        category: "clinical",
        action: "l1.signed",
        severity: "info",
        targetEntityType: "l1_assessment",
        targetEntityId: assessmentId,
        context: {
          caseId,
          delta: computed.delta,
          imageQuality: aquamrFindings.image_quality,
        },
      });
      toast.success("L1 assessment signed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-off failed");
    } finally {
      setIsSigning(false);
    }
  }

  function buildPayload(): L1ExportPayload | null {
    if (!assessmentId || !caseId) {
      toast.error("Save the L1 assessment first");
      return null;
    }
    return buildExportPayload({
      schema_version: "l1-decision-board/v1",
      algorithm_version: ALGORITHM_VERSION,
      assessment_id: assessmentId,
      case_id: caseId,
      patient_id: selectedCase?.patient_id ?? null,
      clinical_context: clinicalContext as Record<string, unknown>,
      hemodynamics: hemodynamics as Record<string, unknown>,
      aquamr_findings: aquamrFindings as Record<string, unknown> & { image_quality: typeof aquamrFindings.image_quality },
      c4i_assessment: c4i as Record<string, unknown>,
      proms_summary: proms as Record<string, unknown>,
      segment_findings: [],
      decision_before_aquamr: decisionBefore,
      decision_after_aquamr: decisionAfter,
      decision_delta: computed.delta,
      recommended_strategy: computed.recommendedStrategy,
      requires_standard_imaging: computed.requiresStandardImaging,
      failure_reason: computed.failureReason,
      clinician_summary: clinicianSummary || null,
      signoff_status: signoffStatus,
      signed_at: signedAt,
      exported_at: new Date().toISOString(),
    });
  }

  async function handleExportCsv() {
    const payload = buildPayload();
    if (!payload) return;
    try {
      downloadFile(`l1-${payload.assessment_id}.csv`, "text/csv", exportToCsvRow(payload));
      await log({
        category: "research",
        action: "l1.exported",
        severity: "info",
        targetEntityType: "l1_assessment",
        targetEntityId: payload.assessment_id,
        context: { format: "csv" },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    }
  }

  async function handleExportJson() {
    const payload = buildPayload();
    if (!payload) return;
    try {
      downloadFile(`l1-${payload.assessment_id}.json`, "application/json", exportToJson(payload));
      await log({
        category: "research",
        action: "l1.exported",
        severity: "info",
        targetEntityType: "l1_assessment",
        targetEntityId: payload.assessment_id,
        context: { format: "json" },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    }
  }

  async function handleExportPdf() {
    const payload = buildPayload();
    if (!payload) return;
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const margin = 40;
      let y = margin;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("VASCU-LINK — L1 Pre-Revascularization Assessment", margin, y);
      y += 22;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Assessment ID: ${payload.assessment_id}`, margin, y);
      y += 14;
      doc.text(`Algorithm: ${payload.algorithm_version}`, margin, y);
      y += 14;
      doc.text(`Exported: ${payload.exported_at}`, margin, y);
      y += 14;
      doc.text(`Sign-off: ${payload.signoff_status}${payload.signed_at ? ` @ ${payload.signed_at}` : ""}`, margin, y);
      y += 20;

      const block = (title: string, lines: string[]) => {
        doc.setFont("helvetica", "bold");
        doc.text(title, margin, y);
        y += 14;
        doc.setFont("helvetica", "normal");
        for (const line of lines) {
          const wrapped = doc.splitTextToSize(line, 515);
          for (const w of wrapped) {
            doc.text(w, margin, y);
            y += 12;
            if (y > 780) {
              doc.addPage();
              y = margin;
            }
          }
        }
        y += 6;
      };

      block("Clinical context", [JSON.stringify(payload.clinical_context, null, 2)]);
      block("Hemodynamics", [JSON.stringify(payload.hemodynamics, null, 2)]);
      block("AquaMR cartography", [JSON.stringify(payload.aquamr_findings, null, 2)]);
      block("C4-i", [JSON.stringify(payload.c4i_assessment, null, 2)]);
      block("PROMs", [JSON.stringify(payload.proms_summary, null, 2)]);
      block("Decision", [
        `Before AquaMR: ${payload.decision_before_aquamr ?? "—"}`,
        `After AquaMR: ${payload.decision_after_aquamr ?? "—"}`,
        `Delta: ${payload.decision_delta}`,
        `Recommended strategy: ${payload.recommended_strategy ?? "—"}`,
        `Standard imaging required: ${payload.requires_standard_imaging ? "yes" : "no"}`,
      ]);
      if (payload.clinician_summary) {
        block("Clinician summary", [payload.clinician_summary]);
      }

      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(
        "Research prototype — not a certified medical device. No autonomous revascularization.",
        margin,
        820,
      );

      doc.save(`l1-${payload.assessment_id}.pdf`);

      await log({
        category: "research",
        action: "l1.exported",
        severity: "info",
        targetEntityType: "l1_assessment",
        targetEntityId: payload.assessment_id,
        context: { format: "pdf" },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PDF export failed");
    }
  }

  const noCaseSelected = !caseId;

  return (
    <div className="space-y-6 max-w-7xl">
      <SEOHead
        title="L1 Decision Board — VASCU-LINK"
        description="L1 Pre-Revascularization Decision Board: AquaMR cartography, C4-i and decision impact."
        path="/app/l1-decision-board"
        noindex
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Compass className="h-6 w-6 sm:h-7 sm:w-7 text-primary shrink-0" />
            L1 Decision Board
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            VASCU-LINK pre-revascularization decision support. L1 makes the AOMI patient
            legible, classable and routable — never autonomously treated.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="outline" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Research prototype
          </Badge>
          <Badge variant="secondary">No autonomous revascularization</Badge>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">Clinician sign-off required</p>
          <p className="text-muted-foreground mt-1">
            Outputs require qualified clinician review. If AquaMR quality is insufficient,
            standard-of-care imaging must be used. No human revascularization is performed
            or recommended autonomously by this module.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Case selection</CardTitle>
          <CardDescription>
            Choose an existing case. The L1 assessment is anchored to that case and
            inherits its institution-level access controls.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="l1-case">Case</Label>
            <Select value={caseId} onValueChange={setCaseId} disabled={loadingCases || isSignedOff}>
              <SelectTrigger id="l1-case">
                <SelectValue placeholder={loadingCases ? "Loading cases…" : "Select a case"} />
              </SelectTrigger>
              <SelectContent>
                {(cases ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title} · {c.category} · {c.status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedCase && (
            <p className="text-xs text-muted-foreground">
              Patient ID (pseudonymized): <span className="font-mono">{selectedCase.patient_id.slice(0, 8)}…</span>
            </p>
          )}
          {!loadingCases && (cases ?? []).length === 0 && (
            <p className="text-xs text-muted-foreground">
              No cases available. Create a patient case first from the Patients module.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <PatientContextCard
            value={clinicalContext}
            onChange={setClinicalContext}
            disabled={noCaseSelected || isSignedOff}
          />
          <HemodynamicsPanel
            value={hemodynamics}
            onChange={setHemodynamics}
            disabled={noCaseSelected || isSignedOff}
          />
        </div>

        <div className="space-y-6">
          <AquaMRFindingsPanel
            value={aquamrFindings}
            onChange={setAquamrFindings}
            disabled={noCaseSelected || isSignedOff}
          />
          <C4iAssessmentPanel
            c4i={c4i}
            proms={proms}
            onChangeC4i={setC4i}
            onChangeProms={setProms}
            disabled={noCaseSelected || isSignedOff}
          />
        </div>

        <div className="space-y-6">
          <DecisionComparisonPanel
            before={decisionBefore}
            after={decisionAfter}
            computed={computed}
            onChangeBefore={setDecisionBefore}
            onChangeAfter={setDecisionAfter}
            disabled={noCaseSelected || isSignedOff}
          />
          <L1SummaryCard
            summary={clinicianSummary}
            signoffStatus={signoffStatus}
            signedAt={signedAt}
            onChangeSummary={setClinicianSummary}
            onSignoff={handleSignoff}
            disabled={noCaseSelected || !assessmentId}
            isSigning={isSigning}
          />
          <L1ExportActions
            onExportCsv={handleExportCsv}
            onExportJson={handleExportJson}
            onExportPdf={handleExportPdf}
            disabled={!assessmentId}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSave} disabled={noCaseSelected || isSaving || isSignedOff}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {assessmentId ? "Update L1 assessment" : "Save L1 assessment"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Research prototype — not a certified medical device. All clinical decisions remain
        the responsibility of the supervising physician.
      </p>
    </div>
  );
}
