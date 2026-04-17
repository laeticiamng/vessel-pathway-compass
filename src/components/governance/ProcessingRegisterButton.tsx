import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuditLog } from "@/hooks/useAuditLog";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useExportManifest } from "@/hooks/useExportManifest";

/**
 * Génère le registre des traitements RGPD (art. 30) en PDF.
 * Source : data_lifecycle_policies + agrégats governance_events 30 derniers jours.
 */
export function ProcessingRegisterButton() {
  const { log } = useAuditLog();
  const { register } = useExportManifest();
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      const [policiesRes, eventsRes] = await Promise.all([
        supabase.from("data_lifecycle_policies" as never).select("*").order("entity_type"),
        supabase
          .from("governance_events" as never)
          .select("event_category, event_action, severity")
          .gte("created_at", new Date(Date.now() - 30 * 86400_000).toISOString()),
      ]);
      if (policiesRes.error) throw policiesRes.error;
      if (eventsRes.error) throw eventsRes.error;

      const policies = (policiesRes.data ?? []) as Array<{
        entity_type: string;
        retention_days: number;
        legal_basis: string;
        automatic_action: string;
        description: string | null;
      }>;
      const events = (eventsRes.data ?? []) as Array<{
        event_category: string;
        event_action: string;
        severity: string;
      }>;

      // Aggregate events by category
      const byCat = events.reduce<Record<string, number>>((acc, e) => {
        acc[e.event_category] = (acc[e.event_category] ?? 0) + 1;
        return acc;
      }, {});

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Registre des traitements RGPD", 14, 18);
      doc.setFontSize(10);
      doc.text("Art. 30 du Règlement (UE) 2016/679 — AquaMR Flow", 14, 25);
      doc.text(`Édité le ${new Date().toLocaleDateString("fr-FR")}`, 14, 31);

      doc.setFontSize(12);
      doc.text("1. Politiques de conservation des données", 14, 42);
      autoTable(doc, {
        startY: 46,
        head: [["Type de donnée", "Durée (jours)", "Action", "Base légale"]],
        body: policies.map((p) => [
          p.entity_type,
          String(p.retention_days),
          p.automatic_action,
          p.legal_basis,
        ]),
        styles: { fontSize: 8 },
      });

      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

      doc.setFontSize(12);
      doc.text("2. Activité des 30 derniers jours par catégorie", 14, finalY);
      autoTable(doc, {
        startY: finalY + 4,
        head: [["Catégorie", "Nombre d'événements"]],
        body: Object.entries(byCat).map(([k, v]) => [k, String(v)]),
        styles: { fontSize: 9 },
      });

      const finalY2 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.text("3. Mesures de sécurité techniques et organisationnelles", 14, finalY2);
      doc.setFontSize(9);
      const lines = [
        "- Authentification forte (Supabase Auth + HIBP)",
        "- RLS systématique sur toutes les tables sensibles",
        "- Audit transverse via governance_events (ADR-001)",
        "- Double validation clinique via clinical_signoffs (ADR-002)",
        "- Cycle de vie automatisé via enforce_data_lifecycle (cron quotidien)",
        "- Self-service RGPD : export, accès, rectification, effacement",
        "- Détection d'anomalies temps réel sur le journal d'audit",
      ];
      lines.forEach((l, i) => doc.text(l, 14, finalY2 + 6 + i * 5));

      // Register chain-of-custody manifest (P7 — ADR-014)
      const payload = JSON.stringify({ policies, byCat, generated_at: new Date().toISOString() });
      const manifest = await register({
        entityType: "rgpd_processing_register",
        format: "pdf",
        rowCount: policies.length,
        payload,
        purpose: "Registre RGPD art. 30",
        context: { events_30d: events.length },
      });

      // Footer signature
      const sigY = finalY2 + 6 + lines.length * 5 + 8;
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`SHA-256: ${manifest?.sha256 ?? "n/a"}`, 14, sigY);
      doc.setTextColor(0);

      doc.save(`registre-traitements-rgpd-${new Date().toISOString().slice(0, 10)}.pdf`);

      await log({
        category: "compliance",
        action: "rgpd.register.generated",
        severity: "info",
        context: { policies: policies.length, events_30d: events.length, sha256: manifest?.sha256 },
      });
      toast.success("Registre RGPD téléchargé");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Échec génération PDF";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handle} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
      Registre RGPD (PDF)
    </Button>
  );
}
