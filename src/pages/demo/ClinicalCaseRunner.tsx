import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { DemoStepShell } from "@/components/demo/DemoStepShell";
import { DEMO_STEPS, type DemoStepId } from "@/demo/aomiFragileCase";
import { getClinicalCase } from "@/demo/clinicalCases";
import { TriagePanel } from "@/components/demo/panels/TriagePanel";
import { ImagingPanel } from "@/components/demo/panels/ImagingPanel";
import { TwinPanel } from "@/components/demo/panels/TwinPanel";
import { DecisionPanel } from "@/components/demo/panels/DecisionPanel";
import { PlanPanel } from "@/components/demo/panels/PlanPanel";
import { PromsPanel } from "@/components/demo/panels/PromsPanel";
import { FollowUpPanel } from "@/components/demo/panels/FollowUpPanel";
import type { DemoCase } from "@/demo/aomiFragileCase";

const STEP_IDS = new Set(DEMO_STEPS.map((s) => s.id));

function isStepId(v: string | null): v is DemoStepId {
  return v !== null && STEP_IDS.has(v as DemoStepId);
}

function renderStep(c: DemoCase, stepId: DemoStepId) {
  switch (stepId) {
    case "triage":
      return {
        headline: `IPS ${c.triage.abiRight}/${c.triage.abiLeft} · Frailty ${c.patient.frailty}/9 · eGFR ${c.patient.egfr}`,
        visual: <TriagePanel case={c} />,
        narrative: (
          <>
            <p>
              <strong>Pourquoi cette étape :</strong> caractériser la sévérité clinique (Rutherford{" "}
              {c.patient.rutherford}), les facteurs de risque et la faisabilité d'un contraste.
            </p>
            <p className="text-muted-foreground">{c.triage.ciAkiNote}</p>
          </>
        ),
      };
    case "imaging":
      return {
        headline: `${c.imaging.modality} — ${c.imaging.contraindicatedAlternatives.length > 0 ? "alternatives contre-indiquées" : "modalité standard"}`,
        visual: <ImagingPanel case={c} />,
        narrative: (
          <>
            <p>
              <strong>Pourquoi cette étape :</strong> obtenir la cartographie vasculaire adaptée au
              profil rénal et allergique du patient.
            </p>
            <p className="text-muted-foreground">{c.imaging.findings}</p>
          </>
        ),
      };
    case "twin":
      return {
        headline: `Sténose ${c.twin.stenosisPct}% — ${c.twin.dominantLesion}`,
        visual: <TwinPanel case={c} />,
        narrative: (
          <p>
            <strong>Pourquoi cette étape :</strong> visualiser la (les) lésion(s) dans la chaîne
            visuelle complète pour planifier le geste.
          </p>
        ),
      };
    case "decision":
      return {
        headline: `Décision ${c.decision.committeeLevel} — ${c.decision.chosenPath}`,
        visual: <DecisionPanel case={c} />,
        narrative: (
          <>
            <p>
              <strong>Pourquoi cette étape :</strong> tracer la décision clinique avec son niveau
              d'arbitrage L1/L2/L3 et les alternatives écartées.
            </p>
            {c.triageJustification && (
              <p className="text-muted-foreground">{c.triageJustification}</p>
            )}
          </>
        ),
      };
    case "plan":
      return {
        headline: `${c.plan.procedure} · ${c.plan.expectedDurationMin} min`,
        visual: <PlanPanel case={c} />,
        narrative: (
          <p>
            <strong>Pourquoi cette étape :</strong> traduire la décision en plan opératoire concret
            (abord : {c.plan.access}, anesthésie : {c.plan.anaesthesia}).
          </p>
        ),
      };
    case "proms":
      return {
        headline: `${c.proms.tool} : ${c.proms.baseline} → ${c.proms.m6} à M6`,
        visual: <PromsPanel case={c} />,
        narrative: (
          <p>
            <strong>Pourquoi cette étape :</strong> mesurer le résultat patient-reporté à 3 et 6
            mois avec un PROM validé.
          </p>
        ),
      };
    case "followup": {
      const last = c.longitudinalFollowUp?.[c.longitudinalFollowUp.length - 1];
      return {
        headline: last
          ? `M12 · QoL ${last.vascuQoL6}/24 · ${last.walkingDistanceMeters} m`
          : "Suivi M1 → M12",
        visual: <FollowUpPanel case={c} />,
        narrative: (
          <>
            <p>
              <strong>Pourquoi cette étape :</strong> suivre la trajectoire clinique sur 12 mois et
              détecter une éventuelle ré-intervention.
            </p>
            <p className="text-muted-foreground">
              Les jalons M3 / M6 / M12 du registre sont prospectifs.
            </p>
          </>
        ),
      };
    }
  }
}

export default function ClinicalCaseRunner() {
  const { caseId } = useParams<{ caseId: string }>();
  const [search] = useSearchParams();
  const c = getClinicalCase(caseId);

  if (!c) return <Navigate to="/demo/clinical-cases" replace />;

  const stepParam = search.get("step");
  const stepId: DemoStepId = isStepId(stepParam) ? stepParam : "triage";
  const step = renderStep(c, stepId);

  return (
    <>
      <SEOHead
        title={`${c.label} · Démo clinique VASCU-LINK`}
        description={c.shortPitch ?? `Parcours clinique fictif en 7 étapes : ${c.label}.`}
      />
      <DemoStepShell
        stepId={stepId}
        visual={step.visual}
        narrative={step.narrative}
        headline={step.headline}
        basePath={`/demo/clinical-cases/${c.id}`}
        caseLabel={c.label}
        libraryHref="/demo/clinical-cases"
      />
    </>
  );
}
