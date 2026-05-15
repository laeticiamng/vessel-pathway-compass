import { useEffect, useState, useCallback, useMemo } from "react";
import { History, Loader2, RefreshCw, FileDown, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation, type Language } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { downloadCsv, downloadPdf, type AuditExportRow } from "@/lib/auditExport";

/* ============================================================================
 * VisualChainAudit — P1 with filters (date range, recommended/current layer)
 * ========================================================================== */

type Assessment = {
  id: string;
  current_layer: string;
  recommended_layer: string;
  rationale: string | null;
  inputs: Record<string, unknown> | null;
  score: Record<string, boolean> | null;
  created_at: string;
};

type Copy = {
  title: string;
  empty: string;
  refresh: string;
  loading: string;
  errorTitle: string;
  recommended: string;
  current: string;
  rationale: string;
  exportCsv: string;
  exportPdf: string;
  pdfTitle: string;
  filters: string;
  from: string;
  to: string;
  any: string;
  csvHeaders: { timestamp: string; recommended: string; current: string; rationale: string };
};

const COPY: Record<Language, Copy> = {
  en: {
    title: "Assessment history", empty: "No assessments match the current filters.",
    refresh: "Refresh", loading: "Loading…", errorTitle: "Failed to load history",
    recommended: "Recommended", current: "Current", rationale: "Rationale",
    exportCsv: "Export CSV", exportPdf: "Export PDF",
    pdfTitle: "Visual Chain — Assessment history",
    filters: "Filters", from: "From", to: "To", any: "Any",
    csvHeaders: { timestamp: "Timestamp", recommended: "Recommended layer", current: "Current layer", rationale: "Rationale" },
  },
  fr: {
    title: "Historique des évaluations", empty: "Aucune évaluation ne correspond aux filtres actuels.",
    refresh: "Rafraîchir", loading: "Chargement…", errorTitle: "Échec du chargement",
    recommended: "Recommandée", current: "Actuelle", rationale: "Justification",
    exportCsv: "Export CSV", exportPdf: "Export PDF",
    pdfTitle: "Chaîne visuelle — Historique",
    filters: "Filtres", from: "Du", to: "Au", any: "Toutes",
    csvHeaders: { timestamp: "Horodatage", recommended: "Couche recommandée", current: "Couche actuelle", rationale: "Justification" },
  },
  de: {
    title: "Bewertungsverlauf", empty: "Keine Bewertungen entsprechen den Filtern.",
    refresh: "Aktualisieren", loading: "Wird geladen…", errorTitle: "Verlauf konnte nicht geladen werden",
    recommended: "Empfohlen", current: "Aktuell", rationale: "Begründung",
    exportCsv: "CSV exportieren", exportPdf: "PDF exportieren",
    pdfTitle: "Visuelle Kette — Bewertungsverlauf",
    filters: "Filter", from: "Von", to: "Bis", any: "Alle",
    csvHeaders: { timestamp: "Zeitstempel", recommended: "Empfohlene Schicht", current: "Aktuelle Schicht", rationale: "Begründung" },
  },
};

const LAYERS = ["L1", "L2", "L3", "Post-PhD"];

export function VisualChainAudit({ refreshKey = 0 }: { refreshKey?: number }) {
  const { language } = useTranslation();
  const c = COPY[language];
  const { session } = useAuth();
  const [items, setItems] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [recommended, setRecommended] = useState<string>("all");
  const [current, setCurrent] = useState<string>("all");

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      let q = supabase
        .from("visual_chain_assessments")
        .select("id, current_layer, recommended_layer, rationale, inputs, score, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (from) q = q.gte("created_at", new Date(from).toISOString());
      if (to) {
        const d = new Date(to); d.setHours(23, 59, 59, 999);
        q = q.lte("created_at", d.toISOString());
      }
      if (recommended !== "all") q = q.eq("recommended_layer", recommended);
      if (current !== "all") q = q.eq("current_layer", current);
      const { data, error } = await q;
      if (error) throw error;
      setItems((data ?? []) as Assessment[]);
    } catch (err) {
      toast.error(c.errorTitle, { description: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  }, [session, c.errorTitle, from, to, recommended, current]);

  useEffect(() => { void load(); }, [load, refreshKey]);

  const rows: AuditExportRow[] = useMemo(() => items.map((a) => ({
    created_at: new Date(a.created_at).toISOString(),
    recommended: a.recommended_layer,
    current: a.current_layer,
    rationale: a.rationale ?? "",
  })), [items]);

  if (!session) return null;

  return (
    <section className="mt-8 rounded-xl border border-border bg-card/40 p-6" aria-label="visual-chain-audit">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <History className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="text-xl font-semibold">{c.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2">{c.refresh}</span>
          </Button>
          <Button variant="outline" size="sm" disabled={rows.length === 0}
            onClick={() => downloadCsv(`visual-chain-audit-${Date.now()}.csv`, rows, c.csvHeaders)}>
            <FileDown className="h-4 w-4" /><span className="ml-2">{c.exportCsv}</span>
          </Button>
          <Button variant="outline" size="sm" disabled={rows.length === 0}
            onClick={() => downloadPdf(`visual-chain-audit-${Date.now()}.pdf`, c.pdfTitle, rows, c.csvHeaders)}>
            <FileText className="h-4 w-4" /><span className="ml-2">{c.exportPdf}</span>
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <div>
          <Label htmlFor="vca-from" className="text-xs">{c.from}</Label>
          <Input id="vca-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="vca-to" className="text-xs">{c.to}</Label>
          <Input id="vca-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">{c.recommended}</Label>
          <Select value={recommended} onValueChange={setRecommended}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{c.any}</SelectItem>
              {LAYERS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">{c.current}</Label>
          <Select value={current} onValueChange={setCurrent}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{c.any}</SelectItem>
              {LAYERS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {items.length === 0 && !loading && (
        <p className="mt-4 text-sm text-muted-foreground">{c.empty}</p>
      )}

      {items.length > 0 && (
        <ul className="mt-4 divide-y divide-border">
          {items.map((a) => (
            <li key={a.id} className="py-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">{c.recommended}: {a.recommended_layer}</Badge>
                <Badge variant="outline">{c.current}: {a.current_layer}</Badge>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(a.created_at).toLocaleString(language)}
                </span>
              </div>
              {a.rationale && (
                <p className="mt-2 text-sm text-foreground/80">
                  <span className="font-medium">{c.rationale}: </span>{a.rationale}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
