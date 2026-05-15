import { useEffect, useState, useCallback } from "react";
import { History, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation, type Language } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/* ============================================================================
 * VisualChainAudit — P1
 * Lists the most recent visual_chain_assessments accessible to the signed-in
 * user (own + institution + admin per RLS).
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
};

const COPY: Record<Language, Copy> = {
  en: {
    title: "Assessment history",
    empty: "No assessments yet — submit the form above to create your first record.",
    refresh: "Refresh",
    loading: "Loading…",
    errorTitle: "Failed to load history",
    recommended: "Recommended",
    current: "Current",
    rationale: "Rationale",
  },
  fr: {
    title: "Historique des évaluations",
    empty: "Aucune évaluation pour l'instant — soumettez le formulaire ci-dessus pour créer le premier enregistrement.",
    refresh: "Rafraîchir",
    loading: "Chargement…",
    errorTitle: "Échec du chargement de l'historique",
    recommended: "Recommandée",
    current: "Actuelle",
    rationale: "Justification",
  },
  de: {
    title: "Bewertungsverlauf",
    empty: "Noch keine Bewertungen — senden Sie das obige Formular ab, um den ersten Eintrag zu erstellen.",
    refresh: "Aktualisieren",
    loading: "Wird geladen…",
    errorTitle: "Verlauf konnte nicht geladen werden",
    recommended: "Empfohlen",
    current: "Aktuell",
    rationale: "Begründung",
  },
};

export function VisualChainAudit({ refreshKey = 0 }: { refreshKey?: number }) {
  const { language } = useTranslation();
  const c = COPY[language];
  const { session } = useAuth();
  const [items, setItems] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("visual_chain_assessments")
        .select("id, current_layer, recommended_layer, rationale, inputs, score, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      setItems((data ?? []) as Assessment[]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(c.errorTitle, { description: msg });
    } finally {
      setLoading(false);
    }
  }, [session, c.errorTitle]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (!session) return null;

  return (
    <section
      className="mt-8 rounded-xl border border-border bg-card/40 p-6"
      aria-label="visual-chain-audit"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <History className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="text-xl font-semibold">{c.title}</h2>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">{c.refresh}</span>
        </Button>
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
                  <span className="font-medium">{c.rationale}: </span>
                  {a.rationale}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
