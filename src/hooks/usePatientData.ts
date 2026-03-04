import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export function usePatientData(id: string | undefined) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("patients").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const { data: cases } = useQuery({
    queryKey: ["patient-cases", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("cases").select("*").eq("patient_id", id!).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const caseIds = cases?.map((c) => c.id) ?? [];

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["case-events", caseIds],
    queryFn: async () => {
      if (caseIds.length === 0) return [];
      const { data, error } = await supabase.from("case_events").select("*").in("case_id", caseIds).order("event_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: caseIds.length > 0,
  });

  const { data: measurements, isLoading: measLoading } = useQuery({
    queryKey: ["measurements", caseIds],
    queryFn: async () => {
      if (caseIds.length === 0) return [];
      const { data, error } = await supabase.from("measurements").select("*").in("case_id", caseIds).order("measured_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: caseIds.length > 0,
  });

  const onError = (err: Error) => {
    toast({ title: t("auth.error"), description: err.message, variant: "destructive" });
  };

  const editMutation = useMutation({
    mutationFn: async (vals: { pseudonym: string; age_range: string; sex: string }) => {
      const { error } = await supabase
        .from("patients")
        .update({ pseudonym: vals.pseudonym, age_range: vals.age_range || null, sex: vals.sex || null })
        .eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", id] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast({ title: t("patientDetail.toasts.updated"), description: t("patientDetail.toasts.updatedDesc") });
    },
    onError,
  });

  const addEventMutation = useMutation({
    mutationFn: async (vals: { title: string; event_type: string; description: string }) => {
      if (!user || !caseIds[0]) throw new Error("No case found");
      const { error } = await supabase.from("case_events").insert({
        case_id: caseIds[0],
        title: vals.title,
        event_type: vals.event_type || "note",
        description: vals.description || null,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-events", caseIds] });
      toast({ title: t("patientDetail.toasts.added"), description: t("patientDetail.toasts.eventAdded") });
    },
    onError,
  });

  const addMeasMutation = useMutation({
    mutationFn: async (vals: { type: string; value: number; unit: string; site: string }) => {
      if (!user || !caseIds[0]) throw new Error("No case found");
      const { error } = await supabase.from("measurements").insert({
        case_id: caseIds[0],
        measurement_type: vals.type,
        value: vals.value,
        unit: vals.unit,
        site: vals.site || null,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements", caseIds] });
      toast({ title: t("patientDetail.toasts.added"), description: t("patientDetail.toasts.measAdded") });
    },
    onError,
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase.from("case_events").delete().eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-events", caseIds] });
      toast({ title: t("patientDetail.toasts.eventDeleted"), description: t("patientDetail.toasts.eventDeletedDesc") });
    },
    onError,
  });

  const bulkDeleteEventsMutation = useMutation({
    mutationFn: async (eventIds: string[]) => {
      const { error } = await supabase.from("case_events").delete().in("id", eventIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-events", caseIds] });
      toast({ title: t("patientDetail.toasts.eventDeleted"), description: t("patientDetail.toasts.bulkDeletedDesc") });
    },
    onError,
  });

  const deleteMeasMutation = useMutation({
    mutationFn: async (measId: string) => {
      const { error } = await supabase.from("measurements").delete().eq("id", measId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements", caseIds] });
      toast({ title: t("patientDetail.toasts.measDeleted"), description: t("patientDetail.toasts.measDeletedDesc") });
    },
    onError,
  });

  const bulkDeleteMeasMutation = useMutation({
    mutationFn: async (measIds: string[]) => {
      const { error } = await supabase.from("measurements").delete().in("id", measIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements", caseIds] });
      toast({ title: t("patientDetail.toasts.measDeleted"), description: t("patientDetail.toasts.bulkDeletedDesc") });
    },
    onError,
  });

  const softDeleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("No patient id");
      const { error } = await supabase
        .from("patients")
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", id] });
      navigate("/app/patients");
    },
    onError,
  });

  const restorePatientMutation = useMutation({
    mutationFn: async (patientId: string) => {
      const { error } = await supabase
        .from("patients")
        .update({ deleted_at: null } as any)
        .eq("id", patientId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast({ title: t("patientDetail.toasts.restored"), description: t("patientDetail.toasts.restoredDesc") });
    },
    onError,
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
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast({ title: t("patientDetail.toasts.permanentlyDeleted"), description: t("patientDetail.toasts.permanentlyDeletedDesc") });
    },
    onError,
  });

  return {
    patient,
    patientLoading,
    cases,
    caseIds,
    events,
    eventsLoading,
    measurements,
    measLoading,
    editMutation,
    addEventMutation,
    addMeasMutation,
    deleteEventMutation,
    bulkDeleteEventsMutation,
    deleteMeasMutation,
    bulkDeleteMeasMutation,
    softDeleteMutation,
    restorePatientMutation,
    permanentDeleteMutation,
  };
}
