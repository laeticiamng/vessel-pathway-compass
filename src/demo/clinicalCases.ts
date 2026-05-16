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

/**
 * CLTI diabétique avec pied infecté — L3, sauvetage de membre, multidisciplinaire.
 */
const MME_T_CLTI_DIAB = Object.freeze({
  id: "mme-t-clti-diabetique",
  label: "Mme T., 68 ans — CLTI diabétique, pied infecté, sauvetage de membre",
  shortPitch:
    "Diabète mal équilibré, ulcère plantaire D infecté avec exposition tendineuse. Ischémie critique chronique (CLTI), arbitrage L3 endo distal vs amputation mineure.",
  patient: {
    initials: "T.S.",
    age: 68,
    sex: "F" as const,
    frailty: 4,
    egfr: 44,
    ckdStage: "CKD 3b",
    iodineAllergy: false,
    rutherford: 5,
  },
  symptoms: [
    "Ulcère plantaire D métatarsien évolutif > 6 semaines, exposition tendineuse",
    "Douleur de repos pied D nocturne, soulagée jambe pendante",
    "Périmètre de marche < 30 m, fièvre 38,2°C",
  ],
  riskFactors: {
    diabetes: true,
    smoking: "former" as const,
    hypertension: true,
    dyslipidemia: true,
    ckd: true,
    priorMI: false,
    priorStroke: false,
    antiplatelet: true,
  },
  doppler: {
    abiRight: 0.35,
    abiLeft: 0.88,
    tbiRight: 0.18,
    waveform: "monophasique" as const,
    peakSystolicVelocityCmS: 310,
    notes:
      "Médiacalcose : IPS faussement rassurant possible, TBI 0.18 D confirme l'ischémie critique. Flux monophasique tibial antérieur D, postérieur absent.",
  },
  triage: {
    abiRight: 0.35,
    abiLeft: 0.88,
    walkingDistanceMeters: 30,
    ciAkiRisk: "moderate" as const,
    ciAkiNote:
      "eGFR 44 + diabète → score Mehran intermédiaire. Hydratation IV pré/post, volume iode minimisé, alternative CO2 envisageable pour la cartographie distale.",
  },
  triageJustification:
    "L3 — RCP CLTI obligatoire : WIfI 3-2-2, sauvetage de membre engagé, équipe pluridisciplinaire (chirurgien vasculaire, radiologue interventionnel, diabéto-podologue, infectiologue). Désescalade vers L2 impossible (ulcère infecté + ischémie distale).",
  imaging: {
    modality: "CTA" as const,
    contraindicatedAlternatives: [],
    sequenceSeconds: 110,
    findings:
      "Occlusion tibiale postérieure D longue (~8 cm), sténose serrée tibiale antérieure D moyenne, péronière perméable. Arcade plantaire incomplète. Pas de lésion fémoro-poplitée significative.",
  },
  twin: {
    affectedSegments: ["TIB_POST_R", "TIB_ANT_R"],
    dominantLesion: "Tibiale postérieure D — occlusion longue",
    stenosisPct: 100,
  },
  decision: {
    rationale:
      "CLTI Rutherford 5 + WIfI 3-2-2 : revascularisation distale indiquée en urgence relative pour cicatrisation. Concept d'angiosome : tibiale postérieure cible la zone de l'ulcère plantaire. Antibiothérapie large spectre + débridement chirurgical en parallèle.",
    chosenPath: "Recanalisation tibiale postérieure D + angioplastie pédieuse + débridement plantaire",
    alternativesConsidered: [
      "Pontage distal veineux saphène (refusé : capital veineux limité + risque infectieux)",
      "Amputation transmétatarsienne d'emblée (refusé : tentative de sauvetage justifiée)",
      "Traitement médical seul (refusé : ischémie critique + infection)",
    ],
    committeeLevel: "L3" as const,
  },
  plan: {
    procedure: "Recanalisation tibiale postérieure D + angioplastie pédieuse",
    access: "Fémoral antérograde homolatéral + abord pédieux rétrograde si échec antérograde",
    anaesthesia: "Locale + sédation, antibiothérapie IV per-procédure",
    expectedDurationMin: 140,
  },
  proms: {
    tool: "VascuQoL-6" as const,
    baseline: 7,
    m3: 13,
    m6: 17,
  },
  longitudinalFollowUp: [
    { milestone: "M1" as const, event: "Bourgeonnement ulcère, antibiothérapie ciblée, soins podologiques", vascuQoL6: 10, walkingDistanceMeters: 60, reintervention: false },
    { milestone: "M3" as const, event: "Ulcère cicatrisé à 80%, reprise marche avec décharge plantaire", vascuQoL6: 13, walkingDistanceMeters: 150, reintervention: false },
    { milestone: "M6" as const, event: "Ulcère cicatrisé complet, équilibration diabète HbA1c 7.1%", vascuQoL6: 17, walkingDistanceMeters: 300, reintervention: false },
    { milestone: "M12" as const, event: "Re-sténose tibiale postérieure D asymptomatique, surveillance rapprochée", vascuQoL6: 16, walkingDistanceMeters: 280, reintervention: false },
  ],
} satisfies DemoCase);

