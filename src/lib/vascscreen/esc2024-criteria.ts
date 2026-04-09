/**
 * ESC 2024 Guidelines — PAD Screening Criteria
 * Reference: Mazzolai L, et al. 2024 ESC Guidelines for the management of
 * peripheral arterial and aortic diseases. Eur Heart J. 2024;45(36):3538-3700.
 */

export interface PatientRiskProfile {
  age: number;
  sex: "male" | "female" | "other";
  smokingStatus: "never" | "former" | "current";
  diabetes: boolean;
  hypertension: boolean;
  dyslipidemia: boolean;
  familyHistoryCVD: boolean;
  knownCVD: boolean;
  ckd: boolean;
  claudication: boolean;
  restPain: boolean;
  nonHealingWounds: boolean;
  erectileDysfunction: boolean;
}

export interface ScreeningRecommendation {
  eligible: boolean;
  urgency: "routine" | "priority" | "urgent";
  reason: string[];
  guidelineReference: string;
  recommendedActions: string[];
}

export interface ABIInterpretation {
  interpretation: string;
  category: "normal" | "borderline" | "mild_pad" | "moderate_pad" | "severe_pad" | "non_compressible";
  action: string;
  color: string;
}

const GUIDELINE_REF = "Mazzolai L, et al. 2024 ESC Guidelines for the management of peripheral arterial and aortic diseases. Eur Heart J. 2024;45(36):3538-3700.";

/**
 * Evaluate PAD screening eligibility per ESC 2024 recommendations.
 *
 * Class I, Level B indications:
 * - Symptomatic patients (claudication, rest pain, wounds)
 * - Age >= 65
 * - Age >= 50 with CV risk factors (smoking, diabetes, HTN, dyslipidemia)
 * - Known atherosclerotic disease (coronary, carotid, aortic)
 * - CKD (eGFR < 60)
 */
export function evaluateScreeningEligibility(
  patient: PatientRiskProfile
): ScreeningRecommendation {
  const reasons: string[] = [];
  const actions: string[] = [];
  let urgency: "routine" | "priority" | "urgent" = "routine";

  // Urgent: critical limb ischemia symptoms
  if (patient.restPain || patient.nonHealingWounds) {
    reasons.push("Symptômes d'ischémie critique (douleur de repos / plaies)");
    urgency = "urgent";
    actions.push("Référence urgente en angiologie");
    actions.push("Mesure IPS immédiate");
  }

  if (patient.claudication) {
    reasons.push("Claudication intermittente");
    if (urgency !== "urgent") urgency = "priority";
    actions.push("Mesure IPS");
    actions.push("Écho-Doppler artériel recommandé");
  }

  // Class I, Level B: age >= 65
  if (patient.age >= 65) {
    reasons.push("Âge ≥ 65 ans (recommandation ESC 2024 Classe I)");
    actions.push("Mesure IPS de dépistage");
  }

  // Class I, Level B: age >= 50 with risk factors
  if (patient.age >= 50) {
    const riskFactors: string[] = [];
    if (patient.smokingStatus === "current") riskFactors.push("tabagisme actif");
    if (patient.smokingStatus === "former") riskFactors.push("tabagisme sevré");
    if (patient.diabetes) riskFactors.push("diabète");
    if (patient.hypertension) riskFactors.push("hypertension");
    if (patient.dyslipidemia) riskFactors.push("dyslipidémie");
    if (patient.familyHistoryCVD) riskFactors.push("antécédents familiaux CV");

    if (riskFactors.length >= 1) {
      reasons.push(`Âge ≥ 50 ans avec facteur(s) de risque: ${riskFactors.join(", ")}`);
      actions.push("Mesure IPS de dépistage");
    }
  }

  // Known atherosclerotic disease
  if (patient.knownCVD) {
    reasons.push("Maladie athérosclérotique connue (polyvascular screening)");
    if (urgency !== "urgent") urgency = "priority";
    actions.push("Mesure IPS");
    actions.push("Évaluation vasculaire complète");
  }

  // CKD
  if (patient.ckd) {
    reasons.push("Insuffisance rénale chronique");
    actions.push("Mesure IPS (attention: risque artères non compressibles)");
  }

  // Erectile dysfunction as atherosclerosis marker
  if (patient.erectileDysfunction && patient.sex === "male") {
    reasons.push("Dysfonction érectile (marqueur d'athérosclérose)");
    actions.push("Évaluation cardiovasculaire globale");
  }

  const eligible = reasons.length > 0;

  return {
    eligible,
    urgency: eligible ? urgency : "routine",
    reason: reasons,
    guidelineReference: GUIDELINE_REF,
    recommendedActions: eligible
      ? [...new Set(actions)]
      : ["Pas d'indication de dépistage actuellement. Réévaluer si changement de profil de risque."],
  };
}

/**
 * Interpret ABI/ABI value per ESC 2024 thresholds.
 */
export function interpretABI(abiValue: number): ABIInterpretation {
  if (abiValue > 1.40) {
    return {
      interpretation: "Artères non compressibles (médiacalcose)",
      category: "non_compressible",
      action: "Compléter par index d'orteil (TBI) ou écho-Doppler",
      color: "orange",
    };
  }
  if (abiValue > 1.0) {
    return {
      interpretation: "Normal",
      category: "normal",
      action: "Pas de MAP détectée. Contrôle selon profil de risque.",
      color: "green",
    };
  }
  if (abiValue > 0.90) {
    return {
      interpretation: "Borderline",
      category: "borderline",
      action: "IPS limite. Considérer écho-Doppler ou épreuve de marche.",
      color: "yellow",
    };
  }
  if (abiValue > 0.70) {
    return {
      interpretation: "MAP légère (Fontaine I-IIa)",
      category: "mild_pad",
      action: "Confirmer par écho-Doppler. Traitement médical optimal. Programme d'exercice supervisé.",
      color: "orange",
    };
  }
  if (abiValue > 0.40) {
    return {
      interpretation: "MAP modérée (Fontaine IIb)",
      category: "moderate_pad",
      action: "Référence angiologie. Écho-Doppler + bilan CV complet. Traitement médical + exercice.",
      color: "red",
    };
  }
  return {
    interpretation: "MAP sévère / Ischémie critique (Fontaine III-IV)",
    category: "severe_pad",
    action: "RÉFÉRENCE URGENTE en angiologie. Risque d'amputation.",
    color: "darkred",
  };
}

/**
 * Calculate a composite PAD risk score (0-10 scale) based on profile.
 */
export function calculateRiskScore(patient: PatientRiskProfile): number {
  let score = 0;

  // Age contribution
  if (patient.age >= 75) score += 2;
  else if (patient.age >= 65) score += 1.5;
  else if (patient.age >= 50) score += 1;

  // Smoking
  if (patient.smokingStatus === "current") score += 2;
  else if (patient.smokingStatus === "former") score += 1;

  // Comorbidities
  if (patient.diabetes) score += 1.5;
  if (patient.hypertension) score += 1;
  if (patient.dyslipidemia) score += 0.5;
  if (patient.knownCVD) score += 1.5;
  if (patient.ckd) score += 1;
  if (patient.familyHistoryCVD) score += 0.5;

  // Symptoms (strongly weighted)
  if (patient.claudication) score += 2;
  if (patient.restPain) score += 3;
  if (patient.nonHealingWounds) score += 3;
  if (patient.erectileDysfunction && patient.sex === "male") score += 0.5;

  return Math.min(10, Math.round(score * 10) / 10);
}
