import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, FileCheck, ScrollText, AlertTriangle, Recycle, History, Lock, UserCog } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import { CompliancePackButton } from "@/components/governance/CompliancePackButton";
import { ComplianceTrendChart } from "@/components/governance/ComplianceTrendChart";

interface ComplianceBreakdown {
  score: number;
  max: number;
  [key: string]: unknown;
}

interface ComplianceData {
  total: number;
  grade: "A" | "B" | "C" | "D" | "E";
  breakdown: {
    dpia: ComplianceBreakdown & { approved: number; total: number };
    rgpd: ComplianceBreakdown & { overdue: number; total: number };
    signoffs: ComplianceBreakdown & { eidas: number; total: number };
    anomalies: ComplianceBreakdown & { critical_7d: number };
    lifecycle: ComplianceBreakdown & { last_run: string | null };
  };
  computed_at: string;
}

const GRADE_COLORS: Record<string, string> = {
  A: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  B: "bg-lime-500/15 text-lime-700 dark:text-lime-400 border-lime-500/30",
  C: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  D: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
  E: "bg-destructive/15 text-destructive border-destructive/30",
};

function isForbiddenError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string; status?: number };
  const msg = (e.message || "").toLowerCase();
  return (
    e.code === "42501" ||
    e.code === "PGRST301" ||
    e.status === 401 ||
    e.status === 403 ||
    msg.includes("forbidden") ||
    msg.includes("permission denied") ||
    msg.includes("not authorized") ||
    msg.includes("insufficient")
  );
}

export default function ComplianceScore() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["compliance-score"],
    queryFn: async (): Promise<ComplianceData> => {
      const { data, error } = await supabase.rpc("compliance_score" as never);
      if (error) throw error;
      return data as unknown as ComplianceData;
    },
    refetchInterval: (query) => (query.state.error ? false : 60_000),
    retry: (failureCount, err) => !isForbiddenError(err) && failureCount < 2,
  });

  const forbidden = error ? isForbiddenError(error) : false;

  return (
    <>
      <SEOHead title="Score de conformité — Gouvernance" description="Score global de conformité RGPD/MDR de la plateforme." path="/app/governance/compliance" noindex />
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Score de conformité global</h1>
            <p className="text-muted-foreground">Vision unifiée de la santé conformité (RGPD · MDR · ISO 14971).</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/app/governance/compliance-history">
                <History className="h-4 w-4 mr-1" /> Historique 90j
              </Link>
            </Button>
            {data && <CompliancePackButton data={data} />}
          </div>
        </div>

        {forbidden ? (
          <Alert variant="destructive">
            <Lock className="h-4 w-4" />
            <AlertTitle>Accès refusé</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>
                Le score de conformité est réservé aux rôles <strong>admin</strong> ou{" "}
                <strong>super_admin</strong>. Votre compte ne dispose pas des permissions nécessaires
                pour consulter cette page.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild size="sm" variant="outline">
                  <Link to="/app/admin/users">
                    <UserCog className="h-4 w-4 mr-1" /> Gérer les rôles utilisateurs
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => refetch()} disabled={isRefetching}>
                  {isRefetching ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                  Réessayer
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur de chargement</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>Impossible de récupérer le score de conformité. {(error as Error).message}</p>
              <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isRefetching}>
                {isRefetching ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        ) : isLoading || !data ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-10">
                <div className={`flex h-32 w-32 items-center justify-center rounded-full border-4 ${GRADE_COLORS[data.grade]}`}>
                  <div className="text-center">
                    <div className="text-5xl font-bold leading-none">{data.grade}</div>
                    <div className="text-xs mt-1 opacity-80">{data.total}/100</div>
                  </div>
                </div>
                <Progress value={data.total} className="w-full max-w-md" />
                <p className="text-sm text-muted-foreground">
                  Calculé le {new Date(data.computed_at).toLocaleString("fr-FR")}
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ScoreCard
                icon={FileCheck}
                title="DPIA approuvées"
                breakdown={data.breakdown.dpia}
                detail={`${data.breakdown.dpia.approved}/${data.breakdown.dpia.total} approuvées`}
              />
              <ScoreCard
                icon={ScrollText}
                title="Demandes RGPD"
                breakdown={data.breakdown.rgpd}
                detail={`${data.breakdown.rgpd.overdue} en retard / ${data.breakdown.rgpd.total} total`}
                warning={data.breakdown.rgpd.overdue > 0}
              />
              <ScoreCard
                icon={Shield}
                title="Signoffs eIDAS"
                breakdown={data.breakdown.signoffs}
                detail={`${data.breakdown.signoffs.eidas}/${data.breakdown.signoffs.total} renforcés eIDAS`}
              />
              <ScoreCard
                icon={AlertTriangle}
                title="Anomalies critiques 7j"
                breakdown={data.breakdown.anomalies}
                detail={`${data.breakdown.anomalies.critical_7d} événement(s) critique(s)`}
                warning={data.breakdown.anomalies.critical_7d > 0}
              />
              <ScoreCard
                icon={Recycle}
                title="Cycle de vie données"
                breakdown={data.breakdown.lifecycle}
                detail={
                  data.breakdown.lifecycle.last_run
                    ? `Dernier run : ${new Date(data.breakdown.lifecycle.last_run).toLocaleString("fr-FR")}`
                    : "Aucune exécution"
                }
                warning={!data.breakdown.lifecycle.last_run}
              />
            </div>

            <ComplianceTrendChart />
          </>
        )}
      </div>
    </>
  );
}

function ScoreCard({
  icon: Icon,
  title,
  breakdown,
  detail,
  warning,
}: {
  icon: typeof Shield;
  title: string;
  breakdown: ComplianceBreakdown;
  detail: string;
  warning?: boolean;
}) {
  const pct = (breakdown.score / breakdown.max) * 100;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <span className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {title}
          </span>
          <Badge variant={warning ? "destructive" : "secondary"}>
            {breakdown.score}/{breakdown.max}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress value={pct} />
        <p className="text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
