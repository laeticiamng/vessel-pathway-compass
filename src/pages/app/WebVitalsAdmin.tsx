import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SEOHead } from "@/components/SEOHead";
import { WCAGBadge, type WCAGStats } from "@/components/a11y/WCAGBadge";
import { Activity, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

type Vital = {
  id: number;
  created_at: string;
  metric: "LCP" | "CLS" | "INP" | "FCP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  path: string;
};

// Google Web Vitals thresholds (good / needs-improvement)
const THRESHOLDS: Record<Vital["metric"], { good: number; poor: number; unit: string; label: string }> = {
  LCP: { good: 2500, poor: 4000, unit: "ms", label: "Largest Contentful Paint" },
  INP: { good: 200, poor: 500, unit: "ms", label: "Interaction to Next Paint" },
  CLS: { good: 0.1, poor: 0.25, unit: "", label: "Cumulative Layout Shift" },
  FCP: { good: 1800, poor: 3000, unit: "ms", label: "First Contentful Paint" },
  TTFB: { good: 800, poor: 1800, unit: "ms", label: "Time to First Byte" },
};

const METRIC_ORDER: Vital["metric"][] = ["LCP", "INP", "CLS", "FCP", "TTFB"];
// Regression alert: p75 worse by >20% vs previous 7-day window
const REGRESSION_THRESHOLD_PCT = 20;

const percentile = (arr: number[], p: number): number => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
};

const fmt = (metric: Vital["metric"], v: number) =>
  metric === "CLS" ? v.toFixed(3) : `${Math.round(v)} ${THRESHOLDS[metric].unit}`;

const ratingFor = (metric: Vital["metric"], v: number): Vital["rating"] => {
  const t = THRESHOLDS[metric];
  if (v <= t.good) return "good";
  if (v <= t.poor) return "needs-improvement";
  return "poor";
};

const ratingColor: Record<Vital["rating"], string> = {
  good: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  "needs-improvement": "bg-amber-500/10 text-amber-600 border-amber-500/30",
  poor: "bg-red-500/10 text-red-600 border-red-500/30",
};

