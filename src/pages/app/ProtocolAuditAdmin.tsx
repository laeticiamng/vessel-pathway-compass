import { useEffect, useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ShieldCheck, Search, Download, Lock, ArrowLeft, ChevronLeft, ChevronRight, Eye, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useAuth } from "@/hooks/useAuth";
import { showGuardDenialToast } from "@/lib/protocolGuardToast";
import { toast } from "sonner";
import { pseudonymizeContext } from "@/lib/protocolAuditPseudonymize";

interface GovEvent {
  id: string;
  created_at: string;
  event_action: string;
  severity: string;
  actor_id: string | null;
  context: Record<string, unknown> | null;
}

const PROTOCOL_ACTIONS = [
  "protocol.access.granted",
  "protocol.access.denied",
  "protocol.access.throttled",
  "protocol.access.alert",
  "protocol.access.error",
  "protocol.export.granted",
  "protocol.viewed",
  "protocol.qa.viewed",
  "protocol.audit_log.exported",
  "protocol.compliance.exported",
] as const;

const TIME_RANGES = [
  { value: "1h", label: "Last hour", ms: 60 * 60_000 },
  { value: "24h", label: "Last 24h", ms: 24 * 60 * 60_000 },
  { value: "7d", label: "Last 7d", ms: 7 * 24 * 60 * 60_000 },
  { value: "30d", label: "Last 30d", ms: 30 * 24 * 60 * 60_000 },
  { value: "all", label: "All time", ms: 0 },
];

const PAGE_SIZES = [50, 100, 250, 500];
const EXPORT_PAGE_SIZE = 1000;
const EXPORT_HARD_CAP = 50_000;

type ExportFormat = "csv" | "pdf";

