import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { en } from "./en";
import { fr } from "./fr";
import { de } from "./de";
import { matchesExpected, emptyForExpected } from "./schema";

export type Language = "en" | "fr" | "de";

const dictionaries = { en, fr, de } as const;

/** Coarse shape the caller expects — used to enable safe fallback rendering. */
export type Expected = "string" | "array" | "object";

export interface I18nMissResult {
  locale: Language;
  key: string;
  reason: "missing" | "shape-mismatch";
  expected?: Expected;
  actual: string;
}

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  /**
   * Resolve a translation key.
   *
   * - `t("foo.bar")` → string (legacy, unchanged).
   * - `t("foo.items", "array")` → returns the value if it IS an array,
   *   otherwise an empty array AND the call is logged via `onMiss`.
   * - `t("foo.bar", "object")` → same contract for plain objects.
   *
   * This guarantees consumers NEVER receive a dotted-path string when they
   * destructure `.map()` / `Object.keys()`, eliminating silent crash bugs.
   */
  t: <T = unknown>(key: string, expected?: Expected) => T;
  /** Last 50 misses, for the dev-only diagnostic overlay. */
  misses: I18nMissResult[];
}

const I18N_CONTEXT_KEY = "__aquamr_flow_i18n_context__";
const globalI18n = globalThis as typeof globalThis & {
  [I18N_CONTEXT_KEY]?: React.Context<I18nContextType | null>;
};

const I18nContext =
  globalI18n[I18N_CONTEXT_KEY] ?? createContext<I18nContextType | null>(null);

if (!globalI18n[I18N_CONTEXT_KEY]) {
  globalI18n[I18N_CONTEXT_KEY] = I18nContext;
}

function getRawNestedValue(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, part) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined),
      obj
    );
}

const isProd = typeof import.meta !== "undefined" && (import.meta as { env?: { PROD?: boolean } }).env?.PROD === true;

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem("aquamr-flow-lang");
      return (stored === "fr" || stored === "de") ? stored : "en";
    } catch {
      return "en";
    }
  });

  // Ring buffer of recent misses (dev only)
  const [misses, setMisses] = useState<I18nMissResult[]>([]);

  const recordMiss = useCallback((m: I18nMissResult) => {
    if (isProd) return; // do not pay the React state cost in production
    setMisses((prev) => {
      const next = [...prev, m];
      return next.length > 50 ? next.slice(-50) : next;
    });
    // eslint-disable-next-line no-console
    console.warn(
      `[i18n] ${m.reason === "missing" ? "Missing key" : "Shape mismatch"}: "${m.key}" in [${m.locale}]` +
        (m.expected ? ` — expected ${m.expected}, got ${m.actual}` : "")
    );
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("aquamr-flow-lang", lang);
    } catch {
      /* swallow — private mode etc. */
    }
  }, []);

  const t = useCallback(
    <T,>(key: string, expected?: Expected): T => {
      const raw = getRawNestedValue(dictionaries[language], key);

      // 1) Missing entirely
      if (raw === undefined || raw === null) {
        recordMiss({ locale: language, key, reason: "missing", expected, actual: "undefined" });
        if (expected) return emptyForExpected(expected) as T;
        return key as unknown as T; // legacy string fallback
      }

      // 2) No expectation given → preserve historical behaviour (return as-is)
      if (!expected) {
        return raw as T;
      }

      // 3) Shape contract enforced
      if (matchesExpected(raw, expected)) {
        return raw as T;
      }

      const actualType = Array.isArray(raw) ? "array" : typeof raw;
      recordMiss({ locale: language, key, reason: "shape-mismatch", expected, actual: actualType });
      return emptyForExpected(expected) as T;
    },
    [language, recordMiss]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, misses }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within LanguageProvider");
  return ctx;
}
