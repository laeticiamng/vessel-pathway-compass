import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from "recharts";
import { AlertTriangle, ChevronRight, Download, FileText, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { pseudonymizeContext } from "@/lib/protocolAuditPseudonymize";

type AlertRow = {
  id: string;
  created_at: string;
  actor_id: string | null;
  context: Record<string, unknown> | null;
};

const RANGE_OPTIONS = [
  { value: "1h", label: "1h", hours: 1 },
  { value: "6h", label: "6h", hours: 6 },
  { value: "24h", label: "24h", hours: 24 },
  { value: "7d", label: "7d", hours: 24 * 7 },
] as const;

type RangeKey = (typeof RANGE_OPTIONS)[number]["value"];

interface Props {
  /** Initial window. Admin can change via the time-range selector. */
  hours?: number;
  /** Whether the current viewer can see raw IP/UA values. */
  canSeeRawNetwork: boolean;
  /**
   * Whether the viewer is allowed to drill down into governance_events.
   * Roles that should NOT pivot the audit table to a request-id / actor
   * filter (e.g. read-only auditors) should pass `false`. When false the
   * drill-down buttons are disabled and the underlying handlers are
   * never invoked.
   */
  canDrillDown?: boolean;
  /** Drill-down callbacks invoked when the admin clicks a row. */
  onDrillDownRequestId: (requestId: string) => void;
  onDrillDownActor: (actorId: string) => void;
}

/**
 * Admin widget summarizing `protocol.access.alert` events
 * (burst_403 + multi_action_anomaly) with a per-hour trend chart and
 * drill-down to the full audit table by request-id or actor.
 *
 * Time range is configurable (1h / 6h / 24h / 7d) and exports
 * (CSV / PDF) reflect exactly the alerts shown in the chart + table,
 * applying the same masking rules as the on-screen view.
 */
export function ProtocolAlertsWidget({
  hours: initialHours = 24,
  canSeeRawNetwork,
  canDrillDown = true,
  onDrillDownRequestId,
  onDrillDownActor,
}: Props) {
  const [scope, setScope] = useState<"all" | "burst_403" | "multi_action_anomaly">("all");
  const [rangeKey, setRangeKey] = useState<RangeKey>(
    (RANGE_OPTIONS.find((r) => r.hours === initialHours)?.value as RangeKey) ?? "24h",
  );
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);
  const range = RANGE_OPTIONS.find((r) => r.value === rangeKey) ?? RANGE_OPTIONS[2];
  const hours = range.hours;
  const sinceISO = useMemo(
    () => new Date(Date.now() - hours * 3_600_000).toISOString(),
    [hours],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["protocol-alerts-widget", sinceISO],
    gcTime: 0,
    staleTime: 30_000,
    queryFn: async (): Promise<AlertRow[]> => {
      const { data, error } = await supabase
        .from("governance_events" as never)
        .select("id, created_at, actor_id, context")
        .eq("target_entity_type", "protocol")
        .eq("event_action", "protocol.access.alert")
        .gte("created_at", sinceISO)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data as unknown as AlertRow[]) ?? [];
    },
  });

  const rows = data ?? [];
  const filtered = scope === "all"
    ? rows
    : rows.filter((r) => (r.context?.alert_type as string) === scope);

  // Trend buckets: bucket size adapts to the selected window so the
  // chart always shows ~24 columns regardless of the range.
  const trend = useMemo(() => {
    const targetBuckets = 24;
    const bucketMs = Math.max(60_000, Math.floor((hours * 3_600_000) / targetBuckets));
    const buckets: { label: string; burst_403: number; multi_action_anomaly: number }[] = [];
    const now = Date.now();
    for (let i = targetBuckets - 1; i >= 0; i--) {
      const t = new Date(now - i * bucketMs);
      const label = bucketMs >= 24 * 3_600_000
        ? `${t.getMonth() + 1}/${t.getDate()}`
        : bucketMs >= 3_600_000
          ? `${String(t.getHours()).padStart(2, "0")}h`
          : `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
      buckets.push({ label, burst_403: 0, multi_action_anomaly: 0 });
    }
    for (const r of rows) {
      const idx = Math.floor((now - new Date(r.created_at).getTime()) / bucketMs);
      const bIdx = targetBuckets - 1 - idx;
      if (bIdx >= 0 && bIdx < buckets.length) {
        const t = (r.context?.alert_type as string) ?? "burst_403";
        if (t === "burst_403") buckets[bIdx].burst_403 += 1;
        else if (t === "multi_action_anomaly") buckets[bIdx].multi_action_anomaly += 1;
      }
    }
    return buckets;
  }, [rows, hours]);

  const totals = useMemo(() => ({
    burst_403: rows.filter((r) => r.context?.alert_type === "burst_403").length,
    multi_action_anomaly: rows.filter((r) => r.context?.alert_type === "multi_action_anomaly").length,
  }), [rows]);

  function buildCsv(): string {
    const header = [
      "timestamp", "alert_type", "actor_id", "request_id",
      "denials", "distinct_actions", "window_ms",
      "ip", "x_forwarded_for", "ua", "pseudonymized",
    ];
    const escape = (v: unknown) => `"${(v == null ? "" : String(v)).replace(/"/g, '""')}"`;
    const lines = [header.join(",")];
    for (const r of filtered) {
      const ctx = pseudonymizeContext(r.context, canSeeRawNetwork);
      const distinct = Array.isArray(ctx.distinct_actions)
        ? (ctx.distinct_actions as unknown[]).join("|")
        : "";
      lines.push([
        r.created_at,
        ctx.alert_type ?? "",
        r.actor_id ?? "",
        ctx.request_id ?? "",
        ctx.denials ?? "",
        distinct,
        ctx.window_ms ?? "",
        ctx.ip ?? "",
        ctx.xff ?? "",
        ctx.ua ?? "",
        canSeeRawNetwork ? "false" : "true",
      ].map(escape).join(","));
    }
    return "\uFEFF" + lines.join("\n");
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const handleExport = async (format: "csv" | "pdf") => {
    setExporting(format);
    try {
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      if (format === "csv") {
        const blob = new Blob([buildCsv()], { type: "text/csv;charset=utf-8" });
        downloadBlob(blob, `protocol-alerts-${range.value}-${stamp}.csv`);
      } else {
        const jsPDFmod = await import("jspdf");
        const autoTableMod = await import("jspdf-autotable");
        const jsPDF = jsPDFmod.default;
        const autoTable = autoTableMod.default;
        const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
        doc.setFontSize(13);
        doc.text("Protocol Security Alerts — Export", 40, 36);
        doc.setFontSize(8); doc.setTextColor(120);
        doc.text(
          `Generated ${new Date().toLocaleString()} · window: last ${range.label} · scope: ${scope} · ${filtered.length} alert(s)`,
          40, 50,
        );
        doc.text(
          canSeeRawNetwork ? "Network metadata: raw" : "Network metadata: pseudonymized",
          40, 62,
        );
        doc.setTextColor(0);
        autoTable(doc, {
          startY: 78,
          head: [["Timestamp", "Type", "Actor", "Request-Id", "Signal", "IP", "XFF"]],
          body: filtered.map((r) => {
            const ctx = pseudonymizeContext(r.context, canSeeRawNetwork);
            const t = (ctx.alert_type as string) ?? "—";
            const distinct = Array.isArray(ctx.distinct_actions)
              ? (ctx.distinct_actions as unknown[]).length
              : null;
            const signal = t === "burst_403"
              ? `${ctx.denials ?? 0} denials / ${ctx.window_ms ?? 0}ms`
              : distinct != null
                ? `${distinct} distinct actions / ${ctx.window_ms ?? 0}ms`
                : "—";
            return [
              new Date(r.created_at).toISOString().replace("T", " ").slice(0, 19),
              t,
              (r.actor_id ?? "").slice(0, 8),
              String(ctx.request_id ?? "").slice(0, 18),
              signal,
              String(ctx.ip ?? ""),
              String(ctx.xff ?? "").slice(0, 30),
            ];
          }),
          styles: { fontSize: 7, cellPadding: 2.5 },
          headStyles: { fillColor: [180, 60, 30] },
        });
        doc.save(`protocol-alerts-${range.value}-${stamp}.pdf`);
      }
      toast.success(`${filtered.length} alerts exported (${format.toUpperCase()})`);
    } catch (e) {
      toast.error(`Export failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <section
      data-testid="protocol-alerts-widget"
      className="rounded-2xl border bg-card p-4"
      aria-labelledby="protocol-alerts-title"
    >
      <header className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <h2 id="protocol-alerts-title" className="text-sm font-semibold">
            Security alerts (last {range.label})
          </h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1" role="group" aria-label="Time range">
            {RANGE_OPTIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRangeKey(r.value)}
                data-testid={`alert-range-${r.value}`}
                className={`text-[10px] uppercase px-2 py-1 rounded font-medium ${
                  rangeKey === r.value ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {(["all", "burst_403", "multi_action_anomaly"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                data-testid={`alert-scope-${s}`}
                className={`text-[10px] uppercase px-2 py-1 rounded font-medium ${
                  scope === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {s === "all" ? `All (${rows.length})`
                  : s === "burst_403" ? `Burst (${totals.burst_403})`
                  : `Multi (${totals.multi_action_anomaly})`}
              </button>
            ))}
          </div>
          <Button
            size="sm" variant="outline"
            data-testid="alerts-export-csv"
            disabled={filtered.length === 0 || exporting !== null}
            onClick={() => handleExport("csv")}
            className="h-7 text-[11px]"
          >
            {exporting === "csv"
              ? <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              : <Download className="h-3 w-3 mr-1" />}
            CSV
          </Button>
          <Button
            size="sm"
            data-testid="alerts-export-pdf"
            disabled={filtered.length === 0 || exporting !== null}
            onClick={() => handleExport("pdf")}
            className="h-7 text-[11px]"
          >
            {exporting === "pdf"
              ? <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              : <FileText className="h-3 w-3 mr-1" />}
            PDF
          </Button>
        </div>
      </header>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <>
          <div className="h-40 mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 11 }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="burst_403" stackId="a" fill="hsl(var(--destructive))" name="burst_403" />
                <Bar dataKey="multi_action_anomaly" stackId="a" fill="hsl(var(--primary))" name="multi_action_anomaly" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="p-2 font-semibold">Time</th>
                  <th className="p-2 font-semibold">Type</th>
                  <th className="p-2 font-semibold">Actor</th>
                  <th className="p-2 font-semibold">Request-Id</th>
                  <th className="p-2 font-semibold">Signal</th>
                  <th className="p-2 font-semibold w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 12).map((r) => {
                  const ctx = pseudonymizeContext(r.context, canSeeRawNetwork);
                  const t = (ctx.alert_type as string) ?? "—";
                  const reqId = String(ctx.request_id ?? "");
                  const distinct = Array.isArray(ctx.distinct_actions)
                    ? (ctx.distinct_actions as unknown[]).length
                    : null;
                  const signal = t === "burst_403"
                    ? `${ctx.denials ?? 0} denials / ${ctx.window_ms ?? 0}ms`
                    : distinct != null
                      ? `${distinct} distinct actions / ${ctx.window_ms ?? 0}ms`
                      : "—";
                  const drillBtnCls = canDrillDown
                    ? "hover:underline"
                    : "cursor-not-allowed text-muted-foreground";
                  const safeDrillReq = () => canDrillDown && reqId && onDrillDownRequestId(reqId);
                  const safeDrillActor = () =>
                    canDrillDown && r.actor_id && onDrillDownActor(r.actor_id);
                  return (
                    <tr key={r.id} className="border-t hover:bg-muted/20">
                      <td className="p-2 font-mono whitespace-nowrap">
                        {new Date(r.created_at).toISOString().replace("T", " ").slice(11, 19)}
                      </td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          t === "burst_403" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
                        }`}>{t}</span>
                      </td>
                      <td className="p-2 font-mono text-[10px] truncate max-w-[120px]">
                        {r.actor_id
                          ? <button
                              onClick={safeDrillActor}
                              disabled={!canDrillDown}
                              className={drillBtnCls}
                              title={canDrillDown ? "Filter audit table by this actor" : "Drill-down restricted for your role"}
                            >
                              {r.actor_id.slice(0, 8)}…
                            </button>
                          : "—"}
                      </td>
                      <td className="p-2 font-mono text-[10px] truncate max-w-[140px]">
                        {reqId
                          ? <button
                              onClick={safeDrillReq}
                              disabled={!canDrillDown}
                              className={drillBtnCls}
                              title={canDrillDown ? "Filter audit table by this request-id" : "Drill-down restricted for your role"}
                            >
                              {reqId.slice(0, 18)}
                            </button>
                          : "—"}
                      </td>
                      <td className="p-2 text-[10px]">{signal}</td>
                      <td className="p-2">
                        <Button
                          size="sm" variant="ghost" className="h-6 w-6 p-0"
                          onClick={safeDrillReq}
                          disabled={!canDrillDown || !reqId}
                          aria-label="Drill down by request-id"
                        >
                          {canDrillDown
                            ? <ChevronRight className="h-3 w-3" />
                            : <Lock className="h-3 w-3" />}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-muted-foreground text-xs">
                      No alerts in the selected scope.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {!canDrillDown && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              Drill-down disabled for your role — viewing aggregates only,
              cannot pivot the audit table to raw governance_events.
            </p>
          )}
        </>
      )}
    </section>
  );
}