export default function ProtocolAuditAdmin() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isResearchLead, isLoading: rolesLoading } = useUserRoles();
  const allowed = isAdmin || isResearchLead;
  // Only full admins can see raw IP/UA. Research leads see pseudonymized values.
  const canSeeRawNetwork = isAdmin;

  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [requestIdFilter, setRequestIdFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [rangeKey, setRangeKey] = useState("24h");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [detailEvent, setDetailEvent] = useState<GovEvent | null>(null);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  const range = TIME_RANGES.find((r) => r.value === rangeKey) ?? TIME_RANGES[1];
  const sinceISO = useMemo(
    () => (range.ms > 0 ? new Date(Date.now() - range.ms).toISOString() : null),
    [range.ms],
  );

  const effectiveActions = selectedActions.length > 0
    ? selectedActions
    : (PROTOCOL_ACTIONS as unknown as string[]);

  const trimmedRequestId = requestIdFilter.trim();
  const trimmedActor = actorFilter.trim();

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [JSON.stringify(effectiveActions), sinceISO, trimmedActor, trimmedRequestId, pageSize]);

  /**
   * Builds the base query with all active filters. Used both for the
   * paginated table view and for full-result CSV/PDF exports so that
   * the exported data ALWAYS matches what the admin is looking at.
   */
  const buildBaseQuery = () => {
    let q = supabase
      .from("governance_events" as never)
      .select("id, created_at, event_action, severity, actor_id, context", { count: "exact" })
      .eq("target_entity_type", "protocol")
      .in("event_action", effectiveActions)
      .order("created_at", { ascending: false });

    if (sinceISO) q = q.gte("created_at", sinceISO);
    if (trimmedActor) q = q.eq("actor_id", trimmedActor);
    // Server-side filter on context.request_id (uses functional index).
    if (trimmedRequestId) q = q.ilike("context->>request_id", `%${trimmedRequestId}%`);
    return q;
  };

  const { data, isFetching } = useQuery({
    queryKey: [
      "protocol-audit-admin",
      effectiveActions,
      sinceISO,
      trimmedActor,
      trimmedRequestId,
      page,
      pageSize,
    ],
    enabled: !!user && allowed,
    gcTime: 0,
    staleTime: 0,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<{ events: GovEvent[]; count: number }> => {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await buildBaseQuery().range(from, to);
      if (error) throw error;
      return {
        events: (data as unknown as GovEvent[]) ?? [],
        count: count ?? 0,
      };
    },
  });

  const events = data?.events ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const toggleAction = (a: string) => {
    setSelectedActions((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
  };

  /**
   * Fetches the full filtered result set by walking server-side pages
   * (same filters as the on-screen view). Caps at EXPORT_HARD_CAP rows
   * to avoid runaway exports.
   */
  async function fetchAllForExport(): Promise<GovEvent[]> {
    const out: GovEvent[] = [];
    let offset = 0;
    const cap = Math.min(totalCount || EXPORT_HARD_CAP, EXPORT_HARD_CAP);
    while (offset < cap) {
      const to = Math.min(offset + EXPORT_PAGE_SIZE, cap) - 1;
      const { data, error } = await buildBaseQuery().range(offset, to);
      if (error) throw error;
      const batch = (data as unknown as GovEvent[]) ?? [];
      out.push(...batch);
      if (batch.length < EXPORT_PAGE_SIZE) break;
      offset += EXPORT_PAGE_SIZE;
    }
    return out;
  }

  function buildCsv(rows: GovEvent[]): string {
    const header = [
      "timestamp", "action", "severity", "actor_id", "request_id",
      "ip", "x_forwarded_for", "cf_connecting_ip", "x_real_ip",
      "reason", "role", "ua",
      // Alert-specific columns (populated for protocol.access.alert /
      // protocol.access.throttled, empty for normal audit events).
      "alert_type", "denials_in_window", "distinct_actions",
      "window_ms", "ban_seconds",
      "pseudonymized",
    ];
    const escape = (v: unknown) => `"${(v == null ? "" : String(v)).replace(/"/g, '""')}"`;
    const lines = [header.join(",")];
    for (const e of rows) {
      const ctx = pseudonymizeContext(e.context, canSeeRawNetwork);
      const distinct = Array.isArray(ctx.distinct_actions)
        ? (ctx.distinct_actions as unknown[]).join("|")
        : "";
      lines.push([
        e.created_at,
        e.event_action,
        e.severity,
        e.actor_id ?? "",
        ctx.request_id ?? "",
        ctx.ip ?? "",
        ctx.xff ?? "",
        ctx.cf_connecting_ip ?? "",
        ctx.x_real_ip ?? "",
        ctx.reason ?? "",
        ctx.role ?? "",
        ctx.ua ?? "",
        ctx.alert_type ?? "",
        ctx.denials ?? ctx.denials_in_window ?? "",
        distinct,
        ctx.window_ms ?? "",
        ctx.ban_seconds ?? "",
        canSeeRawNetwork ? "false" : "true",
      ].map(escape).join(","));
    }
    return "\uFEFF" + lines.join("\n");
  }

  function filtersBanner(): string {
    return [
      `Actions: ${selectedActions.length === 0 ? "(all protocol)" : selectedActions.join(", ")}`,
      `Time range: ${range.label}${sinceISO ? ` (since ${sinceISO})` : ""}`,
      trimmedActor ? `Actor: ${trimmedActor}` : null,
      trimmedRequestId ? `Request-Id contains: ${trimmedRequestId}` : null,
      `Pseudonymized network fields: ${canSeeRawNetwork ? "no" : "yes"}`,
    ].filter(Boolean).join(" · ");
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const handleExport = async (format: ExportFormat) => {
    if (!allowed) {
      showGuardDenialToast({ status: 403, action: `protocol.export.audit_log.${format}` });
      return;
    }
    setExporting(format);
    try {
      const rows = await fetchAllForExport();
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");

      if (format === "csv") {
        const blob = new Blob([buildCsv(rows)], { type: "text/csv;charset=utf-8" });
        triggerDownload(blob, `protocol-audit-${stamp}.csv`);
      } else {
        const jsPDFmod = await import("jspdf");
        const autoTableMod = await import("jspdf-autotable");
        const jsPDF = jsPDFmod.default;
        const autoTable = autoTableMod.default;

        const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
        doc.setFontSize(13);
        doc.text("Protocol Audit Console — Export", 40, 36);
        doc.setFontSize(8); doc.setTextColor(120);
        doc.text(`Generated: ${new Date().toLocaleString()} · ${rows.length} events`, 40, 50);
        doc.text(`Filters → ${filtersBanner()}`, 40, 62, { maxWidth: 760 });
        doc.setTextColor(0);

        autoTable(doc, {
          startY: 84,
          head: [["Timestamp", "Action", "Sev.", "Actor", "Request-Id", "IP", "XFF", "Role / Reason"]],
          body: rows.map((e) => {
            const ctx = pseudonymizeContext(e.context, canSeeRawNetwork);
            return [
              new Date(e.created_at).toISOString().replace("T", " ").slice(0, 19),
              e.event_action,
              e.severity,
              (e.actor_id ?? "").slice(0, 8),
              String(ctx.request_id ?? "").slice(0, 18),
              String(ctx.ip ?? ""),
              String(ctx.xff ?? "").slice(0, 30),
              `${ctx.role ?? ""}${ctx.reason ? ` / ${ctx.reason}` : ""}`,
            ];
          }),
          styles: { fontSize: 6.5, cellPadding: 2.5 },
          headStyles: { fillColor: [41, 65, 99] },
        });

        const pageCount = (doc as unknown as { internal: { getNumberOfPages(): number } }).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(6.5); doc.setTextColor(120);
          doc.text(
            canSeeRawNetwork
              ? "Confidential — full network metadata included."
              : "Confidential — IP / UA pseudonymized for this role.",
            40, doc.internal.pageSize.getHeight() - 18,
          );
          doc.text(`${i} / ${pageCount}`, doc.internal.pageSize.getWidth() - 60, doc.internal.pageSize.getHeight() - 18);
        }
        doc.save(`protocol-audit-${stamp}.pdf`);
      }
      toast.success(`${rows.length} events exported (${format.toUpperCase()})`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(`Export failed: ${msg}`);
    } finally {
      setExporting(null);
    }
  };

  if (authLoading || (user && rolesLoading)) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!user || !allowed) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <Helmet>
          <meta name="robots" content="noindex, nofollow, noarchive" />
          <meta httpEquiv="Cache-Control" content="no-store, private" />
        </Helmet>
        <div className="rounded-2xl border border-dashed bg-muted/20 p-6 flex items-start gap-3">
          <Lock className="h-5 w-5 mt-0.5 text-muted-foreground" />
          <div>
            <h1 className="text-lg font-semibold">Forbidden</h1>
            <p className="text-sm text-muted-foreground mt-1">
              This audit console is restricted to administrators and research leads.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const actionsLabel = selectedActions.length === 0
    ? "All actions"
    : `${selectedActions.length} selected`;

  return (
    <div className="container mx-auto px-6 py-10 max-w-6xl">
      <Helmet>
        <title>Protocol Audit Console</title>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <meta httpEquiv="Cache-Control" content="no-store, no-cache, must-revalidate, private" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta name="referrer" content="no-referrer" />
      </Helmet>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Protocol Audit Console</h1>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link to="/app"><ArrowLeft className="h-4 w-4 mr-1.5" />Back</Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
        Browse tamper-proof governance events for <code>/protocol</code>. Server-side pagination,
        multi-action filtering, and full IP / X-Forwarded-For correlation
        {!canSeeRawNetwork && " (network fields pseudonymized for your role)"}.
      </p>

      {/* Filters */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Actions</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between h-9 font-normal">
                <span className="truncate">{actionsLabel}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2" align="start">
              <div className="flex items-center justify-between px-1 pb-2 border-b mb-2">
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={() => setSelectedActions([...PROTOCOL_ACTIONS])}
                >Select all</button>
                <button
                  className="text-xs text-muted-foreground hover:underline"
                  onClick={() => setSelectedActions([])}
                >Clear</button>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {PROTOCOL_ACTIONS.map((a) => (
                  <label key={a} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-muted/40 cursor-pointer">
                    <Checkbox
                      checked={selectedActions.includes(a)}
                      onCheckedChange={() => toggleAction(a)}
                    />
                    <span className="text-xs font-mono">{a}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Time range</label>
          <select
            value={rangeKey}
            onChange={(e) => setRangeKey(e.target.value)}
            className="w-full h-9 rounded-md border bg-background px-2 text-sm"
          >
            {TIME_RANGES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Actor user-id</label>
          <Input
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            placeholder="uuid…"
            className="h-9 font-mono text-xs"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Request-Id contains</label>
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={requestIdFilter}
              onChange={(e) => setRequestIdFilter(e.target.value)}
              placeholder="r-xxxxx"
              className="h-9 pl-8 font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Toolbar: count + pagination + export */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="text-xs text-muted-foreground flex items-center gap-3">
          <span>
            {isFetching ? "Loading…" : (
              <>
                <strong className="text-foreground">{totalCount.toLocaleString()}</strong> total event(s) match filters
              </>
            )}
          </span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
            className="h-7 rounded border bg-background px-1.5 text-xs"
          >
            {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}/page</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0 || isFetching}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page + 1} / {totalPages}
          </span>
          <Button size="sm" variant="ghost" onClick={() => setPage((p) => p + 1)} disabled={page + 1 >= totalPages || isFetching}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleExport("csv")} disabled={totalCount === 0 || exporting !== null}>
            {exporting === "csv" ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1.5" />}
            Export CSV ({totalCount.toLocaleString()})
          </Button>
          <Button size="sm" onClick={() => handleExport("pdf")} disabled={totalCount === 0 || exporting !== null}>
            {exporting === "pdf" ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <FileText className="h-3.5 w-3.5 mr-1.5" />}
            Export PDF
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="p-2.5 font-semibold">Timestamp</th>
                <th className="p-2.5 font-semibold">Action</th>
                <th className="p-2.5 font-semibold">Severity</th>
                <th className="p-2.5 font-semibold">Actor</th>
                <th className="p-2.5 font-semibold">Request-Id</th>
                <th className="p-2.5 font-semibold">IP{!canSeeRawNetwork && " *"}</th>
                <th className="p-2.5 font-semibold">X-Forwarded-For{!canSeeRawNetwork && " *"}</th>
                <th className="p-2.5 font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => {
                const ctx = pseudonymizeContext(e.context, canSeeRawNetwork);
                return (
                  <tr key={e.id} className="border-t hover:bg-muted/20">
                    <td className="p-2.5 font-mono whitespace-nowrap">
                      {new Date(e.created_at).toISOString().replace("T", " ").slice(0, 19)}
                    </td>
                    <td className="p-2.5 font-mono">{e.event_action}</td>
                    <td className="p-2.5">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase ${
                        e.severity === "critical" || e.severity === "error" ? "bg-destructive/15 text-destructive"
                        : e.severity === "warn" ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                        : "bg-muted text-muted-foreground"
                      }`}>{e.severity}</span>
                    </td>
                    <td className="p-2.5 font-mono text-[10px] truncate max-w-[140px]" title={e.actor_id ?? ""}>
                      {e.actor_id ?? "—"}
                    </td>
                    <td className="p-2.5 font-mono text-[10px] truncate max-w-[160px]" title={String(ctx.request_id ?? "")}>
                      {String(ctx.request_id ?? "—")}
                    </td>
                    <td className="p-2.5 font-mono text-[10px]">{String(ctx.ip ?? "—")}</td>
                    <td className="p-2.5 font-mono text-[10px] truncate max-w-[200px]" title={String(ctx.xff ?? "")}>
                      {String(ctx.xff ?? "—")}
                    </td>
                    <td className="p-2.5">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setDetailEvent(e)} title="View details">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {!isFetching && events.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-muted-foreground text-sm">
                    No events match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!canSeeRawNetwork && (
          <p className="px-3 py-2 text-[10px] text-muted-foreground border-t bg-muted/20">
            * Network metadata (IP, XFF, user-agent) pseudonymized for your role. Full admins see raw values.
          </p>
        )}
      </div>

      <Dialog open={!!detailEvent} onOpenChange={(o) => !o && setDetailEvent(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">{detailEvent?.event_action}</DialogTitle>
            <DialogDescription className="text-xs">
              {detailEvent && new Date(detailEvent.created_at).toISOString()} · severity: {detailEvent?.severity}
              {!canSeeRawNetwork && " · network fields pseudonymized"}
            </DialogDescription>
          </DialogHeader>
          {detailEvent && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-muted-foreground mb-0.5">Event ID</div>
                  <div className="font-mono break-all">{detailEvent.id}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-0.5">Actor ID</div>
                  <div className="font-mono break-all">{detailEvent.actor_id ?? "—"}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  Full context (JSON){!canSeeRawNetwork && " — pseudonymized"}
                </div>
                <ScrollArea className="h-[50vh] rounded-md border bg-muted/30">
                  <pre className="text-[11px] font-mono p-3 whitespace-pre-wrap break-all">
{JSON.stringify(pseudonymizeContext(detailEvent.context, canSeeRawNetwork), null, 2)}
                  </pre>
                </ScrollArea>
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigator.clipboard?.writeText(
                    JSON.stringify(pseudonymizeContext(detailEvent.context, canSeeRawNetwork), null, 2),
                  )}
                >
                  Copy JSON
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
