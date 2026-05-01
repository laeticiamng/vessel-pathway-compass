import { describe, it, expect } from "vitest";
import { computeDecisionDelta } from "@/lib/l1/decision";
import {
  l1AssessmentInputSchema,
  signoffInputSchema,
  assertNoDirectIdentifiers,
} from "@/lib/l1/schemas";
import {
  REVASCULARIZATION_DECISIONS,
  DECISION_DELTAS,
} from "@/lib/l1/types";
import {
  buildExportPayload,
  exportToCsvRow,
  exportToJson,
  type L1ExportPayload,
} from "@/lib/l1/export";

describe("computeDecisionDelta", () => {
  it("returns unchanged when before and after match", () => {
    const result = computeDecisionDelta({
      before: "medical_optimized",
      after: "medical_optimized",
    });
    expect(result.delta).toBe("unchanged");
    expect(result.recommendedStrategy).toBe("medical_optimized");
    expect(result.requiresStandardImaging).toBe(false);
  });

  it("flags escalation when AquaMR pushes toward intervention", () => {
    const result = computeDecisionDelta({
      before: "surveillance",
      after: "endovascular_discussion",
    });
    expect(result.delta).toBe("escalation");
    expect(result.recommendedStrategy).toBe("endovascular_discussion");
  });

  it("flags de-escalation when AquaMR de-stages a patient", () => {
    const result = computeDecisionDelta({
      before: "endovascular_discussion",
      after: "medical_optimized",
    });
    expect(result.delta).toBe("de_escalation");
  });

  it("forces standard imaging fallback when AquaMR is non-interpretable", () => {
    const result = computeDecisionDelta({
      before: "surveillance",
      after: "endovascular_discussion",
      imageQuality: "non_interpretable",
    });
    expect(result.delta).toBe("insufficient_image_quality");
    expect(result.recommendedStrategy).toBe("standard_imaging");
    expect(result.requiresStandardImaging).toBe(true);
    expect(result.failureReason).toMatch(/standard-of-care imaging/i);
  });

  it("returns unchanged with single decision when one side is missing", () => {
    const result = computeDecisionDelta({
      before: undefined,
      after: "surveillance",
    });
    expect(result.delta).toBe("unchanged");
    expect(result.recommendedStrategy).toBe("surveillance");
  });
});

describe("decision categories", () => {
  it("exposes the five required revascularization categories", () => {
    expect([...REVASCULARIZATION_DECISIONS].sort()).toEqual(
      [
        "medical_optimized",
        "surveillance",
        "standard_imaging",
        "endovascular_discussion",
        "surgical_discussion",
      ].sort(),
    );
  });

  it("exposes the expected decision delta values", () => {
    expect([...DECISION_DELTAS].sort()).toEqual(
      [
        "unchanged",
        "escalation",
        "de_escalation",
        "reclassification",
        "insufficient_image_quality",
      ].sort(),
    );
  });
});

describe("l1AssessmentInputSchema", () => {
  it("accepts a minimal valid payload", () => {
    const result = l1AssessmentInputSchema.safeParse({
      case_id: "00000000-0000-0000-0000-000000000001",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.aquamr_findings.image_quality).toBe("unknown");
      expect(result.data.segment_findings).toEqual([]);
    }
  });

  it("rejects ABI values out of physiological range", () => {
    const result = l1AssessmentInputSchema.safeParse({
      case_id: "00000000-0000-0000-0000-000000000001",
      hemodynamics: { abi_left: 5 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown decision categories", () => {
    const result = l1AssessmentInputSchema.safeParse({
      case_id: "00000000-0000-0000-0000-000000000001",
      decision_before_aquamr: "open_heart_surgery",
    });
    expect(result.success).toBe(false);
  });
});

describe("signoffInputSchema", () => {
  it("requires a clinician summary of meaningful length", () => {
    const tooShort = signoffInputSchema.safeParse({
      assessment_id: "00000000-0000-0000-0000-000000000001",
      clinician_summary: "ok",
    });
    expect(tooShort.success).toBe(false);
  });

  it("accepts a valid sign-off payload", () => {
    const ok = signoffInputSchema.safeParse({
      assessment_id: "00000000-0000-0000-0000-000000000001",
      clinician_summary:
        "Stage IIb claudication, ABI 0.6, AquaMR shows focal SFA stenosis 70%. Optimize medical therapy first.",
    });
    expect(ok.success).toBe(true);
  });
});

describe("assertNoDirectIdentifiers", () => {
  it("throws when payload contains a patient name", () => {
    expect(() =>
      assertNoDirectIdentifiers({
        case_id: "abc",
        clinical_context: { patient_name: "Jane Doe" },
      }),
    ).toThrow(/forbidden direct identifier/);
  });

  it("passes when payload uses only pseudonymized fields", () => {
    expect(() =>
      assertNoDirectIdentifiers({
        case_id: "abc",
        clinical_context: { age_range: "70-79", sex: "F" },
      }),
    ).not.toThrow();
  });
});

describe("L1 export payload", () => {
  const samplePayload: L1ExportPayload = {
    schema_version: "l1-decision-board/v1",
    algorithm_version: "l1-decision-board/v1",
    assessment_id: "00000000-0000-0000-0000-0000000000a1",
    case_id: "00000000-0000-0000-0000-0000000000c1",
    patient_id: null,
    clinical_context: { age_range: "70-79", sex: "F", diabetes: true },
    hemodynamics: { abi_left: 0.6, abi_right: 0.7 },
    aquamr_findings: {
      image_quality: "interpretable",
      segment_target: "SFA-mid",
      max_stenosis_percent: 70,
      occlusion: false,
    },
    c4i_assessment: { concordance: "concordant" },
    proms_summary: { wiq: 45, vascuqol6: 18 },
    segment_findings: [],
    decision_before_aquamr: "surveillance",
    decision_after_aquamr: "endovascular_discussion",
    decision_delta: "escalation",
    recommended_strategy: "endovascular_discussion",
    requires_standard_imaging: false,
    failure_reason: null,
    clinician_summary: "Stable claudicant with significant SFA stenosis on AquaMR.",
    signoff_status: "signed",
    signed_at: "2026-05-01T08:00:00.000Z",
    exported_at: "2026-05-01T09:00:00.000Z",
  };

  it("buildExportPayload rejects payloads with direct identifiers", () => {
    const tainted = {
      ...samplePayload,
      clinical_context: { ...samplePayload.clinical_context, email: "patient@example.com" },
    } as unknown as L1ExportPayload;
    expect(() => buildExportPayload(tainted)).toThrow(/forbidden direct identifier/);
  });

  it("buildExportPayload returns the payload unchanged when valid", () => {
    expect(buildExportPayload(samplePayload)).toEqual(samplePayload);
  });

  it("exportToCsvRow contains headers and a single data row", () => {
    const csv = exportToCsvRow(samplePayload);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain("assessment_id");
    expect(lines[1]).toContain(samplePayload.assessment_id);
    expect(lines[1]).toContain("escalation");
  });

  it("exportToJson serializes a stable JSON document", () => {
    const json = exportToJson(samplePayload);
    expect(JSON.parse(json)).toEqual(samplePayload);
  });
});
