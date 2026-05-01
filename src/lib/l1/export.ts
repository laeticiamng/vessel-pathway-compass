import { assertNoDirectIdentifiers } from "./schemas";
import { ComputedDecision } from "./decision";
import { RevascularizationDecision, ImageQuality } from "./types";

export interface L1ExportPayload {
  schema_version: "l1-decision-board/v1";
  algorithm_version: string;
  assessment_id: string;
  case_id: string;
  patient_id: string | null;
  clinical_context: Record<string, unknown>;
  hemodynamics: Record<string, unknown>;
  aquamr_findings: Record<string, unknown> & { image_quality: ImageQuality };
  c4i_assessment: Record<string, unknown>;
  proms_summary: Record<string, unknown>;
  segment_findings: Array<Record<string, unknown>>;
  decision_before_aquamr: RevascularizationDecision | null;
  decision_after_aquamr: RevascularizationDecision | null;
  decision_delta: ComputedDecision["delta"];
  recommended_strategy: ComputedDecision["recommendedStrategy"];
  requires_standard_imaging: boolean;
  failure_reason: string | null;
  clinician_summary: string | null;
  signoff_status: string;
  signed_at: string | null;
  exported_at: string;
}

export function buildExportPayload(payload: L1ExportPayload): L1ExportPayload {
  assertNoDirectIdentifiers(payload);
  return payload;
}

const CSV_HEADERS = [
  "assessment_id",
  "case_id",
  "patient_id",
  "algorithm_version",
  "image_quality",
  "decision_before",
  "decision_after",
  "decision_delta",
  "recommended_strategy",
  "requires_standard_imaging",
  "abi_left",
  "abi_right",
  "tbi_left",
  "tbi_right",
  "max_stenosis_percent",
  "occlusion",
  "lesion_length_mm",
  "runoff_score",
  "confidence_score",
  "wiq",
  "vascuqol6",
  "six_mwt_meters",
  "signoff_status",
  "signed_at",
  "exported_at",
] as const;

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = typeof value === "string" ? value : JSON.stringify(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCsvRow(payload: L1ExportPayload): string {
  const hemo = payload.hemodynamics as Record<string, unknown>;
  const aqua = payload.aquamr_findings as Record<string, unknown>;
  const proms = payload.proms_summary as Record<string, unknown>;

  const row: Array<unknown> = [
    payload.assessment_id,
    payload.case_id,
    payload.patient_id,
    payload.algorithm_version,
    aqua.image_quality,
    payload.decision_before_aquamr,
    payload.decision_after_aquamr,
    payload.decision_delta,
    payload.recommended_strategy,
    payload.requires_standard_imaging,
    hemo.abi_left,
    hemo.abi_right,
    hemo.tbi_left,
    hemo.tbi_right,
    aqua.max_stenosis_percent,
    aqua.occlusion,
    aqua.lesion_length_mm,
    aqua.runoff_score,
    aqua.confidence_score,
    proms.wiq,
    proms.vascuqol6,
    proms.six_mwt_meters,
    payload.signoff_status,
    payload.signed_at,
    payload.exported_at,
  ];

  return [CSV_HEADERS.join(","), row.map(csvEscape).join(",")].join("\n");
}

export function exportToJson(payload: L1ExportPayload): string {
  return JSON.stringify(payload, null, 2);
}
