import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, Loader2, PenLine } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Signoff = {
  id: string;
  entity_type: string;
  entity_id: string;
  signed_by: string;
  cosigned_by: string | null;
  status: string;
  justification: string | null;
  signed_at: string | null;
  cosigned_at: string | null;
  created_at: string;
};

interface SignoffPanelProps {
  entityType: string;
  entityId: string;
  title?: string;
  description?: string;
}

const statusVariant = (s: string) =>
  s === "cosigned" ? "default" : s === "signed" ? "secondary" : s === "rejected" ? "destructive" : "outline";

/**
 * Workflow de signoff clinique réutilisable (ADR-002).
 * Affiche les signoffs existants pour une entité et permet d'en créer un nouveau.
 */
export function SignoffPanel({ entityType, entityId, title, description }: SignoffPanelProps) {
  const { user } = useAuth();
  const { log } = useAuditLog();
  const qc = useQueryClient();
  const [justification, setJustification] = useState("");

  const { data: signoffs, isLoading } = useQuery({
    queryKey: ["signoffs", entityType, entityId],
    enabled: !!user && !!entityId,
    queryFn: async (): Promise<Signoff[]> => {
      const { data, error } = await supabase
        .from("clinical_signoffs" as never)
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as Signoff[]) ?? [];
    },
  });

  const requestSignoff = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("clinical_signoffs" as never)
        .insert({
          entity_type: entityType,
          entity_id: entityId,
          signed_by: user.id,
          justification: justification || null,
          status: "signed",
          signed_at: new Date().toISOString(),
        } as never)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      const id = (data as { id?: string } | null)?.id;
      await log({
        category: "clinical",
        action: "signoff.signed",
        severity: "info",
        targetEntityType: entityType,
        targetEntityId: entityId,
        context: { signoffId: id, awaitingCosign: true },
      });
    },
    onSuccess: () => {
      toast.success("Signoff enregistré. Un expert reviewer pourra cosigner.");
      setJustification("");
      qc.invalidateQueries({ queryKey: ["signoffs", entityType, entityId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          {title ?? "Validation clinique"}
        </CardTitle>
        <CardDescription>
          {description ?? "Tracez votre décision clinique. Un expert reviewer pourra cosigner pour double validation (ADR-002)."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Justification (optionnelle)</label>
          <Textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Indiquez le raisonnement clinique, les références et les éléments contributifs…"
            rows={3}
            maxLength={2000}
          />
          <Button onClick={() => requestSignoff.mutate()} disabled={requestSignoff.isPending} size="sm">
            {requestSignoff.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PenLine className="h-4 w-4 mr-2" />}
            Signer & demander cosignature
          </Button>
        </div>

        <div className="border-t pt-4 space-y-2">
          <p className="text-sm font-medium">Historique des signoffs</p>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : !signoffs?.length ? (
            <p className="text-sm text-muted-foreground">Aucun signoff pour cette entité.</p>
          ) : (
            <ul className="space-y-2">
              {signoffs.map((s) => (
                <li key={s.id} className="rounded-md border p-3 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs">#{s.id.slice(0, 8)}</span>
                    <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Signé le {s.signed_at ? format(new Date(s.signed_at), "dd/MM/yyyy HH:mm") : "—"}
                    {s.cosigned_at && ` · Cosigné le ${format(new Date(s.cosigned_at), "dd/MM/yyyy HH:mm")}`}
                  </p>
                  {s.justification && <p className="text-sm mt-1">{s.justification}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
