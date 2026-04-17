import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, Activity, FlaskConical, Stethoscope, Loader2, AlertTriangle, CheckCircle2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";
import { AnomalyPanel } from "@/components/governance/AnomalyPanel";
import { ProcessingRegisterButton } from "@/components/governance/ProcessingRegisterButton";

type AppRole = "admin" | "physician" | "trainee" | "expert_reviewer" | "hospital_admin" | "research_lead" | "super_admin";

type GovEvent = {
  id: string;
  actor_id: string | null;
  event_category: string;
  event_action: string;
  severity: string;
  context: Record<string, unknown> | null;
  created_at: string;
  target_entity_type: string | null;
};

type Signoff = {
  id: string;
  entity_type: string;
  entity_id: string;
  signed_by: string;
  cosigned_by: string | null;
  status: string;
  justification: string | null;
  created_at: string;
};

type RgpdRequest = {
  id: string;
  user_id: string;
  request_type: string;
  status: string;
  description: string | null;
  due_date: string;
  created_at: string;
};

type LifecyclePolicy = {
  id: string;
  entity_type: string;
  retention_days: number;
  legal_basis: string;
  automatic_action: string;
  description: string | null;
};

const severityVariant = (s: string) =>
  s === "critical" || s === "error" ? "destructive" : s === "warn" ? "secondary" : "outline";

const statusVariant = (s: string) =>
  s === "signed" || s === "cosigned" || s === "completed" ? "default" :
  s === "rejected" || s === "revoked" ? "destructive" :
  s === "in_progress" ? "secondary" : "outline";

