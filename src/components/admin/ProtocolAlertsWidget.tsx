import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from "recharts";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { pseudonymizeContext } from "@/lib/protocolAuditPseudonymize";

type AlertRow = {
  id: string;
  created_at: string;
  actor_id: string | null;
  context: Record<string, unknown> | null;
};

interface Props {
  /** Time window to summarize, default 24h. */
  hours?: number;
  /** Whether the current viewer can see raw IP/UA values. */
  canSeeRawNetwork: boolean;
  /** Drill-down callbacks invoked when the admin clicks a row. */
  onDrillDownRequestId: (requestId: string) => void;
  onDrillDownActor: (actorId: string) => void;
}

/**
 * Admin widget summarizing `protocol.access.alert` events
 * (burst_403 + multi_action_anomaly) with a per-hour trend chart and
 * drill-down to the full audit table by request-id or actor.
 */
export function ProtocolAlertsWidget({
  hours = 24,
  canSeeRawNetwork,
  onDrillDownRequestId,
  onDrillDownActor,
}: Props) {
  const [scope, setScope] = useState<"all" | "burst_403" | "multi_action_anomaly">("all");
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

  // Trend buckets: 1 bar per hour over the window.
  const trend = useMemo(() => {
    const buckets: { hour: string; burst_403: number; multi_action_anomaly: number }[] = [];
    const now = Date.now();
    for (let i = hours - 1; i >= 0; i--) {
      const t = new Date(now - i * 3_600_000);
      buckets.push({
        hour: `${String(t.getHours()).padStart(2, "0")}h`,
        burst_403: 0,
        multi_action_anomaly: 0,
      });
    }
    for (const r of rows) {
      const idx = Math.floor((now - new Date(r.created_at).getTime()) / 3_600_000);
      const bIdx = hours - 1 - idx;
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
            Security alerts (last {hours}h)
          </h2>
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
                : s === "burst_403" ? `Burst 403 (${totals.burst_403})`
                : `Multi-action (${totals.multi_action_anomaly})`}
            </button>
          ))}
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
                <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
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
                          ? <button onClick={() => onDrillDownActor(r.actor_id!)} className="hover:underline">
                              {r.actor_id.slice(0, 8)}…
                            </button>
                          : "—"}
                      </td>
                      <td className="p-2 font-mono text-[10px] truncate max-w-[140px]">
                        {reqId
                          ? <button onClick={() => onDrillDownRequestId(reqId)} className="hover:underline">
                              {reqId.slice(0, 18)}
                            </button>
                          : "—"}
                      </td>
                      <td className="p-2 text-[10px]">{signal}</td>
                      <td className="p-2">
                        <Button
                          size="sm" variant="ghost" className="h-6 w-6 p-0"
                          onClick={() => reqId && onDrillDownRequestId(reqId)}
                          aria-label="Drill down by request-id"
                        >
                          <ChevronRight className="h-3 w-3" />
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
        </>
      )}
    </section>
  );
}
