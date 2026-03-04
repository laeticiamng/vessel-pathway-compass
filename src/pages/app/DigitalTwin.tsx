import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, MapPin, TrendingUp, Calendar, Target, AlertTriangle } from "lucide-react";

const timelineEvents = [
  { date: "2026-03-01", type: "Assessment", detail: "ABI: 0.65 right, 0.82 left", icon: TrendingUp },
  { date: "2026-02-15", type: "Imaging", detail: "CTA: SFA occlusion right leg", icon: MapPin },
  { date: "2026-01-20", type: "Intervention", detail: "PTA + stenting right SFA", icon: Target },
  { date: "2025-12-10", type: "Symptom", detail: "Claudication distance reduced to 100m", icon: AlertTriangle },
  { date: "2025-11-05", type: "Assessment", detail: "ABI: 0.72 right, 0.85 left", icon: TrendingUp },
];

export default function DigitalTwin() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          Vascular Digital Twin
        </h1>
        <p className="text-muted-foreground mt-1">Longitudinal patient timeline, vascular map, and scenario simulation</p>
      </div>

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="vascular-map">Vascular Map</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="care-plan">Care Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient Timeline</CardTitle>
              <CardDescription>Longitudinal view of ABI trends, symptoms, imaging, and interventions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-6">
                  {timelineEvents.map((event, i) => (
                    <div key={i} className="flex items-start gap-4 relative">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 z-10">
                        <event.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">{event.type}</Badge>
                          <span className="text-xs text-muted-foreground">{event.date}</span>
                        </div>
                        <p className="text-sm">{event.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vascular-map" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Vascular Map</CardTitle>
              <CardDescription>Arterial and venous system with lesion markers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-96 bg-muted/30 rounded-lg border-2 border-dashed">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">Interactive SVG Vascular Map</p>
                  <p className="text-sm mt-1">Arterial/venous anatomy with clickable lesion markers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Simulation</CardTitle>
              <CardDescription>
                <span className="flex items-center gap-2">
                  Hypothetical trajectory modeling
                  <Badge variant="outline" className="text-xs">Non-medical device</Badge>
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg border-2 border-dashed">
                <div className="text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-medium">Scenario Comparison Engine</p>
                  <p className="text-sm mt-1">Compare hypothetical treatment pathways — labeled as simulation only</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="care-plan" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Care Plan</CardTitle>
              <CardDescription>Goals, tasks, and reminders for ongoing management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { goal: "Optimize walking distance to 500m", status: "In Progress", due: "2026-04-01" },
                  { goal: "Achieve HbA1c < 7.0%", status: "Pending", due: "2026-06-01" },
                  { goal: "Follow-up Doppler at 3 months", status: "Scheduled", due: "2026-05-15" },
                  { goal: "Smoking cessation milestone", status: "In Progress", due: "2026-03-30" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{item.goal}</p>
                        <p className="text-xs text-muted-foreground">Due: {item.due}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{item.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
