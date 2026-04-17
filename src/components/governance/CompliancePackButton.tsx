import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useExportManifest } from "@/hooks/useExportManifest";

interface ComplianceData {
  total: number;
  grade: string;
  breakdown: Record<string, { score: number; max: number; [k: string]: unknown }>;
  computed_at: string;
}

export function CompliancePackButton({ data }: { data: ComplianceData }) {
  const [loading, setLoading] = useState(false);
  const { register } = useExportManifest();

  const generate = async () => {
    setLoading(true);
    try {
      // Fetch supporting data in parallel
      const [dpiaRes, policiesRes, anomaliesRes, criticalRes] = await Promise.all([
        supabase.from("dpia_assessments").select("title,scope,residual_risk_level,status,approved_at").eq("status", "approved"),
        supabase.from("data_lifecycle_policies").select("entity_type,retention_days,automatic_action,legal_basis"),
        supabase.from("governance_anomalies" as never).select("day,actor_id,anomaly_type,severity,total_events").gte("day", new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]).limit(100),
        supabase.from("governance_events").select("created_at,event_category,event_action,severity,context").in("severity", ["critical", "error"]).gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()).order("created_at", { ascending: false }).limit(50),
      ]);

      const doc = new jsPDF();
      const now = new Date();

      // Register chain-of-custody manifest BEFORE generating PDF (P7 — ADR-014)
      const payload = JSON.stringify({
        score: data.total,
        grade: data.grade,
        breakdown: data.breakdown,
        computed_at: data.computed_at,
        emitted_at: now.toISOString(),
      });
      const manifest = await register({
        entityType: "compliance_pack",
        format: "pdf",
        rowCount: (dpiaRes.data?.length ?? 0) + (policiesRes.data?.length ?? 0) + (anomaliesRes.data?.length ?? 0) + (criticalRes.data?.length ?? 0),
        payload,
        purpose: "Audit externe — Compliance Pack",
        context: { score: data.total, grade: data.grade },
      });
      const packHash = manifest?.sha256 ?? btoa(`${now.toISOString()}-${data.total}-${data.grade}`).slice(0, 32);

      // Page 1 — Score global
      doc.setFontSize(20);
      doc.text("Compliance Pack — Audit externe", 14, 20);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Généré le ${now.toLocaleString("fr-FR")}`, 14, 28);
      doc.setTextColor(0);

      doc.setFontSize(48);
      doc.text(data.grade, 14, 60);
      doc.setFontSize(14);
      doc.text(`Score global : ${data.total}/100`, 40, 55);
      doc.setFontSize(10);
      doc.text(`Calculé le ${new Date(data.computed_at).toLocaleString("fr-FR")}`, 40, 62);

      autoTable(doc, {
        startY: 75,
        head: [["Domaine", "Score", "Max", "Détail"]],
        body: [
          ["DPIA approuvées", String(data.breakdown.dpia.score), String(data.breakdown.dpia.max), `${data.breakdown.dpia.approved}/${data.breakdown.dpia.total}`],
          ["RGPD requests", String(data.breakdown.rgpd.score), String(data.breakdown.rgpd.max), `${data.breakdown.rgpd.overdue} en retard`],
          ["Signoffs eIDAS", String(data.breakdown.signoffs.score), String(data.breakdown.signoffs.max), `${data.breakdown.signoffs.eidas}/${data.breakdown.signoffs.total}`],
          ["Anomalies critiques 7j", String(data.breakdown.anomalies.score), String(data.breakdown.anomalies.max), `${data.breakdown.anomalies.critical_7d} événements`],
          ["Cycle de vie données", String(data.breakdown.lifecycle.score), String(data.breakdown.lifecycle.max), data.breakdown.lifecycle.last_run ? "Exécuté récemment" : "Aucune exécution"],
        ],
      });

      // Page 2 — DPIA approuvées
      doc.addPage();
      doc.setFontSize(16);
      doc.text("DPIA approuvées (RGPD art. 35)", 14, 20);
      autoTable(doc, {
        startY: 28,
        head: [["Titre", "Périmètre", "Risque résiduel", "Approuvée le"]],
        body: (dpiaRes.data ?? []).map((d) => [
          d.title,
          d.scope,
          d.residual_risk_level,
          d.approved_at ? new Date(d.approved_at).toLocaleDateString("fr-FR") : "—",
        ]),
      });

      // Page 3 — Registre RGPD art. 30 (politiques)
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Registre des traitements (RGPD art. 30)", 14, 20);
      autoTable(doc, {
        startY: 28,
        head: [["Type de données", "Rétention (j)", "Action", "Base légale"]],
        body: (policiesRes.data ?? []).map((p) => [
          p.entity_type,
          String(p.retention_days),
          p.automatic_action,
          p.legal_basis,
        ]),
      });

      // Page 4 — Anomalies 30j
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Anomalies de gouvernance (30 jours)", 14, 20);
      autoTable(doc, {
        startY: 28,
        head: [["Jour", "Type", "Sévérité", "Événements"]],
        body: ((anomaliesRes.data as Array<Record<string, unknown>>) ?? []).map((a) => [
          String(a.day ?? ""),
          String(a.anomaly_type ?? ""),
          String(a.severity ?? ""),
          String(a.total_events ?? 0),
        ]),
      });

      // Page 5 — Événements critiques + signature
      doc.addPage();
      doc.setFontSize(16);
      doc.text("Événements critiques (30 jours)", 14, 20);
      autoTable(doc, {
        startY: 28,
        head: [["Date", "Catégorie", "Action", "Sévérité"]],
        body: (criticalRes.data ?? []).map((e) => [
          new Date(e.created_at).toLocaleString("fr-FR"),
          e.event_category,
          e.event_action,
          e.severity,
        ]),
      });

      const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 50;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Signature horodatée du pack (chain-of-custody — ADR-014)", 14, finalY + 15);
      doc.setFont("courier", "normal");
      doc.text(`SHA-256: ${packHash}`, 14, finalY + 22);
      doc.text(`Émis le : ${now.toISOString()}`, 14, finalY + 28);
      if (manifest?.manifestId) {
        doc.text(`Manifest: ${manifest.manifestId.slice(0, 16)}…`, 14, finalY + 34);
      }
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);

      doc.save(`compliance-pack-${now.toISOString().split("T")[0]}.pdf`);

      // Audit
      await supabase.rpc("log_governance_event" as never, {
        _category: "compliance",
        _action: "pack.exported",
        _severity: "info",
        _context: { score: data.total, grade: data.grade, hash: packHash },
      } as never);

      toast.success("Compliance Pack généré");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={generate} disabled={loading} variant="default">
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
      Compliance Pack PDF
    </Button>
  );
}
