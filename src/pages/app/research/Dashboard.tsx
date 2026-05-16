import { useEffect, useMemo, useState } from "react";
import { ResearchPreviewBanner } from "@/components/ResearchPreviewBanner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/SEOHead";
import { Activity, Users, Mail, Brain, ClipboardList } from "lucide-react";
import { format } from "date-fns";

type Project = { id: string; name: string; user_id: string };
type Invitation = { id: string; project_id: string; invited_email: string; invited_role: string; status: string; created_at: string };
type Member = { id: string; project_id: string; user_id: string; project_role: string; created_at: string };
type AIJob = { id: string; pipeline: string; status: string; progress: number; created_at: string; completed_at: string | null; results: any };
type AuditLog = { id: string; project_id: string | null; actor_id: string | null; action: string; entity_type: string; entity_id: string | null; context: any; created_at: string };

const statusColor = (s: string) => {
  switch (s) {
    case "pending":
    case "queued": return "secondary";
    case "running": return "default";
    case "accepted":
    case "completed": return "default";
    case "failed":
    case "declined":
    case "revoked":
    case "cancelled": return "destructive";
    default: return "outline";
  }
};

export default function ResearchDashboard() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [projects, setProjects] = useState<Project[]>([]);
  const [selected, setSelected] = useState<string>("all");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [jobs, setJobs] = useState<AIJob[]>([]);
  const [audit, setAudit] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      setLoading(true);
      // Owned projects + projects where user is member
      const [{ data: owned }, { data: memberships }] = await Promise.all([
        supabase.from("hardware_projects").select("id,name,user_id").eq("user_id", userId),
        supabase.from("project_members").select("project_id").eq("user_id", userId),
      ]);
      const projectIds = new Set<string>([
        ...(owned ?? []).map((p: any) => p.id),
        ...(memberships ?? []).map((m: any) => m.project_id),
      ]);
      let allProjects: Project[] = owned ?? [];
      if (memberships?.length) {
        const memberProjectIds = memberships.map((m: any) => m.project_id).filter((id: string) => !allProjects.some(p => p.id === id));
        if (memberProjectIds.length) {
          const { data: extra } = await supabase.from("hardware_projects").select("id,name,user_id").in("id", memberProjectIds);
          allProjects = [...allProjects, ...(extra ?? [])];
        }
      }

      const ids = Array.from(projectIds);
      const [invRes, memRes, jobsRes, auditRes] = await Promise.all([
        ids.length ? supabase.from("project_invitations").select("*").in("project_id", ids).order("created_at", { ascending: false }) : Promise.resolve({ data: [] as any }),
        ids.length ? supabase.from("project_members").select("*").in("project_id", ids) : Promise.resolve({ data: [] as any }),
        supabase.from("ai_recon_jobs").select("id,pipeline,status,progress,created_at,completed_at,results").order("created_at", { ascending: false }).limit(50),
        supabase.from("research_audit_logs").select("*").order("created_at", { ascending: false }).limit(200),
      ]);

      if (!active) return;
      setProjects(allProjects);
      setInvitations((invRes.data ?? []) as Invitation[]);
      setMembers((memRes.data ?? []) as Member[]);
      setJobs((jobsRes.data ?? []) as AIJob[]);
      setAudit((auditRes.data ?? []) as AuditLog[]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [userId]);

  const filteredInv = useMemo(() => selected === "all" ? invitations : invitations.filter(i => i.project_id === selected), [invitations, selected]);
  const filteredMem = useMemo(() => selected === "all" ? members : members.filter(m => m.project_id === selected), [members, selected]);
  const filteredAudit = useMemo(() => selected === "all" ? audit : audit.filter(a => a.project_id === selected), [audit, selected]);

  const pendingInv = filteredInv.filter(i => i.status === "pending");
  const projectName = (id: string | null) => id ? (projects.find(p => p.id === id)?.name ?? id.slice(0, 8)) : "—";

  return (
    <div className="space-y-6 p-4 md:p-6">
      <SEOHead title="R&D Dashboard — VASCU-LINK" description="Suivi des invitations, rôles et jobs IA par projet de recherche." />
      <ResearchPreviewBanner />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">R&D Dashboard</h1>
          <p className="text-sm text-muted-foreground">Invitations, rôles, jobs IA et journal d'audit par projet.</p>
        </div>
        <Select value={selected} onValueChange={setSelected}>
          <SelectTrigger className="w-full md:w-72"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les projets</SelectItem>
            {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Mail} label="Invitations en attente" value={pendingInv.length} />
        <StatCard icon={Users} label="Membres" value={filteredMem.length} />
        <StatCard icon={Brain} label="Jobs IA (50 derniers)" value={jobs.length} />
        <StatCard icon={ClipboardList} label="Événements audit" value={filteredAudit.length} />
      </div>

      <Tabs defaultValue="invitations">
        <TabsList>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="members">Rôles</TabsTrigger>
          <TabsTrigger value="jobs">Jobs IA</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="invitations">
          <Card>
            <CardHeader><CardTitle>Invitations</CardTitle><CardDescription>Statuts par projet.</CardDescription></CardHeader>
            <CardContent>
              {loading ? <p className="text-sm text-muted-foreground">Chargement…</p>
                : filteredInv.length === 0 ? <p className="text-sm text-muted-foreground">Aucune invitation.</p>
                : <ul className="divide-y">
                    {filteredInv.map(i => (
                      <li key={i.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{i.invited_email}</p>
                          <p className="text-xs text-muted-foreground">{projectName(i.project_id)} · {i.invited_role} · {format(new Date(i.created_at), "Pp")}</p>
                        </div>
                        <Badge variant={statusColor(i.status) as any}>{i.status}</Badge>
                      </li>
                    ))}
                  </ul>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader><CardTitle>Rôles par projet</CardTitle></CardHeader>
            <CardContent>
              {filteredMem.length === 0 ? <p className="text-sm text-muted-foreground">Aucun membre.</p>
                : <ul className="divide-y">
                    {filteredMem.map(m => (
                      <li key={m.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="font-mono text-xs">{m.user_id.slice(0, 12)}…</p>
                          <p className="text-xs text-muted-foreground">{projectName(m.project_id)}</p>
                        </div>
                        <Badge variant="outline">{m.project_role}</Badge>
                      </li>
                    ))}
                  </ul>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader><CardTitle>Historique des jobs IA</CardTitle></CardHeader>
            <CardContent>
              {jobs.length === 0 ? <p className="text-sm text-muted-foreground">Aucun job exécuté.</p>
                : <ul className="divide-y">
                    {jobs.map(j => (
                      <li key={j.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium">{j.pipeline}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(j.created_at), "Pp")}
                            {j.completed_at && ` → ${format(new Date(j.completed_at), "Pp")}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{j.progress}%</span>
                          <Badge variant={statusColor(j.status) as any}>{j.status}</Badge>
                        </div>
                      </li>
                    ))}
                  </ul>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Journal d'audit R&D</CardTitle>
              <CardDescription>Invitations, rôles, messages, sauvegardes de séquences et jobs IA.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[480px] pr-3">
                {filteredAudit.length === 0 ? <p className="text-sm text-muted-foreground">Aucun événement.</p>
                  : <ul className="space-y-2">
                      {filteredAudit.map(a => (
                        <li key={a.id} className="text-xs border rounded-md p-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono">{a.action}</span>
                            <span className="text-muted-foreground">{format(new Date(a.created_at), "Pp")}</span>
                          </div>
                          <div className="text-muted-foreground mt-1">
                            {a.entity_type} · projet: {projectName(a.project_id)} · auteur: {a.actor_id ? a.actor_id.slice(0, 8) + "…" : "système"}
                          </div>
                          {a.context && Object.keys(a.context).length > 0 && (
                            <pre className="mt-1 text-[10px] bg-muted/40 rounded p-1 overflow-x-auto">{JSON.stringify(a.context)}</pre>
                          )}
                        </li>
                      ))}
                    </ul>}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
