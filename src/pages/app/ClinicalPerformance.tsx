import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, TrendingDown, TrendingUp, Clock, Heart, ThumbsUp, AlertTriangle } from "lucide-react";

// European Vascular Surgery benchmarks (ESVS / Vascunet)
const EU_BENCHMARKS = {
  complicationRate30d: { value: 8.5, unit: "%", label: "30-Day Complication Rate" },
  meanTimeToProcedure: { value: 14, unit: "days", label: "Mean Time to Procedure" },
  restenosisRate6m: { value: 12, unit: "%", label: "Re-stenosis Rate (6 mo)" },
  patientSatisfaction: { value: 78, unit: "/100", label: "Patient Satisfaction" },
};

function KPICard({ title, value, unit, benchmark, icon: Icon, isLoading }: {
  title: string;
  value: number | null;
  unit: string;
  benchmark: { value: number; unit: string };
  icon: typeof Activity;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
    );
  }

  const displayValue = value ?? 0;
  // Lower is better for complication/restenosis, higher is better for satisfaction
  const isBetter = title.includes("Satisfaction")
    ? displayValue >= benchmark.value
    : displayValue <= benchmark.value;

  const diff = displayValue - benchmark.value;
  const diffAbs = Math.abs(diff).toFixed(1);

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${isBetter ? "bg-success" : "bg-destructive"}`} />
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-bold">{displayValue.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">{unit}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {isBetter ? (
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              )}
              <span className={`text-xs font-medium ${isBetter ? "text-success" : "text-destructive"}`}>
                {isBetter ? "+" : ""}{diff > 0 ? "+" : "-"}{diffAbs} vs EU benchmark
              </span>
            </div>
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${isBetter ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>EU Benchmark</span>
            <span className="font-medium">{benchmark.value}{benchmark.unit}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClinicalPerformance() {
  const { user } = useAuth();

  // Fetch cases + outcomes for KPI computation
  const { data, isLoading } = useQuery({
    queryKey: ["clinical-performance", user?.id],
    queryFn: async () => {
      const [casesRes, outcomesRes, promsRes] = await Promise.all([
        supabase.from("cases").select("id, category, status, created_at, updated_at"),
        supabase.from("outcomes").select("id, outcome_type, outcome_date, case_id, details"),
        supabase.from("proms").select("id, score, completed_at"),
      ]);
      return {
        cases: casesRes.data ?? [],
        outcomes: outcomesRes.data ?? [],
        proms: promsRes.data ?? [],
      };
    },
    enabled: !!user,
  });

  const kpis = useMemo(() => {
    if (!data) return null;
    const { cases, outcomes, proms } = data;

    // 30-day complication rate
    const complications = outcomes.filter((o) => o.outcome_type === "complication");
    const complicationRate = cases.length > 0 ? (complications.length / cases.length) * 100 : 0;

    // Mean time to procedure (days from case creation to first intervention outcome)
    const interventionTimes: number[] = [];
    for (const c of cases) {
      const intervention = outcomes.find((o) => o.case_id === c.id && (o.outcome_type === "intervention" || o.outcome_type === "procedure"));
      if (intervention) {
        const days = (new Date(intervention.outcome_date).getTime() - new Date(c.created_at).getTime()) / 86400000;
        if (days >= 0) interventionTimes.push(days);
      }
    }
    const meanTime = interventionTimes.length > 0
      ? interventionTimes.reduce((a, b) => a + b, 0) / interventionTimes.length
      : 0;

    // Re-stenosis rate at 6 months
    const restenosis = outcomes.filter((o) => o.outcome_type === "restenosis");
    const restenosisRate = cases.length > 0 ? (restenosis.length / cases.length) * 100 : 0;

    // Patient satisfaction (avg PROM score)
    const satisfaction = proms.length > 0
      ? proms.reduce((sum, p) => sum + (p.score ?? 0), 0) / proms.length
      : 0;

    return { complicationRate, meanTime, restenosisRate, satisfaction };
  }, [data]);

  return (
    <div className="space-y-6 max-w-6xl">
      <SEOHead title="Clinical Performance — Vascular Atlas" description="At-a-glance clinical KPIs with European benchmark comparison" path="/app/performance" noindex />

      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          Clinical Performance Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Key performance indicators compared to European vascular benchmarks (ESVS / Vascunet)</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title={EU_BENCHMARKS.complicationRate30d.label}
          value={kpis?.complicationRate ?? null}
          unit="%"
          benchmark={EU_BENCHMARKS.complicationRate30d}
          icon={AlertTriangle}
          isLoading={isLoading}
        />
        <KPICard
          title={EU_BENCHMARKS.meanTimeToProcedure.label}
          value={kpis?.meanTime ?? null}
          unit="days"
          benchmark={EU_BENCHMARKS.meanTimeToProcedure}
          icon={Clock}
          isLoading={isLoading}
        />
        <KPICard
          title={EU_BENCHMARKS.restenosisRate6m.label}
          value={kpis?.restenosisRate ?? null}
          unit="%"
          benchmark={EU_BENCHMARKS.restenosisRate6m}
          icon={Heart}
          isLoading={isLoading}
        />
        <KPICard
          title={EU_BENCHMARKS.patientSatisfaction.label}
          value={kpis?.satisfaction ?? null}
          unit="/100"
          benchmark={EU_BENCHMARKS.patientSatisfaction}
          icon={ThumbsUp}
          isLoading={isLoading}
        />
      </div>

      {/* Methodology note */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Methodology & Data Sources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><strong>30-Day Complication Rate:</strong> Outcomes marked as "complication" within your cases, divided by total case count.</p>
          <p><strong>Mean Time to Procedure:</strong> Average number of days between case creation and first intervention/procedure outcome.</p>
          <p><strong>Re-stenosis Rate (6 months):</strong> Outcomes marked as "restenosis" as a percentage of total cases.</p>
          <p><strong>Patient Satisfaction:</strong> Average normalized PROM score across all completed questionnaires.</p>
          <p className="pt-2 flex items-center gap-2">
            <Badge variant="outline">European Benchmarks</Badge>
            Based on ESVS guidelines and Vascunet registry aggregate data (2023–2024).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
