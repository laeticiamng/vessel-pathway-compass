import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, AlertOctagon, Loader2, PlusCircle, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

interface SlaMetrics {
  uptime_pct: number;
  downtime_minutes: number;
  total_incidents: number;
  avg_mttr_minutes: number;
  by_severity: Record<string, number>;
}

interface SlaIncident {
  id: string;
  title: string;
  severity: string;
  started_at: string;
  resolved_at: string | null;
  mttr_minutes: number | null;
  affected_users: number | null;
}

const sevColor = (s: string) =>
  s === "sev1" ? "destructive" : s === "sev2" ? "secondary" : "outline";

export function SLAWidget({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    severity: "sev3",
    description: "",
    affected_users: "0",
    resolved: false,
  });

  const { data: metrics, isLoading: mLoading } = useQuery({
    queryKey: ["sla-metrics-30d"],
    enabled: !!user,
    queryFn: async (): Promise<SlaMetrics | null> => {
      const { data, error } = await supabase.rpc("sla_metrics_30d" as never);
      if (error) throw error;
      return (data as unknown as SlaMetrics) ?? null;
    },
  });

  const { data: incidents } = useQuery({
    queryKey: ["sla-incidents-recent"],
    enabled: !!user,
    queryFn: async (): Promise<SlaIncident[]> => {
      const { data, error } = await supabase
        .from("sla_incidents" as never)
        .select("id,title,severity,started_at,resolved_at,mttr_minutes,affected_users")
        .order("started_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data as unknown as SlaIncident[]) ?? [];
    },
  });

  const handleDeclare = async () => {
    if (!user || !form.title) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("sla_incidents" as never).insert({
        title: form.title,
        description: form.description || null,
        severity: form.severity,
        affected_users: parseInt(form.affected_users) || 0,
        declared_by: user.id,
        resolved_at: form.resolved ? new Date().toISOString() : null,
      } as never);
      if (error) throw error;
      await supabase.rpc("log_governance_event" as never, {
        _category: "administration",
        _action: "sla.incident.declared",
        _severity: form.severity === "sev1" ? "critical" : form.severity === "sev2" ? "error" : "warn",
        _context: { title: form.title, severity: form.severity } as never,
      } as never);
      toast.success("Incident SLA déclaré");
      setOpen(false);
      setForm({ title: "", severity: "sev3", description: "", affected_users: "0", resolved: false });
      qc.invalidateQueries({ queryKey: ["sla-metrics-30d"] });
      qc.invalidateQueries({ queryKey: ["sla-incidents-recent"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const uptimeTone =
    !metrics ? "default" : metrics.uptime_pct >= 99.9 ? "ok" : metrics.uptime_pct >= 99 ? "warn" : "danger";
  const uptimeClass =
    uptimeTone === "danger" ? "border-destructive/60" : uptimeTone === "warn" ? "border-warning/60" : uptimeTone === "ok" ? "border-primary/40" : "";

  return (
    <Card className={uptimeClass}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              SLA & Observabilité (30j)
            </CardTitle>
            <CardDescription>Disponibilité, MTTR et incidents récents.</CardDescription>
          </div>
          {isSuperAdmin && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <PlusCircle className="h-4 w-4 mr-1" /> Déclarer un incident
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Déclarer un incident SLA</DialogTitle>
                  <DialogDescription>Sera tracé dans le journal de gouvernance.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="sla-title">Titre</Label>
                    <Input id="sla-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex : Lenteur API edge functions" />
                  </div>
                  <div>
                    <Label>Sévérité</Label>
                    <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sev1">Sev1 — Service indisponible</SelectItem>
                        <SelectItem value="sev2">Sev2 — Dégradation majeure</SelectItem>
                        <SelectItem value="sev3">Sev3 — Dégradation mineure</SelectItem>
                        <SelectItem value="sev4">Sev4 — Cosmétique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sla-affected">Utilisateurs affectés</Label>
                    <Input id="sla-affected" type="number" value={form.affected_users} onChange={(e) => setForm({ ...form, affected_users: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="sla-desc">Description</Label>
                    <Textarea id="sla-desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="sla-resolved" type="checkbox" checked={form.resolved} onChange={(e) => setForm({ ...form, resolved: e.target.checked })} />
                    <Label htmlFor="sla-resolved" className="cursor-pointer">Déjà résolu (calcul MTTR immédiat)</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleDeclare} disabled={submitting || !form.title}>
                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Enregistrer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mLoading || !metrics ? (
          <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold tabular-nums">{metrics.uptime_pct}%</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Uptime
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{metrics.avg_mttr_minutes}<span className="text-sm font-normal text-muted-foreground">min</span></p>
                <p className="text-xs text-muted-foreground">MTTR moyen</p>
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{metrics.total_incidents}</p>
                <p className="text-xs text-muted-foreground">Incidents 30j</p>
              </div>
            </div>
            {incidents && incidents.length > 0 && (
              <ul className="space-y-1.5 mt-2">
                {incidents.map((i) => (
                  <li key={i.id} className="text-xs flex items-center justify-between gap-2 border-t pt-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant={sevColor(i.severity)} className="shrink-0">{i.severity}</Badge>
                      <span className="truncate">{i.title}</span>
                    </div>
                    <span className="text-muted-foreground shrink-0">
                      {i.resolved_at ? `${i.mttr_minutes}min` : <span className="flex items-center gap-1 text-destructive"><AlertOctagon className="h-3 w-3" />ouvert</span>}
                      {" · "}
                      {format(new Date(i.started_at), "dd/MM")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
