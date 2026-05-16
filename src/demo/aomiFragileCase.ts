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
  | "proms";

export interface DemoCase {
  readonly id: string;
  readonly label: string;
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
  readonly triage: {
    readonly abiRight: number;
    readonly abiLeft: number;
    readonly walkingDistanceMeters: number;
    readonly ciAkiRisk: "low" | "moderate" | "high";
    readonly ciAkiNote: string;
  };
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
}

export const AOMI_FRAGILE_CASE = Object.freeze({
  id: "demo-aomi-fragile-mme-r",
  label: "Mme R., 82 ans — AOMI fragile, contraste contre-indiqué",
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
  triage: {
    abiRight: 0.42,
    abiLeft: 0.78,
    walkingDistanceMeters: 50,
    ciAkiRisk: "high",
    ciAkiNote:
      "eGFR 32 + allergie iode documentée → score Mehran élevé. Contraste iodé formellement contre-indiqué.",
  },
  imaging: {
    modality: "AquaMR",
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
    committeeLevel: "L1",
  },
  plan: {
    procedure: "Angioplastie fémoro-poplitée G",
    access: "Fémoral commun controlatéral, crossover",
    anaesthesia: "Locale + sédation légère (fragilité 5)",
    expectedDurationMin: 75,
  },
  proms: {
    tool: "VascuQoL-6",
    baseline: 11,
    m3: 18,
    m6: 22,
  },
} satisfies DemoCase);

export const DEMO_STEPS: readonly { id: DemoStepId; index: number; titleKey: string }[] =
  Object.freeze([
    { id: "triage", index: 1, titleKey: "Triage VascScreen" },
    { id: "imaging", index: 2, titleKey: "Imagerie AquaMR" },
    { id: "twin", index: 3, titleKey: "Digital Twin" },
    { id: "decision", index: 4, titleKey: "Décision L1" },
    { id: "plan", index: 5, titleKey: "Plan opératoire" },
    { id: "proms", index: 6, titleKey: "Suivi PROMs M3/M6" },
  ]);
