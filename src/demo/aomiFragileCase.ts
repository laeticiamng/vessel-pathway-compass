/**
 * "Mme R., 82 ans" — cas fil rouge de la démo guidée AOMI / contraste contre-indiqué.
 *
 * Données 100% fictives. Aucune persistance Supabase. Toujours marquées DEMO à l'écran.
 * Source unique de vérité utilisée par chaque étape du parcours /demo/aomi-fragile.
 */

export type DemoStepId =
  | "triage"
  | "imaging"
  | "twin"
  | "decision"
  | "plan"
  | "proms"
  | "followup";

export type DopplerWaveform = "triphasique" | "biphasique" | "monophasique" | "absent";

export interface DemoCase {
  readonly id: string;
  readonly label: string;
  readonly shortPitch?: string;
  readonly patient: {
    readonly initials: string;
    readonly age: number;
    readonly sex: "F" | "M";
    readonly frailty: number; // Clinical Frailty Scale 1-9
    readonly egfr: number; // mL/min/1.73m²
    readonly ckdStage: string;
    readonly iodineAllergy: boolean;
    readonly rutherford: number; // 0-6
  };
  readonly symptoms?: readonly string[];
  readonly riskFactors?: {
    readonly diabetes?: boolean;
    readonly smoking?: "none" | "former" | "active";
    readonly hypertension?: boolean;
    readonly dyslipidemia?: boolean;
    readonly ckd?: boolean;
    readonly priorMI?: boolean;
    readonly priorStroke?: boolean;
    readonly antiplatelet?: boolean;
  };
  readonly doppler?: {
    readonly abiRight: number;
    readonly abiLeft: number;
    readonly tbiRight?: number;
    readonly tbiLeft?: number;
    readonly waveform: DopplerWaveform;
    readonly peakSystolicVelocityCmS?: number;
    readonly notes?: string;
  };
  readonly triage: {
    readonly abiRight: number;
    readonly abiLeft: number;
    readonly walkingDistanceMeters: number;
    readonly ciAkiRisk: "low" | "moderate" | "high";
    readonly ciAkiNote: string;
  };
  readonly triageJustification?: string;
  readonly imaging: {
    readonly modality: "AquaMR" | "CTA" | "MRA" | "DSA";
    readonly contraindicatedAlternatives: readonly string[];
    readonly sequenceSeconds: number;
    readonly findings: string;
  };
  readonly twin: {
    readonly affectedSegments: readonly string[]; // 18-segment SVG ids
    readonly dominantLesion: string;
    readonly stenosisPct: number;
  };
  readonly decision: {
    readonly rationale: string;
    readonly chosenPath: string;
    readonly alternativesConsidered: readonly string[];
    readonly committeeLevel: "L1" | "L2" | "L3";
  };
  readonly plan: {
    readonly procedure: string;
    readonly access: string;
    readonly anaesthesia: string;
    readonly expectedDurationMin: number;
  };
  readonly proms: {
    readonly tool: "VascuQoL-6";
    readonly baseline: number;
    readonly m3: number;
    readonly m6: number;
  };
  readonly longitudinalFollowUp?: ReadonlyArray<{
    readonly milestone: "M1" | "M3" | "M6" | "M12";
    readonly event: string;
    readonly vascuQoL6: number;
    readonly walkingDistanceMeters: number;
    readonly reintervention: boolean;
  }>;
}

