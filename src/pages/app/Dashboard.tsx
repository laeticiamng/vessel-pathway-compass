import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PatientRiskDistribution from "@/components/dashboard/PatientRiskDistribution";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import {
  Brain,
  Activity,
  LineChart,
  BookOpen,
  FlaskConical,
  Globe,
  HeartPulse,
  Users,
  TrendingUp,
  FileText,
  ArrowRight,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      const [casesRes, aiRes, outcomesRes, simRes] = await Promise.all([
        supabase.from("cases").select("id, status", { count: "exact", head: false }).eq("created_by", user!.id),
        supabase.from("ai_outputs").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("outcomes").select("id", { count: "exact", head: true }).eq("created_by", user!.id),
        supabase.from("simulation_runs").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      ]);

      const activeCases = casesRes.data?.filter((c) => c.status === "active").length ?? 0;
      const totalCases = casesRes.count ?? 0;

      return {
        activeCases,
        totalCases,
        aiReports: aiRes.count ?? 0,
        outcomes: outcomesRes.count ?? 0,
        simulations: simRes.count ?? 0,
      };
    },
    enabled: !!user,
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ["dashboard-activity", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const statCards = [
    { label: t("dashboard.stats.activeCases"), value: stats?.activeCases ?? 0, icon: HeartPulse, trend: `${stats?.totalCases ?? 0} total` },
    { label: t("dashboard.stats.aiReports"), value: stats?.aiReports ?? 0, icon: Brain, trend: t("dashboard.stats.aiReports") },
    { label: t("dashboard.stats.outcomes"), value: stats?.outcomes ?? 0, icon: LineChart, trend: t("dashboard.stats.registryEntries") },
    { label: t("dashboard.stats.simulations"), value: stats?.simulations ?? 0, icon: FlaskConical, trend: t("dashboard.stats.completed") },
  ];

  const quickActions = [
    { label: t("dashboard.quickActions.newCase"), icon: HeartPulse, path: "/app/patients" },
    { label: t("dashboard.quickActions.aiAssistant"), icon: Brain, path: "/app/ai-assistant" },
    { label: t("dashboard.quickActions.simulation"), icon: FlaskConical, path: "/app/simulation" },
    { label: t("dashboard.quickActions.education"), icon: BookOpen, path: "/app/education" },
  ];

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return (t("timeAgo.minutesAgo") as string).replace("{{count}}", String(mins));
    const hours = Math.floor(mins / 60);
    if (hours < 24) return (t("timeAgo.hoursAgo") as string).replace("{{count}}", String(hours));
    const days = Math.floor(hours / 24);
    return (t("timeAgo.daysAgo") as string).replace("{{count}}", String(days));
  }

  const activityIcon: Record<string, typeof Brain> = {
    ai_output: Brain,
    simulation: FlaskConical,
    case: HeartPulse,
    outcome: LineChart,
    forum: Globe,
  };

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("dashboard.welcome")}</p>
      </div>

      {/* Onboarding Checklist for new users */}
      {stats && <OnboardingChecklist stats={stats} />}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            asChild
            className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary/50"
          >
            <Link to={action.path}>
              <action.icon className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold">{stat.value}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-success" />
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
          <CardDescription>{t("dashboard.recentActivityDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
              ))}
            {!activityLoading && recentActivity && recentActivity.length > 0
              ? recentActivity.map((item) => {
                  const Icon = activityIcon[item.entity_type] ?? FileText;
                  return (
                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.action}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.entity_type}{item.entity_id ? ` · ${item.entity_id.slice(0, 8)}` : ""}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{timeAgo(item.created_at)}</span>
                    </div>
                  );
                })
              : !activityLoading && (
                  <div className="text-center py-8">
                    <Activity className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">{t("dashboard.noActivity")}</p>
                  </div>
                )}
          </div>
        </CardContent>
      </Card>

      {/* Patient Risk Distribution */}
      <PatientRiskDistribution />

      {/* Module Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: t("sidebar.aiAssistant"), desc: t("dashboard.moduleDesc.ai"), icon: Brain, path: "/app/ai-assistant" },
          { title: t("sidebar.digitalTwin"), desc: t("dashboard.moduleDesc.twin"), icon: Activity, path: "/app/digital-twin" },
          { title: t("sidebar.registry"), desc: t("dashboard.moduleDesc.registry"), icon: LineChart, path: "/app/registry" },
          { title: t("sidebar.education"), desc: t("dashboard.moduleDesc.education"), icon: BookOpen, path: "/app/education" },
          { title: t("sidebar.simulationLab"), desc: t("dashboard.moduleDesc.simulation"), icon: FlaskConical, path: "/app/simulation" },
          { title: t("sidebar.researchHub"), desc: t("dashboard.moduleDesc.research"), icon: FileText, path: "/app/research" },
        ].map((mod) => (
          <Link key={mod.title} to={mod.path}>
            <Card className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <mod.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{mod.title}</CardTitle>
                  <CardDescription className="text-xs">{mod.desc}</CardDescription>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
