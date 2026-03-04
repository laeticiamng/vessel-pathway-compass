import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, HeartPulse, Edit, Plus, Clock, Ruler, Activity, Calendar,
} from "lucide-react";

const AGE_RANGES = ["18-30", "31-40", "41-50", "51-60", "61-70", "71-80", "80+"] as const;

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [addMeasurementOpen, setAddMeasurementOpen] = useState(false);

  // Edit form
  const [editPseudonym, setEditPseudonym] = useState("");
  const [editAgeRange, setEditAgeRange] = useState("");
  const [editSex, setEditSex] = useState("");

  // Event form
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDesc, setEventDesc] = useState("");

  // Measurement form
  const [measType, setMeasType] = useState("");
  const [measValue, setMeasValue] = useState("");
  const [measUnit, setMeasUnit] = useState("");
  const [measSite, setMeasSite] = useState("");

  // Fetch patient + cases
  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const { data: cases } = useQuery({
    queryKey: ["patient-cases", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("*")
        .eq("patient_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const caseIds = cases?.map((c) => c.id) ?? [];

  // Fetch timeline events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["case-events", caseIds],
    queryFn: async () => {
      if (caseIds.length === 0) return [];
      const { data, error } = await supabase
        .from("case_events")
        .select("*")
        .in("case_id", caseIds)
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: caseIds.length > 0,
  });

  // Fetch measurements
  const { data: measurements, isLoading: measLoading } = useQuery({
    queryKey: ["measurements", caseIds],
    queryFn: async () => {
      if (caseIds.length === 0) return [];
      const { data, error } = await supabase
        .from("measurements")
        .select("*")
        .in("case_id", caseIds)
        .order("measured_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: caseIds.length > 0,
  });

  // Edit patient
  const editMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("patients")
        .update({
          pseudonym: editPseudonym,
          age_range: editAgeRange || null,
          sex: editSex || null,
        })
        .eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient", id] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setEditOpen(false);
      toast({ title: "Updated", description: "Patient information saved" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Add event
  const addEventMutation = useMutation({
    mutationFn: async () => {
      if (!user || !caseIds[0]) throw new Error("No case found");
      const { error } = await supabase.from("case_events").insert({
        case_id: caseIds[0],
        title: eventTitle,
        event_type: eventType || "note",
        description: eventDesc || null,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case-events", caseIds] });
      setAddEventOpen(false);
      setEventTitle(""); setEventType(""); setEventDesc("");
      toast({ title: "Added", description: "Timeline event created" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  // Add measurement
  const addMeasMutation = useMutation({
    mutationFn: async () => {
      if (!user || !caseIds[0]) throw new Error("No case found");
      const { error } = await supabase.from("measurements").insert({
        case_id: caseIds[0],
        measurement_type: measType,
        value: parseFloat(measValue),
        unit: measUnit,
        site: measSite || null,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["measurements", caseIds] });
      setAddMeasurementOpen(false);
      setMeasType(""); setMeasValue(""); setMeasUnit(""); setMeasSite("");
      toast({ title: "Added", description: "Measurement recorded" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  function openEdit() {
    if (patient) {
      setEditPseudonym(patient.pseudonym);
      setEditAgeRange(patient.age_range ?? "");
      setEditSex(patient.sex ?? "");
    }
    setEditOpen(true);
  }

  if (patientLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-4 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate("/app/patients")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <p className="text-muted-foreground">Patient not found.</p>
      </div>
    );
  }

  const latestCase = cases?.[0];
  const riskFactors = Array.isArray(patient.risk_factors) ? patient.risk_factors : [];

  const eventTypeIcon: Record<string, typeof Activity> = {
    procedure: HeartPulse,
    imaging: Activity,
    note: Clock,
    lab: Ruler,
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/patients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <HeartPulse className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold font-mono">{patient.pseudonym}</h1>
            {latestCase && (
              <Badge variant="secondary">{latestCase.category}</Badge>
            )}
            {latestCase && (
              <Badge variant="outline" className="capitalize">{latestCase.status}</Badge>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            {patient.age_range && `Age: ${patient.age_range}`}
            {patient.sex && ` · ${patient.sex}`}
            {` · ${cases?.length ?? 0} case(s)`}
          </p>
        </div>
        <Button variant="outline" onClick={openEdit}>
          <Edit className="h-4 w-4 mr-2" />
          {t("common.edit")}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Cases</p>
            <p className="text-3xl font-bold mt-1">{cases?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Timeline Events</p>
            <p className="text-3xl font-bold mt-1">{events?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Measurements</p>
            <p className="text-3xl font-bold mt-1">{measurements?.length ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="cases">Cases</TabsTrigger>
        </TabsList>

        {/* Timeline */}
        <TabsContent value="timeline" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Case Timeline</h2>
            <Button size="sm" onClick={() => setAddEventOpen(true)} disabled={!caseIds.length}>
              <Plus className="h-4 w-4 mr-1" /> Add Event
            </Button>
          </div>

          {eventsLoading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4">
              <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
          ))}

          {!eventsLoading && events && events.length > 0 ? (
            <div className="relative">
              <div className="absolute left-[18px] top-0 bottom-0 w-px bg-border" />
              {events.map((ev) => {
                const Icon = eventTypeIcon[ev.event_type] ?? Clock;
                return (
                  <div key={ev.id} className="flex gap-4 p-3 relative">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 z-10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{ev.title}</p>
                        <Badge variant="outline" className="text-[10px] capitalize">{ev.event_type}</Badge>
                      </div>
                      {ev.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(ev.event_date).toLocaleDateString()}
                        <span className="ml-2">{timeAgo(ev.event_date)}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : !eventsLoading && (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">No timeline events yet</p>
                {caseIds.length > 0 && (
                  <Button variant="outline" className="mt-4" onClick={() => setAddEventOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add First Event
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Measurements */}
        <TabsContent value="measurements" className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Measurements</h2>
            <Button size="sm" onClick={() => setAddMeasurementOpen(true)} disabled={!caseIds.length}>
              <Plus className="h-4 w-4 mr-1" /> Add Measurement
            </Button>
          </div>

          {measLoading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}

          {!measLoading && measurements && measurements.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Value</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Unit</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Site</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {measurements.map((m) => (
                      <tr key={m.id} className="border-b last:border-0">
                        <td className="p-3 font-medium capitalize">{m.measurement_type}</td>
                        <td className="p-3 font-mono">{m.value}</td>
                        <td className="p-3">{m.unit}</td>
                        <td className="p-3">{m.site ?? "—"}</td>
                        <td className="p-3 text-muted-foreground">{new Date(m.measured_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : !measLoading && (
            <Card>
              <CardContent className="py-12 text-center">
                <Ruler className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">No measurements recorded</p>
                {caseIds.length > 0 && (
                  <Button variant="outline" className="mt-4" onClick={() => setAddMeasurementOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Add First Measurement
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cases */}
        <TabsContent value="cases" className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold">Associated Cases</h2>
          {cases?.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{c.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs">{c.category}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{c.status}</Badge>
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  {c.summary && <p className="text-sm text-muted-foreground mt-2">{c.summary}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
          {(!cases || cases.length === 0) && (
            <p className="text-muted-foreground text-center py-8">No cases found</p>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Patient Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>Update pseudonymized patient information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Pseudonym</Label>
              <Input value={editPseudonym} onChange={(e) => setEditPseudonym(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age Range</Label>
                <Select value={editAgeRange} onValueChange={setEditAgeRange}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {AGE_RANGES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sex</Label>
                <Select value={editSex} onValueChange={setEditSex}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
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

      {/* Add Timeline Event Dialog */}
      <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Timeline Event</DialogTitle>
            <DialogDescription>Record a clinical event for this patient</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="e.g. Duplex ultrasound" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="procedure">Procedure</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="lab">Lab Result</SelectItem>
                  <SelectItem value="note">Clinical Note</SelectItem>
                  <SelectItem value="medication">Medication Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input placeholder="Additional details..." value={eventDesc} onChange={(e) => setEventDesc(e.target.value)} />
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
            <DialogTitle>Add Measurement</DialogTitle>
            <DialogDescription>Record a clinical measurement</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={measType} onValueChange={setMeasType}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="abi">ABI</SelectItem>
                  <SelectItem value="tbi">TBI</SelectItem>
                  <SelectItem value="diameter">Diameter (mm)</SelectItem>
                  <SelectItem value="stenosis">Stenosis (%)</SelectItem>
                  <SelectItem value="velocity">Peak Velocity (cm/s)</SelectItem>
                  <SelectItem value="walking_distance">Walking Distance (m)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Value</Label>
                <Input type="number" step="any" placeholder="0.65" value={measValue} onChange={(e) => setMeasValue(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input placeholder="e.g. ratio, mm, %" value={measUnit} onChange={(e) => setMeasUnit(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Site (optional)</Label>
              <Input placeholder="e.g. Right SFA, Left ATA" value={measSite} onChange={(e) => setMeasSite(e.target.value)} />
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
    </div>
  );
}
