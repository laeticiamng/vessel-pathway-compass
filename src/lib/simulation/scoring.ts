/**
 * Simulation scoring engine.
 *
 * Replaces the naive default-to-option-A logic with a transparent,
 * rubric-weighted score that also feeds the skill heatmap from actual
 * per-step skill tags rather than fabricated offsets.
 */

export type SkillKey =
  | "triageAccuracy"
  | "safetySteps"
  | "documentation"
  | "communication";

export interface SimStep {
  id: string;
  prompt: string;
  options: string[];
  /** 0-based index of the correct option. Required for valid scoring. */
  correctIndex?: number;
  /** Per-step weight (default 1). */
  weight?: number;
  /** Skill tag — feeds the per-skill heatmap. Default "triageAccuracy". */
  skill?: SkillKey;
  /** Short rationale shown in the review screen. */
  rationale?: string;
}

export interface SimScenario {
  steps: SimStep[];
}

export interface ScoringResult {
  total: number; // 0..100
  correctCount: number;
  totalSteps: number;
  perStep: { id: string; correct: boolean; chosen: number | null; expected: number | null }[];
  perSkill: Record<SkillKey, { score: number; samples: number }>;
}

const SKILLS: SkillKey[] = [
  "triageAccuracy",
  "safetySteps",
  "documentation",
  "communication",
];

export function scoreScenario(
  scenario: SimScenario,
  decisions: Record<string, number>,
): ScoringResult {
  const steps = scenario.steps ?? [];
  const perStep: ScoringResult["perStep"] = [];
  const perSkill: ScoringResult["perSkill"] = SKILLS.reduce(
    (acc, k) => ({ ...acc, [k]: { score: 0, samples: 0 } }),
    {} as ScoringResult["perSkill"],
  );

  let weightedCorrect = 0;
  let weightedTotal = 0;
  let correctCount = 0;

  for (const step of steps) {
    const expected = typeof step.correctIndex === "number" ? step.correctIndex : null;
    const chosen = decisions[step.id];
    const isCorrect = expected != null && chosen === expected;
    const w = typeof step.weight === "number" && step.weight > 0 ? step.weight : 1;
    const skill: SkillKey = step.skill ?? "triageAccuracy";

    perStep.push({
      id: step.id,
      correct: isCorrect,
      chosen: chosen ?? null,
      expected,
    });

    if (expected != null) {
      weightedTotal += w;
      if (isCorrect) {
        weightedCorrect += w;
        correctCount += 1;
      }
      const bucket = perSkill[skill];
      bucket.samples += w;
      bucket.score += isCorrect ? w : 0;
    }
  }

  const total =
    weightedTotal > 0 ? Math.round((weightedCorrect / weightedTotal) * 100) : 0;

  // Normalise per-skill into 0..100
  for (const k of SKILLS) {
    const b = perSkill[k];
    b.score = b.samples > 0 ? Math.round((b.score / b.samples) * 100) : 0;
  }

  return { total, correctCount, totalSteps: steps.length, perStep, perSkill };
}

/** Aggregate skill heatmap across multiple completed runs. */
export function aggregateSkillHeatmap(
  runs: { feedback: any }[],
): Record<SkillKey, number> {
  const acc: Record<SkillKey, { sum: number; n: number }> = SKILLS.reduce(
    (a, k) => ({ ...a, [k]: { sum: 0, n: 0 } }),
    {} as any,
  );
  for (const r of runs) {
    const skills = r.feedback?.perSkill as
      | Record<SkillKey, { score: number; samples: number }>
      | undefined;
    if (!skills) continue;
    for (const k of SKILLS) {
      const v = skills[k];
      if (v && v.samples > 0) {
        acc[k].sum += v.score;
        acc[k].n += 1;
      }
    }
  }
  const out: Record<SkillKey, number> = SKILLS.reduce(
    (a, k) => ({ ...a, [k]: acc[k].n > 0 ? Math.round(acc[k].sum / acc[k].n) : 0 }),
    {} as any,
  );
  return out;
}

/** Audit a scenario for completeness — surfaces missing answers/rationales. */
export function auditScenario(scenario: SimScenario): {
  ok: boolean;
  issues: { stepId: string; kind: "no-correct" | "no-rationale" | "no-options" }[];
} {
  const issues: { stepId: string; kind: "no-correct" | "no-rationale" | "no-options" }[] = [];
  for (const step of scenario.steps ?? []) {
    if (!step.options || step.options.length < 2)
      issues.push({ stepId: step.id, kind: "no-options" });
    if (typeof step.correctIndex !== "number")
      issues.push({ stepId: step.id, kind: "no-correct" });
    if (!step.rationale) issues.push({ stepId: step.id, kind: "no-rationale" });
  }
  return { ok: issues.length === 0, issues };
}
