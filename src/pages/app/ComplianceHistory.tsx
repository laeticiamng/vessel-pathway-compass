import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, TrendingDown, TrendingUp, Minus, History } from "lucide-react";
import { ComplianceTrendChart } from "@/components/governance/ComplianceTrendChart";

interface Snapshot {
  id: string;
  captured_at: string;
  score: number;
  grade: string;
}

const GRADE_COLORS: Record<string, string> = {
  A: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  B: "bg-lime-500/15 text-lime-700 dark:text-lime-400 border-lime-500/30",
  C: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  D: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
  E: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function ComplianceHistory() {
  const { data: snapshots, isLoading } = useQuery({
    queryKey: ["compliance-snapshots-list-90d"],
    queryFn: async (): Promise<Snapshot[]> => {
      const since = new Date(Date.now() - 90 * 86400000).toISOString();
      const { data, error } = await supabase
        .from("compliance_snapshots" as never)
        .select("id,captured_at,score,grade")
        .gte("captured_at", since)
        .order("captured_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Snapshot[];
    },
  });

  const stats = (() => {
    if (!snapshots || snapshots.length === 0) return null;
    const scores = snapshots.map((s) => s.score);
    const latest = snapshots[0];
    const oldest = snapshots[snapshots.length - 1];
    const delta = latest.score - oldest.score;
    return {
      latest,
      oldest,
      delta,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      max: Math.max(...scores),
      min: Math.min(...scores),
      count: snapshots.length,
    };
  })();

  return (
    <>
      <SEOHead
        title="Historique conformité — 90 jours"
        description="Évolution quotidienne du score de conformité RGPD/MDR sur 90 jours."
        path="/app/governance/compliance-history"
        noindex
      />
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2">
              <Link to="/app/governance/compliance">
                <ArrowLeft className="h-4 w-4 mr-1" /> Retour au score
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <History className="h-6 w-6" /> Historique de conformité
            </h1>
            <p className="text-muted-foreground">
              Snapshot quotidien capturé à 03:00 UTC. Tendance sur les 90 derniers jours.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !snapshots || snapshots.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Aucun snapshot enregistré pour le moment.</p>
              <p className="text-xs text-muted-foreground">
                Le premier snapshot sera capturé automatiquement lors du prochain cycle (03:00 UTC).
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {stats && (
              <div className="grid sm:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Dernier score</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <p className="text-3xl font-bold">{stats.latest.score}</p>
                      <Badge className={GRADE_COLORS[stats.latest.grade]} variant="outline">
                        {stats.latest.grade}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Δ 90 jours</p>
                    <div className="flex items-center gap-2 mt-2">
                      {stats.delta > 0 ? (
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                      ) : stats.delta < 0 ? (
                        <TrendingDown className="h-5 w-5 text-destructive" />
                      ) : (
                        <Minus className="h-5 w-5 text-muted-foreground" />
                      )}
                      <p className="text-3xl font-bold">
                        {stats.delta > 0 ? "+" : ""}
                        {stats.delta}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Moyenne</p>
                    <p className="text-3xl font-bold mt-2">{stats.avg}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Min / Max</p>
                    <p className="text-3xl font-bold mt-2">
                      {stats.min}<span className="text-muted-foreground text-xl"> / </span>{stats.max}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            <ComplianceTrendChart />

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Snapshots récents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-[480px] overflow-y-auto">
                  {snapshots.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between gap-3 py-2 px-3 rounded-md border bg-card/50"
                    >
                      <span className="text-sm font-mono text-muted-foreground">
                        {new Date(s.captured_at).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tabular-nums">{s.score}/100</span>
                        <Badge className={GRADE_COLORS[s.grade]} variant="outline">
                          {s.grade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
