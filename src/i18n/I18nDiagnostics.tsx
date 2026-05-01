/**
 * Dev-only diagnostic overlay listing recent i18n misses (missing keys or
 * shape mismatches). Hidden in production builds.
 *
 * Mount once, e.g. in `src/App.tsx`:
 *   {!import.meta.env.PROD && <I18nMissOverlay />}
 */
import { useState } from "react";
import { useTranslation } from "@/i18n/context";
import { AlertTriangle, X, ChevronDown, ChevronUp } from "lucide-react";

export function I18nMissOverlay() {
  const { misses, language } = useTranslation();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || misses.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[9999] max-w-md rounded-lg border border-amber-500/40 bg-amber-50 dark:bg-amber-950/80 dark:border-amber-400/40 shadow-lg text-xs"
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-amber-500/20">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <span className="font-semibold text-amber-900 dark:text-amber-100">
          i18n: {misses.length} miss{misses.length > 1 ? "es" : ""} ({language})
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto p-1 rounded hover:bg-amber-200/40 dark:hover:bg-amber-900/40"
          aria-label={open ? "Collapse" : "Expand"}
        >
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-amber-200/40 dark:hover:bg-amber-900/40"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      {open && (
        <ul className="max-h-64 overflow-y-auto p-2 space-y-1 font-mono">
          {misses.slice(-30).map((m, i) => (
            <li key={i} className="text-amber-900 dark:text-amber-100">
              <span className="opacity-60">[{m.locale}]</span>{" "}
              <span className="font-semibold">{m.key}</span>{" "}
              <span className="opacity-70">
                — {m.reason === "missing" ? "missing" : `expected ${m.expected}, got ${m.actual}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Inline placeholder shown when a structured i18n key is empty (e.g. an
 * accordion has no items because the dictionary fell back to []).
 *
 * Visible in dev to surface the issue, silent in prod (returns null) so
 * users never see raw debug text.
 */
export function I18nMissingFallback({
  i18nKey,
  expected,
  hint,
}: {
  i18nKey: string;
  expected: "array" | "object" | "string";
  hint?: string;
}) {
  if (typeof import.meta !== "undefined" && import.meta.env?.PROD) return null;
  return (
    <div className="rounded border border-dashed border-amber-500/60 bg-amber-50/60 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
      <div className="flex items-center gap-1.5 font-semibold">
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
        i18n fallback
      </div>
      <code className="block mt-0.5">{i18nKey}</code>
      <div className="opacity-80 mt-0.5">expected: {expected}</div>
      {hint && <div className="opacity-80 mt-0.5">{hint}</div>}
    </div>
  );
}
