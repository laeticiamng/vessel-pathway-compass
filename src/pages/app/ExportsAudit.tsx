import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileDown, AlertTriangle, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

interface Manifest {
  id: string;
  user_id: string;
  entity_type: string;
  export_format: string;
  row_count: number;
  sha256: string;
  purpose: string;
  expires_at: string | null;
  download_count: number;
  created_at: string;
}

const formatBadge = (f: string) => f === "pdf" ? "default" : f === "csv" ? "secondary" : "outline";

export default function ExportsAudit() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      setIsAdmin((data ?? []).some((r) => ["super_admin", "admin"].includes(r.role as string)));
      setLoading(false);
    })();
  }, [user]);

  const { data: manifests } = useQuery({
    queryKey: ["export-manifests", isAdmin],
    enabled: !!user,
    queryFn: async (): Promise<Manifest[]> => {
      const { data, error } = await supabase
        .from("export_manifests" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data as unknown as Manifest[]) ?? [];
    },
  });

  // Detect suspicious volume per user (>5 in 1h)
  const suspiciousByUser = new Map<string, number>();
  if (manifests) {
    const now = Date.now();
    const oneHourAgo = now - 3600_000;
    manifests.forEach((m) => {
      if (new Date(m.created_at).getTime() > oneHourAgo) {
        suspiciousByUser.set(m.user_id, (suspiciousByUser.get(m.user_id) ?? 0) + 1);
      }
    });
  }

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <>
      <SEOHead title="Audit des exports" description="Chain-of-custody SHA-256 des exports" path="/app/governance/exports" noindex />
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <FileDown className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            Audit des exports
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isAdmin ? "Tous les exports de la plateforme avec hash SHA-256 (chain-of-custody)." : "Vos exports avec hash de signature."}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Manifests d'export</CardTitle>
            <CardDescription>
              Chaque export PDF/CSV est tracé avec un SHA-256 du contenu et un motif déclaré (ADR-014).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!manifests?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun export tracé.</p>
            ) : (
              <ul className="space-y-2">
                {manifests.map((m) => {
                  const suspicious = (suspiciousByUser.get(m.user_id) ?? 0) > 5;
                  return (
                    <li key={m.id} className="rounded-md border p-3">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={formatBadge(m.export_format)}>{m.export_format.toUpperCase()}</Badge>
                          <span className="font-medium text-sm">{m.entity_type}</span>
                          <Badge variant="outline" className="text-xs">{m.row_count} lignes</Badge>
                          {suspicious && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" /> volume suspect
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(m.created_at), "dd/MM/yyyy HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Motif : {m.purpose}</p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-1 break-all">
                        SHA-256: {m.sha256}
                      </p>
                      {isAdmin && (
                        <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                          User: {m.user_id.slice(0, 8)}…
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
