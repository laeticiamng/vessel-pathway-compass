import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, Play, Timer, BarChart3, Pencil, Brain, Target, Shield, MessageSquare } from "lucide-react";

const cases = [
  { title: "Acute Limb Ischemia — Emergency Triage", difficulty: "Hard", duration: "8 min", type: "OSCE" },
  { title: "Chronic PAD — Outpatient Assessment", difficulty: "Medium", duration: "15 min", type: "Learning" },
  { title: "Ruptured AAA — Decision Making", difficulty: "Hard", duration: "8 min", type: "OSCE" },
  { title: "DVT Diagnosis & Management", difficulty: "Easy", duration: "12 min", type: "Learning" },
  { title: "Carotid Stenosis — Pre-op Workup", difficulty: "Medium", duration: "10 min", type: "OSCE" },
];

const heatmapData = [
  { skill: "Triage Accuracy", score: 87, color: "bg-success" },
  { skill: "Safety Steps", score: 92, color: "bg-success" },
  { skill: "Documentation", score: 74, color: "bg-warning" },
  { skill: "Communication", score: 68, color: "bg-destructive" },
];

export default function Simulation() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FlaskConical className="h-8 w-8 text-primary" />
          Clinical Simulation Lab
        </h1>
        <p className="text-muted-foreground mt-1">Interactive branching cases with AI-powered feedback</p>
      </div>

      <Tabs defaultValue="cases">
        <TabsList>
          <TabsTrigger value="cases">Case Library</TabsTrigger>
          <TabsTrigger value="heatmap">Skill Heatmap</TabsTrigger>
          <TabsTrigger value="authoring">Case Authoring</TabsTrigger>
        </TabsList>

        <TabsContent value="cases" className="mt-6 space-y-4">
          {cases.map((c) => (
            <Card key={c.title} className="hover:border-primary/30 transition-colors">
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FlaskConical className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{c.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{c.type}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Timer className="h-3 w-3" /> {c.duration}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          c.difficulty === "Hard" ? "border-destructive/50 text-destructive" :
                          c.difficulty === "Medium" ? "border-warning/50 text-warning" :
                          "border-success/50 text-success"
                        }`}
                      >
                        {c.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button size="sm">
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Start
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="heatmap" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Skill Heatmap</CardTitle>
              <CardDescription>Performance across key competency areas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {heatmapData.map((skill) => (
                <div key={skill.skill} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{skill.skill}</span>
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
                Case Authoring Tool
              </CardTitle>
              <CardDescription>Create branching clinical scenarios with rubrics and feedback</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center text-muted-foreground">
                <Pencil className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Visual case scenario builder</p>
                <p className="text-sm mt-1">Define branches, scoring rubrics, and structured feedback</p>
                <Button variant="outline" className="mt-4">
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Create New Case
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
