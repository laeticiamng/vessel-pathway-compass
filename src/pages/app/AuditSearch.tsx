import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, Download, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useExportManifest } from "@/hooks/useExportManifest";
import { toast } from "sonner";

type GovEvent = {
  id: string;
  actor_id: string | null;
  event_category: string;
  event_action: string;
  severity: string;
  context: Record<string, unknown> | null;
  target_entity_type: string | null;
  target_entity_id: string | null;
  created_at: string;
};

const CATEGORIES = ["all", "security", "compliance", "clinical", "research", "administration", "data_lifecycle"];
const SEVERITIES = ["all", "info", "warn", "error", "critical"];

const sevVariant = (s: string) =>
  s === "critical" || s === "error" ? "destructive" : s === "warn" ? "secondary" : "outline";

export default function AuditSearch() {
  const { user } = useAuth();
  const { log } = useAuditLog();
  const { register } = useExportManifest();
  const [category, setCategory] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [actionFilter, setActionFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  // Role check
  useQuery({
    queryKey: ["audit-search-role", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      const roles = (data ?? []).map((r) => r.role);
      const ok = roles.includes("admin") || roles.includes("super_admin");
      setAuthorized(ok);
      return ok;
    },
  });

  const { data: events, isFetching, refetch } = useQuery({
    queryKey: ["audit-search", category, severity, actionFilter, actorFilter, from, to],
    enabled: !!user && authorized === true,
    queryFn: async (): Promise<GovEvent[]> => {
      let q = supabase
        .from("governance_events" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (category !== "all") q = q.eq("event_category", category);
      if (severity !== "all") q = q.eq("severity", severity);
      if (actionFilter) q = q.ilike("event_action", `%${actionFilter}%`);
      if (actorFilter) q = q.eq("actor_id", actorFilter);
      if (from) q = q.gte("created_at", new Date(from).toISOString());
      if (to) q = q.lte("created_at", new Date(to).toISOString());
      const { data, error } = await q;
      if (error) throw error;
      return (data as unknown as GovEvent[]) ?? [];
    },
  });

  const csv = useMemo(() => {
    if (!events?.length) return "";
    const header = ["created_at", "category", "action", "severity", "actor_id", "target_entity_type", "target_entity_id", "context"];
    const rows = events.map((e) => [
      e.created_at,
      e.event_category,
      e.event_action,
      e.severity,
      e.actor_id ?? "",
      e.target_entity_type ?? "",
      e.target_entity_id ?? "",
      JSON.stringify(e.context ?? {}).replace(/"/g, '""'),
    ]);
    return [header.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
  }, [events]);

  const handleExport = async () => {
    if (!csv) {
      toast.info("Aucun résultat à exporter");
      return;
    }
    // Register chain-of-custody manifest (P7 — ADR-014)
    const manifest = await register({
      entityType: "governance_audit",
      format: "csv",
      rowCount: events?.length ?? 0,
      payload: csv,
      purpose: `Export audit DPO — filtres: ${category}/${severity}`,
      context: { filters: { category, severity, actionFilter, from, to } },
    });

    const signedCsv = manifest?.sha256
      ? `${csv}\n# SHA-256: ${manifest.sha256}\n# Manifest: ${manifest.manifestId}\n`
      : csv;

    const blob = new Blob([signedCsv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    await log({
      category: "compliance",
      action: "audit.export.csv",
      severity: "info",
      context: { count: events?.length ?? 0, filters: { category, severity, actionFilter, from, to }, sha256: manifest?.sha256 },
    });
    toast.success(`${events?.length ?? 0} événements exportés (SHA-256 signé)`);
  };

  if (authorized === false) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-2">
          <ShieldAlert className="h-10 w-10 text-destructive mx-auto" />
          <p className="font-medium">Accès réservé aux DPO (admin / super_admin).</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <SEOHead title="Recherche audit" description="Recherche avancée dans le journal de gouvernance" path="/app/governance/audit-search" noindex />
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Search className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            Recherche audit avancée
          </h1>
          <p className="text-muted-foreground mt-1">
            Filtrez le journal de gouvernance et exportez en CSV pour audit externe.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
            <CardDescription>500 résultats max par requête.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Catégorie</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Sévérité</Label>
              <Select value={severity} onValueChange={setSeverity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEVERITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Action contient</Label>
              <Input value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} placeholder="ex: patient.created" />
            </div>
            <div className="space-y-1">
              <Label>Acteur (UUID)</Label>
              <Input value={actorFilter} onChange={(e) => setActorFilter(e.target.value)} placeholder="UUID utilisateur" />
            </div>
            <div className="space-y-1">
              <Label>Du</Label>
              <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Au</Label>
              <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
              <Button onClick={() => refetch()} disabled={isFetching}>
                {isFetching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                Rechercher
              </Button>
              <Button variant="outline" onClick={handleExport} disabled={!events?.length}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV ({events?.length ?? 0})
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Résultats</CardTitle>
          </CardHeader>
          <CardContent>
            {isFetching ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <ScrollArea className="h-[60vh]">
                <ul className="space-y-2">
                  {events?.map((e) => (
                    <li key={e.id} className="rounded-md border p-3 text-sm space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={sevVariant(e.severity)}>{e.severity}</Badge>
                        <Badge variant="outline">{e.event_category}</Badge>
                        <span className="font-mono text-xs">{e.event_action}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{format(new Date(e.created_at), "dd/MM/yyyy HH:mm:ss")}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Acteur : {e.actor_id?.slice(0, 8) ?? "système"}
                        {e.target_entity_type && ` · cible : ${e.target_entity_type}/${e.target_entity_id?.slice(0, 8)}`}
                      </div>
                      {e.context && Object.keys(e.context).length > 0 && (
                        <pre className="text-xs bg-muted/50 rounded p-2 overflow-x-auto">{JSON.stringify(e.context, null, 2)}</pre>
                      )}
                    </li>
                  ))}
                  {!events?.length && <p className="text-sm text-muted-foreground text-center py-8">Aucun événement.</p>}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
