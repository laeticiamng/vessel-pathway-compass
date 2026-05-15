import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Loader2, Sparkles, Lock, History, RefreshCw, FileDown, FileText } from "lucide-react";
import { downloadCsv, downloadPdf, type AuditExportRow } from "@/lib/auditExport";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation, type Language } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/* ============================================================================
 * RsvpEngine — P2
 * Authenticated form calling rsvp-engine. Persists rsvp_stratifications
 * and surfaces the recommended L1/L2/L3 + cost / delay / LMIC bands.
 * Includes inline audit history (last 20 entries via RLS).
 * ========================================================================== */

type Level = "L1" | "L2" | "L3";

type Recommendation = {
  recommended_level: Level;
  rationale: string;
  bands: { cost: string; delay: string; lmic: string };
};

type Strat = {
  id: string;
  requested_level: Level;
  recommended_level: Level;
  rationale: string | null;
  bands: { cost?: string; delay?: string; lmic?: string } | null;
  created_at: string;
};

type Copy = {
  title: string;
  lede: string;
  signInCta: string;
  signInLabel: string;
  requested: string;
  lowResource: string;
  lmic: string;
  urgent: string;
  iodine: string;
  gadolinium: string;
  radiation: string;
  l1l2: string;
  submit: string;
  submitting: string;
  resultTitle: string;
  rationale: string;
  cost: string;
  delay: string;
  lmicHeader: string;
  errorTitle: string;
  history: string;
  refresh: string;
  empty: string;
};

const COPY: Record<Language, Copy> = {
  en: {
    title: "RSVP Stratification Engine",
    lede:
      "Provide local constraints and clinical context to receive a resource-stratified visual plan (L1/L2/L3). The mechanical revascularisation gesture is unchanged.",
    signInCta: "Sign in",
    signInLabel: "Sign in to use the stratification engine.",
    requested: "Requested level",
    lowResource: "Low-resource mode",
    lmic: "LMIC context",
    urgent: "Urgent / time-critical",
    iodine: "Iodinated contrast contraindicated",
    gadolinium: "Gadolinium contraindicated",
    radiation: "Ionising radiation contraindicated",
    l1l2: "L1/L2 deemed insufficient",
    submit: "Compute stratification",
    submitting: "Computing…",
    resultTitle: "Recommended level",
    rationale: "Rationale",
    cost: "Cost",
    delay: "Delay",
    lmicHeader: "LMIC transposability",
    errorTitle: "Stratification failed",
    history: "Stratification history",
    refresh: "Refresh",
    empty: "No stratifications yet.",
  },
  fr: {
    title: "Moteur de stratification RSVP",
    lede:
      "Renseignez les contraintes locales et le contexte clinique pour obtenir un plan visuel stratifié (L1/L2/L3). Le geste mécanique reste inchangé.",
    signInCta: "Se connecter",
    signInLabel: "Connectez-vous pour utiliser le moteur de stratification.",
    requested: "Niveau demandé",
    lowResource: "Mode faibles ressources",
    lmic: "Contexte LMIC",
    urgent: "Urgent / temps critique",
    iodine: "Contraste iodé contre-indiqué",
    gadolinium: "Gadolinium contre-indiqué",
    radiation: "Rayonnement ionisant contre-indiqué",
    l1l2: "L1/L2 jugé insuffisant",
    submit: "Calculer la stratification",
    submitting: "Calcul en cours…",
    resultTitle: "Niveau recommandé",
    rationale: "Justification",
    cost: "Coût",
    delay: "Délai",
    lmicHeader: "Transposabilité LMIC",
    errorTitle: "Échec de la stratification",
    history: "Historique des stratifications",
    refresh: "Rafraîchir",
    empty: "Aucune stratification pour l'instant.",
  },
  de: {
    title: "RSVP-Stratifizierungs-Engine",
    lede:
      "Geben Sie lokale Einschränkungen und klinischen Kontext ein, um einen ressourcenstratifizierten Bildplan (L1/L2/L3) zu erhalten. Die mechanische Geste bleibt unverändert.",
    signInCta: "Anmelden",
    signInLabel: "Melden Sie sich an, um die Engine zu verwenden.",
    requested: "Angeforderte Stufe",
    lowResource: "Low-Resource-Modus",
    lmic: "LMIC-Kontext",
    urgent: "Dringend / zeitkritisch",
    iodine: "Jodhaltiges Kontrastmittel kontraindiziert",
    gadolinium: "Gadolinium kontraindiziert",
    radiation: "Ionisierende Strahlung kontraindiziert",
    l1l2: "L1/L2 als unzureichend bewertet",
    submit: "Stratifizierung berechnen",
    submitting: "Wird berechnet…",
    resultTitle: "Empfohlene Stufe",
    rationale: "Begründung",
    cost: "Kosten",
    delay: "Verzögerung",
    lmicHeader: "LMIC-Transponierbarkeit",
    errorTitle: "Stratifizierung fehlgeschlagen",
    history: "Verlauf der Stratifizierungen",
    refresh: "Aktualisieren",
    empty: "Noch keine Stratifizierungen.",
  },
};

