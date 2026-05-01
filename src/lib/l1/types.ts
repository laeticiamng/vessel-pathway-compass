export const REVASCULARIZATION_DECISIONS = [
  "medical_optimized",
  "surveillance",
  "standard_imaging",
  "endovascular_discussion",
  "surgical_discussion",
] as const;

export type RevascularizationDecision = (typeof REVASCULARIZATION_DECISIONS)[number];

export const DECISION_DELTAS = [
  "unchanged",
  "escalation",
  "de_escalation",
  "reclassification",
  "insufficient_image_quality",
] as const;

export type DecisionDelta = (typeof DECISION_DELTAS)[number];

export const IMAGE_QUALITIES = [
  "unknown",
  "interpretable",
  "limited",
  "non_interpretable",
] as const;

export type ImageQuality = (typeof IMAGE_QUALITIES)[number];

export const C4I_CONCORDANCE = [
  "concordant",
  "discordant_mild",
  "discordant_high",
] as const;

export type C4iConcordance = (typeof C4I_CONCORDANCE)[number];

export const SIGNOFF_STATUSES = [
  "draft",
  "pending_signoff",
  "signed",
  "cosigned",
  "rejected",
] as const;

export type SignoffStatus = (typeof SIGNOFF_STATUSES)[number];
