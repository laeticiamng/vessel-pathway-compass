import { AOMI_FRAGILE_CASE, type DemoCase } from "./aomiFragileCase";

/**
 * Cas claudicant standard — exemple "courant" d'arbitrage L2 endo vs médical.
 */
const M_D_CLAUDICANT = Object.freeze({
  id: "m-d-claudicant",
  label: "M. D., 64 ans — claudication invalidante",
  shortPitch:
    "Diabétique tabagique actif, claudication serrée 200 m. Arbitrage : optimisation médicale vs revascularisation endovasculaire.",
  patient: {
    initials: "D.M.",
    age: 64,
    sex: "M" as const,
    frailty: 3,
    egfr: 78,
    ckdStage: "Normal",
    iodineAllergy: false,
    rutherford: 3,
  },
  symptoms: [
    "Claudication mollet G à 200 m, plat",
    "Pas de douleur de repos",
    "Réduction des activités professionnelles depuis 6 mois",
  ],
  riskFactors: {
    diabetes: true,
    smoking: "active" as const,
    hypertension: true,
    dyslipidemia: true,
    ckd: false,
    priorMI: false,
    priorStroke: false,
    antiplatelet: true,
  },
  doppler: {
    abiRight: 0.95,
    abiLeft: 0.62,
    waveform: "biphasique" as const,
    peakSystolicVelocityCmS: 280,
    notes: "Onde biphasique post-sténotique fémorale superficielle G, ratio PSV ~ 2.5.",
  },
  triage: {
    abiRight: 0.95,
    abiLeft: 0.62,
    walkingDistanceMeters: 200,
    ciAkiRisk: "low" as const,
    ciAkiNote: "eGFR 78, pas d'allergie iode → contraste autorisé sans précaution particulière.",
  },
  triageJustification:
    "L2 — RCP courte : indication discutée entre optimisation médicale supervisée (BAT) et angioplastie. Profil intermédiaire (Rutherford 3, comorbidités contrôlées), pas de complexité technique majeure.",
  imaging: {
    modality: "CTA" as const,
    contraindicatedAlternatives: [],
    sequenceSeconds: 90,
    findings:
      "Sténose courte (~3 cm) fémorale superficielle G ~ 70%, distalité conservée, pas de lésion étagée.",
  },
  twin: {
    affectedSegments: ["FEM_SUP_L"],
    dominantLesion: "Fémorale superficielle G — sténose courte",
    stenosisPct: 70,
  },
  decision: {
    rationale:
      "Échec de 3 mois de BAT (best medical therapy) bien conduit + impact professionnel majeur. Lésion courte favorable à angioplastie simple. Pas de pontage en première intention.",
    chosenPath: "Angioplastie fémorale superficielle G + DCB (drug-coated balloon)",
    alternativesConsidered: [
      "Poursuite BAT seul (refusé : 3 mois sans amélioration)",
      "Pontage fémoro-poplité (refusé : lésion courte, geste disproportionné)",
    ],
    committeeLevel: "L2" as const,
  },
  plan: {
    procedure: "Angioplastie fémorale superficielle G + DCB",
    access: "Fémoral antérograde homolatéral",
    anaesthesia: "Locale",
    expectedDurationMin: 50,
  },
  proms: {
    tool: "VascuQoL-6" as const,
    baseline: 14,
    m3: 20,
    m6: 22,
  },
  longitudinalFollowUp: [
    { milestone: "M1" as const, event: "Reprise marche sans gêne sur 500 m, sevrage tabagique entamé", vascuQoL6: 18, walkingDistanceMeters: 500, reintervention: false },
    { milestone: "M3" as const, event: "Reprise activité professionnelle complète", vascuQoL6: 20, walkingDistanceMeters: 800, reintervention: false },
    { milestone: "M6" as const, event: "Marche illimitée, sevrage tabac maintenu", vascuQoL6: 22, walkingDistanceMeters: 1200, reintervention: false },
    { milestone: "M12" as const, event: "Perméabilité primaire DCB conservée, IPS G 0.91", vascuQoL6: 22, walkingDistanceMeters: 1200, reintervention: false },
  ],
} satisfies DemoCase);

/**
 * Cas multi-étagé complexe — décision L3 multidisciplinaire.
 */
