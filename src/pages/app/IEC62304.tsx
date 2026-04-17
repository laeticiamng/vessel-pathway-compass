import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, Package, GitBranch, FileCheck2 } from "lucide-react";
import { format } from "date-fns";
import { IECTechnicalFileButton } from "@/components/governance/IECTechnicalFileButton";

interface SoftwareVersion { id: string; version: string; released_at: string; risk_class: string; release_notes: string | null; git_sha: string | null; }
interface SoupComponent { id: string; name: string; version: string; license: string | null; cve_status: string; purpose: string | null; risk_assessment: string | null; }
interface ClinicalAlgo { id: string; name: string; version: string; validation_status: string; risk_class: string; description: string | null; last_review_at: string | null; evidence_url: string | null; }

const cveColor = (s: string) =>
  s === "vulnerable" ? "destructive" : s === "watch" ? "secondary" : s === "patched" ? "outline" : "default";
const validationColor = (s: string) =>
  s === "validated" ? "default" : s === "deprecated" ? "destructive" : "secondary";

export default function IEC62304() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const roles = (data ?? []).map((r) => r.role);
      setAuthorized(roles.some((r) => ["admin", "super_admin", "hospital_admin"].includes(r as string)));
      setLoading(false);
    })();
  }, [user]);

  const { data: versions } = useQuery({
    queryKey: ["iec-versions"],
    enabled: !!user && authorized,
    queryFn: async (): Promise<SoftwareVersion[]> => {
      const { data, error } = await supabase
        .from("software_versions" as never)
        .select("*")
        .order("released_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as SoftwareVersion[]) ?? [];
    },
  });

  const { data: soup } = useQuery({
    queryKey: ["iec-soup"],
    enabled: !!user && authorized,
    queryFn: async (): Promise<SoupComponent[]> => {
      const { data, error } = await supabase.from("soup_components" as never).select("*").order("name");
      if (error) throw error;
      return (data as unknown as SoupComponent[]) ?? [];
    },
  });

  const { data: algos } = useQuery({
    queryKey: ["iec-algos"],
    enabled: !!user && authorized,
    queryFn: async (): Promise<ClinicalAlgo[]> => {
      const { data, error } = await supabase.from("clinical_algorithms" as never).select("*").order("name");
      if (error) throw error;
      return (data as unknown as ClinicalAlgo[]) ?? [];
    },
  });

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!authorized) {
    return (
      <Card className="max-w-2xl mx-auto mt-12">
        <CardHeader>
          <CardTitle>Accès refusé</CardTitle>
          <CardDescription>Réservé aux administrateurs et hospital admins.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <SEOHead title="IEC 62304" description="Technical file IEC 62304 — versions, SOUP, algorithmes" path="/app/governance/iec62304" noindex />
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
              IEC 62304 — Technical File
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Traçabilité du cycle de vie logiciel pour la certification dispositif médical.
            </p>
          </div>
          <IECTechnicalFileButton />
        </div>

        <Tabs defaultValue="versions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="versions"><GitBranch className="h-4 w-4 mr-1" /> Versions</TabsTrigger>
            <TabsTrigger value="soup"><Package className="h-4 w-4 mr-1" /> SOUP</TabsTrigger>
            <TabsTrigger value="algos"><FileCheck2 className="h-4 w-4 mr-1" /> Algorithmes</TabsTrigger>
          </TabsList>

          <TabsContent value="versions">
            <Card>
              <CardHeader>
                <CardTitle>Historique des versions logicielles</CardTitle>
                <CardDescription>Chaque release est associée à une classe de risque IEC 62304 (A/B/C).</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {versions?.map((v) => (
                    <li key={v.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">v{v.version}</span>
                          <Badge variant="outline">classe {v.risk_class}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{format(new Date(v.released_at), "dd/MM/yyyy")}</span>
                      </div>
                      {v.release_notes && <p className="text-sm text-muted-foreground mt-1">{v.release_notes}</p>}
                      {v.git_sha && <p className="text-xs font-mono text-muted-foreground mt-1">git: {v.git_sha.slice(0, 12)}</p>}
                    </li>
                  ))}
                  {!versions?.length && <p className="text-sm text-muted-foreground text-center py-6">Aucune version enregistrée.</p>}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="soup">
            <Card>
              <CardHeader>
                <CardTitle>Composants SOUP</CardTitle>
                <CardDescription>Inventaire des dépendances tierces et statut de vulnérabilités.</CardDescription>
              </CardHeader>
              <CardContent>
                {!soup?.length ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    Inventaire SOUP à compléter (ex : React, Vite, Tailwind, Supabase JS…).
                    <br />Action super admin requise.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {soup.map((s) => (
                      <li key={s.id} className="rounded-md border p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{s.name}</span>
                            <span className="font-mono text-xs text-muted-foreground">{s.version}</span>
                          </div>
                          <Badge variant={cveColor(s.cve_status)}>CVE: {s.cve_status}</Badge>
                        </div>
                        {s.purpose && <p className="text-xs text-muted-foreground mt-1">{s.purpose}</p>}
                        {s.license && <p className="text-xs mt-1">Licence : <span className="font-mono">{s.license}</span></p>}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="algos">
            <Card>
              <CardHeader>
                <CardTitle>Algorithmes cliniques</CardTitle>
                <CardDescription>Aides à la décision soumises à validation et revue régulière.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {algos?.map((a) => (
                    <li key={a.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{a.name}</span>
                          <span className="font-mono text-xs">v{a.version}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">classe {a.risk_class}</Badge>
                          <Badge variant={validationColor(a.validation_status)}>{a.validation_status}</Badge>
                        </div>
                      </div>
                      {a.description && <p className="text-sm text-muted-foreground mt-1">{a.description}</p>}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {a.last_review_at && <span>Revue : {format(new Date(a.last_review_at), "dd/MM/yyyy")}</span>}
                        {a.evidence_url && <a href={a.evidence_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">Preuve ↗</a>}
                      </div>
                    </li>
                  ))}
                  {!algos?.length && <p className="text-sm text-muted-foreground text-center py-6">Aucun algorithme enregistré.</p>}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
