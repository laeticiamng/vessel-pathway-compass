import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  TrendingUp,
  Activity,
  HeartPulse,
  Clock,
  FileText,
  Brain,
  FlaskConical,
  Users,
  Stethoscope,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const CATEGORY_COLORS = [
  "hsl(200 70% 50%)",
  "hsl(0 70% 55%)",
  "hsl(150 60% 45%)",
  "hsl(38 92% 50%)",
  "hsl(270 60% 55%)",
  "hsl(180 50% 45%)",
];

export default function Analytics() {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Fetch all cases for category distribution
  const { data: cases, isLoading: casesLoading } = useQuery({
    queryKey: ["analytics-cases", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("id, category, status, created_at, updated_at")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch measurements for trend charts
  const { data: measurements, isLoading: measLoading } = useQuery({
    queryKey: ["analytics-measurements", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("measurements")
        .select("id, measurement_type, value, unit, site, measured_at, case_id")
        .order("measured_at", { ascending: true })
        .limit(500);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch recent activity (case events + audit logs)
  const { data: recentEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["analytics-events", user?.id],
    queryFn: async () => {
      const [eventsRes, auditRes] = await Promise.all([
        supabase
          .from("case_events")
          .select("id, title, event_type, event_date, case_id")
          .order("event_date", { ascending: false })
          .limit(10),
        supabase
          .from("audit_logs")
          .select("id, action, entity_type, created_at")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const events = (eventsRes.data ?? []).map((e) => ({
        id: e.id,
        title: e.title,
        type: e.event_type,
        date: e.event_date,
        source: "event" as const,
      }));

      const audits = (auditRes.data ?? []).map((a) => ({
        id: a.id,
        title: a.action,
        type: a.entity_type,
        date: a.created_at,
        source: "audit" as const,
      }));

      return [...events, ...audits]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 12);
    },
    enabled: !!user,
  });

  // Fetch summary stats
  const { data: stats } = useQuery({
    queryKey: ["analytics-stats", user?.id],
    queryFn: async () => {
      const [patientsRes, casesRes, measRes, aiRes] = await Promise.all([
        supabase.from("patients").select("id", { count: "exact", head: true }).is("deleted_at", null),
        supabase.from("cases").select("id", { count: "exact", head: true }),
        supabase.from("measurements").select("id", { count: "exact", head: true }),
        supabase.from("ai_outputs").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
      ]);
      return {
        patients: patientsRes.count ?? 0,
        cases: casesRes.count ?? 0,
        measurements: measRes.count ?? 0,
        aiReports: aiRes.count ?? 0,
      };
    },
    enabled: !!user,
  });

  // === Derived data ===

  // Category distribution for pie chart
  const categoryDistribution = (() => {
    if (!cases) return [];
    const counts: Record<string, number> = {};
    for (const c of cases) {
      const cat = (c.category || "other").toUpperCase();
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  // Measurement trends grouped by type, aggregated by month
  const measurementTrends = (() => {
    if (!measurements || measurements.length === 0) return [];
    const byMonth: Record<string, Record<string, { sum: number; count: number }>> = {};
    for (const m of measurements) {
      const month = m.measured_at.slice(0, 7); // YYYY-MM
      if (!byMonth[month]) byMonth[month] = {};
      if (!byMonth[month][m.measurement_type]) byMonth[month][m.measurement_type] = { sum: 0, count: 0 };
      byMonth[month][m.measurement_type].sum += m.value;
      byMonth[month][m.measurement_type].count += 1;
    }
    const types = [...new Set(measurements.map((m) => m.measurement_type))];
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => {
        const row: Record<string, string | number> = { month };
        for (const type of types) {
          row[type] = data[type] ? +(data[type].sum / data[type].count).toFixed(2) : 0;
        }
        return row;
      });
  })();

  const measurementTypes = measurements
    ? [...new Set(measurements.map((m) => m.measurement_type))]
    : [];

  // Cases over time (cumulative by month)
  const casesOverTime = (() => {
    if (!cases) return [];
    const byMonth: Record<string, number> = {};
    for (const c of cases) {
      const month = c.created_at.slice(0, 7);
      byMonth[month] = (byMonth[month] || 0) + 1;
    }
    let cumulative = 0;
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => {
        cumulative += count;
        return { month, count, cumulative };
      });
  })();

  // Status distribution for bar chart
  const statusDistribution = (() => {
    if (!cases) return [];
    const counts: Record<string, number> = {};
    for (const c of cases) {
      const status = c.status || "unknown";
      counts[status] = (counts[status] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  const TREND_COLORS = [
    "hsl(200 70% 50%)",
    "hsl(0 70% 55%)",
    "hsl(150 60% 45%)",
    "hsl(38 92% 50%)",
    "hsl(270 60% 55%)",
  ];

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }

  const eventIcons: Record<string, typeof Activity> = {
    assessment: Stethoscope,
    intervention: HeartPulse,
    follow_up: Clock,
    ai_output: Brain,
    simulation: FlaskConical,
    case: HeartPulse,
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          {t("analytics.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("analytics.subtitle")}</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t("analytics.kpi.patients"), value: stats?.patients ?? 0, icon: Users, color: "text-blue-500" },
          { label: t("analytics.kpi.cases"), value: stats?.cases ?? 0, icon: HeartPulse, color: "text-red-500" },
          { label: t("analytics.kpi.measurements"), value: stats?.measurements ?? 0, icon: Activity, color: "text-green-500" },
          { label: t("analytics.kpi.aiReports"), value: stats?.aiReports ?? 0, icon: Brain, color: "text-purple-500" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-3xl font-bold mt-1">{kpi.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-xl bg-muted flex items-center justify-center ${kpi.color}`}>
                  <kpi.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Measurement Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t("analytics.measurementTrends")}
            </CardTitle>
            <CardDescription>{t("analytics.measurementTrendsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {measLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : measurementTrends.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>{t("analytics.noMeasurements")}</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={measurementTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                  />
                  <Legend />
                  {measurementTypes.map((type, i) => (
                    <Line
                      key={type}
                      type="monotone"
                      dataKey={type}
                      stroke={TREND_COLORS[i % TREND_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name={type.replace(/_/g, " ")}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Case Category Distribution (Pie) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-primary" />
              {t("analytics.caseDistribution")}
            </CardTitle>
            <CardDescription>{t("analytics.caseDistributionDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {casesLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : categoryDistribution.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>{t("analytics.noCases")}</p>
              </div>
            ) : (
              <div>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryDistribution.map((_, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--popover-foreground))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-2 justify-center">
                  {categoryDistribution.map((cat, i) => (
                    <Badge
                      key={cat.name}
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                    >
                      <div
                        className="h-2 w-2 rounded-full mr-1"
                        style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                      />
                      {cat.name}: {cat.value}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cases Over Time (Area) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t("analytics.casesOverTime")}
            </CardTitle>
            <CardDescription>{t("analytics.casesOverTimeDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {casesLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : casesOverTime.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>{t("analytics.noCases")}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={casesOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="hsl(200 70% 50%)"
                    fill="hsl(200 70% 50% / 0.15)"
                    strokeWidth={2}
                    name={t("analytics.cumulative")}
                  />
                  <Bar dataKey="count" fill="hsl(200 70% 50% / 0.4)" name={t("analytics.newCases")} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Case Status (Bar) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              {t("analytics.statusBreakdown")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {casesLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : statusDistribution.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <p>{t("analytics.noCases")}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={statusDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--popover-foreground))",
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name={t("analytics.cases")} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {t("analytics.recentActivity")}
            </CardTitle>
            <CardDescription>{t("analytics.recentActivityDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !recentEvents || recentEvents.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>{t("analytics.noActivity")}</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[340px] overflow-y-auto">
                {recentEvents.map((item) => {
                  const Icon = eventIcons[item.type] ?? FileText;
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{item.type.replace(/_/g, " ")}</p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {timeAgo(item.date)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
