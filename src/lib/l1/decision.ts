import {
  DecisionDelta,
  ImageQuality,
  RevascularizationDecision,
  REVASCULARIZATION_DECISIONS,
} from "./types";

const ESCALATION_RANK: Record<RevascularizationDecision, number> = {
  medical_optimized: 0,
  surveillance: 1,
  standard_imaging: 2,
  endovascular_discussion: 3,
  surgical_discussion: 4,
};

export interface ComputeDecisionDeltaInput {
  before: RevascularizationDecision | null | undefined;
  after: RevascularizationDecision | null | undefined;
  imageQuality?: ImageQuality;
}

export interface ComputedDecision {
  delta: DecisionDelta;
  recommendedStrategy: RevascularizationDecision | null;
  requiresStandardImaging: boolean;
  failureReason: string | null;
}

export function computeDecisionDelta({
  before,
  after,
  imageQuality,
}: ComputeDecisionDeltaInput): ComputedDecision {
  if (imageQuality === "non_interpretable") {
    return {
      delta: "insufficient_image_quality",
      recommendedStrategy: "standard_imaging",
      requiresStandardImaging: true,
      failureReason:
        "AquaMR cartography insufficient for L1 reading; fall back to standard-of-care imaging.",
    };
  }

  if (!before || !after) {
    return {
      delta: "unchanged",
      recommendedStrategy: after ?? before ?? null,
      requiresStandardImaging: false,
      failureReason: null,
    };
  }

  if (before === after) {
    return {
      delta: "unchanged",
      recommendedStrategy: after,
      requiresStandardImaging: false,
      failureReason: null,
    };
  }

  const beforeRank = ESCALATION_RANK[before];
  const afterRank = ESCALATION_RANK[after];

  let delta: DecisionDelta;
  if (afterRank > beforeRank) {
    delta = "escalation";
  } else if (afterRank < beforeRank) {
    delta = "de_escalation";
  } else {
    delta = "reclassification";
  }

  return {
    delta,
    recommendedStrategy: after,
    requiresStandardImaging: false,
    failureReason: null,
  };
}

export function isRevascularizationDecision(
  value: unknown,
): value is RevascularizationDecision {
  return (
    typeof value === "string" &&
    (REVASCULARIZATION_DECISIONS as readonly string[]).includes(value)
  );
}