/**
 * Ischémie aiguë de membre sur embolie cardiaque (FA) — L2 urgent, fenêtre courte.
 */
const M_K_ISCHEMIE_AIGUE = Object.freeze({
  id: "m-k-ischemie-aigue-embolique",
  label: "M. K., 74 ans — ischémie aiguë de membre, embolie sur FA",
  shortPitch:
    "ACFA non anticoagulée, douleur brutale jambe G, pâleur et froideur depuis 4 h. Ischémie aiguë Rutherford IIa, fenêtre thérapeutique courte.",
  patient: {
    initials: "K.A.",
    age: 74,
    sex: "M" as const,
    frailty: 3,
    egfr: 62,
    ckdStage: "Normal",
    iodineAllergy: false,
    rutherford: 6,
  },
  symptoms: [
    "Douleur brutale jambe G survenue il y a 4 h, intensité 8/10",
    "Pied G froid, pâle, paresthésies débutantes (face dorsale)",
    "Pouls fémoral G présent, poplité et distaux absents",
  ],
  riskFactors: {
    diabetes: false,
    smoking: "former" as const,
    hypertension: true,
    dyslipidemia: false,
    ckd: false,
    priorMI: false,
    priorStroke: true,
    antiplatelet: false,
  },
  doppler: {
    abiRight: 1.05,
    abiLeft: 0.0,
    waveform: "absent" as const,
    notes:
      "Doppler artériel jambe G : flux absent en poplité et distaux. ECG : ACFA à 110/min non anticoagulée (CHA₂DS₂-VASc = 4). ETT : oreillette G dilatée, pas de thrombus visible mais cause embolique très probable.",
  },
  triage: {
    abiRight: 1.05,
    abiLeft: 0.0,
    walkingDistanceMeters: 0,
    ciAkiRisk: "low" as const,
    ciAkiNote:
      "eGFR 62, pas d'allergie iode. Urgence absolue : pas de retard pour bilan rénal complémentaire, héparine IV bolus immédiat.",
  },
  triageJustification:
    "L2 urgent — décision binôme chirurgien vasculaire + radiologue interventionnel en moins de 60 min. Rutherford IIa (paresthésies débutantes, force conservée) : fenêtre pour revascularisation endovasculaire ou chirurgicale. L3 non nécessaire (mécanisme clair, geste standard).",
  imaging: {
    modality: "CTA" as const,
    contraindicatedAlternatives: [],
    sequenceSeconds: 60,
    findings:
      "Occlusion poplitée G d'allure embolique (stop net convexe), arbre artériel sus-jacent indemne, distalité jambière reperméabilisée partiellement par collatérales. Pas de lésion athéromateuse contributive.",
  },
  twin: {
    affectedSegments: ["POP_L"],
    dominantLesion: "Poplitée G — occlusion embolique aiguë",
    stenosisPct: 100,
  },
  decision: {
    rationale:
      "Ischémie aiguë IIa < 6h, mécanisme embolique sur ACFA : thrombo-aspiration percutanée + héparinothérapie IV. Reprise anticoagulation orale (AOD) à 24h si pas de complication hémorragique. Bilan cardio-emboligène secondaire.",
    chosenPath: "Thrombo-aspiration poplitée G + héparine IV continue, AOD à H24",
    alternativesConsidered: [
      "Thrombolyse in situ rt-PA (refusé : ATCD AVC < 5 ans, risque hémorragique)",
      "Embolectomie chirurgicale Fogarty (option de secours si échec endovasculaire)",
      "Anticoagulation seule (refusé : ischémie aiguë symptomatique)",
    ],
    committeeLevel: "L2" as const,
  },
  plan: {
    procedure: "Thrombo-aspiration mécanique poplitée G",
    access: "Fémoral antérograde homolatéral, introducteur 8F",
    anaesthesia: "Locale, monitoring cardio continu (ACFA)",
    expectedDurationMin: 70,
  },
  proms: {
    tool: "VascuQoL-6" as const,
    baseline: 12,
    m3: 21,
    m6: 23,
  },
  longitudinalFollowUp: [
    { milestone: "M1" as const, event: "Reperméabilisation complète, AOD bien tolérée, kiné active", vascuQoL6: 19, walkingDistanceMeters: 600, reintervention: false },
    { milestone: "M3" as const, event: "Récupération sensitivomotrice complète, reprise activités", vascuQoL6: 21, walkingDistanceMeters: 1000, reintervention: false },
    { milestone: "M6" as const, event: "Pas de récidive embolique, AOD maintenue, IPS G 0.98", vascuQoL6: 23, walkingDistanceMeters: 1500, reintervention: false },
    { milestone: "M12" as const, event: "Cardioversion électrique programmée pour FA persistante", vascuQoL6: 23, walkingDistanceMeters: 1500, reintervention: false },
  ],
} satisfies DemoCase);

