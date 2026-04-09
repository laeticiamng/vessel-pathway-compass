import { useTranslation } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScreeningStats } from "@/components/vascscreen/ScreeningStats";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const SEVERITY_COLORS = ["#22c55e", "#eab308", "#f97316", "#ef4444", "#991b1b", "#fb923c"];

export default function VascScreenDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["vascscreen-dashboard-stats", user?.id],
    queryFn: async () => {
      const { data: patients, error } = await supabase
        .from("vascscreen_patients" as any)
        .select("*")
        .eq("created_by", user!.id);

      if (error) throw error;
      const all = (patients || []) as any[];

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());

      const thisMonth = all.filter((p: any) => new Date(p.created_at) >= startOfMonth).length;
      const thisWeek = all.filter((p: any) => new Date(p.created_at) >= startOfWeek).length;
      const eligible = all.filter((p: any) => p.screening_eligible).length;
      const screened = all.filter((p: any) => p.abi_right || p.abi_left).length;
      const padDetected = all.filter((p: any) =>
        p.abi_interpretation && !["normal", "borderline"].includes(p.abi_interpretation)
      ).length;
      const referred = all.filter((p: any) => p.referred_to_angiologist).length;

      const referralDays = all
        .filter((p: any) => p.time_to_diagnosis_days != null)
        .map((p: any) => p.time_to_diagnosis_days);
      const meanReferralDays = referralDays.length > 0
        ? referralDays.reduce((a: number, b: number) => a + b, 0) / referralDays.length
        : 0;

      // Severity distribution
      const severityCounts: Record<string, number> = {
        normal: 0, borderline: 0, mild_pad: 0, moderate_pad: 0, severe_pad: 0, non_compressible: 0,
      };
      all.forEach((p: any) => {
        if (p.abi_interpretation && severityCounts[p.abi_interpretation] !== undefined) {
          severityCounts[p.abi_interpretation]++;
        }
      });

      // Risk factor distribution
      const rfCounts: Record<string, number> = {};
      all.forEach((p: any) => {
        if (p.smoking_status === "current") rfCounts["Smoking (active)"] = (rfCounts["Smoking (active)"] || 0) + 1;
        if (p.diabetes) rfCounts["Diabetes"] = (rfCounts["Diabetes"] || 0) + 1;
        if (p.hypertension) rfCounts["Hypertension"] = (rfCounts["Hypertension"] || 0) + 1;
        if (p.dyslipidemia) rfCounts["Dyslipidemia"] = (rfCounts["Dyslipidemia"] || 0) + 1;
        if (p.known_cvd) rfCounts["Known CVD"] = (rfCounts["Known CVD"] || 0) + 1;
        if (p.ckd) rfCounts["CKD"] = (rfCounts["CKD"] || 0) + 1;
      });

      // Monthly trend (last 6 months)
      const monthlyData: { month: string; count: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString("en", { month: "short", year: "2-digit" });
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        const count = all.filter((p: any) => {
          const cd = new Date(p.created_at);
          return cd >= d && cd <= end;
        }).length;
        monthlyData.push({ month: label, count });
      }

      return {
        total: all.length,
        thisMonth,
        thisWeek,
        eligible,
        screened,
        padDetected,
        referred,
        meanReferralDays,
        severityData: Object.entries(severityCounts)
          .filter(([, v]) => v > 0)
          .map(([name, value]) => ({ name, value })),
        riskFactorData: Object.entries(rfCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 6)
          .map(([name, value]) => ({ name, value })),
        monthlyData,
      };
    },
    enabled: !!user,
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <SEOHead
        title={t("vascscreen.dashboard")}
        description={t("vascscreen.subtitle")}
        path="/app/vascscreen/dashboard"
        noindex
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/app/vascscreen")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{t("vascscreen.dashboard")}</h1>
            <p className="text-sm text-muted-foreground">{t("vascscreen.subtitle")}</p>
          </div>
        </div>
        <Link to="/app/vascscreen/patient-entry">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            {t("vascscreen.newPatient")}
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : stats ? (
        <>
          <ScreeningStats
            totalAssessed={stats.total}
            thisMonth={stats.thisMonth}
            thisWeek={stats.thisWeek}
            eligiblePatients={stats.eligible}
            patientsScreened={stats.screened}
            padDetected={stats.padDetected}
            referralsMade={stats.referred}
            meanTimeToReferral={stats.meanReferralDays}
          />

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Monthly trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("vascscreen.stats.screeningOverTime")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Severity distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("vascscreen.stats.bySeverity")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {stats.severityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.severityData}>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value">
                          {stats.severityData.map((_: any, i: number) => (
                            <Cell key={i} fill={SEVERITY_COLORS[i % SEVERITY_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      No ABI data yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Risk factors pie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("vascscreen.stats.topRiskFactors")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {stats.riskFactorData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.riskFactorData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, value }: any) => `${name}: ${value}`}
                        >
                          {stats.riskFactorData.map((_: any, i: number) => (
                            <Cell key={i} fill={SEVERITY_COLORS[i % SEVERITY_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      No data yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}

      {/* ESC 2024 reference footer */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-4 border-t">
        <BookOpen className="h-3.5 w-3.5" />
        <span>{t("vascscreen.guidelineReference")}</span>
      </div>
    </div>
  );
}
