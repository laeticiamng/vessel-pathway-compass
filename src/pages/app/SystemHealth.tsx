import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, Database, ShieldAlert, AlertTriangle, Users, FileWarning, Clock, Zap } from "lucide-react";
import { format } from "date-fns";
import { SLAWidget } from "@/components/admin/SLAWidget";

type Health = {
  patients_total: number;
  patients_active: number;
  patients_soft_deleted: number;
  cases_total: number;
  ai_outputs_total: number;
  governance_events_24h: number;
  governance_events_critical_7d: number;
  pending_signoffs: number;
  pending_rgpd_requests: number;
  overdue_rgpd_requests: number;
  active_users_30d: number;
  last_lifecycle_run: string | null;
  lifecycle_policies_count: number;
  institutions_count: number;
  notifications_unread: number;
};

type RecentEvent = {
  id: string;
  event_action: string;
  event_category: string;
  severity: string;
  created_at: string;
};

function MetricCard({ icon, label, value, hint, tone = "default" }: {
  icon: React.ReactNode; label: string; value: string | number; hint?: string;
  tone?: "default" | "warn" | "danger" | "ok";
}) {
  const toneClass = tone === "danger" ? "border-destructive/50" : tone === "warn" ? "border-warning/50" : tone === "ok" ? "border-primary/30" : "";
  return (
    <Card className={toneClass}>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2 text-xs">{icon}{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardHeader>
    </Card>
  );
}

export default function SystemHealth() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) { setChecking(false); return; }
    (async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const roles = (data ?? []).map((r) => r.role as string);
      setIsAdmin(roles.some((r) => r === "super_admin" || r === "admin"));
      setIsSuperAdmin(roles.includes("super_admin"));
      setChecking(false);
    })();
  }, [user]);

  const { data: health, isLoading: hLoading } = useQuery({
    queryKey: ["system-health"],
    enabled: !!user && isAdmin,
    refetchInterval: 30000,
    queryFn: async (): Promise<Health | null> => {
      const { data, error } = await supabase.rpc("system_health_metrics" as never);
      if (error) throw error;
      return (data as unknown as Health) ?? null;
    },
  });

  const { data: recent } = useQuery({
    queryKey: ["recent-critical-events"],
    enabled: !!user && isAdmin,
    refetchInterval: 30000,
    queryFn: async (): Promise<RecentEvent[]> => {
      const { data, error } = await supabase
        .from("governance_events" as never)
        .select("id, event_action, event_category, severity, created_at")
        .in("severity", ["critical", "error"])
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data as unknown as RecentEvent[]) ?? [];
    },
  });

  if (checking) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!isAdmin) {
    return (
      <Card className="max-w-2xl mx-auto mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-destructive" />Accès refusé</CardTitle>
          <CardDescription>Réservé aux administrateurs (admin / super_admin).</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <SEOHead title="Santé du système" description="Observabilité et métriques système" path="/app/admin/system-health" noindex />
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            Santé du système
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Métriques temps réel · rafraîchissement automatique toutes les 30s.
          </p>
        </div>

        {hLoading || !health ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* Critical alerts row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard icon={<AlertTriangle className="h-3.5 w-3.5 text-destructive" />} label="Événements critiques (7j)" value={health.governance_events_critical_7d} tone={health.governance_events_critical_7d > 0 ? "danger" : "ok"} />
              <MetricCard icon={<FileWarning className="h-3.5 w-3.5 text-destructive" />} label="RGPD en retard" value={health.overdue_rgpd_requests} tone={health.overdue_rgpd_requests > 0 ? "danger" : "ok"} />
              <MetricCard icon={<Clock className="h-3.5 w-3.5" />} label="Signoffs en attente" value={health.pending_signoffs} tone={health.pending_signoffs > 5 ? "warn" : "default"} />
              <MetricCard icon={<Zap className="h-3.5 w-3.5" />} label="Événements (24h)" value={health.governance_events_24h} hint="Activité globale" />
            </div>

            <SLAWidget isSuperAdmin={isSuperAdmin} />

            {/* Data volumes */}
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4" />Volume de données</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <MetricCard icon={<Users className="h-3.5 w-3.5" />} label="Patients actifs" value={health.patients_active} hint={`${health.patients_soft_deleted} soft-deleted`} />
                  <MetricCard icon={<Database className="h-3.5 w-3.5" />} label="Cas cliniques" value={health.cases_total} />
                  <MetricCard icon={<Zap className="h-3.5 w-3.5" />} label="Sorties IA" value={health.ai_outputs_total} />
                  <MetricCard icon={<Users className="h-3.5 w-3.5" />} label="Utilisateurs actifs (30j)" value={health.active_users_30d} />
                </div>
              </CardContent>
            </Card>

            {/* Governance & RGPD */}
            <Card>
              <CardHeader><CardTitle className="text-base">Conformité & cycle de vie</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">RGPD en cours</span>
                  <span className="font-mono">{health.pending_rgpd_requests}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Politiques de cycle de vie</span>
                  <span className="font-mono">{health.lifecycle_policies_count}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Institutions</span>
                  <span className="font-mono">{health.institutions_count}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Notifications non lues (toutes)</span>
                  <span className="font-mono">{health.notifications_unread}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dernière exécution lifecycle</span>
                  <span className="font-mono text-xs">
                    {health.last_lifecycle_run ? format(new Date(health.last_lifecycle_run), "dd/MM/yyyy HH:mm") : "jamais"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent critical events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Derniers événements critiques
                </CardTitle>
                <CardDescription>10 derniers événements de sévérité critical/error.</CardDescription>
              </CardHeader>
              <CardContent>
                {!recent?.length ? (
                  <p className="text-sm text-muted-foreground text-center py-6">✨ Aucun événement critique récent.</p>
                ) : (
                  <ul className="space-y-2">
                    {recent.map((e) => (
                      <li key={e.id} className="rounded-md border p-2 text-sm flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge variant={e.severity === "critical" ? "destructive" : "secondary"}>{e.severity}</Badge>
                          <Badge variant="outline">{e.event_category}</Badge>
                          <span className="font-mono text-xs truncate">{e.event_action}</span>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(e.created_at), "dd/MM HH:mm")}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