/**
 * Dysplasie fibromusculaire iliaque chez femme jeune — L3, cas rare, diagnostic différentiel.
 */
const MME_L_FMD_ILIAQUE = Object.freeze({
  id: "mme-l-fmd-iliaque",
  label: "Mme L., 38 ans — dysplasie fibromusculaire iliaque",
  shortPitch:
    "Femme jeune, non athéromateuse, claudication fessière D atypique. Aspect en collier de perles iliaque externe D : dysplasie fibromusculaire (FMD), arbitrage L3 expertise rare.",
  patient: {
    initials: "L.C.",
    age: 38,
    sex: "F" as const,
    frailty: 1,
    egfr: 96,
    ckdStage: "Normal",
    iodineAllergy: false,
    rutherford: 2,
  },
  symptoms: [
    "Claudication fessière et cuisse D à 400 m, plateau depuis 8 mois",
    "Pas de douleur de repos, pas de trouble trophique",
    "Sensation de jambe lourde D en fin de journée",
  ],
  riskFactors: {
    diabetes: false,
    smoking: "none" as const,
    hypertension: true,
    dyslipidemia: false,
    ckd: false,
    priorMI: false,
    priorStroke: false,
    antiplatelet: false,
  },
  doppler: {
    abiRight: 0.78,
    abiLeft: 1.02,
    waveform: "biphasique" as const,
    peakSystolicVelocityCmS: 340,
    notes:
      "Onde biphasique amortie fémorale D, ratio PSV > 3 en iliaque externe D. Aspect évocateur : sténoses étagées courtes (collier de perles) sans plaque calcifiée visible.",
  },
  triage: {
    abiRight: 0.78,
    abiLeft: 1.02,
    walkingDistanceMeters: 400,
    ciAkiRisk: "low" as const,
    ciAkiNote:
      "eGFR 96, pas d'allergie iode. Patiente jeune : limiter irradiation, privilégier MRA en première intention si disponible.",
  },
  triageJustification:
    "L3 — RCP expertise rare : patient jeune sans facteur de risque athéromateux, présentation atypique. Évoquer FMD, exclure artériopathie inflammatoire (Takayasu), endofibrose iliaque (cycliste), syndrome de l'artère poplitée piégée. Bilan extra-vasculaire associé (rénal, cervical).",
  imaging: {
    modality: "MRA" as const,
    contraindicatedAlternatives: [],
    sequenceSeconds: 360,
    findings:
      "Aspect typique en collier de perles iliaque externe D (alternance sténoses-dilatations courtes sur 4 cm). Pas d'anévrysme associé. Artères rénales : aspect identique en faveur d'une FMD multi-sites. Carotides indemnes.",
  },
  twin: {
    affectedSegments: ["IL_EXT_R"],
    dominantLesion: "Iliaque externe D — sténoses étagées (FMD)",
    stenosisPct: 65,
  },
  decision: {
    rationale:
      "FMD multi-sites confirmée (iliaque + rénale). Symptômes invalidants chez patiente active : angioplastie au ballon simple (PAS de stent en première intention, gold standard FMD). Suivi conjoint avec néphrologue pour HTA secondaire. Dépistage familial proposé.",
    chosenPath: "Angioplastie au ballon iliaque externe D (sans stent)",
    alternativesConsidered: [
      "Traitement médical seul (refusé : impact fonctionnel + jeune âge)",
      "Stent d'emblée (refusé : recommandations FMD = ballon seul en 1ʳᵉ intention)",
      "Chirurgie ouverte (refusé : disproportionnée, jeune âge, risque récidive)",
    ],
    committeeLevel: "L3" as const,
  },
  plan: {
    procedure: "Angioplastie au ballon non couvert iliaque externe D",
    access: "Fémoral commun controlatéral G, crossover",
    anaesthesia: "Locale",
    expectedDurationMin: 45,
  },
  proms: {
    tool: "VascuQoL-6" as const,
    baseline: 15,
    m3: 22,
    m6: 23,
  },
  longitudinalFollowUp: [
    { milestone: "M1" as const, event: "Disparition claudication, reprise course à pied progressive", vascuQoL6: 20, walkingDistanceMeters: 2000, reintervention: false },
    { milestone: "M3" as const, event: "IPS D 0.96, pas de gradient résiduel échographique", vascuQoL6: 22, walkingDistanceMeters: 3000, reintervention: false },
    { milestone: "M6" as const, event: "HTA mieux contrôlée (mono-thérapie), bilan FMD familial négatif", vascuQoL6: 23, walkingDistanceMeters: 3000, reintervention: false },
    { milestone: "M12" as const, event: "Perméabilité conservée MRA contrôle, inscription registre FMD", vascuQoL6: 23, walkingDistanceMeters: 3000, reintervention: false },
  ],
} satisfies DemoCase);

export const CLINICAL_CASES: readonly DemoCase[] = Object.freeze([
  AOMI_FRAGILE_CASE,
  M_D_CLAUDICANT,
  M_B_MULTIETAGE,
  MME_T_CLTI_DIAB,
  M_K_ISCHEMIE_AIGUE,
  MME_L_FMD_ILIAQUE,
]);

export function getClinicalCase(id: string | undefined | null): DemoCase | undefined {
  if (!id) return undefined;
  return CLINICAL_CASES.find((c) => c.id === id);
}

/**
 * Renvoie le cas suivant dans la bibliothèque (boucle en fin de liste)
 * pour permettre l'enchaînement des démos guidées.
 */
export function getNextClinicalCase(currentId: string): DemoCase | undefined {
  const i = CLINICAL_CASES.findIndex((c) => c.id === currentId);
  if (i < 0) return undefined;
  return CLINICAL_CASES[(i + 1) % CLINICAL_CASES.length];
}
