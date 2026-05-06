import { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ShieldCheck, Search, Download, Lock, ArrowLeft, ChevronLeft, ChevronRight, Eye } from "lucide-react";
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

export default function ProtocolAuditAdmin() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isResearchLead, isLoading: rolesLoading } = useUserRoles();
  const allowed = isAdmin || isResearchLead;

  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [requestIdFilter, setRequestIdFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [rangeKey, setRangeKey] = useState("24h");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [detailEvent, setDetailEvent] = useState<GovEvent | null>(null);

  const range = TIME_RANGES.find((r) => r.value === rangeKey) ?? TIME_RANGES[1];
  const sinceISO = useMemo(
    () => (range.ms > 0 ? new Date(Date.now() - range.ms).toISOString() : null),
    [range.ms],
  );

  const effectiveActions = selectedActions.length > 0
    ? selectedActions
    : (PROTOCOL_ACTIONS as unknown as string[]);

  // Reset page when filters change
  const filtersKey = JSON.stringify({ effectiveActions, sinceISO, actorFilter, pageSize });
  useMemo(() => { setPage(0); return null; }, [filtersKey]);

  const { data, isFetching } = useQuery({
    queryKey: ["protocol-audit-admin", effectiveActions, sinceISO, actorFilter, page, pageSize],
    enabled: !!user && allowed,
    gcTime: 0,
    staleTime: 0,
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<{ events: GovEvent[]; count: number }> => {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      let q = supabase
        .from("governance_events" as never)
        .select("id, created_at, event_action, severity, actor_id, context", { count: "exact" })
        .eq("target_entity_type", "protocol")
        .in("event_action", effectiveActions)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (sinceISO) q = q.gte("created_at", sinceISO);
      if (actorFilter.trim()) q = q.eq("actor_id", actorFilter.trim());

      const { data, error, count } = await q;
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

  // Client-side request-id filter (lives inside context jsonb).
  const filtered = useMemo(() => {
    const rid = requestIdFilter.trim().toLowerCase();
    if (!rid) return events;
    return events.filter((e) => {
      const ctx = (e.context ?? {}) as Record<string, unknown>;
      return String(ctx.request_id ?? "").toLowerCase().includes(rid);
    });
  }, [events, requestIdFilter]);

  const toggleAction = (a: string) => {
    setSelectedActions((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
  };

  const exportCsv = () => {
    if (!allowed) {
      showGuardDenialToast({ status: 403, action: "protocol.export.audit_log.csv" });
      return;
    }
    const header = ["timestamp", "action", "severity", "actor_id", "request_id", "ip", "x_forwarded_for", "cf_connecting_ip", "x_real_ip", "reason", "role", "ua"];
    const escape = (v: unknown) => `"${(v == null ? "" : String(v)).replace(/"/g, '""')}"`;
    const lines = [header.join(",")];
    for (const e of filtered) {
      const ctx = (e.context ?? {}) as Record<string, unknown>;
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
      ].map(escape).join(","));
    }
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `protocol-audit-admin-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        multi-action filtering, and full IP / X-Forwarded-For correlation.
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
                <strong className="text-foreground">{totalCount.toLocaleString()}</strong> total event(s)
                {requestIdFilter && ` · ${filtered.length} on this page after request-id filter`}
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
          <Button size="sm" variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export page CSV
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
                <th className="p-2.5 font-semibold">IP</th>
                <th className="p-2.5 font-semibold">X-Forwarded-For</th>
                <th className="p-2.5 font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const ctx = (e.context ?? {}) as Record<string, unknown>;
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
              {!isFetching && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-muted-foreground text-sm">
                    No events match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!detailEvent} onOpenChange={(o) => !o && setDetailEvent(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">{detailEvent?.event_action}</DialogTitle>
            <DialogDescription className="text-xs">
              {detailEvent && new Date(detailEvent.created_at).toISOString()} · severity: {detailEvent?.severity}
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
                <div className="text-xs text-muted-foreground mb-1">Full context (JSON)</div>
                <ScrollArea className="h-[50vh] rounded-md border bg-muted/30">
                  <pre className="text-[11px] font-mono p-3 whitespace-pre-wrap break-all">
{JSON.stringify(detailEvent.context ?? {}, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigator.clipboard?.writeText(JSON.stringify(detailEvent.context ?? {}, null, 2))}
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