export default function Governance() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const { log } = useAuditLog();

  useEffect(() => {
    let cancelled = false;
    if (!user) { setRolesLoading(false); return; }
    (async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (cancelled) return;
      setRoles((data ?? []).map((r) => r.role as AppRole));
      setRolesLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const isDpo = roles.includes("admin") || roles.includes("super_admin");
  const isHospitalAdmin = roles.includes("hospital_admin") || isDpo;
  const isResearchLead = roles.includes("research_lead") || isDpo;
  const isExpert = roles.includes("expert_reviewer") || isDpo;

  // Default tab based on role
  const defaultTab = isDpo ? "dpo" : isExpert ? "expert" : isResearchLead ? "research" : isHospitalAdmin ? "hospital" : "dpo";

  const { data: events, isLoading: evLoading } = useQuery({
    queryKey: ["gov-events"],
    enabled: !!user,
    queryFn: async (): Promise<GovEvent[]> => {
      const { data, error } = await supabase
        .from("governance_events" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data as unknown as GovEvent[]) ?? [];
    },
  });

  const { data: signoffs, isLoading: sLoading, refetch: refetchSignoffs } = useQuery({
    queryKey: ["clinical-signoffs"],
    enabled: !!user,
    queryFn: async (): Promise<Signoff[]> => {
      const { data, error } = await supabase
        .from("clinical_signoffs" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data as unknown as Signoff[]) ?? [];
    },
  });

  const { data: rgpd, isLoading: rLoading } = useQuery({
    queryKey: ["rgpd-all"],
    enabled: !!user && isDpo,
    queryFn: async (): Promise<RgpdRequest[]> => {
      const { data, error } = await supabase
        .from("rgpd_requests" as never)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as RgpdRequest[]) ?? [];
    },
  });

  const { data: policies } = useQuery({
    queryKey: ["lifecycle-policies"],
    enabled: !!user,
    queryFn: async (): Promise<LifecyclePolicy[]> => {
      const { data, error } = await supabase
        .from("data_lifecycle_policies" as never)
        .select("*")
        .order("entity_type");
      if (error) throw error;
      return (data as unknown as LifecyclePolicy[]) ?? [];
    },
  });

  const handleCosign = async (signoff: Signoff) => {
    if (!user) return;
    const { error } = await supabase
      .from("clinical_signoffs" as never)
      .update({ cosigned_by: user.id, cosigned_at: new Date().toISOString(), status: "cosigned" } as never)
      .eq("id", signoff.id);
    if (error) { toast.error(error.message); return; }
    await log({
      category: "clinical",
      action: "signoff.cosigned",
      severity: "info",
      targetEntityType: signoff.entity_type,
      targetEntityId: signoff.entity_id,
      context: { signoffId: signoff.id },
    });
    toast.success("Signoff co-signé");
    refetchSignoffs();
  };

  if (rolesLoading) {
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  // Stats
  const criticalEvents = events?.filter((e) => e.severity === "critical" || e.severity === "error").length ?? 0;
  const pendingSignoffs = signoffs?.filter((s) => s.status === "pending" || s.status === "signed").length ?? 0;
  const overdueRgpd = rgpd?.filter((r) => r.status !== "completed" && r.status !== "rejected" && new Date(r.due_date) < new Date()).length ?? 0;

  return (
    <>
      <SEOHead title="Gouvernance" description="Tableau de bord gouvernance, conformité et audit" path="/app/governance" noindex />
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            Gouvernance & Conformité
          </h1>
          <p className="text-muted-foreground mt-1">
            Audit transverse, signoffs cliniques, RGPD, cycle de vie des données.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {roles.map((r) => <Badge key={r} variant="secondary">{r}</Badge>)}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Événements critiques</CardDescription>
              <CardTitle className="text-3xl">{criticalEvents}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Signoffs en attente</CardDescription>
              <CardTitle className="text-3xl">{pendingSignoffs}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> RGPD en retard</CardDescription>
              <CardTitle className="text-3xl">{overdueRgpd}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-4">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="dpo"><ShieldCheck className="h-4 w-4 mr-1" /> DPO</TabsTrigger>
            <TabsTrigger value="hospital"><Activity className="h-4 w-4 mr-1" /> Hospital Admin</TabsTrigger>
            <TabsTrigger value="research"><FlaskConical className="h-4 w-4 mr-1" /> Research Lead</TabsTrigger>
            <TabsTrigger value="expert"><Stethoscope className="h-4 w-4 mr-1" /> Expert Reviewer</TabsTrigger>
          </TabsList>

          {/* DPO TAB */}
          <TabsContent value="dpo" className="space-y-4">
            {!isDpo ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Réservé aux DPO (admin / super_admin).</CardContent></Card>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/app/governance/audit-search">
                      <Search className="h-4 w-4 mr-2" />
                      Recherche audit avancée
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/app/governance/policies">
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Politiques cycle de vie
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/app/admin/system-health">
                      <Activity className="h-4 w-4 mr-2" />
                      Santé système
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/app/governance/dpia">
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      DPIA (art. 35)
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/app/admin/users">
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Utilisateurs & rôles
                    </Link>
                  </Button>
                  <ProcessingRegisterButton />
                </div>

                <AnomalyPanel />

                <Card>
                  <CardHeader>
                    <CardTitle>Journal de gouvernance (200 derniers)</CardTitle>
                    <CardDescription>Tous les événements de sécurité, conformité, clinique et administration.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {evLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <ScrollArea className="h-96">
                        <ul className="space-y-2">
                          {events?.map((e) => (
                            <li key={e.id} className="rounded-md border p-2 text-sm flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={severityVariant(e.severity)}>{e.severity}</Badge>
                                  <Badge variant="outline">{e.event_category}</Badge>
                                  <span className="font-mono text-xs">{e.event_action}</span>
                                </div>
                                {e.target_entity_type && <p className="text-xs text-muted-foreground mt-1">cible : {e.target_entity_type}</p>}
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{format(new Date(e.created_at), "dd/MM HH:mm")}</span>
                            </li>
                          ))}
                          {!events?.length && <p className="text-sm text-muted-foreground text-center py-8">Aucun événement.</p>}
                        </ul>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Demandes RGPD</CardTitle>
                    <CardDescription>Délai légal de traitement : 30 jours.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {rLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <ul className="space-y-2">
                        {rgpd?.map((r) => {
                          const overdue = r.status !== "completed" && r.status !== "rejected" && new Date(r.due_date) < new Date();
                          return (
                            <li key={r.id} className="rounded-md border p-3 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{r.request_type}</span>
                                <div className="flex items-center gap-2">
                                  {overdue && <Badge variant="destructive">EN RETARD</Badge>}
                                  <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Soumise {format(new Date(r.created_at), "dd/MM/yyyy")} · Échéance {format(new Date(r.due_date), "dd/MM/yyyy")}
                              </p>
                              {r.description && <p className="text-sm mt-1">{r.description}</p>}
                            </li>
                          );
                        })}
                        {!rgpd?.length && <p className="text-sm text-muted-foreground text-center py-8">Aucune demande RGPD.</p>}
                      </ul>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Politiques de cycle de vie</CardTitle>
                    <CardDescription>Durées de conservation et actions automatiques (RGPD art. 5).</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {policies?.map((p) => (
                        <li key={p.id} className="rounded-md border p-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{p.entity_type}</span>
                            <Badge variant="outline">{p.automatic_action}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Conservation : {p.retention_days} jours · Base légale : {p.legal_basis}
                          </p>
                          {p.description && <p className="text-xs mt-1">{p.description}</p>}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* HOSPITAL ADMIN TAB */}
          <TabsContent value="hospital" className="space-y-4">
            {!isHospitalAdmin ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Réservé aux Hospital Admin.</CardContent></Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Activité de l'institution</CardTitle>
                  <CardDescription>Événements de gouvernance scoped à votre institution.</CardDescription>
                </CardHeader>
                <CardContent>
                  {evLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <ul className="space-y-2">
                      {events?.filter((e) => e.event_category === "clinical" || e.event_category === "administration").slice(0, 50).map((e) => (
                        <li key={e.id} className="rounded-md border p-2 text-sm flex justify-between">
                          <span><Badge variant="outline" className="mr-2">{e.event_category}</Badge>{e.event_action}</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(e.created_at), "dd/MM HH:mm")}</span>
                        </li>
                      ))}
                      {!events?.length && <p className="text-sm text-muted-foreground text-center py-8">Aucun événement institution.</p>}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* RESEARCH LEAD TAB */}
          <TabsContent value="research" className="space-y-4">
            {!isResearchLead ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Réservé aux Research Lead.</CardContent></Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Événements recherche & exports</CardTitle>
                  <CardDescription>Traçabilité des exports anonymisés et de l'éligibilité des cohortes.</CardDescription>
                </CardHeader>
                <CardContent>
                  {evLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <ul className="space-y-2">
                      {events?.filter((e) => e.event_category === "research").slice(0, 50).map((e) => (
                        <li key={e.id} className="rounded-md border p-2 text-sm flex justify-between">
                          <span className="font-mono text-xs">{e.event_action}</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(e.created_at), "dd/MM HH:mm")}</span>
                        </li>
                      ))}
                      {!events?.filter((e) => e.event_category === "research").length && (
                        <p className="text-sm text-muted-foreground text-center py-8">Aucun événement recherche pour le moment.</p>
                      )}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* EXPERT REVIEWER TAB */}
          <TabsContent value="expert" className="space-y-4">
            {!isExpert ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Réservé aux Expert Reviewer.</CardContent></Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Signoffs cliniques</CardTitle>
                  <CardDescription>Validez (cosignez) les décisions cliniques en attente.</CardDescription>
                </CardHeader>
                <CardContent>
                  {sLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                    <ul className="space-y-2">
                      {signoffs?.map((s) => (
                        <li key={s.id} className="rounded-md border p-3 text-sm space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{s.entity_type} #{s.entity_id.slice(0, 8)}</span>
                            <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
                          </div>
                          {s.justification && <p className="text-xs text-muted-foreground">{s.justification}</p>}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{format(new Date(s.created_at), "dd/MM/yyyy HH:mm")}</span>
                            {s.status === "signed" && !s.cosigned_by && (
                              <Button size="sm" onClick={() => handleCosign(s)}>Cosigner</Button>
                            )}
                          </div>
                        </li>
                      ))}
                      {!signoffs?.length && <p className="text-sm text-muted-foreground text-center py-8">Aucun signoff.</p>}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
