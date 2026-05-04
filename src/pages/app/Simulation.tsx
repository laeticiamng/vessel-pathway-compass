import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  FlaskConical,
  Play,
  Timer,
  Plus,
  Trophy,
  CheckCircle2,
  Search,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";
import SimulationRunner from "@/components/simulation/SimulationRunner";
import { ResearchPreviewBadge } from "@/components/ResearchPreviewBadge";
import {
  aggregateSkillHeatmap,
  auditScenario,
  type SimScenario,
} from "@/lib/simulation/scoring";

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

/** Default scenario template — fully scored (correctIndex + skill + rationale). */
function defaultScenario(): SimScenario {
  return {
    steps: [
      {
        id: "1",
        prompt:
          "AOMI fragile, IRC stade 3b. Quel premier examen non ionisant proposer ?",
        options: [
          "Doppler artériel des membres inférieurs + ABI/TBI",
          "Angio-CT avec produit de contraste iodé",
          "ARM injectée d'emblée",
          "Surveillance clinique seule",
        ],
        correctIndex: 0,
        skill: "triageAccuracy",
        weight: 1,
        rationale:
          "En IRC stade 3b, on privilégie l'écho-Doppler + ABI/TBI en première ligne avant toute imagerie injectée.",
      },
      {
        id: "2",
        prompt:
          "Le Doppler montre une sténose hémodynamiquement significative. Quelle étape sécurise la décision ?",
        options: [
          "Décision opératoire immédiate",
          "Cartographie complémentaire (ARM non injectée ou angio-CT bas iode) avec discussion RCP",
          "Reprise du Doppler à 6 mois",
          "Anticoagulation curative empirique",
        ],
        correctIndex: 1,
        skill: "safetySteps",
        weight: 1,
        rationale:
          "Une cartographie segmentaire validée + RCP est requise avant revascularisation.",
      },
      {
        id: "3",
        prompt: "Quelle traçabilité dans le dossier ?",
        options: [
          "Compte-rendu structuré + score de risque CI-AKI + plan de bascule",
          "Note libre courte",
          "Aucune si décision conservatrice",
          "Uniquement ordonnance d'imagerie",
        ],
        correctIndex: 0,
        skill: "documentation",
        weight: 1,
        rationale:
          "Un compte-rendu structuré horodaté + score CI-AKI + plan de bascule est exigible.",
      },
    ],
  };
}

const SKILL_KEYS = ["triageAccuracy", "safetySteps", "documentation", "communication"] as const;

