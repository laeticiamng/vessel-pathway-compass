import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeartPulse, MapPin, Calendar, Activity, Stethoscope, Scan, Target, User } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import VascularMap, { VASCULAR_SEGMENTS } from "@/components/digital-twin/VascularMap";
import SegmentDetail from "@/components/digital-twin/SegmentDetail";

export default function DigitalTwin() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  // Fetch patients
  const { data: patients } = useQuery({
    queryKey: ["dt-patients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("id, pseudonym, risk_factors, age_range, sex")
        .is("deleted_at" as any, null)
        .order("updated_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch cases for selected patient
  const { data: cases } = useQuery({
    queryKey: ["dt-cases", selectedPatientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("id, title, category, status, updated_at")
        .eq("patient_id", selectedPatientId!)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPatientId,
  });

  const caseIds = cases?.map((c) => c.id) ?? [];

  // Fetch all measurements for patient's cases
  const { data: measurements, isLoading: measLoading } = useQuery({
    queryKey: ["dt-measurements", caseIds],
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

  // Fetch case events for timeline
  const { data: events } = useQuery({
    queryKey: ["dt-events", caseIds],
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

  // Find which segment a measurement belongs to
  function matchSegment(site: string | null): string | null {
    if (!site) return null;
    const lower = site.toLowerCase();
    for (const seg of VASCULAR_SEGMENTS) {
      if (seg.measurementSites.some((s) => lower.includes(s) || s.includes(lower))) {
        return seg.id;
      }
    }
    return null;
  }

  // Build segment status from measurements
  const segmentStatus: Record<string, "normal" | "warning" | "critical"> = {};
  for (const m of measurements ?? []) {
    const segId = matchSegment(m.site);
    if (!segId) continue;
    // Simple heuristic: ABI < 0.5 = critical, < 0.9 = warning
    if (m.measurement_type.toLowerCase().includes("abi")) {
      if (m.value < 0.5) segmentStatus[segId] = "critical";
      else if (m.value < 0.9 && segmentStatus[segId] !== "critical") segmentStatus[segId] = "warning";
    }
    // Stenosis > 70% = critical, > 50% = warning
    if (m.measurement_type.toLowerCase().includes("stenosis")) {
      if (m.value > 70) segmentStatus[segId] = "critical";
      else if (m.value > 50 && segmentStatus[segId] !== "critical") segmentStatus[segId] = "warning";
    }
  }

  // Get measurements for selected segment
  const activeSegment = VASCULAR_SEGMENTS.find((s) => s.id === selectedSegment);
  const segmentMeasurements = activeSegment
    ? (measurements ?? []).filter((m) => {
        const segId = matchSegment(m.site);
        return segId === selectedSegment;
      })
    : [];

  const selectedPatient = patients?.find((p) => p.id === selectedPatientId);

  const eventIcons: Record<string, typeof Stethoscope> = {
    assessment: Stethoscope,
    imaging: Scan,
    intervention: HeartPulse,
    follow_up: Activity,
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <HeartPulse className="h-8 w-8 text-primary" />
            {t("digitalTwin.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("digitalTwin.subtitle")}</p>
        </div>
      </div>

      {/* Patient selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <User className="h-5 w-5 text-muted-foreground" />
            <Select value={selectedPatientId ?? ""} onValueChange={setSelectedPatientId}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder={t("digitalTwin.selectPatient")} />
              </SelectTrigger>
              <SelectContent>
                {patients?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="font-mono">{p.pseudonym}</span>
                    {p.age_range && <span className="text-muted-foreground ml-2">· {p.age_range}</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPatient && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedPatient.age_range ?? "—"}</Badge>
                <Badge variant="outline">{selectedPatient.sex ?? "—"}</Badge>
                <Badge variant="outline">{cases?.length ?? 0} {t("digitalTwin.cases")}</Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!selectedPatientId ? (
        <Card>
          <CardContent className="py-16 text-center">
            <HeartPulse className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
            <p className="text-lg text-muted-foreground">{t("digitalTwin.selectPatientPrompt")}</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="map">
          <TabsList>
            <TabsTrigger value="map">{t("digitalTwin.tabs.vascularMap")}</TabsTrigger>
            <TabsTrigger value="timeline">{t("digitalTwin.tabs.timeline")}</TabsTrigger>
            <TabsTrigger value="careplan">{t("digitalTwin.tabs.carePlan")}</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* SVG Map */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {t("digitalTwin.vascularMap.title")}
                  </CardTitle>
                  <CardDescription className="text-xs">{t("digitalTwin.vascularMap.clickPrompt")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <VascularMap
                    selectedSegment={selectedSegment}
                    onSegmentClick={setSelectedSegment}
                    segmentStatus={segmentStatus}
                  />
                  {/* Legend */}
                  <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-success" />
                      <span className="text-muted-foreground">{t("digitalTwin.legend.normal")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-warning" />
                      <span className="text-muted-foreground">{t("digitalTwin.legend.warning")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-full bg-destructive" />
                      <span className="text-muted-foreground">{t("digitalTwin.legend.critical")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Segment detail */}
              <div>
                {selectedSegment && activeSegment ? (
                  <SegmentDetail
                    segmentLabel={activeSegment.label}
                    measurements={segmentMeasurements}
                    isLoading={measLoading}
                  />
                ) : (
                  <Card>
                    <CardContent className="py-16 text-center">
                      <Activity className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">{t("digitalTwin.selectSegment")}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Risk factors */}
                {selectedPatient?.risk_factors && Array.isArray(selectedPatient.risk_factors) && (selectedPatient.risk_factors as string[]).length > 0 && (
                  <Card className="mt-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{t("digitalTwin.riskFactors")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {(selectedPatient.risk_factors as string[]).map((rf) => (
                          <Badge key={rf} variant="destructive" className="text-xs capitalize">
                            {rf.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6 space-y-4">
            {(events?.length ?? 0) === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">{t("digitalTwin.noEvents")}</p>
                </CardContent>
              </Card>
            ) : (
              events!.map((ev) => {
                const Icon = eventIcons[ev.event_type] ?? Activity;
                return (
                  <div key={ev.id} className="flex gap-4 p-4 rounded-lg border">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{ev.title}</h3>
                        <Badge variant="outline" className="text-xs">{new Date(ev.event_date).toLocaleDateString()}</Badge>
                        <Badge variant="secondary" className="text-xs capitalize">{ev.event_type.replace(/_/g, " ")}</Badge>
                      </div>
                      {ev.description && <p className="text-sm text-muted-foreground">{ev.description}</p>}
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="careplan" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {t("digitalTwin.carePlan.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(cases?.length ?? 0) === 0 ? (
                  <p className="text-center text-muted-foreground py-8">{t("digitalTwin.noCases")}</p>
                ) : (
                  <div className="space-y-3">
                    {cases!.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{c.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs capitalize">{c.category}</Badge>
                            <span className="text-xs text-muted-foreground">{new Date(c.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge variant={c.status === "active" ? "default" : "outline"} className="capitalize">{c.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
