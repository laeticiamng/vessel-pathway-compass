import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldAlert } from "lucide-react";

function riskFromFactors(factors: unknown): string {
  const count = Array.isArray(factors) ? factors.length : 0;
  if (count === 0) return "low";
  if (count <= 2) return "moderate";
  if (count <= 3) return "high";
  return "critical";
}

const RISK_CONFIG = {
  low: { label: "Low", color: "hsl(var(--chart-3))", bg: "hsl(var(--chart-3) / 0.15)" },
  moderate: { label: "Moderate", color: "hsl(var(--chart-4))", bg: "hsl(var(--chart-4) / 0.15)" },
  high: { label: "High", color: "hsl(var(--chart-5))", bg: "hsl(var(--chart-5) / 0.15)" },
  critical: { label: "Critical", color: "hsl(0 84% 60%)", bg: "hsl(0 84% 60% / 0.15)" },
} as const;

type RiskLevel = keyof typeof RISK_CONFIG;

export default function PatientRiskDistribution() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ["patient-risk-distribution", user?.id],
    queryFn: async () => {
      const { data: patients, error } = await supabase
        .from("patients")
        .select("id, risk_factors")
        .limit(500);
      if (error) throw error;

      const distribution: Record<RiskLevel, number> = { low: 0, moderate: 0, high: 0, critical: 0 };
      for (const p of patients ?? []) {
        const risk = riskFromFactors(p.risk_factors) as RiskLevel;
        distribution[risk]++;
      }

      const total = patients?.length ?? 0;
      return { distribution, total };
    },
    enabled: !!user,
  });

  const total = data?.total ?? 0;
  const dist = data?.distribution ?? { low: 0, moderate: 0, high: 0, critical: 0 };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-primary" />
            {t("dashboard.riskDistribution.title")}
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            {t("dashboard.riskDistribution.desc")}
          </CardDescription>
        </div>
        <Link
          to="/app/patients"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          {t("dashboard.riskDistribution.viewAll")}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-full rounded-full" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </div>
        ) : total === 0 ? (
          <div className="text-center py-6">
            <ShieldAlert className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">{t("dashboard.riskDistribution.noPatients")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stacked bar */}
            <div className="flex h-3 rounded-full overflow-hidden bg-muted">
              {(["low", "moderate", "high", "critical"] as RiskLevel[]).map((level) => {
                const pct = total > 0 ? (dist[level] / total) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={level}
                    className="transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: RISK_CONFIG[level].color,
                      minWidth: pct > 0 ? "4px" : "0",
                    }}
                    title={`${RISK_CONFIG[level].label}: ${dist[level]} (${Math.round(pct)}%)`}
                  />
                );
              })}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["low", "moderate", "high", "critical"] as RiskLevel[]).map((level) => {
                const pct = total > 0 ? Math.round((dist[level] / total) * 100) : 0;
                const config = RISK_CONFIG[level];
                return (
                  <div
                    key={level}
                    className="rounded-lg p-3 text-center transition-colors"
                    style={{ backgroundColor: config.bg }}
                  >
                    <p className="text-2xl font-bold font-mono" style={{ color: config.color }}>
                      {dist[level]}
                    </p>
                    <p className="text-[11px] font-medium mt-0.5" style={{ color: config.color }}>
                      {config.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{pct}%</p>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {total} {t("dashboard.riskDistribution.totalPatients")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
