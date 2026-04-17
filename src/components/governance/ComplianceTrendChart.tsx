import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Snapshot {
  captured_at: string;
  score: number;
  grade: string;
}

export function ComplianceTrendChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["compliance-snapshots-90d"],
    queryFn: async (): Promise<Snapshot[]> => {
      const since = new Date(Date.now() - 90 * 86400000).toISOString();
      const { data, error } = await supabase
        .from("compliance_snapshots" as never)
        .select("captured_at,score,grade")
        .gte("captured_at", since)
        .order("captured_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Snapshot[];
    },
  });

  const chartData = (data ?? []).map((s) => ({
    date: new Date(s.captured_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    score: s.score,
    grade: s.grade,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4" />
          Tendance du score (90 jours)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            Aucun snapshot disponible. Le premier sera capturé cette nuit (03:30 UTC).
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 6,
                  fontSize: 12,
                }}
                formatter={(value: number, _name, props) => [`${value}/100 (${props.payload.grade})`, "Score"]}
              />
              <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="url(#scoreGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
