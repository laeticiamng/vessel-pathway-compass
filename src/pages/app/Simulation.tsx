import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, Play, Timer, Pencil } from "lucide-react";
import { useTranslation } from "@/i18n/context";

const cases = [
  { titleKey: "acuteLimb" as const, diffKey: "hard" as const, duration: "8 min", type: "OSCE" },
  { titleKey: "chronicPAD" as const, diffKey: "medium" as const, duration: "15 min", type: "Learning" },
  { titleKey: "rupturedAAA" as const, diffKey: "hard" as const, duration: "8 min", type: "OSCE" },
  { titleKey: "dvt" as const, diffKey: "easy" as const, duration: "12 min", type: "Learning" },
  { titleKey: "carotid" as const, diffKey: "medium" as const, duration: "10 min", type: "OSCE" },
];

const heatmapKeys = [
  { key: "triageAccuracy" as const, score: 87, color: "bg-success" },
  { key: "safetySteps" as const, score: 92, color: "bg-success" },
  { key: "documentation" as const, score: 74, color: "bg-warning" },
  { key: "communication" as const, score: 68, color: "bg-destructive" },
];

export default function Simulation() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FlaskConical className="h-8 w-8 text-primary" />
          {t("simulation.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("simulation.subtitle")}</p>
      </div>

      <Tabs defaultValue="cases">
        <TabsList>
          <TabsTrigger value="cases">{t("simulation.tabs.cases")}</TabsTrigger>
          <TabsTrigger value="heatmap">{t("simulation.tabs.heatmap")}</TabsTrigger>
          <TabsTrigger value="authoring">{t("simulation.tabs.authoring")}</TabsTrigger>
        </TabsList>

        <TabsContent value="cases" className="mt-6 space-y-4">
          {cases.map((c) => (
            <Card key={c.titleKey} className="hover:border-primary/30 transition-colors">
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FlaskConical className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t(`simulation.cases.${c.titleKey}`)}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{c.type}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Timer className="h-3 w-3" /> {c.duration}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          c.diffKey === "hard" ? "border-destructive/50 text-destructive" :
                          c.diffKey === "medium" ? "border-warning/50 text-warning" :
                          "border-success/50 text-success"
                        }`}
                      >
                        {t(`simulation.difficulty.${c.diffKey}`)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button size="sm">
                  <Play className="h-3.5 w-3.5 mr-1" />
                  {t("common.start")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="heatmap" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("simulation.heatmap.title")}</CardTitle>
              <CardDescription>{t("simulation.heatmap.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {heatmapKeys.map((skill) => (
                <div key={skill.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t(`simulation.skills.${skill.key}`)}</span>
                    <span className="text-sm font-bold">{skill.score}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${skill.color} transition-all`} style={{ width: `${skill.score}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authoring" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5" />
                {t("simulation.authoring.title")}
              </CardTitle>
              <CardDescription>{t("simulation.authoring.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <Pencil className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>{t("simulation.authoring.placeholder")}</p>
                <p className="text-sm mt-1">{t("simulation.authoring.placeholderDesc")}</p>
                <Button variant="outline" className="mt-4">
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  {t("simulation.createCase")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
