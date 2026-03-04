import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeartPulse, MapPin, Target, Calendar, Activity, Stethoscope, Scan } from "lucide-react";
import { useTranslation } from "@/i18n/context";

const timelineKeys = [
  { date: "2025-12-15", typeKey: "initialAssessment", detailKey: "initialDetail", icon: Stethoscope },
  { date: "2026-01-08", typeKey: "duplexUltrasound", detailKey: "duplexDetail", icon: Activity },
  { date: "2026-01-22", typeKey: "ctAngiography", detailKey: "ctDetail", icon: Scan },
  { date: "2026-02-10", typeKey: "intervention", detailKey: "interventionDetail", icon: HeartPulse },
];

export default function DigitalTwin() {
  const { t } = useTranslation();

  const carePlanGoals = [
    { goalKey: "walking", dueKey: "walkingDue", statusKey: "walkingStatus" },
    { goalKey: "abi", dueKey: "abiDue", statusKey: "abiStatus" },
    { goalKey: "smoking", dueKey: "smokingDue", statusKey: "smokingStatus" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <HeartPulse className="h-8 w-8 text-primary" />
          {t("digitalTwin.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("digitalTwin.subtitle")}</p>
      </div>

      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">{t("digitalTwin.tabs.timeline")}</TabsTrigger>
          <TabsTrigger value="map">{t("digitalTwin.tabs.vascularMap")}</TabsTrigger>
          <TabsTrigger value="simulation">{t("digitalTwin.tabs.simulation")}</TabsTrigger>
          <TabsTrigger value="careplan">{t("digitalTwin.tabs.carePlan")}</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="mt-6 space-y-4">
          {timelineKeys.map((ev) => {
            const Icon = ev.icon;
            return (
              <div key={ev.typeKey} className="flex gap-4 p-4 rounded-lg border">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{t(`digitalTwin.timeline.events.${ev.typeKey}`)}</h3>
                    <Badge variant="outline" className="text-xs">{ev.date}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{t(`digitalTwin.timeline.events.${ev.detailKey}`)}</p>
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="map" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t("digitalTwin.vascularMap.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64 bg-muted/30 rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground text-center max-w-md">{t("digitalTwin.vascularMap.placeholder")}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t("digitalTwin.simulationEngine.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64 bg-muted/30 rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground text-center max-w-md">{t("digitalTwin.simulationEngine.placeholder")}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="careplan" className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold">{t("digitalTwin.carePlan.title")}</h2>
          {carePlanGoals.map((g) => (
            <Card key={g.goalKey}>
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{t(`digitalTwin.carePlan.goals.${g.goalKey}`)}</p>
                    <p className="text-sm text-muted-foreground">{t(`digitalTwin.carePlan.goals.${g.dueKey}`)}</p>
                  </div>
                </div>
                <Badge variant="outline">{t(`digitalTwin.carePlan.goals.${g.statusKey}`)}</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
