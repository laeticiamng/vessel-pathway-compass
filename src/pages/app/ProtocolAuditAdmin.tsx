import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ShieldCheck, Search, Download, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
type ActionFilter = "all" | (typeof PROTOCOL_ACTIONS)[number];

const ACTION_OPTIONS: { value: ActionFilter; label: string }[] = [
  { value: "all", label: "All actions" },
  ...PROTOCOL_ACTIONS.map((a) => ({ value: a, label: a })),
];

const TIME_RANGES = [
  { value: "1h", label: "Last hour", ms: 60 * 60_000 },
  { value: "24h", label: "Last 24h", ms: 24 * 60 * 60_000 },
  { value: "7d", label: "Last 7d", ms: 7 * 24 * 60 * 60_000 },
  { value: "30d", label: "Last 30d", ms: 30 * 24 * 60 * 60_000 },
  { value: "all", label: "All time", ms: 0 },
];

export default function ProtocolAuditAdmin() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isResearchLead, isLoading: rolesLoading } = useUserRoles();
  const allowed = isAdmin || isResearchLead;

  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");
  const [requestIdFilter, setRequestIdFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [rangeKey, setRangeKey] = useState("24h");

  const range = TIME_RANGES.find((r) => r.value === rangeKey) ?? TIME_RANGES[1];
  const sinceISO = useMemo(
    () => (range.ms > 0 ? new Date(Date.now() - range.ms).toISOString() : null),
    [range.ms],
  );

  const { data: events = [], isFetching } = useQuery({
    queryKey: ["protocol-audit-admin", actionFilter, sinceISO, actorFilter],
    enabled: !!user && allowed,
    gcTime: 0,
    staleTime: 0,
    queryFn: async (): Promise<GovEvent[]> => {
      let q = supabase
        .from("governance_events" as never)
        .select("id, created_at, event_action, severity, actor_id, context")
        .eq("target_entity_type", "protocol")
        .order("created_at", { ascending: false })
        .limit(1000);

      if (actionFilter !== "all") {
        q = q.eq("event_action", actionFilter);
      } else {
        q = q.in("event_action", PROTOCOL_ACTIONS as unknown as string[]);
      }
      if (sinceISO) q = q.gte("created_at", sinceISO);
      if (actorFilter.trim()) q = q.eq("actor_id", actorFilter.trim());

      const { data, error } = await q;
      if (error) throw error;
      return (data as unknown as GovEvent[]) ?? [];
    },
  });

  // Client-side request-id filter (it lives inside context jsonb).
  const filtered = useMemo(() => {
    const rid = requestIdFilter.trim().toLowerCase();
    if (!rid) return events;
    return events.filter((e) => {
      const ctx = (e.context ?? {}) as Record<string, unknown>;
      const v = String(ctx.request_id ?? "").toLowerCase();
      return v.includes(rid);
    });
  }, [events, requestIdFilter]);

  const exportCsv = () => {
    if (!allowed) {
      showGuardDenialToast({ status: 403, action: "protocol.export.audit_log.csv" });
      return;
    }
    const header = ["timestamp", "action", "severity", "actor_id", "request_id", "ip", "reason", "role", "ua"];
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
        Browse tamper-proof governance events for <code>/protocol</code> access and exports.
        Filter by request-id to correlate a user-reported issue with the exact server log.
      </p>

      {/* Filters */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Action</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
            className="w-full h-9 rounded-md border bg-background px-2 text-sm"
          >
            {ACTION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
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

      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <p className="text-xs text-muted-foreground">
          {isFetching ? "Loading…" : `${filtered.length} event(s) matching filters`}
        </p>
        <Button size="sm" variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Export filtered CSV
        </Button>
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
                <th className="p-2.5 font-semibold">Reason / Role</th>
                <th className="p-2.5 font-semibold">IP</th>
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
                        e.severity === "critical" ? "bg-destructive/15 text-destructive"
                        : e.severity === "warn" ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                        : e.severity === "error" ? "bg-destructive/15 text-destructive"
                        : "bg-muted text-muted-foreground"
                      }`}>{e.severity}</span>
                    </td>
                    <td className="p-2.5 font-mono text-[10px] truncate max-w-[140px]" title={e.actor_id ?? ""}>
                      {e.actor_id ?? "—"}
                    </td>
                    <td className="p-2.5 font-mono text-[10px] truncate max-w-[160px]" title={String(ctx.request_id ?? "")}>
                      {String(ctx.request_id ?? "—")}
                    </td>
                    <td className="p-2.5">
                      {String(ctx.reason ?? ctx.role ?? "")}
                    </td>
                    <td className="p-2.5 font-mono text-[10px]">{String(ctx.ip ?? "—")}</td>
                  </tr>
                );
              })}
              {!isFetching && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground text-sm">
                    No events match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
