import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, FileText, FileSpreadsheet, Lock, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useTranslation } from "@/i18n/context";

interface GovEvent {
  id: string;
  created_at: string;
  event_action: string;
  event_category: string;
  severity: string;
  actor_id: string | null;
  context: Record<string, unknown> | null;
}

const PROTOCOL_ACTIONS = ["protocol.viewed", "protocol.qa.viewed"];

/**
 * Exportable audit log for protocol & Q&A access.
 *
 * - Visible only to admin / super_admin / hospital_admin / research_lead
 *   (committee-grade governance roles).
 * - Pulls the latest 1000 governance_events with action in
 *   {protocol.viewed, protocol.qa.viewed}.
 * - Exports CSV (raw) or PDF (formatted) for committee review.
 */
export function ProtocolAuditLogExporter() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { hasRole, isLoading: rolesLoading } = useUserRoles();
  const [exporting, setExporting] = useState(false);

  const allowed = hasRole(["admin", "super_admin", "hospital_admin", "research_lead"]);

  const { data: events, isFetching } = useQuery({
    queryKey: ["protocol-audit-log", user?.id],
    enabled: !!user && allowed,
    queryFn: async (): Promise<GovEvent[]> => {
      const { data, error } = await supabase
        .from("governance_events" as never)
        .select("id, created_at, event_action, event_category, severity, actor_id, context")
        .in("event_action", PROTOCOL_ACTIONS)
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data as unknown as GovEvent[]) ?? [];
    },
  });

  if (!user) {
    return (
      <section className="mb-10 rounded-2xl border border-dashed bg-muted/20 p-5">
        <div className="flex items-center gap-2.5 text-muted-foreground">
          <Lock className="h-4 w-4" aria-hidden="true" />
          <p className="text-sm">{t("pages.protocol.auditLog.signedOut")}</p>
        </div>
      </section>
    );
  }

  if (rolesLoading) return null;

  if (!allowed) {
    return (
      <section className="mb-10 rounded-2xl border border-dashed bg-muted/20 p-5">
        <div className="flex items-start gap-2.5 text-muted-foreground">
          <Lock className="h-4 w-4 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground/80">
              {t("pages.protocol.auditLog.restrictedTitle")}
            </p>
            <p className="text-xs mt-1 italic leading-relaxed">
              {t("pages.protocol.auditLog.restrictedDisclaimer")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const rows = events ?? [];
  const totalViews = rows.filter((r) => r.event_action === "protocol.viewed").length;
  const totalQA = rows.filter((r) => r.event_action === "protocol.qa.viewed").length;

  const downloadCSV = () => {
    const header = [
      "timestamp",
      "action",
      "actor_id",
      "role",
      "specialty",
      "institution",
      "question_index",
      "question_excerpt",
      "protocol_version",
    ];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };
    const lines = [header.join(",")];
    for (const r of rows) {
      const ctx = r.context ?? {};
      lines.push(
        [
          r.created_at,
          r.event_action,
          r.actor_id ?? "",
          ctx["role"] ?? "",
          ctx["specialty"] ?? "",
          ctx["institution"] ?? "",
          ctx["question_index"] ?? "",
          ctx["question_excerpt"] ?? "",
          ctx["protocol_version"] ?? "",
        ]
          .map(escape)
          .join(","),
      );
    }
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    triggerDownload(blob, `vasculink-protocol-audit-${stamp()}.csv`);
  };

  const downloadPDF = async () => {
    setExporting(true);
    try {
      const jsPDFmod = await import("jspdf");
      const autoTableMod = await import("jspdf-autotable");
      const jsPDF = jsPDFmod.default;
      const autoTable = autoTableMod.default;

      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const title = String(t("pages.protocol.auditLog.pdfTitle"));
      doc.setFontSize(14);
      doc.text(title, 40, 40);
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(
        `${t("pages.protocol.auditLog.pdfGenerated")} ${new Date().toLocaleString()} — ${rows.length} events`,
        40,
        56,
      );
      doc.setTextColor(0);

      autoTable(doc, {
        startY: 72,
        head: [[
          "Timestamp",
          "Action",
          "Role",
          "Specialty",
          "Institution",
          "Q#",
          "Excerpt",
          "Version",
        ]],
        body: rows.map((r) => {
          const ctx = (r.context ?? {}) as Record<string, unknown>;
          return [
            new Date(r.created_at).toISOString().replace("T", " ").slice(0, 19),
            r.event_action,
            String(ctx.role ?? ""),
            String(ctx.specialty ?? ""),
            String(ctx.institution ?? ""),
            String(ctx.question_index ?? ""),
            String(ctx.question_excerpt ?? "").slice(0, 60),
            String(ctx.protocol_version ?? ""),
          ];
        }),
        styles: { fontSize: 7, cellPadding: 3 },
        headStyles: { fillColor: [41, 65, 99] },
        columnStyles: { 0: { cellWidth: 110 }, 6: { cellWidth: 180 } },
      });

      // Footer disclaimer
      const pageCount = (doc as unknown as { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(120);
        doc.text(
          String(t("pages.protocol.auditLog.pdfFooter")),
          40,
          doc.internal.pageSize.getHeight() - 20,
        );
        doc.text(
          `${i} / ${pageCount}`,
          doc.internal.pageSize.getWidth() - 60,
          doc.internal.pageSize.getHeight() - 20,
        );
      }

      doc.save(`vasculink-protocol-audit-${stamp()}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <section
      aria-labelledby="protocol-audit-log-title"
      className="mb-10 rounded-2xl border-2 border-border bg-card p-5 sm:p-6"
    >
      <header className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <ScrollText className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h2 id="protocol-audit-log-title" className="text-base font-semibold">
              {t("pages.protocol.auditLog.title")}
            </h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">
              {t("pages.protocol.auditLog.subtitle")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={downloadCSV}
            disabled={isFetching || rows.length === 0}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
            {t("pages.protocol.auditLog.exportCsv")}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={downloadPDF}
            disabled={isFetching || exporting || rows.length === 0}
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            {exporting ? "…" : t("pages.protocol.auditLog.exportPdf")}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <Stat label={t("pages.protocol.auditLog.statTotal") as string} value={rows.length} />
        <Stat label={t("pages.protocol.auditLog.statViews") as string} value={totalViews} />
        <Stat label={t("pages.protocol.auditLog.statQa") as string} value={totalQA} />
      </div>

      <p className="text-[11px] text-muted-foreground italic leading-relaxed">
        <Download className="h-3 w-3 inline mr-1" aria-hidden="true" />
        {t("pages.protocol.auditLog.disclaimer")}
      </p>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-background/60 py-2.5 text-center">
      <p className="text-lg font-bold font-mono">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
