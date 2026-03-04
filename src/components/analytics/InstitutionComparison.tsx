import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "hsl(200 70% 50%)",
  "hsl(150 60% 45%)",
  "hsl(38 92% 50%)",
  "hsl(270 60% 55%)",
];

export default function InstitutionComparison() {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Fetch institutions accessible to user
  const { data: institutions, isLoading: instLoading } = useQuery({
    queryKey: ["analytics-institutions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("institutions")
        .select("id, name, city, country");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch all cases with institution_id
  const { data: cases } = useQuery({
    queryKey: ["analytics-inst-cases", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("id, institution_id, category, status, created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch outcomes with institution_id
  const { data: outcomes } = useQuery({
    queryKey: ["analytics-inst-outcomes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("outcomes")
        .select("id, institution_id, outcome_type");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch measurements via cases
  const { data: measurements } = useQuery({
    queryKey: ["analytics-inst-measurements", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("measurements")
        .select("id, case_id")
        .limit(1000);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const chartData = useMemo(() => {
    if (!institutions || institutions.length === 0) return [];

    // Build case-to-institution map
    const caseInstMap = new Map<string, string>();
    for (const c of cases ?? []) {
      if (c.institution_id) caseInstMap.set(c.id, c.institution_id);
    }

    return institutions.map((inst) => {
      const instCases = (cases ?? []).filter((c) => c.institution_id === inst.id);
      const instOutcomes = (outcomes ?? []).filter((o) => o.institution_id === inst.id);
      const instCaseIds = new Set(instCases.map((c) => c.id));
      const instMeas = (measurements ?? []).filter((m) => instCaseIds.has(m.case_id));

      return {
        name: inst.name.length > 18 ? inst.name.slice(0, 16) + "…" : inst.name,
        fullName: inst.name,
        city: inst.city,
        cases: instCases.length,
        outcomes: instOutcomes.length,
        measurements: instMeas.length,
      };
    }).sort((a, b) => b.cases - a.cases);
  }, [institutions, cases, outcomes, measurements]);

  if (instLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[280px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!institutions || institutions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {t("analytics.institutionComparison")}
          </CardTitle>
          <CardDescription>{t("analytics.institutionComparisonDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-muted-foreground">
            <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>{t("analytics.noInstitutions")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          {t("analytics.institutionComparison")}
        </CardTitle>
        <CardDescription>{t("analytics.institutionComparisonDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              className="fill-muted-foreground"
            />
            <YAxis className="fill-muted-foreground" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
              formatter={(value: number, name: string) => [value, t(`analytics.instMetrics.${name}` as any) || name]}
              labelFormatter={(label: string) => {
                const item = chartData.find((d) => d.name === label);
                return item ? `${item.fullName}${item.city ? ` (${item.city})` : ""}` : label;
              }}
            />
            <Legend
              formatter={(value: string) => t(`analytics.instMetrics.${value}` as any) || value}
            />
            <Bar dataKey="cases" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
            <Bar dataKey="outcomes" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
            <Bar dataKey="measurements" fill={COLORS[2]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
