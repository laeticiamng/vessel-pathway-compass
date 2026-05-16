import { useEffect, useState } from "react";
import { Settings2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRoles } from "@/hooks/useUserRoles";
import { parseGuardResponse, newGuardRequestId } from "@/lib/protocolGuard";
import { guardLog } from "@/lib/guardLogger";

/**
 * Read-only display of the active protocol-access-guard security
 * thresholds (sourced from the Edge Function env). Lets admins audit
 * the values without having to inspect deployment configs.
 */
type Cfg = {
  window_ms: number; max_denied: number; ban_ms: number;
  burst_403: number; burst_window_ms: number;
  multi_action_distinct: number; multi_action_window_ms: number;
  alert_cooldown_ms: number;
};

function fmt(ms: number) {
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60_000) return `${Math.round(ms / 100) / 10} s`;
  return `${Math.round(ms / 6_000) / 10} min`;
}

export function ProtocolGuardConfigPanel() {
  const { hasRole, isLoading: rolesLoading } = useUserRoles();
  const allowed = hasRole(["admin", "super_admin", "research_lead"]);
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (rolesLoading) return;
    // Client-side fast-path: server allowlist is {admin, super_admin,
    // research_lead}. Anyone else would get a guaranteed 403 — skip the
    // call entirely to avoid console noise / runtime-error overlays.
    if (!allowed) {
      setLoading(false);
      return;
    }
    let cancel = false;
    (async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const token = sess.session?.access_token;
        if (!token) throw new Error("Not authenticated");
        const requestId = newGuardRequestId();
        const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/protocol-access-guard?config=1`;
        const r = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
            "x-request-id": requestId,
          },
        });
        const parsed = await parseGuardResponse<{ config: Cfg }>(r, requestId);
        if (!parsed.ok || !parsed.data) {
          throw new Error(parsed.error ?? `HTTP ${parsed.status}`);
        }
        if (!cancel) setCfg(parsed.data.config);
      } catch (e) {
        if (!cancel) setErr(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [rolesLoading, allowed]);

  // Hide entirely for non-admins — server already denies and this avoids
  // leaking even the section header to unauthorized viewers.
  if (!rolesLoading && !allowed) return null;

  return (
    <section
      data-testid="guard-config-panel"
      className="rounded-2xl border bg-card p-4"
      aria-labelledby="guard-config-title"
    >
      <header className="flex items-center gap-2 mb-3">
        <Settings2 className="h-4 w-4 text-primary" />
        <h2 id="guard-config-title" className="text-sm font-semibold">
          Active security thresholds
        </h2>
        <span className="text-[10px] text-muted-foreground ml-auto uppercase">read-only</span>
      </header>
      {loading && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading…
        </div>
      )}
      {err && <p className="text-xs text-destructive">Failed to load config: {err}</p>}
      {cfg && (
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Row label="Sliding window" v={fmt(cfg.window_ms)} />
          <Row label="Max denials / window" v={String(cfg.max_denied)} />
          <Row label="Ban duration" v={fmt(cfg.ban_ms)} />
          <Row label="Alert cooldown" v={fmt(cfg.alert_cooldown_ms)} />
          <Row label="Burst threshold" v={`${cfg.burst_403} denials`} />
          <Row label="Burst window" v={fmt(cfg.burst_window_ms)} />
          <Row label="Multi-action threshold" v={`${cfg.multi_action_distinct} distinct`} />
          <Row label="Multi-action window" v={fmt(cfg.multi_action_window_ms)} />
        </dl>
      )}
      <p className="mt-3 text-[10px] text-muted-foreground">
        Override via <code>PROTOCOL_GUARD_*</code> env vars on the edge function.
      </p>
    </section>
  );
}

function Row({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono">{v}</dd>
    </div>
  );
}