export default function WebVitalsAdmin() {
  const { user } = useAuth();

  const { data: roles } = useQuery({
    queryKey: ["my-roles", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      if (error) throw error;
      return data.map((r) => r.role);
    },
    enabled: !!user,
  });

  const isAdmin = roles?.includes("admin") || roles?.includes("super_admin");

  const { data, isLoading } = useQuery({
    queryKey: ["web-vitals-14d"],
    enabled: !!isAdmin,
    refetchInterval: 60_000,
    queryFn: async () => {
      const since = new Date(Date.now() - 14 * 24 * 3600_000).toISOString();
      const { data, error } = await supabase
        .from("web_vitals")
        .select("id, created_at, metric, value, rating, path")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(10000);
      if (error) throw error;
      return data as Vital[];
    },
  });

  const analysis = useMemo(() => {
    if (!data) return null;
    const now = Date.now();
    const week = 7 * 24 * 3600_000;

    return METRIC_ORDER.map((metric) => {
      const all = data.filter((d) => d.metric === metric);
      const current = all.filter((d) => now - new Date(d.created_at).getTime() <= week);
      const previous = all.filter((d) => {
        const age = now - new Date(d.created_at).getTime();
        return age > week && age <= 2 * week;
      });

      const p75Current = percentile(current.map((d) => d.value), 75);
      const p75Previous = percentile(previous.map((d) => d.value), 75);
      const delta = p75Previous > 0 ? ((p75Current - p75Previous) / p75Previous) * 100 : 0;
      const regressed = p75Previous > 0 && delta > REGRESSION_THRESHOLD_PCT;
      const improved = p75Previous > 0 && delta < -REGRESSION_THRESHOLD_PCT;
      const rating = current.length > 0 ? ratingFor(metric, p75Current) : null;
      const poorPct = current.length > 0
        ? (current.filter((d) => d.rating === "poor").length / current.length) * 100
        : 0;

      return { metric, sampleCount: current.length, p75Current, p75Previous, delta, regressed, improved, rating, poorPct };
    });
  }, [data]);

  const trendData = useMemo(() => {
    if (!data) return [];
    const days = 14;
    const buckets: Record<string, { date: string; LCP: number[]; INP: number[]; CLS: number[]; FCP: number[]; TTFB: number[] }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 3600_000);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { date: key.slice(5), LCP: [], INP: [], CLS: [], FCP: [], TTFB: [] };
    }
    for (const v of data) {
      const key = v.created_at.slice(0, 10);
      const b = buckets[key];
      if (b) b[v.metric].push(v.value);
    }
    return Object.values(buckets).map((b) => ({
      date: b.date,
      LCP: percentile(b.LCP, 75) || null,
      INP: percentile(b.INP, 75) || null,
      CLS: percentile(b.CLS, 75) || null,
      FCP: percentile(b.FCP, 75) || null,
      TTFB: percentile(b.TTFB, 75) || null,
    }));
  }, [data]);

  if (!user) return <Navigate to="/auth" replace />;
  if (roles && !isAdmin) return <Navigate to="/app" replace />;

  const regressions = analysis?.filter((a) => a.regressed) ?? [];

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      <SEOHead title="Web Vitals Monitoring" description="Real-user performance monitoring (LCP, CLS, INP)" path="/app/admin/web-vitals" noindex />

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Web Vitals — Real User Monitoring
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            p75 over the last 7 days vs the previous 7 days. Regression alert at &gt;{REGRESSION_THRESHOLD_PCT}%.
          </p>
        </div>
        {wcag && <WCAGBadge light={wcag.light} dark={wcag.dark} variant="compact" />}
      </div>

      {wcag && (
        <WCAGBadge light={wcag.light} dark={wcag.dark} variant="full" />
      )}

      {regressions.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Performance regression detected</AlertTitle>
          <AlertDescription>
            {regressions.map((r) => (
              <div key={r.metric}>
                <strong>{r.metric}</strong> p75 is {r.delta.toFixed(0)}% worse than the previous 7 days
                ({fmt(r.metric, r.p75Previous)} → {fmt(r.metric, r.p75Current)}).
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {analysis && analysis.every((a) => a.sampleCount === 0) && (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertTitle>No data yet</AlertTitle>
          <AlertDescription>
            Measurements are collected automatically when visitors load the production site
            (lovable.app or aquamr-flow.com). The first samples will appear within minutes of real traffic.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading || !analysis
          ? METRIC_ORDER.map((m) => <Skeleton key={m} className="h-32" />)
          : analysis.map((a) => (
              <Card key={a.metric} className={a.regressed ? "border-red-500/50" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{a.metric}</CardTitle>
                    {a.rating && <Badge variant="outline" className={ratingColor[a.rating]}>{a.rating}</Badge>}
                  </div>
                  <CardDescription className="text-xs">{THRESHOLDS[a.metric].label}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold tabular-nums">
                    {a.sampleCount > 0 ? fmt(a.metric, a.p75Current) : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    p75 · {a.sampleCount.toLocaleString()} samples
                  </div>
                  {a.p75Previous > 0 && (
                    <div className={`text-xs mt-2 flex items-center gap-1 ${
                      a.regressed ? "text-red-600" : a.improved ? "text-emerald-600" : "text-muted-foreground"
                    }`}>
                      {a.regressed ? <TrendingUp className="h-3 w-3" /> :
                       a.improved ? <TrendingDown className="h-3 w-3" /> :
                       <CheckCircle2 className="h-3 w-3" />}
                      {a.delta > 0 ? "+" : ""}{a.delta.toFixed(1)}% vs prev. 7d
                    </div>
                  )}
                  {a.poorPct > 10 && (
                    <div className="text-xs text-red-600 mt-1">
                      {a.poorPct.toFixed(0)}% poor
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>14-day trend (p75)</CardTitle>
          <CardDescription>Daily p75 per metric. Lower is better (CLS uses its own scale).</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis yAxisId="ms" fontSize={11} label={{ value: "ms", angle: -90, position: "insideLeft", fontSize: 11 }} />
                <YAxis yAxisId="cls" orientation="right" fontSize={11} label={{ value: "CLS", angle: 90, position: "insideRight", fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line yAxisId="ms" type="monotone" dataKey="LCP" stroke="hsl(var(--primary))" connectNulls dot={false} />
                <Line yAxisId="ms" type="monotone" dataKey="INP" stroke="#f59e0b" connectNulls dot={false} />
                <Line yAxisId="ms" type="monotone" dataKey="FCP" stroke="#10b981" connectNulls dot={false} />
                <Line yAxisId="ms" type="monotone" dataKey="TTFB" stroke="#6366f1" connectNulls dot={false} />
                <Line yAxisId="cls" type="monotone" dataKey="CLS" stroke="#ec4899" connectNulls dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Worst-performing pages (last 7 days)</CardTitle>
          <CardDescription>Pages with the highest LCP p75 and at least 5 samples.</CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            if (!data) return <Skeleton className="h-20" />;
            const week = Date.now() - 7 * 24 * 3600_000;
            const lcpByPath: Record<string, number[]> = {};
            for (const v of data) {
              if (v.metric !== "LCP") continue;
              if (new Date(v.created_at).getTime() < week) continue;
              (lcpByPath[v.path] ||= []).push(v.value);
            }
            const rows = Object.entries(lcpByPath)
              .filter(([, vals]) => vals.length >= 5)
              .map(([path, vals]) => ({ path, p75: percentile(vals, 75), n: vals.length }))
              .sort((a, b) => b.p75 - a.p75)
              .slice(0, 10);
            if (rows.length === 0) {
              return <p className="text-sm text-muted-foreground">Not enough samples yet.</p>;
            }
            return (
              <div className="space-y-1.5">
                {rows.map((r) => (
                  <div key={r.path} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                    <code className="text-xs">{r.path}</code>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={ratingColor[ratingFor("LCP", r.p75)]}>
                        {fmt("LCP", r.p75)}
                      </Badge>
                      <span className="text-xs text-muted-foreground tabular-nums w-16 text-right">{r.n} samples</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
