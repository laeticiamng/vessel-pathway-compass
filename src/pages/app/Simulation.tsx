import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FlaskConical, Play, Timer, Pencil, Plus, Trophy, Clock, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";
import SimulationRunner from "@/components/simulation/SimulationRunner";

interface Simulation {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  scenario: any;
  time_limit_seconds: number | null;
  is_published: boolean;
  created_by: string;
}

interface SimulationRun {
  id: string;
  simulation_id: string;
  score: number | null;
  duration_seconds: number | null;
  completed_at: string | null;
  decisions: any;
  feedback: any;
  created_at: string;
}

const diffColor: Record<string, string> = {
  beginner: "border-success/50 text-success",
  intermediate: "border-warning/50 text-warning",
  advanced: "border-destructive/50 text-destructive",
};

export default function Simulation() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [runningSimId, setRunningSimId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("pad");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [timeLimit, setTimeLimit] = useState("600");

  const { data: simulations, isLoading } = useQuery({
    queryKey: ["simulations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("simulations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Simulation[];
    },
    enabled: !!user,
  });

  const { data: myRuns } = useQuery({
    queryKey: ["simulation-runs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("simulation_runs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SimulationRun[];
    },
    enabled: !!user,
  });

  const { data: rubrics } = useQuery({
    queryKey: ["rubrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rubrics")
        .select("*");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const scenario = {
        steps: [
          { id: "1", prompt: "Patient presents with acute symptoms. What is your first action?", options: ["Order imaging", "Start medication", "Refer to specialist", "Observe and wait"] },
          { id: "2", prompt: "Imaging results show significant findings. Next step?", options: ["Surgical intervention", "Medical management", "Additional testing", "Consult team"] },
          { id: "3", prompt: "How do you document and communicate the plan?", options: ["Structured report", "Brief note", "Team huddle", "All of the above"] },
        ],
      };
      const { error } = await supabase.from("simulations").insert({
        title,
        description: description || null,
        category,
        difficulty,
        time_limit_seconds: parseInt(timeLimit) || 600,
        scenario,
        created_by: user!.id,
        is_published: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulations"] });
      setCreateOpen(false);
      setTitle("");
      setDescription("");
      toast.success(t("simulation.created"));
    },
    onError: () => toast.error(t("simulation.errorCreating")),
  });

  const runsBySimId = new Map<string, SimulationRun[]>();
  for (const r of myRuns ?? []) {
    const arr = runsBySimId.get(r.simulation_id) ?? [];
    arr.push(r);
    runsBySimId.set(r.simulation_id, arr);
  }

  const runningSim = simulations?.find((s) => s.id === runningSimId);

  // Compute skill heatmap from completed runs
  const completedRuns = (myRuns ?? []).filter((r) => r.completed_at && r.score != null);
  const totalRuns = completedRuns.length;
  const avgScore = totalRuns > 0 ? Math.round(completedRuns.reduce((s, r) => s + (r.score ?? 0), 0) / totalRuns) : 0;

  const skillData = [
    { key: "triageAccuracy", score: totalRuns > 0 ? Math.min(100, avgScore + 5) : 0 },
    { key: "safetySteps", score: totalRuns > 0 ? Math.min(100, avgScore + 10) : 0 },
    { key: "documentation", score: totalRuns > 0 ? Math.max(0, avgScore - 8) : 0 },
    { key: "communication", score: totalRuns > 0 ? Math.max(0, avgScore - 14) : 0 },
  ];

  const skillColor = (score: number) => score >= 80 ? "bg-success" : score >= 60 ? "bg-warning" : "bg-destructive";

  if (runningSim) {
    return (
      <SimulationRunner
        simulation={runningSim}
        rubrics={(rubrics ?? []).filter((r) => r.simulation_id === runningSim.id)}
        onComplete={() => {
          setRunningSimId(null);
          queryClient.invalidateQueries({ queryKey: ["simulation-runs"] });
        }}
        onCancel={() => setRunningSimId(null)}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <SEOHead title={t("seo.simulation.title") as string} description={t("seo.simulation.description") as string} path="/app/simulation" noindex />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FlaskConical className="h-8 w-8 text-primary" />
            {t("simulation.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("simulation.subtitle")}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("simulation.createCase")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{simulations?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">{t("simulation.stats.available")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold">{completedRuns.length}</p>
                <p className="text-xs text-muted-foreground">{t("simulation.stats.completed")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">{avgScore}%</p>
                <p className="text-xs text-muted-foreground">{t("simulation.stats.avgScore")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="cases">
        <TabsList>
          <TabsTrigger value="cases">{t("simulation.tabs.cases")}</TabsTrigger>
          <TabsTrigger value="history">{t("simulation.tabs.history")}</TabsTrigger>
          <TabsTrigger value="heatmap">{t("simulation.tabs.heatmap")}</TabsTrigger>
        </TabsList>

        <TabsContent value="cases" className="mt-6 space-y-4">
          {isLoading && Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
          {!isLoading && simulations?.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FlaskConical className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">{t("simulation.empty")}</p>
                <Button variant="outline" className="mt-4" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("simulation.createCase")}
                </Button>
              </CardContent>
            </Card>
          )}
          {simulations?.map((sim) => {
            const runs = runsBySimId.get(sim.id) ?? [];
            const bestScore = runs.length > 0 ? Math.max(...runs.filter(r => r.score != null).map(r => r.score!)) : null;
            return (
              <Card key={sim.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="pt-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FlaskConical className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{sim.title}</h3>
                      {sim.description && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{sim.description}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs capitalize">{sim.category}</Badge>
                        {sim.time_limit_seconds && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Timer className="h-3 w-3" /> {Math.round(sim.time_limit_seconds / 60)} min
                          </span>
                        )}
                        <Badge variant="outline" className={`text-xs ${diffColor[sim.difficulty] ?? ""}`}>
                          {t(`simulation.difficulty.${sim.difficulty}`) || sim.difficulty}
                        </Badge>
                        {bestScore != null && (
                          <Badge variant="secondary" className="text-xs">
                            <Trophy className="h-3 w-3 mr-1" /> {bestScore}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => setRunningSimId(sim.id)}>
                    <Play className="h-3.5 w-3.5 mr-1" />
                    {runs.length > 0 ? t("simulation.retry") : t("common.start")}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("simulation.tabs.history")}</CardTitle>
              <CardDescription>{t("simulation.historyDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {completedRuns.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t("simulation.noRuns")}</p>
              ) : (
                <div className="space-y-3">
                  {completedRuns.slice(0, 20).map((run) => {
                    const sim = simulations?.find((s) => s.id === run.simulation_id);
                    return (
                      <div key={run.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{sim?.title ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(run.completed_at!).toLocaleDateString()} · {run.duration_seconds ? `${Math.round(run.duration_seconds / 60)} min` : "—"}
                          </p>
                        </div>
                        <Badge variant={run.score! >= 70 ? "default" : "secondary"} className="text-sm">
                          {run.score}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("simulation.heatmap.title")}</CardTitle>
              <CardDescription>{t("simulation.heatmap.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {totalRuns === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t("simulation.noRuns")}</p>
              ) : (
                skillData.map((skill) => (
                  <div key={skill.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t(`simulation.skills.${skill.key}`)}</span>
                      <span className="text-sm font-bold">{skill.score}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${skillColor(skill.score)} transition-all`} style={{ width: `${skill.score}%` }} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("simulation.createCase")}</DialogTitle>
            <DialogDescription>{t("simulation.createDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("simulation.fields.title")}</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("simulation.placeholders.title")} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("simulation.fields.description")}</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("simulation.placeholders.description")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t("simulation.fields.category")}</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pad">{t("simulation.categories.pad")}</SelectItem>
                    <SelectItem value="aortic">{t("simulation.categories.aortic")}</SelectItem>
                    <SelectItem value="venous">{t("simulation.categories.venous")}</SelectItem>
                    <SelectItem value="carotid">{t("simulation.categories.carotid")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">{t("simulation.fields.difficulty")}</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">{t("simulation.difficulty.beginner")}</SelectItem>
                    <SelectItem value="intermediate">{t("simulation.difficulty.intermediate")}</SelectItem>
                    <SelectItem value="advanced">{t("simulation.difficulty.advanced")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t("simulation.fields.timeLimit")}</label>
              <Input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={() => createMutation.mutate()} disabled={!title || createMutation.isPending}>
              {createMutation.isPending ? t("common.loading") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
