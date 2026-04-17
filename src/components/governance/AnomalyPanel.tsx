import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

type Anomaly = {
  actor_id: string;
  day: string;
  phi_access_count: number;
  export_count: number;
  signoff_count: number;
  error_count: number;
  total_events: number;
  last_event_at: string;
  anomaly_type: string;
  severity: string;
};

const ANOMALY_LABELS: Record<string, string> = {
  mass_phi_access: "Accès massifs PHI",
  unusual_exports: "Exports inhabituels",
  serial_signoffs: "Signoffs en série",
  repeated_errors: "Erreurs répétées",
};

/**
 * Panneau de détection d'anomalies pour le DPO (ADR-001).
 * Lit la vue `governance_anomalies` (7 derniers jours).
 */
export function AnomalyPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["governance-anomalies"],
    queryFn: async (): Promise<Anomaly[]> => {
      const { data, error } = await supabase
        .from("governance_anomalies" as never)
        .select("*")
        .order("last_event_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as Anomaly[]) ?? [];
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Détection d'anomalies (7 jours)
        </CardTitle>
        <CardDescription>
          Seuils : &gt;100 accès PHI/jour, &gt;10 exports/jour, &gt;20 signoffs/jour, &gt;5 erreurs/jour.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : !data?.length ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ShieldCheck className="h-10 w-10 text-primary mb-2" />
            <p className="text-sm">Aucune anomalie détectée. Comportement normal.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {data.map((a, i) => (
              <li key={`${a.actor_id}-${a.day}-${i}`} className="rounded-md border p-3 text-sm space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={a.severity === "critical" ? "destructive" : "secondary"}>
                    {a.severity}
                  </Badge>
                  <span className="font-medium">{ANOMALY_LABELS[a.anomaly_type] ?? a.anomaly_type}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {format(new Date(a.day), "dd/MM/yyyy")}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Acteur : <span className="font-mono">{a.actor_id.slice(0, 8)}</span> · Total : {a.total_events} événements
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-2">
                  <div>PHI : <span className="font-semibold">{a.phi_access_count}</span></div>
                  <div>Exports : <span className="font-semibold">{a.export_count}</span></div>
                  <div>Signoffs : <span className="font-semibold">{a.signoff_count}</span></div>
                  <div>Erreurs : <span className="font-semibold">{a.error_count}</span></div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
