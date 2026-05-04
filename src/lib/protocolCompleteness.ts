/**
 * Automated completeness audit for the public research protocol page.
 *
 * Each rule reads a structured i18n value from the active dictionary and
 * checks that the section is present, non-empty and meets minimal
 * editorial requirements (e.g. an endpoint table must have at least 5
 * rows, the safety section must list explicit triggers, etc.).
 *
 * The audit is deterministic and runs client-side so jury reviewers
 * (CHUV / scientific committee) can verify in real time that no
 * mandatory section silently disappeared between two locales or two
 * editorial versions.
 */

export type ProtocolSectionId =
  | "objective"
  | "population"
  | "design"
  | "comparators"
  | "endpoints"
  | "stats"
  | "safety"
  | "limits"
  | "disclaimers";

export type ProtocolCheckSeverity = "ok" | "warn" | "error";

export interface ProtocolCheckResult {
  id: ProtocolSectionId;
  label: string;
  severity: ProtocolCheckSeverity;
  /** Short human-readable explanation when severity is warn/error. */
  message?: string;
}

export interface ProtocolAuditSnapshot {
  results: ProtocolCheckResult[];
  okCount: number;
  warnCount: number;
  errorCount: number;
  /** 0–100 completeness score. */
  score: number;
}

type Dict = (key: string) => unknown;

function isNonEmptyString(value: unknown, min = 40): value is string {
  return typeof value === "string" && value.trim().length >= min;
}

function isNonEmptyArray(value: unknown, min = 1): value is unknown[] {
  return Array.isArray(value) && value.length >= min;
}

interface RuleDef {
  id: ProtocolSectionId;
  label: string;
  evaluate: (t: Dict) => { severity: ProtocolCheckSeverity; message?: string };
}

const RULES: RuleDef[] = [
  {
    id: "objective",
    label: "Clinical objective",
    evaluate: (t) => {
      const body = t("pages.protocol.objective.body");
      if (!isNonEmptyString(body, 80)) {
        return { severity: "error", message: "Missing or too short clinical objective." };
      }
      return { severity: "ok" };
    },
  },
  {
    id: "population",
    label: "Target population",
    evaluate: (t) => {
      const body = t("pages.protocol.population.body");
      if (!isNonEmptyString(body, 80)) {
        return { severity: "error", message: "Missing or too short target population." };
      }
      return { severity: "ok" };
    },
  },
  {
    id: "design",
    label: "Validation design",
    evaluate: (t) => {
      const body = t("pages.protocol.design.body");
      if (!isNonEmptyString(body, 100)) {
        return { severity: "error", message: "Validation design body is missing or too short." };
      }
      return { severity: "ok" };
    },
  },
  {
    id: "comparators",
    label: "Comparators",
    evaluate: (t) => {
      const items = t("pages.protocol.comparators.items");
      if (!isNonEmptyArray(items, 3)) {
        return { severity: "warn", message: "Fewer than 3 comparators declared." };
      }
      return { severity: "ok" };
    },
  },
  {
    id: "endpoints",
    label: "Endpoints (primary + secondary)",
    evaluate: (t) => {
      const primary = t("pages.protocol.endpoints.primary");
      const rows = t("pages.protocol.endpoints.rows");
      if (!isNonEmptyString(primary, 40)) {
        return { severity: "error", message: "Primary endpoint is missing." };
      }
      if (!isNonEmptyArray(rows, 5)) {
        return { severity: "warn", message: "Fewer than 5 secondary endpoints declared." };
      }
      return { severity: "ok" };
    },
  },
  {
    id: "stats",
    label: "Statistical plan",
    evaluate: (t) => {
      const sample = t("pages.protocol.stats.sample");
      const tests = t("pages.protocol.stats.tests");
      if (!isNonEmptyString(sample, 40) || !isNonEmptyString(tests, 40)) {
        return { severity: "error", message: "Sample size or main tests not declared." };
      }
      return { severity: "ok" };
    },
  },
  {
    id: "safety",
    label: "Safety fallback rules",
    evaluate: (t) => {
      const triggers = t("pages.protocol.safety.triggers");
      if (!isNonEmptyArray(triggers, 3)) {
        return { severity: "error", message: "Safety fallback triggers are insufficient." };
      }
      return { severity: "ok" };
    },
  },
  {
    id: "limits",
    label: "Methodological limits",
    evaluate: (t) => {
      const items = t("pages.protocol.limits.items");
      if (!isNonEmptyArray(items, 4)) {
        return { severity: "warn", message: "Fewer than 4 acknowledged limits." };
      }
      return { severity: "ok" };
    },
  },
  {
    id: "disclaimers",
    label: "Regulatory status & disclaimers",
    evaluate: (t) => {
      const body = t("pages.protocol.regulatory.body");
      const disclaimers = t("pages.protocol.regulatory.disclaimers");
      if (!isNonEmptyString(body, 80) || !isNonEmptyString(disclaimers, 80)) {
        return { severity: "error", message: "Regulatory body or disclaimers are missing." };
      }
      return { severity: "ok" };
    },
  },
];

export function auditProtocolCompleteness(t: Dict): ProtocolAuditSnapshot {
  const results: ProtocolCheckResult[] = RULES.map((rule) => {
    const r = rule.evaluate(t);
    return { id: rule.id, label: rule.label, severity: r.severity, message: r.message };
  });

  const okCount = results.filter((r) => r.severity === "ok").length;
  const warnCount = results.filter((r) => r.severity === "warn").length;
  const errorCount = results.filter((r) => r.severity === "error").length;
  // OK = 1, warn = 0.5, error = 0.
  const raw = okCount + warnCount * 0.5;
  const score = Math.round((raw / results.length) * 100);

  return { results, okCount, warnCount, errorCount, score };
}
