import { useTranslation } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";

export default function VascScreenAnalytics() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["vascscreen-analytics", user?.id],
    queryFn: async () => {
      const { data: patients, error } = await supabase
        .from("vascscreen_patients" as any)
        .select("*")
        .eq("created_by", user!.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      const all = (patients || []) as any[];

      // Age distribution
      const ageBuckets: Record<string, number> = {
        "< 50": 0, "50-59": 0, "60-69": 0, "70-79": 0, "80+": 0,
      };
      all.forEach((p: any) => {
        if (p.age < 50) ageBuckets["< 50"]++;
        else if (p.age < 60) ageBuckets["50-59"]++;
        else if (p.age < 70) ageBuckets["60-69"]++;
        else if (p.age < 80) ageBuckets["70-79"]++;
        else ageBuckets["80+"]++;
      });

      // Gender distribution
      const genderCounts = { male: 0, female: 0, other: 0 };
      all.forEach((p: any) => {
        if (p.sex in genderCounts) (genderCounts as any)[p.sex]++;
      });

      // Weekly screening volume (last 12 weeks)
      const now = new Date();
      const weeklyData: { week: string; screened: number; padDetected: number }[] = [];
      for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (i * 7 + now.getDay()));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        const label = `W${Math.ceil((weekStart.getDate() + weekStart.getDay()) / 7)}`;

        const weekPatients = all.filter((p: any) => {
          const cd = new Date(p.created_at);
          return cd >= weekStart && cd < weekEnd;
        });

        weeklyData.push({
          week: label,
          screened: weekPatients.filter((p: any) => p.abi_right || p.abi_left).length,
          padDetected: weekPatients.filter((p: any) =>
            p.abi_interpretation && !["normal", "borderline"].includes(p.abi_interpretation)
          ).length,
        });
      }

      // Key metrics for summary
      const totalScreened = all.filter((p: any) => p.abi_right || p.abi_left).length;
      const totalPAD = all.filter((p: any) =>
        p.abi_interpretation && !["normal", "borderline"].includes(p.abi_interpretation)
      ).length;
      const screeningRate = all.length > 0
        ? (totalScreened / all.filter((p: any) => p.screening_eligible).length) * 100
        : 0;
      const detectionRate = totalScreened > 0 ? (totalPAD / totalScreened) * 100 : 0;

      return {
        total: all.length,
        totalScreened,
        totalPAD,
        screeningRate: isNaN(screeningRate) ? 0 : screeningRate,
        detectionRate,
        ageData: Object.entries(ageBuckets).map(([name, value]) => ({ name, value })),
        genderCounts,
        weeklyData,
      };
    },
    enabled: !!user,
  });

  const TrendIcon = ({ value }: { value: number }) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <SEOHead
        title={t("vascscreen.analytics")}
        description={t("vascscreen.subtitle")}
        path="/app/vascscreen/analytics"
        noindex
      />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/vascscreen")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{t("vascscreen.analytics")}</h1>
          <p className="text-sm text-muted-foreground">{t("vascscreen.subtitle")}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : analytics ? (
        <>
          {/* Summary cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{t("vascscreen.stats.totalAssessed")}</p>
                <p className="text-2xl font-bold">{analytics.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{t("vascscreen.stats.screeningRate")}</p>
                <p className="text-2xl font-bold">{analytics.screeningRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{t("vascscreen.stats.padDetected")}</p>
                <p className="text-2xl font-bold">{analytics.totalPAD}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Detection Rate</p>
                <p className="text-2xl font-bold">{analytics.detectionRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Weekly trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t("vascscreen.stats.screeningOverTime")}</CardTitle>
                <CardDescription>Last 12 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="screened" stroke="hsl(var(--primary))" strokeWidth={2} name="Screened" />
                      <Line type="monotone" dataKey="padDetected" stroke="#ef4444" strokeWidth={2} name="PAD Detected" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Age distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Age Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.ageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gender breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 justify-center">
                  {Object.entries(analytics.genderCounts).map(([gender, count]) => (
                    <div key={gender} className="text-center p-4 bg-muted/50 rounded-lg min-w-[80px]">
                      <p className="text-2xl font-bold">{count as number}</p>
                      <p className="text-xs text-muted-foreground capitalize">{gender}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}

      <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-4 border-t">
        <BookOpen className="h-3.5 w-3.5" />
        <span>{t("vascscreen.guidelineReference")}</span>
      </div>
    </div>
  );
}
