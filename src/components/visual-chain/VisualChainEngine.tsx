import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Sparkles, Lock } from "lucide-react";
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
 * VisualChainEngine — P1
 *
 * Authenticated form that calls the visual-chain-engine edge function and
 * shows the recommended layer + 4-zero badges + rationale.
 * Inline COPY pattern matches the parent VisualChain page.
 * ========================================================================== */

type ResourceLevel = "L1" | "L2" | "L3";
type EchoQuality = "conclusive" | "inconclusive" | "unknown";
type LayerOut = "L1" | "L2" | "L3" | "Post-PhD";

type Recommendation = {
  recommended_layer: LayerOut;
  rationale: string;
  score: {
    zero_contrast: boolean;
    zero_radiation: boolean;
    zero_invasive: boolean;
    zero_anesthesia: boolean;
  };
};

type EngineCopy = {
  title: string;
  lede: string;
  signInCta: string;
  signInLabel: string;
  currentLayer: string;
  resourceLevel: string;
  echoQuality: string;
  echoOptions: Record<EchoQuality, string>;
  ciAki: string;
  radiationContraind: string;
  preGesture: string;
  research: string;
  submit: string;
  submitting: string;
  resultTitle: string;
  rationale: string;
  zeros: {
    contrast: string;
    radiation: string;
    invasive: string;
    anesthesia: string;
  };
  errorTitle: string;
};

const COPY: Record<Language, EngineCopy> = {
  en: {
    title: "Visual Chain Assessment Engine",
    lede:
      "Provide clinical inputs to receive an evidence-based recommendation across the L1/L2/L3/Post-PhD layers. The mechanical revascularisation gesture is unchanged.",
    signInCta: "Sign in",
    signInLabel: "Sign in to use the assessment engine.",
    currentLayer: "Current layer in use",
    resourceLevel: "Available resource level",
    echoQuality: "Ultrasound (echo) quality at point of decision",
    echoOptions: {
      conclusive: "Conclusive",
      inconclusive: "Inconclusive",
      unknown: "Unknown / not performed",
    },
    ciAki: "CI-AKI risk present",
    radiationContraind: "Radiation contraindicated",
    preGesture: "Pre-gesture confirmation required",
    research: "Research / audit context",
    submit: "Compute recommendation",
    submitting: "Computing…",
    resultTitle: "Recommended layer",
    rationale: "Rationale",
    zeros: {
      contrast: "Zero iodinated contrast",
      radiation: "Zero ionising radiation",
      invasive: "Zero invasive access",
      anesthesia: "Zero anaesthesia",
    },
    errorTitle: "Assessment failed",
  },
  fr: {
    title: "Moteur d'évaluation de la chaîne visuelle",
    lede:
      "Renseignez les données cliniques pour obtenir une recommandation L1/L2/L3/Post-PhD. Le geste de revascularisation mécanique reste inchangé.",
    signInCta: "Se connecter",
    signInLabel: "Connectez-vous pour utiliser le moteur d'évaluation.",
    currentLayer: "Couche actuellement utilisée",
    resourceLevel: "Niveau de ressources disponible",
    echoQuality: "Qualité de l'écho au point de décision",
    echoOptions: {
      conclusive: "Concluante",
      inconclusive: "Non concluante",
      unknown: "Inconnue / non réalisée",
    },
    ciAki: "Risque CI-AKI présent",
    radiationContraind: "Rayonnement contre-indiqué",
    preGesture: "Confirmation pré-geste requise",
    research: "Contexte recherche / audit",
    submit: "Calculer la recommandation",
    submitting: "Calcul en cours…",
    resultTitle: "Couche recommandée",
    rationale: "Justification",
    zeros: {
      contrast: "Zéro produit de contraste iodé",
      radiation: "Zéro rayonnement ionisant",
      invasive: "Zéro accès invasif",
      anesthesia: "Zéro anesthésie",
    },
    errorTitle: "Échec de l'évaluation",
  },
  de: {
    title: "Bewertungs-Engine der visuellen Kette",
    lede:
      "Geben Sie klinische Daten ein, um eine evidenzbasierte Empfehlung über die Schichten L1/L2/L3/Post-PhD zu erhalten. Die mechanische Revaskularisationsgeste bleibt unverändert.",
    signInCta: "Anmelden",
    signInLabel: "Melden Sie sich an, um die Bewertungs-Engine zu verwenden.",
    currentLayer: "Aktuell verwendete Schicht",
    resourceLevel: "Verfügbare Ressourcenstufe",
    echoQuality: "Ultraschallqualität am Entscheidungspunkt",
    echoOptions: {
      conclusive: "Schlüssig",
      inconclusive: "Nicht schlüssig",
      unknown: "Unbekannt / nicht durchgeführt",
    },
    ciAki: "CI-AKI-Risiko vorhanden",
    radiationContraind: "Strahlung kontraindiziert",
    preGesture: "Bestätigung vor der Geste erforderlich",
    research: "Forschungs- / Audit-Kontext",
    submit: "Empfehlung berechnen",
    submitting: "Wird berechnet…",
    resultTitle: "Empfohlene Schicht",
    rationale: "Begründung",
    zeros: {
      contrast: "Null jodhaltiges Kontrastmittel",
      radiation: "Null ionisierende Strahlung",
      invasive: "Kein invasiver Zugang",
      anesthesia: "Keine Anästhesie",
    },
    errorTitle: "Bewertung fehlgeschlagen",
  },
};

