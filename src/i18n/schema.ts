/**
 * i18n schema & TypeScript types.
 *
 * - Defines zod schemas for the structured (non-string) sections of the i18n dictionaries
 *   (FAQ items, Limits sections, L1 panels, etc.).
 * - Exports inferred TS types so consumers can `as` cast `t()` results safely.
 * - Provides `validateLocale(dict, locale)` used by tests AND the CI pre-build check
 *   to guarantee FR/EN/DE keep the same structural contract over time.
 *
 * IMPORTANT: this file does NOT validate every leaf string (we have hundreds of them
 * and they evolve fast). It validates the structural contracts that, when broken,
 * cause silent rendering bugs (e.g. FAQ accordion crashing because items isn't an array).
 */

import { z } from "zod";

// ---------- Atomic shapes ----------

export const FaqItemSchema = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});
export type FaqItem = z.infer<typeof FaqItemSchema>;

export const LimitsSectionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  items: z.array(z.string().min(1)).min(1),
});
export type LimitsSection = z.infer<typeof LimitsSectionSchema>;

export const LegalSectionSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
});
export type LegalSection = z.infer<typeof LegalSectionSchema>;

// ---------- Top-level structural contract ----------
//
// We use .passthrough() everywhere so dictionaries keep the freedom to add new
// keys without breaking validation. We only assert on the keys that the UI
// actually consumes as structured data.

export const LocaleSchema = z
  .object({
    pages: z
      .object({
        faq: z
          .object({
            items: z.array(FaqItemSchema).min(1),
          })
          .passthrough(),
        limits: z
          .object({
            sections: z
              .object({
                regulatory: LimitsSectionSchema,
                clinical: LimitsSectionSchema,
                technical: LimitsSectionSchema,
                usage: LimitsSectionSchema,
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    support: z
      .object({
        faq: z
          .object({
            items: z.array(FaqItemSchema).min(1),
          })
          .passthrough(),
      })
      .passthrough(),
    legal: z
      .object({
        notice: z
          .object({
            sections: z.array(LegalSectionSchema).min(1),
          })
          .passthrough(),
        privacy: z
          .object({
            sections: z.array(LegalSectionSchema).min(1),
          })
          .passthrough(),
        terms: z
          .object({
            sections: z.array(LegalSectionSchema).min(1),
          })
          .passthrough(),
      })
      .passthrough(),
  })
  .passthrough();

export type LocaleDictionary = z.infer<typeof LocaleSchema>;

// ---------- Validation helper ----------

export interface LocaleValidationError {
  locale: string;
  path: string;
  message: string;
}

export function validateLocale(
  dict: unknown,
  locale: string
): LocaleValidationError[] {
  const result = LocaleSchema.safeParse(dict);
  if (result.success) return [];
  return result.error.issues.map((iss) => ({
    locale,
    path: iss.path.join("."),
    message: iss.message,
  }));
}

// ---------- Runtime helpers (consumed by context.tsx) ----------

/** Returns a safe empty value of the expected shape for graceful rendering. */
export function emptyForExpected(
  expected: "string" | "array" | "object"
): string | unknown[] | Record<string, unknown> {
  if (expected === "array") return [];
  if (expected === "object") return {};
  return "";
}

/** Whether `value` matches the expected coarse shape. */
export function matchesExpected(
  value: unknown,
  expected: "string" | "array" | "object"
): boolean {
  if (expected === "string") return typeof value === "string";
  if (expected === "array") return Array.isArray(value);
  if (expected === "object")
    return (
      typeof value === "object" && value !== null && !Array.isArray(value)
    );
  return false;
}
