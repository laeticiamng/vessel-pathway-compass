import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import {
  auditProtocolCompleteness,
  type ProtocolCheckSeverity,
} from "@/lib/protocolCompleteness";

/**
 * Public, real-time completeness audit shown at the top of /protocol.
 *
 * Reads the live i18n dictionary and verifies that the 8 mandatory
 * sections (objective, population, design, comparators, endpoints, stats,
 * safety, limits, disclaimers) are present and non-trivial. Designed so
 * a CHUV reviewer can verify chain-of-evidence at a glance.
 */
export function ProtocolCompletenessChecklist() {
  const { t } = useTranslation();

  const audit = useMemo(() => auditProtocolCompleteness(t as (k: string) => unknown), [t]);

  const headerSeverity: ProtocolCheckSeverity =
    audit.errorCount > 0 ? "error" : audit.warnCount > 0 ? "warn" : "ok";

  return (
    <section
      aria-labelledby="protocol-completeness-title"
      className="mb-10 rounded-2xl border-2 border-border bg-card p-5 sm:p-6"
    >
      <header className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 id="protocol-completeness-title" className="text-base sm:text-lg font-semibold">
            {t("pages.protocol.completeness.title")}
          </h2>
        </div>
        <ScoreBadge score={audit.score} severity={headerSeverity} />
      </header>

      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {t("pages.protocol.completeness.intro")}
      </p>

      {audit.errorCount > 0 && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/5 p-3 flex items-start gap-2.5">
          <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-xs text-destructive font-medium">
            {String(t("pages.protocol.completeness.alertError")).replace(
              "{count}",
              String(audit.errorCount),
            )}
          </p>
        </div>
      )}
      {audit.errorCount === 0 && audit.warnCount > 0 && (
        <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
            {String(t("pages.protocol.completeness.alertWarn")).replace(
              "{count}",
              String(audit.warnCount),
            )}
          </p>
        </div>
      )}

      <ul className="grid sm:grid-cols-2 gap-2" role="list">
        {audit.results.map((r) => (
          <li
            key={r.id}
            className="flex items-start gap-2.5 rounded-lg border bg-background/50 p-3"
          >
            <SeverityIcon severity={r.severity} />
            <div className="min-w-0">
              <p className="text-sm font-medium leading-tight">{r.label}</p>
              {r.message && (
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{r.message}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SeverityIcon({ severity }: { severity: ProtocolCheckSeverity }) {
  if (severity === "ok") {
    return <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" aria-label="OK" />;
  }
  if (severity === "warn") {
    return (
      <AlertTriangle
        className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0"
        aria-label="Warning"
      />
    );
  }
  return <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" aria-label="Error" />;
}

function ScoreBadge({ score, severity }: { score: number; severity: ProtocolCheckSeverity }) {
  const cls =
    severity === "ok"
      ? "border-success/40 bg-success/10 text-success"
      : severity === "warn"
        ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
        : "border-destructive/40 bg-destructive/10 text-destructive";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}
    >
      <span className="font-mono">{score}/100</span>
    </span>
  );
}
