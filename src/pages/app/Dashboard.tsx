import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import PatientRiskDistribution from "@/components/dashboard/PatientRiskDistribution";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { AngiographicFunctionTrajectory } from "@/components/vasculink/AngiographicFunctionTrajectory";
import { ModalityPositioningMatrix } from "@/components/vasculink/ModalityPositioningMatrix";
import { ScientificSafetyBox } from "@/components/vasculink/ScientificSafetyBox";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { NeonKpi } from "@/components/neon/NeonKpi";
import { NeonModuleTile } from "@/components/neon/NeonModuleTile";
import { NeonPageHeader } from "@/components/neon/NeonPageHeader";
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
  Image,
  Calculator,
  BarChart3,
  Leaf,
  LayoutGrid,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async () => {
      const [casesRes, aiRes, outcomesRes, simRes, eduRes] = await Promise.all([
        supabase.from("cases").select("id, status", { count: "exact", head: false }).eq("created_by", user!.id),
        supabase.from("ai_outputs").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("outcomes").select("id", { count: "exact", head: true }).eq("created_by", user!.id),
        supabase.from("simulation_runs").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
        supabase.from("quiz_attempts").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      ]);

      const activeCases = casesRes.data?.filter((c) => c.status === "active").length ?? 0;
      const totalCases = casesRes.count ?? 0;

      return {
        activeCases,
        totalCases,
        aiReports: aiRes.count ?? 0,
        outcomes: outcomesRes.count ?? 0,
        simulations: simRes.count ?? 0,
        educationExplored: (eduRes.count ?? 0) > 0,
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

  // Fetch eco metrics summary
  const { data: ecoSummary } = useQuery({
    queryKey: ["dashboard-eco-summary", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("eco_metrics" as any)
        .select("gadolinium_avoided_mg, eco_impact_score")
        .eq("created_by", user!.id);
      if (error) throw error;
      const metrics = (data as any[]) ?? [];
      return {
        gadoliniumAvoided: Math.round(metrics.reduce((s: number, m: any) => s + Number(m.gadolinium_avoided_mg), 0)),
        ecoScore: metrics.length > 0
          ? Math.round(metrics.reduce((s: number, m: any) => s + Number(m.eco_impact_score), 0) / metrics.length)
          : 0,
      };
    },
    enabled: !!user,
  });

  const statCards = [
    { label: t("dashboard.stats.activeCases"), value: stats?.activeCases ?? 0, icon: HeartPulse, trend: `${stats?.totalCases ?? 0} ${t("dashboard.stats.total") ?? "total"}`, variant: "cyan" as const },
    { label: t("dashboard.stats.aiReports"), value: stats?.aiReports ?? 0, icon: Brain, trend: t("dashboard.stats.generated") as string, variant: "cyan" as const, unit: "/day" },
    { label: t("dashboard.stats.outcomes"), value: stats?.outcomes ?? 0, icon: LineChart, trend: t("dashboard.stats.registryEntries") as string, variant: "cyan" as const },
    { label: t("dashboard.stats.simulations"), value: stats?.simulations ?? 0, icon: LayoutGrid, trend: t("dashboard.stats.completed") as string, variant: "violet" as const },
  ];

  const quickActions = [
    { label: t("dashboard.quickActions.procedurePlanner"), icon: Brain, path: "/app/procedure-planner" },
    { label: t("dashboard.quickActions.fusionViewer"), icon: Image, path: "/app/fusion-viewer" },
    { label: t("dashboard.quickActions.ciAkiEngine"), icon: Calculator, path: "/app/ci-aki-engine" },
    { label: t("dashboard.quickActions.simulation"), icon: FlaskConical, path: "/app/simulation" },
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
    <div className="space-y-5 sm:space-y-8 max-w-7xl">
      <SEOHead
        title={t("seo.dashboard.title") as string}
        description={t("seo.dashboard.description") as string}
        path="/app"
        noindex
      />
      <NeonPageHeader
        title={t("dashboard.title") as string}
        subtitle={t("dashboard.welcome") as string}
      />

      {stats && <OnboardingChecklist stats={stats} />}

      {/* KPI grid — AquaMR Flow signature */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 stagger-in">
        {statCards.map((stat) => (
          <NeonKpi
            key={stat.label}
            label={stat.label as string}
            value={stat.value}
            unit={(stat as any).unit}
            icon={stat.icon}
            variant={stat.variant}
            trend={stat.trend as string}
            loading={statsLoading}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-in">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            asChild
            className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
          >
            <Link to={action.path}>
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <action.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>

      <AngiographicFunctionTrajectory />

      <ScientificSafetyBox />

      {/* Eco-Impact Summary */}
      <Card className="border-emerald-500/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.ecoImpact.title")}</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Leaf className="h-4 w-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-2xl font-bold tracking-tight">{ecoSummary?.gadoliniumAvoided ?? 0} mg</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("dashboard.ecoImpact.gadoliniumAvoided")}</p>
            </div>
            <div className="h-10 border-l" />
            <div>
              <p className="text-2xl font-bold tracking-tight">{ecoSummary?.ecoScore ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("dashboard.ecoImpact.ecoScore")}</p>
            </div>
          </div>
          <Link to="/app/registry" className="text-xs text-emerald-600 hover:underline mt-2 inline-flex items-center gap-1">
            {t("dashboard.ecoImpact.viewRegistry")}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
          <CardDescription>{t("dashboard.recentActivityDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
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
                    <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors duration-150">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{(t(`dashboard.activityLabels.${item.action}`) as string) || item.action.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.entity_type}{item.entity_id ? ` · ${item.entity_id.slice(0, 8)}` : ""}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{timeAgo(item.created_at)}</span>
                    </div>
                  );
                })
              : !activityLoading && (
                  <div className="text-center py-10">
                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                      <Activity className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm text-muted-foreground">{t("dashboard.noActivity")}</p>
                  </div>
                )}
          </div>
        </CardContent>
      </Card>

      <PatientRiskDistribution />

      <ModalityPositioningMatrix />

      {/* Hero module tiles — AquaMR Flow signature row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 stagger-in">
        <NeonModuleTile
          title={t("sidebar.procedurePlanner") as string}
          icon={Brain}
          to="/app/procedure-planner"
          variant="cyan"
        />
        <NeonModuleTile
          title={t("sidebar.digitalTwin") as string}
          icon={Activity}
          to="/app/digital-twin"
          variant="cyan"
        />
        <NeonModuleTile
          title={t("sidebar.registry") as string}
          icon={BarChart3}
          to="/app/registry"
          variant="cyan"
        />
        <NeonModuleTile
          title={t("sidebar.education") as string}
          icon={BookOpen}
          to="/app/education"
          variant="violet"
        />
      </div>

      {/* Secondary modules */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-in">
        {[
          { title: t("sidebar.fusionViewer"), desc: t("dashboard.moduleDesc.fusionViewer"), icon: Image, path: "/app/fusion-viewer" },
          { title: t("sidebar.ciAkiEngine"), desc: t("dashboard.moduleDesc.ciAkiEngine"), icon: Calculator, path: "/app/ci-aki-engine" },
          { title: t("sidebar.simulationLab"), desc: t("dashboard.moduleDesc.simulation"), icon: FlaskConical, path: "/app/simulation" },
          { title: t("sidebar.analytics"), desc: t("dashboard.moduleDesc.analytics"), icon: LineChart, path: "/app/analytics" },
          { title: t("sidebar.researchHub"), desc: t("dashboard.moduleDesc.research"), icon: FileText, path: "/app/research" },
        ].map((mod) => (
          <Link key={mod.title as string} to={mod.path}>
            <Card className="neon-card card-hover shine-hover cursor-pointer h-full group">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="neon-icon-ring shrink-0">
                  <mod.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div className="relative z-10 flex-1 min-w-0">
                  <CardTitle className="text-base">{mod.title}</CardTitle>
                  <CardDescription className="text-xs">{mod.desc}</CardDescription>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
