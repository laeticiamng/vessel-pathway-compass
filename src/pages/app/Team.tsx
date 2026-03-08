import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Loader2, Settings, Info } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function Team() {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Get user's institution memberships, then fetch all members of those institutions
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["team-members", user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Get user's institutions
      const { data: myMemberships, error: mErr } = await supabase
        .from("memberships")
        .select("institution_id")
        .eq("user_id", user.id);
      if (mErr) throw mErr;
      if (!myMemberships?.length) return [];

      const instIds = myMemberships.map((m) => m.institution_id);

      // Get all members of those institutions
      const { data: allMemberships, error: aErr } = await supabase
        .from("memberships")
        .select("user_id, role, institution_id")
        .in("institution_id", instIds);
      if (aErr) throw aErr;
      if (!allMemberships?.length) return [];

      // Get profiles for those users
      const userIds = [...new Set(allMemberships.map((m) => m.user_id))];
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("user_id, display_name, role, institution")
        .in("user_id", userIds);
      if (pErr) throw pErr;

      const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));

      return allMemberships.map((m) => {
        const p = profileMap.get(m.user_id);
        return {
          user_id: m.user_id,
          display_name: p?.display_name ?? "—",
          role: m.role || p?.role || "member",
          institution: p?.institution ?? "",
        };
      });
    },
    enabled: !!user,
  });

  const { data: myProfile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // If no institution memberships, show empty state with guidance
  const hasInstitution = members.length > 0;
  const displayMembers = hasInstitution ? members : myProfile ? [{
    user_id: user?.id ?? "",
    display_name: myProfile.display_name ?? user?.email ?? "—",
    role: myProfile.role ?? "physician",
    institution: myProfile.institution ?? "",
  }] : [];

  return (
    <div className="space-y-6 max-w-4xl">
      <SEOHead title={t("seo.team.title") as string} description={t("seo.team.description") as string} path="/app/team" noindex />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            {t("team.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("team.subtitle")}</p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          {t("team.inviteMember")}
          <Badge variant="secondary" className="ml-2 text-xs">{t("common.comingSoon")}</Badge>
        </Button>
      </div>

      {!hasInstitution && (
        <Card className="border-dashed border-primary/20 bg-primary/5">
          <CardContent className="py-8 flex flex-col items-center text-center gap-3">
            <Info className="h-8 w-8 text-primary" />
            <p className="text-sm text-muted-foreground max-w-md">{t("team.emptyState")}</p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/app/settings">
                <Settings className="h-4 w-4 mr-2" />
                {t("sidebar.settings")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("team.columns.name")}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("team.columns.role")}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("team.columns.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {displayMembers.map((m, i) => (
                    <tr key={m.user_id + i} className="border-b last:border-0">
                      <td className="p-4 font-medium">{m.display_name}</td>
                      <td className="p-4"><Badge variant="secondary">{m.role}</Badge></td>
                      <td className="p-4">
                        <Badge variant="default">{t("team.statuses.active")}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
