import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, HeartPulse, Edit, Plus, Clock, Ruler, Activity, Calendar, Trash2,
} from "lucide-react";
import MeasurementTrendChart from "@/components/patient/MeasurementTrendChart";

const AGE_RANGES = ["18-30", "31-40", "41-50", "51-60", "61-70", "71-80", "80+"] as const;

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  function timeAgo(dateStr: string) {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return t("patientDetail.timeAgo.today");
    if (days === 1) return t("patientDetail.timeAgo.yesterday");
    return `${days}${t("patientDetail.timeAgo.daysAgo")}`;
  }

  const [editOpen, setEditOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [addMeasurementOpen, setAddMeasurementOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [deleteMeasId, setDeleteMeasId] = useState<string | null>(null);

  const [editPseudonym, setEditPseudonym] = useState("");
  const [editAgeRange, setEditAgeRange] = useState("");
  const [editSex, setEditSex] = useState("");

  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDesc, setEventDesc] = useState("");

  const [measType, setMeasType] = useState("");
  const [measValue, setMeasValue] = useState("");
  const [measUnit, setMeasUnit] = useState("");
  const [measSite, setMeasSite] = useState("");

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

  const editMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("patients").update({ pseudonym: editPseudonym, age_range: editAgeRange || null, sex: editSex || null }).eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", id] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setEditOpen(false);
      toast({ title: t("patientDetail.toasts.updated"), description: t("patientDetail.toasts.updatedDesc") });
    },
    onError: (err: Error) => { toast({ title: t("auth.error"), description: err.message, variant: "destructive" }); },
  });

  const addEventMutation = useMutation({
    mutationFn: async () => {
      if (!user || !caseIds[0]) throw new Error("No case found");
      const { error } = await supabase.from("case_events").insert({ case_id: caseIds[0], title: eventTitle, event_type: eventType || "note", description: eventDesc || null, created_by: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-events", caseIds] });
      setAddEventOpen(false);
      setEventTitle(""); setEventType(""); setEventDesc("");
      toast({ title: t("patientDetail.toasts.added"), description: t("patientDetail.toasts.eventAdded") });
    },
    onError: (err: Error) => { toast({ title: t("auth.error"), description: err.message, variant: "destructive" }); },
  });

  const addMeasMutation = useMutation({
    mutationFn: async () => {
      if (!user || !caseIds[0]) throw new Error("No case found");
      const { error } = await supabase.from("measurements").insert({ case_id: caseIds[0], measurement_type: measType, value: parseFloat(measValue), unit: measUnit, site: measSite || null, created_by: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements", caseIds] });
      setAddMeasurementOpen(false);
      setMeasType(""); setMeasValue(""); setMeasUnit(""); setMeasSite("");
      toast({ title: t("patientDetail.toasts.added"), description: t("patientDetail.toasts.measAdded") });
    },
    onError: (err: Error) => { toast({ title: t("auth.error"), description: err.message, variant: "destructive" }); },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase.from("case_events").delete().eq("id", eventId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-events", caseIds] });
      setDeleteEventId(null);
      toast({ title: t("patientDetail.toasts.eventDeleted"), description: t("patientDetail.toasts.eventDeletedDesc") });
    },
    onError: (err: Error) => { toast({ title: t("auth.error"), description: err.message, variant: "destructive" }); },
  });

  const deleteMeasMutation = useMutation({
    mutationFn: async (measId: string) => {
      const { error } = await supabase.from("measurements").delete().eq("id", measId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements", caseIds] });
      setDeleteMeasId(null);
      toast({ title: t("patientDetail.toasts.measDeleted"), description: t("patientDetail.toasts.measDeletedDesc") });
    },
    onError: (err: Error) => { toast({ title: t("auth.error"), description: err.message, variant: "destructive" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("No patient id");
      // Get all case IDs for this patient
      const { data: patientCases } = await supabase.from("cases").select("id").eq("patient_id", id);
      const ids = patientCases?.map((c) => c.id) ?? [];
      if (ids.length > 0) {
        // Delete case_events, measurements, imaging_summaries, outcomes, proms for these cases
        await Promise.all([
          supabase.from("case_events").delete().in("case_id", ids),
          supabase.from("measurements").delete().in("case_id", ids),
          supabase.from("imaging_summaries").delete().in("case_id", ids),
          supabase.from("outcomes").delete().in("case_id", ids),
          supabase.from("proms").delete().in("case_id", ids),
        ]);
        // Delete cases
        await supabase.from("cases").delete().eq("patient_id", id);
      }
      // Delete consents
      await supabase.from("consents").delete().eq("patient_id", id);
      // Delete patient
      const { error } = await supabase.from("patients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast({ title: t("patientDetail.toastsDeleted"), description: t("patientDetail.toastsDeletedDesc") });
      navigate("/app/patients");
    },
    onError: (err: Error) => { toast({ title: t("auth.error"), description: err.message, variant: "destructive" }); },
  });

  function openEdit() {
    if (patient) { setEditPseudonym(patient.pseudonym); setEditAgeRange(patient.age_range ?? ""); setEditSex(patient.sex ?? ""); }
    setEditOpen(true);
  }

  if (patientLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-3 gap-4"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate("/app/patients")}><ArrowLeft className="h-4 w-4 mr-2" /> {t("patientDetail.back")}</Button>
        <p className="text-muted-foreground">{t("patientDetail.notFound")}</p>
      </div>
    );
  }

  const latestCase = cases?.[0];
  const eventTypeIcon: Record<string, typeof Activity> = { procedure: HeartPulse, imaging: Activity, note: Clock, lab: Ruler };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/patients")}><ArrowLeft className="h-4 w-4" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <HeartPulse className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold font-mono">{patient.pseudonym}</h1>
            {latestCase && <Badge variant="secondary">{latestCase.category}</Badge>}
            {latestCase && <Badge variant="outline" className="capitalize">{latestCase.status}</Badge>}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {patient.age_range && `${t("patientDetail.age")}: ${patient.age_range}`}
            {patient.sex && ` · ${patient.sex}`}
            {` · ${cases?.length ?? 0} ${t("patientDetail.cases").toLowerCase()}`}
          </p>
        </div>
        <Button variant="outline" onClick={openEdit}><Edit className="h-4 w-4 mr-2" />{t("common.edit")}</Button>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}><Trash2 className="h-4 w-4 mr-2" />{t("common.delete")}</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">{t("patientDetail.cases")}</p><p className="text-3xl font-bold mt-1">{cases?.length ?? 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">{t("patientDetail.timelineEvents")}</p><p className="text-3xl font-bold mt-1">{events?.length ?? 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">{t("patientDetail.measurementsCount")}</p><p className="text-3xl font-bold mt-1">{measurements?.length ?? 0}</p></CardContent></Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">{t("patientDetail.tabs.timeline")}</TabsTrigger>
          <TabsTrigger value="measurements">{t("patientDetail.tabs.measurements")}</TabsTrigger>
          <TabsTrigger value="cases">{t("patientDetail.tabs.cases")}</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{t("patientDetail.caseTimeline")}</h2>
            <Button size="sm" onClick={() => setAddEventOpen(true)} disabled={!caseIds.length}><Plus className="h-4 w-4 mr-1" /> {t("patientDetail.addEvent")}</Button>
          </div>
          {eventsLoading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4"><Skeleton className="h-9 w-9 rounded-lg shrink-0" /><div className="flex-1 space-y-1"><Skeleton className="h-4 w-48" /><Skeleton className="h-3 w-64" /></div></div>
          ))}
          {!eventsLoading && events && events.length > 0 ? (
            <div className="relative">
              <div className="absolute left-[18px] top-0 bottom-0 w-px bg-border" />
              {events.map((ev) => {
                const Icon = eventTypeIcon[ev.event_type] ?? Clock;
                return (
                  <div key={ev.id} className="flex gap-4 p-3 relative group">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 z-10"><Icon className="h-4 w-4 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><p className="text-sm font-medium">{ev.title}</p><Badge variant="outline" className="text-[10px] capitalize">{ev.event_type}</Badge></div>
                      {ev.description && <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>}
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(ev.event_date).toLocaleDateString()}<span className="ml-2">{timeAgo(ev.event_date)}</span></p>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setDeleteEventId(ev.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : !eventsLoading && (
            <Card><CardContent className="py-12 text-center">
              <Clock className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">{t("patientDetail.noEvents")}</p>
              {caseIds.length > 0 && <Button variant="outline" className="mt-4" onClick={() => setAddEventOpen(true)}><Plus className="h-4 w-4 mr-2" /> {t("patientDetail.addFirstEvent")}</Button>}
            </CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="measurements" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{t("patientDetail.measurements")}</h2>
            <Button size="sm" onClick={() => setAddMeasurementOpen(true)} disabled={!caseIds.length}><Plus className="h-4 w-4 mr-1" /> {t("patientDetail.addMeasurement")}</Button>
          </div>
          {measLoading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-3"><Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-12" /></div>
          ))}
          {!measLoading && measurements && measurements.length > 0 ? (
            <>
            <MeasurementTrendChart measurements={measurements} />
            <Card><CardContent className="p-0">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("patientDetail.table.type")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("patientDetail.table.value")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("patientDetail.table.unit")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("patientDetail.table.site")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("patientDetail.table.date")}</th>
                  <th className="w-10"></th>
                </tr></thead>
                <tbody>{measurements.map((m) => (
                  <tr key={m.id} className="border-b last:border-0 group">
                    <td className="p-3 font-medium capitalize">{m.measurement_type}</td>
                    <td className="p-3 font-mono">{m.value}</td>
                    <td className="p-3">{m.unit}</td>
                    <td className="p-3">{m.site ?? "—"}</td>
                    <td className="p-3 text-muted-foreground">{new Date(m.measured_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setDeleteMeasId(m.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </CardContent></Card>
            </>
          ) : !measLoading && (
            <Card><CardContent className="py-12 text-center">
              <Ruler className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">{t("patientDetail.noMeasurements")}</p>
              {caseIds.length > 0 && <Button variant="outline" className="mt-4" onClick={() => setAddMeasurementOpen(true)}><Plus className="h-4 w-4 mr-2" /> {t("patientDetail.addFirstMeasurement")}</Button>}
            </CardContent></Card>
          )}
        </TabsContent>

        <TabsContent value="cases" className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold">{t("patientDetail.associatedCases")}</h2>
          {cases?.map((c) => (
            <Card key={c.id}><CardContent className="pt-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{c.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">{c.category}</Badge>
                  <Badge variant="outline" className="text-xs capitalize">{c.status}</Badge>
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                {c.summary && <p className="text-sm text-muted-foreground mt-2">{c.summary}</p>}
              </div>
            </CardContent></Card>
          ))}
          {(!cases || cases.length === 0) && <p className="text-muted-foreground text-center py-8">{t("patientDetail.noCases")}</p>}
        </TabsContent>
      </Tabs>

      {/* Edit Patient Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("patientDetail.editDialog.title")}</DialogTitle>
            <DialogDescription>{t("patientDetail.editDialog.desc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("patientDetail.editDialog.pseudonym")}</Label>
              <Input value={editPseudonym} onChange={(e) => setEditPseudonym(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("patientDetail.editDialog.ageRange")}</Label>
                <Select value={editAgeRange} onValueChange={setEditAgeRange}>
                  <SelectTrigger><SelectValue placeholder={t("patientDetail.editDialog.selectPlaceholder")} /></SelectTrigger>
                  <SelectContent>{AGE_RANGES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("patientDetail.editDialog.sex")}</Label>
                <Select value={editSex} onValueChange={setEditSex}>
                  <SelectTrigger><SelectValue placeholder={t("patientDetail.editDialog.selectPlaceholder")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("patientDetail.editDialog.male")}</SelectItem>
                    <SelectItem value="female">{t("patientDetail.editDialog.female")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={() => editMutation.mutate()} disabled={!editPseudonym || editMutation.isPending}>
              {editMutation.isPending ? t("common.loading") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("patientDetail.eventDialog.title")}</DialogTitle>
            <DialogDescription>{t("patientDetail.eventDialog.desc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("patientDetail.eventDialog.titleLabel")}</Label>
              <Input placeholder={t("patientDetail.eventDialog.titlePlaceholder")} value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("patientDetail.eventDialog.eventType")}</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger><SelectValue placeholder={t("patientDetail.eventDialog.selectType")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="procedure">{t("patientDetail.eventDialog.procedure")}</SelectItem>
                  <SelectItem value="imaging">{t("patientDetail.eventDialog.imaging")}</SelectItem>
                  <SelectItem value="lab">{t("patientDetail.eventDialog.lab")}</SelectItem>
                  <SelectItem value="note">{t("patientDetail.eventDialog.note")}</SelectItem>
                  <SelectItem value="medication">{t("patientDetail.eventDialog.medication")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("patientDetail.eventDialog.description")}</Label>
              <Input placeholder={t("patientDetail.eventDialog.descPlaceholder")} value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddEventOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={() => addEventMutation.mutate()} disabled={!eventTitle || addEventMutation.isPending}>
              {addEventMutation.isPending ? t("common.loading") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Measurement Dialog */}
      <Dialog open={addMeasurementOpen} onOpenChange={setAddMeasurementOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("patientDetail.measDialog.title")}</DialogTitle>
            <DialogDescription>{t("patientDetail.measDialog.desc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("patientDetail.measDialog.type")}</Label>
              <Select value={measType} onValueChange={setMeasType}>
                <SelectTrigger><SelectValue placeholder={t("patientDetail.measDialog.selectType")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="abi">{t("patientDetail.measDialog.abi")}</SelectItem>
                  <SelectItem value="tbi">{t("patientDetail.measDialog.tbi")}</SelectItem>
                  <SelectItem value="diameter">{t("patientDetail.measDialog.diameter")}</SelectItem>
                  <SelectItem value="stenosis">{t("patientDetail.measDialog.stenosis")}</SelectItem>
                  <SelectItem value="velocity">{t("patientDetail.measDialog.velocity")}</SelectItem>
                  <SelectItem value="walking_distance">{t("patientDetail.measDialog.walkingDistance")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("patientDetail.measDialog.value")}</Label>
                <Input type="number" step="any" placeholder={t("patientDetail.measDialog.valuePlaceholder")} value={measValue} onChange={(e) => setMeasValue(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("patientDetail.measDialog.unit")}</Label>
                <Input placeholder={t("patientDetail.measDialog.unitPlaceholder")} value={measUnit} onChange={(e) => setMeasUnit(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("patientDetail.measDialog.site")}</Label>
              <Input placeholder={t("patientDetail.measDialog.sitePlaceholder")} value={measSite} onChange={(e) => setMeasSite(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMeasurementOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={() => addMeasMutation.mutate()} disabled={!measType || !measValue || !measUnit || addMeasMutation.isPending}>
              {addMeasMutation.isPending ? t("common.loading") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Patient Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("patientDetail.deleteDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("patientDetail.deleteDialog.desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? t("patientDetail.deleteDialog.deleting") : t("patientDetail.deleteDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Event Confirmation */}
      <AlertDialog open={!!deleteEventId} onOpenChange={(open) => !open && setDeleteEventId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("patientDetail.deleteEventDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("patientDetail.deleteEventDialog.desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEventId && deleteEventMutation.mutate(deleteEventId)}
              disabled={deleteEventMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEventMutation.isPending ? t("common.loading") : t("patientDetail.deleteEventDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Measurement Confirmation */}
      <AlertDialog open={!!deleteMeasId} onOpenChange={(open) => !open && setDeleteMeasId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("patientDetail.deleteMeasDialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("patientDetail.deleteMeasDialog.desc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMeasId && deleteMeasMutation.mutate(deleteMeasId)}
              disabled={deleteMeasMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMeasMutation.isPending ? t("common.loading") : t("patientDetail.deleteMeasDialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
