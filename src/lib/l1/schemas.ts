import { z } from "zod";
import {
  C4I_CONCORDANCE,
  IMAGE_QUALITIES,
  REVASCULARIZATION_DECISIONS,
  SIGNOFF_STATUSES,
} from "./types";

const trimmedText = (max: number) =>
  z.string().trim().max(max, `Max ${max} characters`);

export const clinicalContextSchema = z.object({
  age_range: trimmedText(40).optional().or(z.literal("")),
  sex: trimmedText(20).optional().or(z.literal("")),
  ckd_stage: trimmedText(20).optional().or(z.literal("")),
  diabetes: z.boolean().optional(),
  comorbidities: trimmedText(2000).optional().or(z.literal("")),
  symptoms: trimmedText(2000).optional().or(z.literal("")),
  fontaine: trimmedText(20).optional().or(z.literal("")),
  rutherford: trimmedText(20).optional().or(z.literal("")),
});

export const hemodynamicsSchema = z.object({
  abi_left: z.number().finite().min(0).max(2).optional(),
  abi_right: z.number().finite().min(0).max(2).optional(),
  tbi_left: z.number().finite().min(0).max(2).optional(),
  tbi_right: z.number().finite().min(0).max(2).optional(),
  doppler_summary: trimmedText(2000).optional().or(z.literal("")),
  oximetry: z.number().finite().min(0).max(100).optional(),
  notes: trimmedText(2000).optional().or(z.literal("")),
});

export const aquaMrFindingsSchema = z.object({
  image_quality: z.enum(IMAGE_QUALITIES).default("unknown"),
  segment_target: trimmedText(120).optional().or(z.literal("")),
  max_stenosis_percent: z.number().finite().min(0).max(100).optional(),
  occlusion: z.boolean().optional(),
  lesion_length_mm: z.number().finite().min(0).max(1000).optional(),
  runoff_score: z.number().finite().min(0).max(10).optional(),
  confidence_score: z.number().finite().min(0).max(1).optional(),
  notes: trimmedText(2000).optional().or(z.literal("")),
});

export const c4iAssessmentSchema = z.object({
  concordance: z.enum(C4I_CONCORDANCE).optional(),
  reason: trimmedText(2000).optional().or(z.literal("")),
});

export const promsSummarySchema = z.object({
  wiq: z.number().finite().min(0).max(100).optional(),
  vascuqol6: z.number().finite().min(0).max(24).optional(),
  six_mwt_meters: z.number().finite().min(0).max(2000).optional(),
  notes: trimmedText(2000).optional().or(z.literal("")),
});

export const segmentFindingSchema = z.object({
  segment_id: trimmedText(60).min(1, "Required"),
  segment_label: trimmedText(120).optional().or(z.literal("")),
  stenosis_percent: z.number().finite().min(0).max(100).optional(),
  occlusion: z.boolean().optional(),
  lesion_length_mm: z.number().finite().min(0).max(1000).optional(),
  runoff_score: z.number().finite().min(0).max(10).optional(),
  confidence_score: z.number().finite().min(0).max(1).optional(),
  notes: trimmedText(2000).optional().or(z.literal("")),
});

export const l1AssessmentInputSchema = z.object({
  case_id: z.string().uuid(),
  patient_id: z.string().uuid().optional().nullable(),
  clinical_context: clinicalContextSchema.default({}),
  hemodynamics: hemodynamicsSchema.default({}),
  aquamr_findings: aquaMrFindingsSchema.default({ image_quality: "unknown" }),
  c4i_assessment: c4iAssessmentSchema.default({}),
  proms_summary: promsSummarySchema.default({}),
  decision_before_aquamr: z.enum(REVASCULARIZATION_DECISIONS).optional().nullable(),
  decision_after_aquamr: z.enum(REVASCULARIZATION_DECISIONS).optional().nullable(),
  clinician_summary: trimmedText(4000).optional().or(z.literal("")),
  segment_findings: z.array(segmentFindingSchema).default([]),
});

export type L1AssessmentInput = z.infer<typeof l1AssessmentInputSchema>;

export const signoffInputSchema = z.object({
  assessment_id: z.string().uuid(),
  clinician_summary: trimmedText(4000).min(20, "Provide at least 20 characters"),
  status: z.enum(SIGNOFF_STATUSES).default("signed"),
});

export type SignoffInput = z.infer<typeof signoffInputSchema>;

const PHI_KEYS = new Set([
  "name",
  "first_name",
  "last_name",
  "email",
  "phone",
  "address",
  "dob",
  "date_of_birth",
  "ssn",
  "national_id",
  "patient_name",
]);

/**
 * Validate that an export payload only contains pseudonymized fields.
 * Used to enforce that direct patient identifiers never leave the platform.
 */
export function assertNoDirectIdentifiers(payload: unknown, path: string[] = []): void {
  if (payload === null || payload === undefined) return;
  if (Array.isArray(payload)) {
    payload.forEach((item, idx) => assertNoDirectIdentifiers(item, [...path, String(idx)]));
    return;
  }
  if (typeof payload !== "object") return;
  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (PHI_KEYS.has(key.toLowerCase())) {
      throw new Error(
        `Export payload contains forbidden direct identifier: ${[...path, key].join(".")}`,
      );
    }
    assertNoDirectIdentifiers(value, [...path, key]);
  }
}