const M_B_MULTIETAGE = Object.freeze({
  id: "m-b-multietage",
  label: "M. B., 71 ans — lésions multi-étagées aorto-fémorales",
  shortPitch:
    "Lésions aorto-iliaques + fémoro-poplitées bilatérales. Décision multidisciplinaire (chirurgien + radiologue + cardiologue).",
  patient: {
    initials: "B.J.",
    age: 71,
    sex: "M" as const,
    frailty: 4,
    egfr: 58,
    ckdStage: "CKD 3a",
    iodineAllergy: false,
    rutherford: 4,
  },
  symptoms: [
    "Douleur de repos pied D nocturne",
    "Claudication mollet bilatérale < 100 m",
    "Pas d'ulcère ni de nécrose",
  ],
  riskFactors: {
    diabetes: true,
    smoking: "former" as const,
    hypertension: true,
    dyslipidemia: true,
    ckd: true,
    priorMI: true,
    priorStroke: false,
    antiplatelet: true,
  },
  doppler: {
    abiRight: 0.38,
    abiLeft: 0.55,
    waveform: "monophasique" as const,
    peakSystolicVelocityCmS: 420,
    notes: "Flux monophasique bilatéral, ratio PSV > 4 en fémoral D, suspicion lésion proximale iliaque.",
  },
  triage: {
    abiRight: 0.38,
    abiLeft: 0.55,
    walkingDistanceMeters: 80,
    ciAkiRisk: "moderate" as const,
    ciAkiNote:
      "eGFR 58, pas d'allergie iode. Hydratation pré/post-contraste recommandée, volume iode minimisé.",
  },
  triageJustification:
    "L3 — RCP multidisciplinaire obligatoire : lésions multi-étagées bilatérales, ATCD coronarien, plusieurs stratégies hybrides envisageables. Arbitrage chirurgien vasculaire + radiologue interventionnel + cardiologue.",
  imaging: {
    modality: "DSA" as const,
    contraindicatedAlternatives: [],
    sequenceSeconds: 180,
    findings:
      "Sténose iliaque commune D ~ 80%, occlusion courte fémorale superficielle D, sténose fémoro-poplitée G ~ 65%. Distalité jambière conservée.",
  },
  twin: {
    affectedSegments: ["IL_COM_R", "FEM_SUP_R", "FEM_SUP_L"],
    dominantLesion: "Iliaque commune D — sténose serrée",
    stenosisPct: 80,
  },
  decision: {
    rationale:
      "Stratégie hybride en 2 temps : (1) angioplastie + stent iliaque commune D pour restaurer l'inflow, (2) revascularisation fémorale D dans le même temps. Côté G traité ultérieurement après cicatrisation. Bilan coronarien préop nécessaire (ATCD IDM).",
    chosenPath: "Hybride : stent iliaque D + angioplastie fémorale D, G dans un 2ᵉ temps",
    alternativesConsidered: [
      "Pontage aorto-bifémoral (refusé : morbidité chirurgicale + ATCD IDM)",
      "Endo isolé sans traiter l'iliaque (refusé : inflow insuffisant)",
      "Geste bilatéral en une session (refusé : volume contraste + durée anesthésie)",
    ],
    committeeLevel: "L3" as const,
  },
  plan: {
    procedure: "Stent iliaque commune D + angioplastie fémorale superficielle D",
    access: "Fémoral controlatéral (G) + abord brachial complémentaire si besoin",
    anaesthesia: "Locale + sédation",
    expectedDurationMin: 120,
  },
  proms: {
    tool: "VascuQoL-6" as const,
    baseline: 9,
    m3: 14,
    m6: 18,
  },
  longitudinalFollowUp: [
    { milestone: "M1" as const, event: "Disparition douleur de repos D, périmètre 250 m", vascuQoL6: 12, walkingDistanceMeters: 250, reintervention: false },
    { milestone: "M3" as const, event: "2ᵉ temps : angioplastie fémorale G programmée", vascuQoL6: 14, walkingDistanceMeters: 300, reintervention: true },
    { milestone: "M6" as const, event: "Périmètre 600 m bilatéral, reprise activités modérées", vascuQoL6: 18, walkingDistanceMeters: 600, reintervention: false },
    { milestone: "M12" as const, event: "Stent iliaque perméable, IPS D 0.85 / G 0.82", vascuQoL6: 18, walkingDistanceMeters: 700, reintervention: false },
  ],
} satisfies DemoCase);

export const CLINICAL_CASES: readonly DemoCase[] = Object.freeze([
  AOMI_FRAGILE_CASE,
  M_D_CLAUDICANT,
  M_B_MULTIETAGE,
]);

export function getClinicalCase(id: string | undefined | null): DemoCase | undefined {
  if (!id) return undefined;
  return CLINICAL_CASES.find((c) => c.id === id);
}