export function RsvpEngine({ initialLevel = "L2" as Level }: { initialLevel?: Level }) {
  const { language } = useTranslation();
  const c = COPY[language];
  const { session } = useAuth();

  const [requested, setRequested] = useState<Level>(initialLevel);
  const [lowResource, setLowResource] = useState(false);
  const [lmic, setLmic] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [iodine, setIodine] = useState(false);
  const [gadolinium, setGadolinium] = useState(false);
  const [radiation, setRadiation] = useState(false);
  const [l1l2, setL1l2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Recommendation | null>(null);
  const [items, setItems] = useState<Strat[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterRecommended, setFilterRecommended] = useState<string>("all");
  const [filterRequested, setFilterRequested] = useState<string>("all");

  const loadHistory = useCallback(async () => {
    if (!session) return;
    setHistoryLoading(true);
    try {
      let q = supabase
        .from("rsvp_stratifications")
        .select("id, requested_level, recommended_level, rationale, bands, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      if (fromDate) q = q.gte("created_at", new Date(fromDate).toISOString());
      if (toDate) {
        const d = new Date(toDate); d.setHours(23, 59, 59, 999);
        q = q.lte("created_at", d.toISOString());
      }
      if (filterRecommended !== "all") q = q.eq("recommended_level", filterRecommended as Level);
      if (filterRequested !== "all") q = q.eq("requested_level", filterRequested as Level);
      const { data, error } = await q;
      if (error) throw error;
      setItems((data ?? []) as Strat[]);
    } catch (err) {
      toast.error(c.errorTitle, {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setHistoryLoading(false);
    }
  }, [session, c.errorTitle, fromDate, toDate, filterRecommended, filterRequested]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  if (!session) {
    return (
      <section
        className="mt-12 rounded-xl border border-border bg-card/40 p-6"
        aria-label="rsvp-engine"
      >
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-muted-foreground" aria-hidden />
          <h2 className="text-xl font-semibold">{c.title}</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{c.signInLabel}</p>
        <Button asChild className="mt-4">
          <Link to="/auth">{c.signInCta}</Link>
        </Button>
      </section>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("rsvp-engine", {
        body: {
          inputs: {
            requested_level: requested,
            low_resource_mode: lowResource,
            lmic_context: lmic,
            urgent,
            iodine_contraindicated: iodine,
            gadolinium_contraindicated: gadolinium,
            radiation_contraindicated: radiation,
            l1l2_insufficient: l1l2,
          },
        },
      });
      if (error) throw error;
      setResult(data.recommendation as Recommendation);
      void loadHistory();
    } catch (err) {
      toast.error(c.errorTitle, {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section
        className="mt-12 rounded-xl border border-border bg-card/40 p-6"
        aria-label="rsvp-engine"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden />
          <h2 className="text-xl font-semibold">{c.title}</h2>
        </div>
        <p className="mt-2 text-sm text-muted-foreground max-w-3xl">{c.lede}</p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="rsvp-requested">{c.requested}</Label>
            <Select value={requested} onValueChange={(v) => setRequested(v as Level)}>
              <SelectTrigger id="rsvp-requested" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L1">L1</SelectItem>
                <SelectItem value="L2">L2</SelectItem>
                <SelectItem value="L3">L3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 grid gap-3 sm:grid-cols-2">
            {[
              [c.lowResource, lowResource, setLowResource],
              [c.lmic, lmic, setLmic],
              [c.urgent, urgent, setUrgent],
              [c.iodine, iodine, setIodine],
              [c.gadolinium, gadolinium, setGadolinium],
              [c.radiation, radiation, setRadiation],
              [c.l1l2, l1l2, setL1l2],
            ].map(([label, val, setter], i) => (
              <label key={i} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={val as boolean}
                  onCheckedChange={(v) => (setter as (b: boolean) => void)(!!v)}
                />
                <span>{label as string}</span>
              </label>
            ))}
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {c.submitting}
                </>
              ) : (
                c.submit
              )}
            </Button>
          </div>
        </form>

        {result && (
          <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {c.resultTitle}
              </h3>
              <Badge variant="default" className="text-base px-3 py-1">
                {result.recommended_level}
              </Badge>
            </div>
            <p className="mt-3 text-sm text-foreground/90">
              <span className="font-medium">{c.rationale}: </span>
              {result.rationale}
            </p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
              <div>
                <dt className="text-xs uppercase text-muted-foreground">{c.cost}</dt>
                <dd className="mt-1 font-medium">{result.bands.cost}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">{c.delay}</dt>
                <dd className="mt-1 font-medium">{result.bands.delay}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-muted-foreground">{c.lmicHeader}</dt>
                <dd className="mt-1 font-medium">{result.bands.lmic}</dd>
              </div>
            </dl>
          </div>
        )}
      </section>

      <section
        className="mt-8 rounded-xl border border-border bg-card/40 p-6"
        aria-label="rsvp-history"
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <History className="h-5 w-5 text-primary" aria-hidden />
            <h2 className="text-xl font-semibold">{c.history}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void loadHistory()} disabled={historyLoading}>
              {historyLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">{c.refresh}</span>
            </Button>
            {(() => {
              const csvHeaders = {
                timestamp: language === "fr" ? "Horodatage" : language === "de" ? "Zeitstempel" : "Timestamp",
                recommended: language === "fr" ? "Niveau recommandé" : language === "de" ? "Empfohlene Stufe" : "Recommended level",
                current: language === "fr" ? "Niveau demandé" : language === "de" ? "Angeforderte Stufe" : "Requested level",
                rationale: c.rationale,
              };
              const rows: AuditExportRow[] = items.map((it) => ({
                created_at: new Date(it.created_at).toISOString(),
                recommended: it.recommended_level,
                current: it.requested_level,
                rationale: it.rationale ?? "",
                extra: {
                  cost: it.bands?.cost ?? "",
                  delay: it.bands?.delay ?? "",
                  lmic: it.bands?.lmic ?? "",
                },
              }));
              return (
                <>
                  <Button variant="outline" size="sm" disabled={items.length === 0}
                    onClick={() => downloadCsv(`rsvp-history-${Date.now()}.csv`, rows, csvHeaders)}>
                    <FileDown className="h-4 w-4" /><span className="ml-2">CSV</span>
                  </Button>
                  <Button variant="outline" size="sm" disabled={items.length === 0}
                    onClick={() => downloadPdf(`rsvp-history-${Date.now()}.pdf`, "RSVP — Stratification history", rows, csvHeaders)}>
                    <FileText className="h-4 w-4" /><span className="ml-2">PDF</span>
                  </Button>
                </>
              );
            })()}
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div>
            <Label htmlFor="rsvp-from" className="text-xs">From</Label>
            <input id="rsvp-from" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              className="mt-1 w-full h-9 rounded-md border border-input bg-background px-2 text-sm" />
          </div>
          <div>
            <Label htmlFor="rsvp-to" className="text-xs">To</Label>
            <input id="rsvp-to" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
              className="mt-1 w-full h-9 rounded-md border border-input bg-background px-2 text-sm" />
          </div>
          <div>
            <Label className="text-xs">Recommended</Label>
            <Select value={filterRecommended} onValueChange={setFilterRecommended}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="L1">L1</SelectItem>
                <SelectItem value="L2">L2</SelectItem>
                <SelectItem value="L3">L3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Requested</Label>
            <Select value={filterRequested} onValueChange={setFilterRequested}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="L1">L1</SelectItem>
                <SelectItem value="L2">L2</SelectItem>
                <SelectItem value="L3">L3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {items.length === 0 && !historyLoading && (
          <p className="mt-4 text-sm text-muted-foreground">{c.empty}</p>
        )}
        {items.length > 0 && (
          <ul className="mt-4 divide-y divide-border">
            {items.map((it) => (
              <li key={it.id} className="py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="default">{it.recommended_level}</Badge>
                  <Badge variant="outline">req: {it.requested_level}</Badge>
                  {it.bands?.cost && <span className="text-xs text-muted-foreground">{it.bands.cost}</span>}
                  {it.bands?.delay && <span className="text-xs text-muted-foreground">· {it.bands.delay}</span>}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(it.created_at).toLocaleString(language)}
                  </span>
                </div>
                {it.rationale && (
                  <p className="mt-2 text-sm text-foreground/80">{it.rationale}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
