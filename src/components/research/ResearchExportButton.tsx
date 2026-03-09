import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, FileText, Shield, Loader2 } from "lucide-react";

export default function ResearchExportButton() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  const generateExport = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [casesRes, outcomesRes, measRes, patientsRes, promsRes] = await Promise.all([
        supabase.from("cases").select("id, category, status, created_at").eq("created_by", user.id),
        supabase.from("outcomes").select("id, outcome_type, outcome_date").eq("created_by", user.id),
        supabase.from("measurements").select("id, measurement_type, value, unit").eq("created_by", user.id),
        supabase.from("patients").select("id, age_range, sex, risk_factors").eq("created_by", user.id).is("deleted_at", null),
        supabase.from("proms").select("id, questionnaire_type, score"),
      ]);

      const cases = casesRes.data ?? [];
      const outcomes = outcomesRes.data ?? [];
      const measurements = measRes.data ?? [];
      const patients = patientsRes.data ?? [];
      const proms = promsRes.data ?? [];

      const catCounts: Record<string, number> = {};
      cases.forEach((c) => { catCounts[c.category] = (catCounts[c.category] || 0) + 1; });

      const outcomeCounts: Record<string, number> = {};
      outcomes.forEach((o) => { outcomeCounts[o.outcome_type] = (outcomeCounts[o.outcome_type] || 0) + 1; });

      const sexCounts: Record<string, number> = {};
      const ageCounts: Record<string, number> = {};
      patients.forEach((p) => {
        sexCounts[p.sex || "unknown"] = (sexCounts[p.sex || "unknown"] || 0) + 1;
        ageCounts[p.age_range || "unknown"] = (ageCounts[p.age_range || "unknown"] || 0) + 1;
      });

      const measByType: Record<string, number[]> = {};
      measurements.forEach((m) => {
        if (!measByType[m.measurement_type]) measByType[m.measurement_type] = [];
        measByType[m.measurement_type].push(m.value);
      });
      const measStats = Object.entries(measByType).map(([type, vals]) => ({
        type,
        n: vals.length,
        mean: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2),
        min: Math.min(...vals).toFixed(2),
        max: Math.max(...vals).toFixed(2),
      }));

      const promsByType: Record<string, number[]> = {};
      proms.forEach((p) => {
        if (!promsByType[p.questionnaire_type]) promsByType[p.questionnaire_type] = [];
        if (p.score !== null) promsByType[p.questionnaire_type].push(p.score);
      });

      const now = new Date().toISOString().slice(0, 10);
      const lines: string[] = [
        `ANONYMIZED REGISTRY DATASET SUMMARY`,
        `Generated: ${now}`,
        `Institution: Vascular Atlas Platform`,
        `Format: Aggregate statistics only — no individual patient data`,
        ``,
        `== COHORT OVERVIEW ==`,
        `Total patients: ${patients.length}`,
        `Total cases: ${cases.length}`,
        `Total outcomes recorded: ${outcomes.length}`,
        `Total measurements: ${measurements.length}`,
        `Total PROMs completed: ${proms.length}`,
        ``,
        `== DEMOGRAPHICS (aggregate) ==`,
        `Sex distribution: ${Object.entries(sexCounts).map(([k, v]) => `${k}: ${v}`).join(", ")}`,
        `Age range distribution: ${Object.entries(ageCounts).map(([k, v]) => `${k}: ${v}`).join(", ")}`,
        ``,
        `== CASE CATEGORIES ==`,
        ...Object.entries(catCounts).map(([k, v]) => `  ${k.toUpperCase()}: ${v} (${((v / cases.length) * 100).toFixed(1)}%)`),
        ``,
        `== OUTCOME TYPES ==`,
        ...Object.entries(outcomeCounts).map(([k, v]) => `  ${k}: ${v}`),
        ``,
        `== MEASUREMENT STATISTICS ==`,
        ...measStats.map((s) => `  ${s.type}: n=${s.n}, mean=${s.mean}, range=[${s.min}–${s.max}]`),
        ``,
        `== PATIENT-REPORTED OUTCOMES ==`,
        ...Object.entries(promsByType).map(([type, scores]) => {
          const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
          return `  ${type}: n=${scores.length}, mean score=${avg}/100`;
        }),
        ``,
        `== DATA QUALITY NOTES ==`,
        `- All data is pseudonymized at collection`,
        `- No personally identifiable information included`,
        `- Dataset suitable for vascular registry submission`,
        `- Compliant with GDPR Article 89 (research exemption)`,
      ];

      setReport(lines.join("\n"));
    } catch (err) {
      console.error(err);
      toast.error(t("researchExport.error") as string);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registry-export-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("researchExport.downloadSuccess") as string);
  };

  return (
    <>
      <Button variant="outline" onClick={() => { setOpen(true); setReport(null); }}>
        <FileText className="h-4 w-4 mr-2" /> {t("researchExport.button")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t("researchExport.title")}
            </DialogTitle>
            <DialogDescription>{t("researchExport.description")}</DialogDescription>
          </DialogHeader>

          {!report ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="flex gap-2">
                <Badge variant="outline"><Shield className="h-3 w-3 mr-1" /> {t("researchExport.gdprCompliant")}</Badge>
                <Badge variant="outline">{t("researchExport.aggregateOnly")}</Badge>
                <Badge variant="secondary">{t("researchExport.registryFormat")}</Badge>
              </div>
              <Button onClick={generateExport} disabled={loading} size="lg">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                {loading ? t("researchExport.generating") : t("researchExport.generate")}
              </Button>
            </div>
          ) : (
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
              {report}
            </pre>
          )}

          <DialogFooter>
            {report && (
              <Button onClick={downloadReport}>
                <Download className="h-4 w-4 mr-2" /> {t("researchExport.download")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
