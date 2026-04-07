import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, Users, Mail, CheckCircle2, Loader2 } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const ROLES: AppRole[] = ["admin", "physician", "trainee", "expert_reviewer", "hospital_admin", "research_lead", "super_admin"];

export default function Admin() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if user is super_admin
  const { data: userRoles, isLoading: rolesLoading } = useQuery({
    queryKey: ["my-roles", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      if (error) throw error;
      return data.map((r) => r.role);
    },
    enabled: !!user,
  });

  const isSuperAdmin = userRoles?.includes("super_admin") || userRoles?.includes("admin");

  // Fetch all user_roles with profiles
  const { data: allRoles, isLoading: allRolesLoading } = useQuery({
    queryKey: ["admin-all-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
    enabled: isSuperAdmin === true,
  });

  // Fetch profiles
  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      return data;
    },
    enabled: isSuperAdmin === true,
  });

  // Fetch contact messages
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["admin-contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isSuperAdmin === true,
  });

  // Group roles by user_id
  const userRolesMap = new Map<string, AppRole[]>();
  for (const r of allRoles ?? []) {
    const arr = userRolesMap.get(r.user_id) ?? [];
    arr.push(r.role);
    userRolesMap.set(r.user_id, arr);
  }

  // Add role mutation
  const addRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-roles"] });
      toast.success("Role added");
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (rolesLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <SEOHead title="Admin Panel" description="Administration panel" path="/app/admin" noindex />
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
          {t("admin.title") || "Administration"}
        </h1>
        <p className="text-muted-foreground mt-1">{t("admin.subtitle") || "Manage users, roles, and messages"}</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users" className="gap-1.5"><Users className="h-3.5 w-3.5" /> {t("admin.tabs.users") || "Users & Roles"}</TabsTrigger>
          <TabsTrigger value="messages" className="gap-1.5"><Mail className="h-3.5 w-3.5" /> {t("admin.tabs.messages") || "Messages"} {(messages?.filter(m => !m.is_read).length ?? 0) > 0 && <Badge variant="destructive" className="ml-1 text-xs">{messages?.filter(m => !m.is_read).length}</Badge>}</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6 space-y-4">
          {allRolesLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : (
            (profiles ?? []).map((profile) => {
              const roles = userRolesMap.get(profile.user_id) ?? [];
              return (
                <Card key={profile.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{profile.display_name || "—"}</p>
                        <p className="text-sm text-muted-foreground">{profile.institution || "—"} · {profile.specialty || profile.role || "—"}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {roles.map((r) => (
                            <Badge key={r} variant="secondary" className="text-xs capitalize">{r.replace(/_/g, " ")}</Badge>
                          ))}
                          {roles.length === 0 && <Badge variant="outline" className="text-xs">No role</Badge>}
                        </div>
                      </div>
                      <Select onValueChange={(role) => addRole.mutate({ userId: profile.user_id, role: role as AppRole })}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Add role..." />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.filter(r => !roles.includes(r)).map((r) => (
                            <SelectItem key={r} value={r} className="capitalize">{r.replace(/_/g, " ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="messages" className="mt-6 space-y-4">
          {messagesLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
          ) : (messages?.length ?? 0) === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><Mail className="h-10 w-10 mx-auto mb-3 opacity-30" /><p>No messages yet</p></CardContent></Card>
          ) : (
            messages!.map((msg) => (
              <Card key={msg.id} className={msg.is_read ? "opacity-70" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{msg.name}</p>
                        <a href={`mailto:${msg.email}`} className="text-sm text-primary hover:underline">{msg.email}</a>
                        {!msg.is_read && <Badge variant="destructive" className="text-xs">New</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{msg.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{new Date(msg.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