export default function Simulation() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [runningSimId, setRunningSimId] = useState<string | null>(null);
  const [deleteSimId, setDeleteSimId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [filterDiff, setFilterDiff] = useState<string>("all");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("peripheral");
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
      const { data, error } = await supabase.from("rubrics").select("*");
      if (error) throw error;
      return data as { id: string; simulation_id: string; criteria: string; max_score: number; weight: number }[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("simulations").insert({
        title,
        description: description || null,
        category,
        difficulty,
        time_limit_seconds: parseInt(timeLimit) || 600,
        scenario: defaultScenario() as any,
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

  const togglePublishMutation = useMutation({
    mutationFn: async (sim: Simulation) => {
      const { error } = await supabase
        .from("simulations")
        .update({ is_published: !sim.is_published })
        .eq("id", sim.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulations"] });
      toast.success(t("simulation.publishUpdated"));
    },
    onError: () => toast.error(t("simulation.errorSaving")),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("simulations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["simulations"] });
      setDeleteSimId(null);
      toast.success(t("simulation.deleted"));
    },
    onError: () => toast.error(t("simulation.errorDeleting")),
  });

  const runsBySimId = useMemo(() => {
    const m = new Map<string, SimulationRun[]>();
    for (const r of myRuns ?? []) {
      const arr = m.get(r.simulation_id) ?? [];
      arr.push(r);
      m.set(r.simulation_id, arr);
    }
    return m;
  }, [myRuns]);

  const completedRuns = useMemo(
    () => (myRuns ?? []).filter((r) => r.completed_at && r.score != null),
    [myRuns],
  );
  const totalRuns = completedRuns.length;
  const avgScore =
    totalRuns > 0
      ? Math.round(
          completedRuns.reduce((s, r) => s + Number(r.score ?? 0), 0) / totalRuns,
        )
      : 0;

  // Real heatmap from feedback.perSkill (no fabricated offsets)
  const heatmap = useMemo(() => aggregateSkillHeatmap(completedRuns), [completedRuns]);

  const filteredSims = useMemo(() => {
    let list = simulations ?? [];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.description ?? "").toLowerCase().includes(q),
      );
    }
    if (filterCat !== "all") list = list.filter((s) => s.category === filterCat);
    if (filterDiff !== "all") list = list.filter((s) => s.difficulty === filterDiff);
    return list;
  }, [simulations, search, filterCat, filterDiff]);

  const runningSim = simulations?.find((s) => s.id === runningSimId);
  const skillColor = (score: number) =>
    score >= 80 ? "bg-success" : score >= 60 ? "bg-warning" : "bg-destructive";

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
      <SEOHead
        title={t("seo.simulation.title") as string}
        description={t("seo.simulation.description") as string}
        path="/app/simulation"
        noindex
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 flex-wrap">
            <FlaskConical className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            {t("simulation.title")}
            <ResearchPreviewBadge stage="research-preview" />
          </h1>
          <p className="text-muted-foreground mt-1">{t("simulation.subtitle")}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="self-start sm:self-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t("simulation.createCase")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{simulations?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">
                  {t("simulation.stats.available")}
                </p>
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
                <p className="text-xs text-muted-foreground">
                  {t("simulation.stats.completed")}
                </p>
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
                <p className="text-xs text-muted-foreground">
                  {t("simulation.stats.avgScore")}
                </p>
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
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("simulation.searchPlaceholder") as string}
                className="pl-9"
              />
            </div>
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("simulation.filters.allCategories")}</SelectItem>
                <SelectItem value="coronary">{t("simulation.categories.coronary")}</SelectItem>
                <SelectItem value="peripheral">{t("simulation.categories.peripheral")}</SelectItem>
                <SelectItem value="renal">{t("simulation.categories.renal")}</SelectItem>
                <SelectItem value="carotid">{t("simulation.categories.carotid")}</SelectItem>
                <SelectItem value="bio-contrast">{t("simulation.categories.bioContrast")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDiff} onValueChange={setFilterDiff}>
              <SelectTrigger className="sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("simulation.filters.allDifficulties")}</SelectItem>
                <SelectItem value="beginner">{t("simulation.difficulty.beginner")}</SelectItem>
                <SelectItem value="intermediate">{t("simulation.difficulty.intermediate")}</SelectItem>
                <SelectItem value="advanced">{t("simulation.difficulty.advanced")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          {!isLoading && filteredSims.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FlaskConical className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">{t("simulation.empty")}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("simulation.createCase")}
                </Button>
              </CardContent>
            </Card>
          )}
          {filteredSims.map((sim) => {
            const runs = runsBySimId.get(sim.id) ?? [];
            const bestScore =
              runs.length > 0
                ? Math.max(
                    ...runs.filter((r) => r.score != null).map((r) => Number(r.score!)),
                  )
                : null;
            const audit = auditScenario({
              steps: Array.isArray(sim.scenario?.steps) ? sim.scenario.steps : [],
            });
            const isOwner = sim.created_by === user?.id;
            return (
              <Card key={sim.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FlaskConical className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{sim.title}</h3>
                      {sim.description && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                          {sim.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {sim.category}
                        </Badge>
                        {sim.time_limit_seconds && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Timer className="h-3 w-3" />{" "}
                            {Math.round(sim.time_limit_seconds / 60)} min
                          </span>
                        )}
                        <Badge
                          variant="outline"
                          className={`text-xs ${diffColor[sim.difficulty] ?? ""}`}
                        >
                          {t(`simulation.difficulty.${sim.difficulty}`) || sim.difficulty}
                        </Badge>
                        {bestScore != null && (
                          <Badge variant="secondary" className="text-xs">
                            <Trophy className="h-3 w-3 mr-1" /> {bestScore}%
                          </Badge>
                        )}
                        {sim.is_published ? (
                          <Badge variant="outline" className="text-xs border-success/50 text-success">
                            <Eye className="h-3 w-3 mr-1" />
                            {t("simulation.published")}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            <EyeOff className="h-3 w-3 mr-1" />
                            {t("simulation.draft")}
                          </Badge>
                        )}
                        {!audit.ok && (
                          <Badge
                            variant="outline"
                            className="text-xs border-warning/50 text-warning"
                            title={t("simulation.auditDesc") as string}
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {t("simulation.incomplete")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    {isOwner && (
                      <>
                        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Switch
                            checked={sim.is_published}
                            onCheckedChange={() => togglePublishMutation.mutate(sim)}
                            aria-label={t("simulation.publishToggle") as string}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteSimId(sim.id)}
                          aria-label={t("common.delete") as string}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                    <Button size="sm" onClick={() => setRunningSimId(sim.id)}>
                      <Play className="h-3.5 w-3.5 mr-1" />
                      {runs.length > 0 ? t("simulation.retry") : t("common.start")}
                    </Button>
                  </div>
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
                <p className="text-center text-muted-foreground py-8">
                  {t("simulation.noRuns")}
                </p>
              ) : (
                <div className="space-y-3">
                  {completedRuns.slice(0, 20).map((run) => {
                    const sim = simulations?.find((s) => s.id === run.simulation_id);
                    return (
                      <div
                        key={run.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium text-sm">{sim?.title ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(run.completed_at!).toLocaleDateString()} ·{" "}
                            {run.duration_seconds
                              ? `${Math.round(run.duration_seconds / 60)} min`
                              : "—"}
                          </p>
                        </div>
                        <Badge
                          variant={Number(run.score!) >= 70 ? "default" : "secondary"}
                          className="text-sm"
                        >
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
                <p className="text-center text-muted-foreground py-8">
                  {t("simulation.noRuns")}
                </p>
              ) : (
                SKILL_KEYS.map((k) => {
                  const score = heatmap[k] ?? 0;
                  return (
                    <div key={k} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {t(`simulation.skills.${k}`)}
                        </span>
                        <span className="text-sm font-bold">{score}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${skillColor(score)} transition-all`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })
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
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("simulation.placeholders.title") as string}
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t("simulation.fields.description")}</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("simulation.placeholders.description") as string}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t("simulation.fields.category")}</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coronary">{t("simulation.categories.coronary")}</SelectItem>
                    <SelectItem value="peripheral">{t("simulation.categories.peripheral")}</SelectItem>
                    <SelectItem value="renal">{t("simulation.categories.renal")}</SelectItem>
                    <SelectItem value="carotid">{t("simulation.categories.carotid")}</SelectItem>
                    <SelectItem value="bio-contrast">{t("simulation.categories.bioContrast")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">{t("simulation.fields.difficulty")}</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
              <Input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("simulation.templateNote")}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!title || createMutation.isPending}
            >
              {createMutation.isPending ? t("common.loading") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteSimId} onOpenChange={(o) => !o && setDeleteSimId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("simulation.deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("simulation.deleteDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSimId && deleteMutation.mutate(deleteSimId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