export const AOMI_FRAGILE_CASE = Object.freeze({
  id: "mme-r-aomi-fragile",
  label: "Mme R., 82 ans — AOMI fragile, contraste contre-indiqué",
  shortPitch:
    "AOMI sévère stade ulcère chez patiente âgée fragile avec contre-indication absolue au contraste iodé.",
  patient: {
    initials: "R.M.",
    age: 82,
    sex: "F" as const,
    frailty: 5,
    egfr: 32,
    ckdStage: "CKD 3b",
    iodineAllergy: true,
    rutherford: 5,
  },
  symptoms: [
    "Douleur de repos pied G",
    "Ulcère malléolaire G évolutif > 4 semaines",
    "Réduction périmètre de marche < 50 m",
  ],
  riskFactors: {
    diabetes: false,
    smoking: "former" as const,
    hypertension: true,
    dyslipidemia: true,
    ckd: true,
    priorMI: false,
    priorStroke: false,
    antiplatelet: true,
  },
  doppler: {
    abiRight: 0.42,
    abiLeft: 0.78,
    waveform: "monophasique" as const,
    peakSystolicVelocityCmS: 380,
    notes: "Flux monophasique post-sténotique fémoral G, ratio PSV > 3.",
  },
  triage: {
    abiRight: 0.42,
    abiLeft: 0.78,
    walkingDistanceMeters: 50,
    ciAkiRisk: "high",
    ciAkiNote:
      "eGFR 32 + allergie iode documentée → score Mehran élevé. Contraste iodé formellement contre-indiqué.",
  },
  triageJustification:
    "L1 — décision locale du centre vasculaire : lésion unifocale fémoro-poplitée G, geste endovasculaire standard, fragilité gérable en local + sédation. Pas de complexité multidisciplinaire requise.",
  imaging: {
    modality: "AquaMR" as const,
    contraindicatedAlternatives: ["CTA (iode)", "DSA (iode + radiation)"],
    sequenceSeconds: 480,
    findings:
      "Sténose serrée fémoro-poplitée G (~85%), perméabilité distale conservée, pas d'occlusion étagée.",
  },
  twin: {
    affectedSegments: ["FEM_SUP_L", "POP_L"],
    dominantLesion: "Fémorale superficielle G",
    stenosisPct: 85,
  },
  decision: {
    rationale:
      "Contraste iodé contre-indiqué (eGFR 32 + allergie). AquaMR fournit cartographie suffisante pour planifier sans irradiation. Rutherford 5 + ulcère → revascularisation indiquée.",
    chosenPath: "Angioplastie fémoro-poplitée G + stent si dissection",
    alternativesConsidered: [
      "Traitement médical seul (refusé : ulcère évolutif)",
      "Pontage fémoro-poplité (refusé : fragilité 5)",
    ],
    committeeLevel: "L1" as const,
  },
  plan: {
    procedure: "Angioplastie fémoro-poplitée G",
    access: "Fémoral commun controlatéral, crossover",
    anaesthesia: "Locale + sédation légère (fragilité 5)",
    expectedDurationMin: 75,
  },
  proms: {
    tool: "VascuQoL-6" as const,
    baseline: 11,
    m3: 18,
    m6: 22,
  },
  longitudinalFollowUp: [
    { milestone: "M1" as const, event: "Cicatrisation ulcère en cours, pansement simple", vascuQoL6: 14, walkingDistanceMeters: 80, reintervention: false },
    { milestone: "M3" as const, event: "Ulcère cicatrisé, marche autonome quotidienne", vascuQoL6: 18, walkingDistanceMeters: 200, reintervention: false },
    { milestone: "M6" as const, event: "Reprise activités domestiques, IPS G 0.92", vascuQoL6: 22, walkingDistanceMeters: 350, reintervention: false },
    { milestone: "M12" as const, event: "Perméabilité primaire conservée, pas de récidive", vascuQoL6: 21, walkingDistanceMeters: 320, reintervention: false },
  ],
} satisfies DemoCase);

export const DEMO_STEPS: readonly { id: DemoStepId; index: number; titleKey: string }[] =
  Object.freeze([
    { id: "triage", index: 1, titleKey: "Triage VascScreen" },
    { id: "imaging", index: 2, titleKey: "Imagerie" },
    { id: "twin", index: 3, titleKey: "Digital Twin" },
    { id: "decision", index: 4, titleKey: "Décision L1/L2/L3" },
    { id: "plan", index: 5, titleKey: "Plan opératoire" },
    { id: "proms", index: 6, titleKey: "PROMs M3/M6" },
    { id: "followup", index: 7, titleKey: "Suivi M1 → M12" },
  ]);
