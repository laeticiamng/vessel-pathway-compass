import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useExportManifest } from "@/hooks/useExportManifest";

interface SoftwareVersion { version: string; released_at: string; risk_class: string; release_notes: string | null; }
interface SoupComponent { name: string; version: string; license: string | null; cve_status: string; purpose: string | null; }
interface ClinicalAlgo { name: string; version: string; validation_status: string; risk_class: string; last_review_at: string | null; }

/**
 * Génère le "Technical File" IEC 62304 consolidé (versions / SOUP / algorithmes).
 * Enregistre un manifest SHA-256 (chain-of-custody).
 */
export function IECTechnicalFileButton() {
  const [loading, setLoading] = useState(false);
  const { register } = useExportManifest();

  const generate = async () => {
    setLoading(true);
    try {
      const [vRes, sRes, aRes] = await Promise.all([
        supabase.from("software_versions" as never).select("version,released_at,risk_class,release_notes").order("released_at", { ascending: false }),
        supabase.from("soup_components" as never).select("name,version,license,cve_status,purpose").order("name"),
        supabase.from("clinical_algorithms" as never).select("name,version,validation_status,risk_class,last_review_at").order("name"),
      ]);
      if (vRes.error) throw vRes.error;
      if (sRes.error) throw sRes.error;
      if (aRes.error) throw aRes.error;

      const versions = (vRes.data ?? []) as unknown as SoftwareVersion[];
      const soup = (sRes.data ?? []) as unknown as SoupComponent[];
      const algos = (aRes.data ?? []) as unknown as ClinicalAlgo[];

      const doc = new jsPDF();
      const now = new Date();

      // Cover
      doc.setFontSize(20);
      doc.text("IEC 62304 — Technical File", 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Software Lifecycle Documentation — Édité le ${now.toLocaleString("fr-FR")}`, 14, 30);
      doc.setTextColor(0);
      doc.setFontSize(10);
      doc.text("Conforme à la norme IEC 62304 (logiciels de dispositifs médicaux).", 14, 40);

      // 1. Versions
      doc.setFontSize(14);
      doc.text("1. Historique des versions logicielles", 14, 54);
      autoTable(doc, {
        startY: 58,
        head: [["Version", "Date", "Classe", "Notes"]],
        body: versions.map((v) => [
          v.version,
          new Date(v.released_at).toLocaleDateString("fr-FR"),
          v.risk_class,
          (v.release_notes ?? "").slice(0, 80),
        ]),
        styles: { fontSize: 8 },
      });

      // 2. SOUP
      const y1 = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 80;
      doc.setFontSize(14);
      doc.text("2. Composants SOUP (Software Of Unknown Provenance)", 14, y1 + 12);
      autoTable(doc, {
        startY: y1 + 16,
        head: [["Nom", "Version", "Licence", "Statut CVE", "Usage"]],
        body: soup.length === 0
          ? [["—", "—", "—", "—", "Inventaire à compléter"]]
          : soup.map((s) => [s.name, s.version, s.license ?? "—", s.cve_status, (s.purpose ?? "").slice(0, 40)]),
        styles: { fontSize: 8 },
      });

      // 3. Algorithmes
      const y2 = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 140;
      if (y2 > 220) doc.addPage();
      const y3 = y2 > 220 ? 20 : y2 + 12;
      doc.setFontSize(14);
      doc.text("3. Algorithmes cliniques validés", 14, y3);
      autoTable(doc, {
        startY: y3 + 4,
        head: [["Nom", "Version", "Statut", "Classe", "Dernière revue"]],
        body: algos.map((a) => [
          a.name,
          a.version,
          a.validation_status,
          a.risk_class,
          a.last_review_at ? new Date(a.last_review_at).toLocaleDateString("fr-FR") : "—",
        ]),
        styles: { fontSize: 8 },
      });

      // Chain-of-custody footer (computed from a stable serialization)
      const payload = JSON.stringify({ versions, soup, algos, generatedAt: now.toISOString() });
      const manifest = await register({
        entityType: "iec62304_technical_file",
        format: "pdf",
        rowCount: versions.length + soup.length + algos.length,
        payload,
        purpose: "Technical File IEC 62304 — audit interne",
      });

      const yEnd = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 220;
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text("Signature horodatée (chain-of-custody)", 14, yEnd + 14);
      doc.setFont("courier", "normal");
      doc.text(`SHA-256 : ${manifest?.sha256 ?? "n/a"}`, 14, yEnd + 20);
      doc.text(`Manifest : ${manifest?.manifestId ?? "n/a"}`, 14, yEnd + 25);
      doc.text(`Émis le : ${now.toISOString()}`, 14, yEnd + 30);
      doc.setFont("helvetica", "normal");

      doc.save(`iec62304-technical-file-${now.toISOString().slice(0, 10)}.pdf`);
      toast.success("Technical File IEC 62304 généré");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={generate} disabled={loading} variant="default">
      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
      Technical File PDF
    </Button>
  );
}
