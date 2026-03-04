import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { usePatientData } from "@/hooks/usePatientData";
import PatientHeader from "@/components/patient/PatientHeader";
import PatientTimeline from "@/components/patient/PatientTimeline";
import PatientMeasurements from "@/components/patient/PatientMeasurements";
import PatientCases from "@/components/patient/PatientCases";
import RiskFactorsEditor from "@/components/patient/RiskFactorsEditor";
import {
  EditPatientDialog,
  AddEventDialog,
  AddMeasurementDialog,
  DeleteConfirmDialog,
} from "@/components/patient/PatientDialogs";

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    patient, patientLoading,
    cases, caseIds,
    events, eventsLoading,
    measurements, measLoading,
    editMutation, addEventMutation, addMeasMutation,
    deleteEventMutation, deleteMeasMutation, deleteMutation,
  } = usePatientData(id);

  const [editOpen, setEditOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [addMeasurementOpen, setAddMeasurementOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [deleteMeasId, setDeleteMeasId] = useState<string | null>(null);

  if (patientLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate("/app/patients")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> {t("patientDetail.back")}
        </Button>
        <p className="text-muted-foreground">{t("patientDetail.notFound")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <PatientHeader
        patient={patient}
        latestCase={cases?.[0]}
        casesCount={cases?.length ?? 0}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setDeleteOpen(true)}
      />

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">{t("patientDetail.cases")}</p><p className="text-3xl font-bold mt-1">{cases?.length ?? 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">{t("patientDetail.timelineEvents")}</p><p className="text-3xl font-bold mt-1">{events?.length ?? 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">{t("patientDetail.measurementsCount")}</p><p className="text-3xl font-bold mt-1">{measurements?.length ?? 0}</p></CardContent></Card>
      </div>

      <RiskFactorsEditor
        patientId={patient.id}
        riskFactors={Array.isArray(patient.risk_factors) ? (patient.risk_factors as string[]) : []}
      />

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">{t("patientDetail.tabs.timeline")}</TabsTrigger>
          <TabsTrigger value="measurements">{t("patientDetail.tabs.measurements")}</TabsTrigger>
          <TabsTrigger value="cases">{t("patientDetail.tabs.cases")}</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          <PatientTimeline
            events={events}
            eventsLoading={eventsLoading}
            hasCases={caseIds.length > 0}
            onAddEvent={() => setAddEventOpen(true)}
            onDeleteEvent={(id) => setDeleteEventId(id)}
          />
        </TabsContent>

        <TabsContent value="measurements" className="mt-6">
          <PatientMeasurements
            measurements={measurements}
            measLoading={measLoading}
            hasCases={caseIds.length > 0}
            onAddMeasurement={() => setAddMeasurementOpen(true)}
            onDeleteMeasurement={(id) => setDeleteMeasId(id)}
          />
        </TabsContent>

        <TabsContent value="cases" className="mt-6">
          <PatientCases cases={cases} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <EditPatientDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        patient={patient}
        mutation={editMutation}
      />
      <AddEventDialog
        open={addEventOpen}
        onOpenChange={setAddEventOpen}
        mutation={addEventMutation}
      />
      <AddMeasurementDialog
        open={addMeasurementOpen}
        onOpenChange={setAddMeasurementOpen}
        mutation={addMeasMutation}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("patientDetail.deleteDialog.title")}
        description={t("patientDetail.deleteDialog.desc")}
        confirmLabel={t("patientDetail.deleteDialog.confirm")}
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
      <DeleteConfirmDialog
        open={!!deleteEventId}
        onOpenChange={(open) => !open && setDeleteEventId(null)}
        title={t("patientDetail.deleteEventDialog.title")}
        description={t("patientDetail.deleteEventDialog.desc")}
        confirmLabel={t("patientDetail.deleteEventDialog.confirm")}
        isPending={deleteEventMutation.isPending}
        onConfirm={() => deleteEventId && deleteEventMutation.mutate(deleteEventId)}
      />
      <DeleteConfirmDialog
        open={!!deleteMeasId}
        onOpenChange={(open) => !open && setDeleteMeasId(null)}
        title={t("patientDetail.deleteMeasDialog.title")}
        description={t("patientDetail.deleteMeasDialog.desc")}
        confirmLabel={t("patientDetail.deleteMeasDialog.confirm")}
        isPending={deleteMeasMutation.isPending}
        onConfirm={() => deleteMeasId && deleteMeasMutation.mutate(deleteMeasId)}
      />
    </div>
  );
}
