import { useQuery } from "@tanstack/react-query";
import { History, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

type Row = {
  id: string;
  changed_at: string;
  observed_by: string | null;
  request_id: string | null;
  config_hash: string;
  previous_config: Record<string, unknown> | null;
  current_config: Record<string, unknown>;
  diff: Record<string, { from: unknown; to: unknown }>;
  source: string;
};

/**
 * Tamper-proof audit trail of changes to protocol-access-guard
 * security thresholds (env-driven). Snapshots are inserted server-side
 * by the edge function whenever an admin observes a new configuration.
 *
 * Restricted to admin / super_admin (RLS enforced).
 */
export function ProtocolSecurityConfigHistoryPanel() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["protocol-security-config-history"],
    staleTime: 30_000,
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("protocol_security_config_history" as never)
        .select("*")
        .order("changed_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data as unknown as Row[]) ?? [];
    },
  });

  return (
    <section
      data-testid="config-history-panel"
      className="rounded-2xl border bg-card p-4"
    >
      <header className="flex items-center gap-2 mb-3">
        <History className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Security threshold change log</h2>
        <span className="text-[10px] text-muted-foreground ml-auto uppercase">
          tamper-proof
        </span>
      </header>
      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading history…
        </div>
      )}
      {error && (
        <p className="text-xs text-destructive">
          Unable to load history (admin role required).
        </p>
      )}
      {data && data.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No threshold changes observed yet. The first admin opening the
          console will register the baseline.
        </p>
      )}
      {data && data.length > 0 && (
        <ScrollArea className="max-h-72 pr-2">
          <ul className="space-y-2">
            {data.map((r) => {
              const diffKeys = Object.keys(r.diff ?? {});
              return (
                <li
                  key={r.id}
                  className="rounded-md border bg-background/50 p-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono">
                      {new Date(r.changed_at).toISOString().replace("T", " ").slice(0, 19)}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      hash:{r.config_hash.slice(0, 10)}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mb-1">
                    observed by{" "}
                    <span className="font-mono">
                      {r.observed_by ? r.observed_by.slice(0, 8) + "…" : "system"}
                    </span>
                    {" · "}source: {r.source}
                    {r.request_id && (
                      <> · req <span className="font-mono">{r.request_id.slice(0, 12)}</span></>
                    )}
                  </div>
                  {diffKeys.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground italic">
                      Baseline snapshot (no previous config).
                    </p>
                  ) : (
                    <ul className="space-y-0.5">
                      {diffKeys.map((k) => (
                        <li key={k} className="font-mono text-[10px]">
                          <span className="text-muted-foreground">{k}:</span>{" "}
                          <span className="line-through text-destructive/80">
                            {String(r.diff[k]?.from ?? "—")}
                          </span>{" "}
                          →{" "}
                          <span className="text-primary">
                            {String(r.diff[k]?.to ?? "—")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      )}
    </section>
  );
}
