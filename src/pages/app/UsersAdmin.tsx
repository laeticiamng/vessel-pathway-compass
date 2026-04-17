import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShieldAlert, Users, UserPlus, UserMinus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { FreezeAccountButton } from "@/components/governance/FreezeAccountButton";

type AppRole = "admin" | "physician" | "trainee" | "expert_reviewer" | "hospital_admin" | "research_lead" | "super_admin";

type UserRow = {
  user_id: string;
  display_name: string | null;
  role_app: AppRole | null;
  profile_role: string | null;
  last_activity_at: string | null;
  events_30d: number;
  patients_count: number;
  pending_signoffs: number;
};

const ROLES: AppRole[] = ["physician", "trainee", "expert_reviewer", "hospital_admin", "research_lead", "admin", "super_admin"];

export default function UsersAdmin() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [search, setSearch] = useState("");
  const [pendingRole, setPendingRole] = useState<Record<string, AppRole>>({});

  useEffect(() => {
    if (!user) { setChecking(false); return; }
    (async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const roles = (data ?? []).map((r) => r.role);
      setIsSuperAdmin(roles.includes("super_admin"));
      setIsAdmin(roles.includes("admin") || roles.includes("super_admin"));
      setChecking(false);
    })();
  }, [user]);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    enabled: !!user && isAdmin,
    queryFn: async (): Promise<UserRow[]> => {
      const { data, error } = await supabase.rpc("list_users_with_activity" as never);
      if (error) throw error;
      return (data as unknown as UserRow[]) ?? [];
    },
  });

  const assign = useMutation({
    mutationFn: async ({ targetId, role }: { targetId: string; role: AppRole }) => {
      const { error } = await supabase.rpc("assign_role" as never, { _target_user_id: targetId, _role: role } as never);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Rôle attribué"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const revoke = useMutation({
    mutationFn: async ({ targetId, role }: { targetId: string; role: AppRole }) => {
      const { error } = await supabase.rpc("revoke_role" as never, { _target_user_id: targetId, _role: role } as never);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Rôle révoqué"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (checking) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!isAdmin) {
    return (
      <Card className="max-w-2xl mx-auto mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-destructive" />Accès refusé</CardTitle>
          <CardDescription>Réservé aux administrateurs.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const filtered = (users ?? []).filter((u) =>
    !search || (u.display_name ?? "").toLowerCase().includes(search.toLowerCase()) || u.user_id.includes(search)
  );

  return (
    <>
      <SEOHead title="Gestion utilisateurs" description="Administration des rôles et activité" path="/app/admin/users" noindex />
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            Gestion des utilisateurs
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Activité, rôles et audit. {isSuperAdmin ? "Vous pouvez attribuer/révoquer des rôles." : "Lecture seule (super_admin requis pour modifier)."}
          </p>
        </div>

        <Input placeholder="Rechercher (nom ou UUID)…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />

        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((u) => (
              <Card key={u.user_id}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold">{u.display_name ?? "(sans nom)"}</p>
                      <p className="text-xs text-muted-foreground font-mono">{u.user_id.slice(0, 8)}…</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {u.role_app && <Badge variant="default">{u.role_app}</Badge>}
                      {u.profile_role && <Badge variant="outline">{u.profile_role}</Badge>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="rounded border p-2">
                      <p className="text-muted-foreground">Dernière activité</p>
                      <p className="font-medium">{u.last_activity_at ? formatDistanceToNow(new Date(u.last_activity_at), { addSuffix: true, locale: fr }) : "jamais"}</p>
                    </div>
                    <div className="rounded border p-2"><p className="text-muted-foreground">Événements 30j</p><p className="font-medium">{u.events_30d}</p></div>
                    <div className="rounded border p-2"><p className="text-muted-foreground">Patients</p><p className="font-medium">{u.patients_count}</p></div>
                    <div className="rounded border p-2"><p className="text-muted-foreground">Signoffs en attente</p><p className="font-medium">{u.pending_signoffs}</p></div>
                  </div>

                  {isSuperAdmin && (
                    <div className="flex items-center gap-2 flex-wrap pt-2 border-t">
                      <Select value={pendingRole[u.user_id] ?? ""} onValueChange={(v) => setPendingRole({ ...pendingRole, [u.user_id]: v as AppRole })}>
                        <SelectTrigger className="w-[180px] h-8"><SelectValue placeholder="Choisir un rôle…" /></SelectTrigger>
                        <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" disabled={!pendingRole[u.user_id] || assign.isPending}
                        onClick={() => assign.mutate({ targetId: u.user_id, role: pendingRole[u.user_id]! })}>
                        <UserPlus className="h-3 w-3 mr-1" />Attribuer
                      </Button>
                      <Button size="sm" variant="outline" disabled={!pendingRole[u.user_id] || revoke.isPending}
                        onClick={() => revoke.mutate({ targetId: u.user_id, role: pendingRole[u.user_id]! })}>
                        <UserMinus className="h-3 w-3 mr-1" />Révoquer
                      </Button>
                      {u.user_id !== user?.id && (
                        <FreezeAccountButton
                          targetUserId={u.user_id}
                          targetName={u.display_name ?? u.user_id.slice(0, 8)}
                          onFrozen={() => qc.invalidateQueries({ queryKey: ["admin-users"] })}
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Aucun utilisateur trouvé.</p>}
          </div>
        )}
      </div>
    </>
  );
}
