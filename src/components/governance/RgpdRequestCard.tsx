import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";
import { format } from "date-fns";

const REQUEST_TYPES = [
  { value: "access", label: "Droit d'accès (art. 15)" },
  { value: "rectification", label: "Rectification (art. 16)" },
  { value: "erasure", label: "Effacement (art. 17)" },
  { value: "portability", label: "Portabilité (art. 20)" },
  { value: "restriction", label: "Limitation (art. 18)" },
  { value: "objection", label: "Opposition (art. 21)" },
] as const;

type RgpdRow = {
  id: string;
  request_type: string;
  status: string;
  description: string | null;
  response: string | null;
  due_date: string;
  created_at: string;
};

const statusVariant = (s: string) =>
  s === "completed" ? "default" : s === "rejected" ? "destructive" : s === "in_progress" ? "secondary" : "outline";

export function RgpdRequestCard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { log } = useAuditLog();
  const [requestType, setRequestType] = useState<string>("access");
  const [description, setDescription] = useState("");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["rgpd-requests", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<RgpdRow[]> => {
      const { data, error } = await supabase
        .from("rgpd_requests" as never)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as RgpdRow[]) ?? [];
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("rgpd_requests" as never)
        .insert({ user_id: user.id, request_type: requestType, description: description || null } as never)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      const id = (data as { id?: string } | null)?.id;
      await log({
        category: "compliance",
        action: `rgpd.${requestType}.submitted`,
        severity: "info",
        targetEntityType: "rgpd_request",
        targetEntityId: id,
        context: { description: description.slice(0, 200) },
      });
    },
    onSuccess: () => {
      toast.success("Demande RGPD envoyée. Délai de traitement : 30 jours.");
      setDescription("");
      qc.invalidateQueries({ queryKey: ["rgpd-requests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" /> Mes droits RGPD
        </CardTitle>
        <CardDescription>
          Exercez vos droits prévus par le RGPD (accès, rectification, effacement…). Délai légal : 30 jours.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Type de demande</label>
          <Select value={requestType} onValueChange={setRequestType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {REQUEST_TYPES.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Précisions (optionnel)</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez votre demande…"
            rows={3}
            maxLength={1000}
          />
        </div>
        <Button onClick={() => submit.mutate()} disabled={submit.isPending}>
          {submit.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Soumettre la demande
        </Button>

        <div className="border-t pt-4 space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" /> Mes demandes
          </p>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : !requests?.length ? (
            <p className="text-sm text-muted-foreground">Aucune demande pour le moment.</p>
          ) : (
            <ul className="space-y-2">
              {requests.map((r) => (
                <li key={r.id} className="rounded-md border p-3 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {REQUEST_TYPES.find((t) => t.value === r.request_type)?.label ?? r.request_type}
                    </span>
                    <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Soumise le {format(new Date(r.created_at), "dd/MM/yyyy")} · Échéance {format(new Date(r.due_date), "dd/MM/yyyy")}
                  </p>
                  {r.response && <p className="text-sm mt-1">{r.response}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
