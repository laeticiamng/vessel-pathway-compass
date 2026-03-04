import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { DeleteConfirmDialog } from "@/components/patient/PatientDialogs";

export default function PatientTrash() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);

  const { data: deletedPatients, isLoading } = useQuery({
    queryKey: ["patients-trash"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .not("deleted_at" as any, "is", null)
        .order("deleted_at" as any, { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const restoreMutation = useMutation({
    mutationFn: async (patientId: string) => {
      const { error } = await supabase
        .from("patients")
        .update({ deleted_at: null } as any)
        .eq("id", patientId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients-trash"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast({ title: t("patientDetail.toasts.restored"), description: t("patientDetail.toasts.restoredDesc") });
    },
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: async (patientId: string) => {
      const { data: patientCases } = await supabase.from("cases").select("id").eq("patient_id", patientId);
      const ids = patientCases?.map((c) => c.id) ?? [];
      if (ids.length > 0) {
        await Promise.all([
          supabase.from("case_events").delete().in("case_id", ids),
          supabase.from("measurements").delete().in("case_id", ids),
          supabase.from("imaging_summaries").delete().in("case_id", ids),
          supabase.from("outcomes").delete().in("case_id", ids),
          supabase.from("proms").delete().in("case_id", ids),
        ]);
        await supabase.from("cases").delete().eq("patient_id", patientId);
      }
      await supabase.from("consents").delete().eq("patient_id", patientId);
      const { error } = await supabase.from("patients").delete().eq("id", patientId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients-trash"] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setPermanentDeleteId(null);
      toast({ title: t("patientDetail.toasts.permanentlyDeleted"), description: t("patientDetail.toasts.permanentlyDeletedDesc") });
    },
  });

  if (isLoading) return null;
  if (!deletedPatients || deletedPatients.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Trash2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="font-medium">{t("patientDetail.trash.empty")}</p>
        <p className="text-sm mt-1">{t("patientDetail.trash.emptyDesc")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {deletedPatients.map((p) => {
        const deletedAt = (p as any).deleted_at ? new Date((p as any).deleted_at) : null;
        const daysRemaining = deletedAt
          ? Math.max(0, 30 - Math.floor((Date.now() - deletedAt.getTime()) / (1000 * 60 * 60 * 24)))
          : 30;

        return (
          <Card key={p.id} className="border-dashed border-destructive/30">
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trash2 className="h-4 w-4 text-destructive/60" />
                <div>
                  <h3 className="font-semibold">{p.pseudonym}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    {deletedAt && (
                      <span>{t("patientDetail.trash.deletedOn")} {deletedAt.toLocaleDateString()}</span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {daysRemaining}d remaining
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => restoreMutation.mutate(p.id)}
                  disabled={restoreMutation.isPending}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  {t("patientDetail.trash.restore")}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setPermanentDeleteId(p.id)}
                >
                  {t("patientDetail.trash.deletePermanently")}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <DeleteConfirmDialog
        open={!!permanentDeleteId}
        onOpenChange={(open) => !open && setPermanentDeleteId(null)}
        title={t("patientDetail.trash.permanentDeleteDialog.title")}
        description={t("patientDetail.trash.permanentDeleteDialog.desc")}
        confirmLabel={t("patientDetail.trash.permanentDeleteDialog.confirm")}
        isPending={permanentDeleteMutation.isPending}
        onConfirm={() => permanentDeleteId && permanentDeleteMutation.mutate(permanentDeleteId)}
      />
    </div>
  );
}
