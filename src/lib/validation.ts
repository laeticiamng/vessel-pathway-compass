import { z } from "zod";

/** Shared text field: trimmed, non-empty, max-length capped */
const safeText = (max = 200) =>
  z.string().trim().min(1, "Required").max(max, `Max ${max} characters`);

// ── Patient / Case forms ─────────────────────────────────────────────
export const newPatientCaseSchema = z.object({
  pseudonym: safeText(100),
  ageRange: z.string().optional(),
  sex: z.string().optional(),
  category: z.string().optional(),
  caseTitle: safeText(200).optional().or(z.literal("")),
});

export const editPatientSchema = z.object({
  pseudonym: safeText(100),
  age_range: z.string().optional(),
  sex: z.string().optional(),
});

// ── Case event form ──────────────────────────────────────────────────
export const caseEventSchema = z.object({
  title: safeText(200),
  event_type: z.string().min(1, "Required"),
  description: safeText(1000).optional().or(z.literal("")),
});

// ── Measurement form ─────────────────────────────────────────────────
export const measurementSchema = z.object({
  type: z.string().min(1, "Required"),
  value: z.number({ invalid_type_error: "Must be a number" }).finite(),
  unit: safeText(20),
  site: safeText(100).optional().or(z.literal("")),
});

// ── Forum post ───────────────────────────────────────────────────────
export const forumPostSchema = z.object({
  title: safeText(200),
  topic: z.string().min(1, "Required"),
  content: safeText(5000),
});

// ── Expert request ───────────────────────────────────────────────────
export const expertRequestSchema = z.object({
  title: safeText(200),
  topic: z.string().min(1, "Required"),
  case_summary: safeText(5000),
});
