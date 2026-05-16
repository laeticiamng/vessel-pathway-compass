import { useSearchParams } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { DemoStepShell } from "@/components/demo/DemoStepShell";
import { AOMI_FRAGILE_CASE, DEMO_STEPS, type DemoStepId } from "@/demo/aomiFragileCase";

/**
 * Guided 2-minute demo — "Mme R., 82 ans" AOMI fragile / contraste contre-indiqué.
 *
 * Lot 1 (current): walkable skeleton with frozen case data, progress bar, keyboard nav.
 * Each step renders a placeholder visual + a narrative pulled from the frozen case.
 * Lot 2 will replace each VisualPlaceholder with the real app component in demoData mode.
 */

const STEP_IDS = new Set(DEMO_STEPS.map((s) => s.id));

function isStepId(value: string | null): value is DemoStepId {
  return value !== null && STEP_IDS.has(value as DemoStepId);
}

const CASE = AOMI_FRAGILE_CASE;

function VisualPlaceholder({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="h-full min-h-[420px] w-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-muted/40 to-muted/10">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
        Lot 2 — Branchement du visuel
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{label}</p>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">{hint}</p>
    </div>
  );
}

function renderStep(stepId: DemoStepId) {
  switch (stepId) {
    case "triage":
      return {
        headline: "IPS 0,42 droite · Frailty 5 · eGFR 32",
        visual: (
          <VisualPlaceholder
            label="Triage VascScreen"
            hint="L'écran VascScreen / résultat ABI affichera l'IPS, le score de fragilité et le score CI-AKI calculés sur les données du cas."
          />
        ),
        narrative: (
          <>
            <p>
              <strong>Pourquoi cette étape :</strong> identifier qu'on a affaire à une AOMI sévère
              (Rutherford {CASE.patient.rutherford}, IPS {CASE.triage.abiRight}) chez une patiente
              fragile avec contre-indication absolue au contraste iodé.
            </p>
            <p className="text-muted-foreground">{CASE.triage.ciAkiNote}</p>
          </>
        ),
      };
    case "imaging":
      return {
        headline: "AquaMR — sans iode, sans radiation",
        visual: (
          <VisualPlaceholder
            label="FusionViewer · séquence AquaMR"
            hint="Le FusionViewer affichera la séquence MR de Mme R., avec la mention explicite que CTA/DSA sont contre-indiqués."
          />
        ),
        narrative: (
          <>
            <p>
              <strong>Pourquoi cette étape :</strong> obtenir une cartographie vasculaire
              exploitable pour planifier le geste, là où {CASE.imaging.contraindicatedAlternatives.join(" et ")}{" "}
              sont écartés d'emblée.
            </p>
            <p className="text-muted-foreground">{CASE.imaging.findings}</p>
          </>
        ),
      };
    case "twin":
      return {
        headline: `Sténose ${CASE.twin.stenosisPct}% — ${CASE.twin.dominantLesion}`,
        visual: (
          <VisualPlaceholder
            label="Digital Twin · 18 segments"
            hint={`La carte SVG colorera les segments ${CASE.twin.affectedSegments.join(", ")} selon la sévérité de la lésion.`}
          />
        ),
        narrative: (
          <>
            <p>
              <strong>Pourquoi cette étape :</strong> visualiser la lésion dominante dans la chaîne
              visuelle complète. La distalité est conservée → revascularisation faisable.
            </p>
          </>
        ),
      };
    case "decision":
      return {
        headline: `Décision ${CASE.decision.committeeLevel} — ${CASE.decision.chosenPath}`,
        visual: (
          <VisualPlaceholder
            label="L1 Decision Board"
            hint="Le board L1 affichera le raisonnement structuré : indication, alternatives écartées et justification."
          />
        ),
        narrative: (
          <>
            <p>
              <strong>Pourquoi cette étape :</strong> tracer la décision clinique de façon
              auditable, avec les alternatives explicitement écartées.
            </p>
            <p className="text-muted-foreground">{CASE.decision.rationale}</p>
            <ul className="mt-2 text-xs text-muted-foreground list-disc pl-4 space-y-1">
              {CASE.decision.alternativesConsidered.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </>
        ),
      };
    case "plan":
      return {
        headline: `${CASE.plan.procedure} · ${CASE.plan.expectedDurationMin} min`,
        visual: (
          <VisualPlaceholder
            label="Procedure Planner"
            hint="Le planner détaillera voie d'abord, matériel, anesthésie et timeline opératoire."
          />
        ),
        narrative: (
          <>
            <p>
              <strong>Pourquoi cette étape :</strong> traduire la décision en plan exécutable adapté
              à la fragilité (anesthésie locale, abord controlatéral).
            </p>
            <p className="text-muted-foreground">
              Abord : {CASE.plan.access}. Anesthésie : {CASE.plan.anaesthesia}.
            </p>
          </>
        ),
      };
    case "proms":
      return {
        headline: `${CASE.proms.tool} : ${CASE.proms.baseline} → ${CASE.proms.m6} à M6`,
        visual: (
          <VisualPlaceholder
            label="Registry · VascuQoL-6"
            hint="La courbe PROMs affichera l'évolution baseline → M3 → M6 sur la patiente du cas."
          />
        ),
        narrative: (
          <>
            <p>
              <strong>Pourquoi cette étape :</strong> fermer la boucle clinique avec un PROM validé.
              La qualité de vie passe de {CASE.proms.baseline} à {CASE.proms.m6} sur 24.
            </p>
            <p className="text-muted-foreground">
              C'est ce résultat patient-reporté qui justifie a posteriori la stratégie AquaMR.
            </p>
          </>
        ),
      };
  }
}

export default function AomiFragileDemo() {
  const [search] = useSearchParams();
  const stepParam = search.get("step");
  const stepId: DemoStepId = isStepId(stepParam) ? stepParam : "triage";
  const step = renderStep(stepId);

  return (
    <>
      <SEOHead
        title="Démo guidée — AOMI fragile sans contraste · VASCU-LINK"
        description="Parcours clinique 2 minutes : triage, imagerie AquaMR, digital twin, décision L1, plan opératoire, suivi PROMs sur un cas fictif d'AOMI sévère avec contre-indication au contraste iodé."
      />
      <DemoStepShell
        stepId={stepId}
        visual={step.visual}
        narrative={step.narrative}
        headline={step.headline}
      />
    </>
  );
}