export function VisualChainEngine() {
  const { language } = useTranslation();
  const c = COPY[language];
  const { session } = useAuth();

  const [currentLayer, setCurrentLayer] = useState<LayerOut>("L1");
  const [resourceLevel, setResourceLevel] = useState<ResourceLevel>("L2");
  const [echoQuality, setEchoQuality] = useState<EchoQuality>("unknown");
  const [ciAki, setCiAki] = useState(false);
  const [radContra, setRadContra] = useState(false);
  const [preGesture, setPreGesture] = useState(false);
  const [research, setResearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Recommendation | null>(null);

  if (!session) {
    return (
      <section
        className="mt-12 rounded-xl border border-border bg-card/40 p-6"
        aria-label="visual-chain-engine"
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
      const { data, error } = await supabase.functions.invoke(
        "visual-chain-engine",
        {
          body: {
            current_layer: currentLayer,
            inputs: {
              resource_level: resourceLevel,
              echo_quality: echoQuality,
              ci_aki_risk: ciAki,
              radiation_contraindicated: radContra,
              pre_gesture_confirmation_required: preGesture,
              research_context: research,
            },
          },
        },
      );
      if (error) throw error;
      setResult(data.recommendation as Recommendation);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(c.errorTitle, { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="mt-12 rounded-xl border border-border bg-card/40 p-6"
      aria-label="visual-chain-engine"
    >
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-xl font-semibold">{c.title}</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground max-w-3xl">{c.lede}</p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="current-layer">{c.currentLayer}</Label>
          <Select
            value={currentLayer}
            onValueChange={(v) => setCurrentLayer(v as LayerOut)}
          >
            <SelectTrigger id="current-layer" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L1">L1</SelectItem>
              <SelectItem value="L2">L2</SelectItem>
              <SelectItem value="L3">L3</SelectItem>
              <SelectItem value="Post-PhD">Post-PhD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="resource-level">{c.resourceLevel}</Label>
          <Select
            value={resourceLevel}
            onValueChange={(v) => setResourceLevel(v as ResourceLevel)}
          >
            <SelectTrigger id="resource-level" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L1">L1</SelectItem>
              <SelectItem value="L2">L2</SelectItem>
              <SelectItem value="L3">L3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="echo-quality">{c.echoQuality}</Label>
          <Select
            value={echoQuality}
            onValueChange={(v) => setEchoQuality(v as EchoQuality)}
          >
            <SelectTrigger id="echo-quality" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conclusive">{c.echoOptions.conclusive}</SelectItem>
              <SelectItem value="inconclusive">{c.echoOptions.inconclusive}</SelectItem>
              <SelectItem value="unknown">{c.echoOptions.unknown}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={ciAki} onCheckedChange={(v) => setCiAki(!!v)} />
            <span>{c.ciAki}</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={radContra} onCheckedChange={(v) => setRadContra(!!v)} />
            <span>{c.radiationContraind}</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={preGesture} onCheckedChange={(v) => setPreGesture(!!v)} />
            <span>{c.preGesture}</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={research} onCheckedChange={(v) => setResearch(!!v)} />
            <span>{c.research}</span>
          </label>
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
              {result.recommended_layer}
            </Badge>
          </div>
          <p className="mt-3 text-sm text-foreground/90">
            <span className="font-medium">{c.rationale}: </span>
            {result.rationale}
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {(
              [
                ["zero_contrast", c.zeros.contrast],
                ["zero_radiation", c.zeros.radiation],
                ["zero_invasive", c.zeros.invasive],
                ["zero_anesthesia", c.zeros.anesthesia],
              ] as const
            ).map(([key, label]) => {
              const ok = result.score[key];
              return (
                <li
                  key={key}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    aria-hidden
                    className={`h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
                  />
                  <span className={ok ? "" : "text-muted-foreground line-through"}>
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
