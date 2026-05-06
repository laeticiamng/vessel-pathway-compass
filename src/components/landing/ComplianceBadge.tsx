import { useMemo } from "react";
import { ShieldCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useAuditLog } from "@/hooks/useAuditLog";
import { getContentVersion } from "@/lib/contentVersions";
import { callProtocolAccessGuard } from "@/hooks/useProtocolGuard";
import { toast } from "@/hooks/use-toast";
import {
  auditProtocolCompleteness,
  type ProtocolCheckSeverity,
} from "@/lib/protocolCompleteness";

/**
 * Compliance & Completeness badge.
 *
 * Visible to authenticated users only. Computes a live score from the
 * protocol completeness audit and exposes a JSON export for offline
 * audit trails (governance, scientific committee, notified body review).
 */
export function ComplianceBadge() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isResearchLead, isLoading: rolesLoading } = useUserRoles();
  const { log } = useAuditLog();

  const audit = useMemo(
    () => auditProtocolCompleteness(t as (k: string) => unknown),
    [t],
  );

  // Loading: render neutral skeleton (no audit info leak)
  if (authLoading || (user && rolesLoading)) {
    return (
      <section
        aria-hidden="true"
        className="mb-10 rounded-2xl border bg-muted/10 p-5"
        data-testid="compliance-badge-skeleton"
      >
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </section>
    );
  }

  // Unauthorized: render NOTHING (no badge, no counters, no hint)
  if (!user || !(isAdmin || isResearchLead)) {
    return null;
  }

  const severity: ProtocolCheckSeverity =
    audit.errorCount > 0 ? "error" : audit.warnCount > 0 ? "warn" : "ok";

  const statusKey =
    severity === "ok"
      ? "pages.protocol.complianceBadge.statusOk"
      : severity === "warn"
        ? "pages.protocol.complianceBadge.statusWarn"
        : "pages.protocol.complianceBadge.statusError";

  const ringCls =
    severity === "ok"
      ? "border-success/40 bg-success/5"
      : severity === "warn"
        ? "border-amber-500/40 bg-amber-500/5"
        : "border-destructive/40 bg-destructive/5";

  const dotCls =
    severity === "ok"
      ? "bg-success"
      : severity === "warn"
        ? "bg-amber-500"
        : "bg-destructive";

  const handleExport = async () => {
    const verdict = await callProtocolAccessGuard(
      "protocol.export.compliance.json",
    );
    if (!verdict.ok) {
      toast({
        title: "Forbidden",
        description: `Export refused (${verdict.status}). Request-Id: ${verdict.requestId ?? "n/a"}`,
        variant: "destructive",
      });
      return;
    }
    const generatedAt = new Date().toISOString();
    const protocolVersion = getContentVersion("protocol")?.version ?? null;
    const payload = {
      kind: "protocol.compliance.snapshot",
      generatedAt,
      generatedBy: { id: user.id, email: user.email ?? null },
      protocolVersion,
      score: audit.score,
      status: severity,
      counts: {
        ok: audit.okCount,
        warn: audit.warnCount,
        error: audit.errorCount,
      },
      results: audit.results.map((r) => ({
        id: r.id,
        label: r.label,
        severity: r.severity,
        message: r.message ?? null,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = generatedAt.replace(/[:.]/g, "-");
    const filename = `vasculink-compliance-${stamp}.json`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Audit trail — record the export with timestamp + actor.
    void log({
      category: "compliance",
      action: "protocol.compliance.exported",
      severity: "info",
      targetEntityType: "protocol",
      context: {
        format: "json",
        filename,
        score: audit.score,
        status: severity,
        protocol_version: protocolVersion,
        exported_at: generatedAt,
      },
    });
  };

  return (
    <section
      aria-labelledby="compliance-badge-title"
      className={`mb-10 rounded-2xl border-2 ${ringCls} p-5 sm:p-6`}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-background border flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 id="compliance-badge-title" className="text-base font-semibold">
              {t("pages.protocol.complianceBadge.title")}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block h-2 w-2 rounded-full ${dotCls}`} aria-hidden="true" />
              <p className="text-xs text-muted-foreground">
                {t(statusKey)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold font-mono leading-none">
              {audit.score}
              <span className="text-sm text-muted-foreground font-normal">/100</span>
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
              {t("pages.protocol.complianceBadge.scoreLabel")}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleExport}
            aria-label={t("pages.protocol.complianceBadge.exportAria") as string}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            {t("pages.protocol.complianceBadge.export")}
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label={t("pages.protocol.complianceBadge.ok") as string} value={audit.okCount} tone="ok" />
        <Stat label={t("pages.protocol.complianceBadge.warn") as string} value={audit.warnCount} tone="warn" />
        <Stat label={t("pages.protocol.complianceBadge.error") as string} value={audit.errorCount} tone="error" />
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "ok" | "warn" | "error" }) {
  const cls =
    tone === "ok"
      ? "text-success"
      : tone === "warn"
        ? "text-amber-600 dark:text-amber-400"
        : "text-destructive";
  return (
    <div className="rounded-lg border bg-background/60 py-2.5">
      <p className={`text-lg font-bold font-mono ${cls}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
