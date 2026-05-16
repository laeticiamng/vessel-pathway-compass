import { useSearchParams } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { DemoStepShell } from "@/components/demo/DemoStepShell";
import { AOMI_FRAGILE_CASE, DEMO_STEPS, type DemoStepId } from "@/demo/aomiFragileCase";
import { TriagePanel } from "@/components/demo/panels/TriagePanel";
import { ImagingPanel } from "@/components/demo/panels/ImagingPanel";
import { TwinPanel } from "@/components/demo/panels/TwinPanel";
import { DecisionPanel } from "@/components/demo/panels/DecisionPanel";
import { PlanPanel } from "@/components/demo/panels/PlanPanel";
import { PromsPanel } from "@/components/demo/panels/PromsPanel";

/**
 * Guided 2-minute demo — "Mme R., 82 ans" AOMI fragile / contraste contre-indiqué.
 *
 * Lot 2: each step renders a self-contained demo panel fed by AOMI_FRAGILE_CASE.
 * Zero Supabase calls, zero side effects — purely presentational.
 */

const STEP_IDS = new Set(DEMO_STEPS.map((s) => s.id));

function isStepId(value: string | null): value is DemoStepId {
  return value !== null && STEP_IDS.has(value as DemoStepId);
}

const CASE = AOMI_FRAGILE_CASE;

function renderStep(stepId: DemoStepId) {
  switch (stepId) {
    case "triage":
      return {
        headline: "IPS 0,42 droite · Frailty 5 · eGFR 32",
        visual: <TriagePanel />,
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
        visual: <ImagingPanel />,
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
        visual: <TwinPanel />,
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
        visual: <DecisionPanel />,
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
        visual: <PlanPanel />,
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
        visual: <PromsPanel />,
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
