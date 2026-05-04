import { useState, useEffect, useRef, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FlaskConical,
  Trophy,
  XCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  scoreScenario,
  auditScenario,
  type SimScenario,
  type SimStep,
  type ScoringResult,
} from "@/lib/simulation/scoring";

interface SimulationProps {
  simulation: {
    id: string;
    title: string;
    description: string | null;
    scenario: any;
    time_limit_seconds: number | null;
    difficulty: string;
    category: string;
  };
  rubrics: { id: string; criteria: string; max_score: number; weight: number }[];
  onComplete: () => void;
  onCancel: () => void;
}

export default function SimulationRunner({
  simulation,
  rubrics,
  onComplete,
  onCancel,
}: SimulationProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const scenario: SimScenario = useMemo(
    () => ({ steps: Array.isArray(simulation.scenario?.steps) ? simulation.scenario.steps : [] }),
    [simulation.scenario],
  );
  const steps: SimStep[] = scenario.steps;

  const audit = useMemo(() => auditScenario(scenario), [scenario]);

  const [currentStep, setCurrentStep] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (finished) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [finished]);

  // Auto-submit on time-up
  useEffect(() => {
    if (
      simulation.time_limit_seconds &&
      elapsed >= simulation.time_limit_seconds &&
      !finished
    ) {
      finishSimulation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed]);

  const saveMutation = useMutation({
    mutationFn: async (data: { result: ScoringResult; duration: number }) => {
      // Apply rubric weights to translate the global score into per-rubric scores.
      const totalWeight = rubrics.reduce((s, r) => s + (Number(r.weight) || 1), 0) || 1;
      const rubricScores = rubrics.map((r) => {
        const w = (Number(r.weight) || 1) / totalWeight;
        return {
          criteria: r.criteria,
          score: Math.round(((data.result.total / 100) * Number(r.max_score)) * 1) ,
          max_score: Number(r.max_score),
          weight: w,
        };
      });
      const { error } = await supabase.from("simulation_runs").insert({
        simulation_id: simulation.id,
        user_id: user!.id,
        score: data.result.total,
        decisions: decisions as any,
        duration_seconds: data.duration,
        completed_at: new Date().toISOString(),
        feedback: {
          perStep: data.result.perStep,
          perSkill: data.result.perSkill,
          rubrics: rubricScores,
        } as any,
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success(t("simulation.runSaved")),
    onError: () => toast.error(t("simulation.errorSaving")),
  });

  function selectOption(stepId: string, optionIdx: number) {
    setDecisions((prev) => ({ ...prev, [stepId]: optionIdx }));
  }

  function finishSimulation() {
    const r = scoreScenario(scenario, decisions);
    setResult(r);
    setFinished(true);
    const duration = Math.floor((Date.now() - startTime.current) / 1000);
    saveMutation.mutate({ result: r, duration });
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const step = steps[currentStep];
  const progress =
    steps.length > 0 ? ((currentStep + (finished ? 1 : 0)) / steps.length) * 100 : 0;
  const timeLimit = simulation.time_limit_seconds;
  const timeRemaining = timeLimit ? Math.max(0, timeLimit - elapsed) : null;

  // ── Result screen ────────────────────────────────────────────────────────
  if (finished && result) {
    const passed = result.total >= 70;
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {passed ? (
                <Trophy className="h-16 w-16 text-warning mx-auto" />
              ) : (
                <FlaskConical className="h-16 w-16 text-muted-foreground mx-auto" />
              )}
            </div>
            <CardTitle className="text-2xl">{t("simulation.results.title")}</CardTitle>
            <p className="text-muted-foreground">{simulation.title}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-4xl sm:text-5xl font-bold font-mono">{result.total}%</p>
              <p className="text-sm text-muted-foreground mt-1">
                {passed
                  ? t("simulation.results.passed")
                  : t("simulation.results.needsWork")}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-muted">
                <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="font-mono text-sm">{formatTime(elapsed)}</p>
                <p className="text-xs text-muted-foreground">
                  {t("simulation.results.duration")}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-success" />
                <p className="font-mono text-sm">
                  {result.correctCount}/{result.totalSteps}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("simulation.results.correct")}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <Info className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="font-mono text-sm">
                  {Object.keys(decisions).length}/{steps.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("simulation.results.answered")}
                </p>
              </div>
            </div>

            {/* Per-step review with rationale */}
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("simulation.results.review")}</p>
              {steps.map((s, i) => {
                const r = result.perStep.find((p) => p.id === s.id);
                const ok = r?.correct;
                return (
                  <div
                    key={s.id}
                    className="p-3 rounded-lg border bg-card space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">
                        {i + 1}. {s.prompt}
                      </p>
                      {r?.expected != null ? (
                        ok ? (
                          <Badge variant="default" className="shrink-0">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {t("simulation.results.ok")}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="shrink-0">
                            <XCircle className="h-3 w-3 mr-1" />
                            {t("simulation.results.ko")}
                          </Badge>
                        )
                      ) : (
                        <Badge variant="outline" className="shrink-0">
                          {t("simulation.results.unscored")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("simulation.results.yourAnswer")}:{" "}
                      <span className="font-medium text-foreground">
                        {r?.chosen != null ? s.options[r.chosen] : "—"}
                      </span>
                    </p>
                    {r?.expected != null && !ok && (
                      <p className="text-xs text-muted-foreground">
                        {t("simulation.results.expected")}:{" "}
                        <span className="font-medium text-success">
                          {s.options[r.expected]}
                        </span>
                      </p>
                    )}
                    {s.rationale && (
                      <p className="text-xs text-muted-foreground italic">
                        {s.rationale}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Rubric breakdown */}
            {rubrics.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {t("simulation.results.rubrics")}
                </p>
                {rubrics.map((r) => {
                  const totalWeight =
                    rubrics.reduce((s, x) => s + (Number(x.weight) || 1), 0) || 1;
                  const w = (Number(r.weight) || 1) / totalWeight;
                  const sc = Math.round(
                    (result.total / 100) * Number(r.max_score),
                  );
                  return (
                    <div
                      key={r.id}
                      className="flex justify-between text-sm p-2 rounded bg-muted/50"
                    >
                      <span>
                        {r.criteria}{" "}
                        <span className="text-xs text-muted-foreground">
                          (×{(w * 100).toFixed(0)}%)
                        </span>
                      </span>
                      <span className="font-mono">
                        {sc}/{Number(r.max_score)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onCancel}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("simulation.backToList")}
              </Button>
              <Button className="flex-1" onClick={onComplete}>
                {t("common.close")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!step) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground">{t("simulation.noSteps")}</p>
        <Button variant="outline" className="mt-4" onClick={onCancel}>
          {t("common.back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">{t("simulation.backToList")}</span>
        </Button>
        <div className="flex items-center gap-2 sm:gap-3">
          {timeRemaining != null && (
            <Badge
              variant={timeRemaining < 60 ? "destructive" : "secondary"}
              className="font-mono"
            >
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(timeRemaining)}
            </Badge>
          )}
          <Badge variant="outline" className="font-mono">
            {currentStep + 1}/{steps.length}
          </Badge>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Audit warning when scenario is incomplete */}
      {!audit.ok && currentStep === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t("simulation.auditTitle")}</AlertTitle>
          <AlertDescription>{t("simulation.auditDesc")}</AlertDescription>
        </Alert>
      )}

      {/* Step Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{simulation.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("simulation.step")} {currentStep + 1}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base">{step.prompt}</p>
          <div className="space-y-2">
            {step.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => selectOption(step.id, idx)}
                className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-colors active:scale-[0.99] ${
                  decisions[step.id] === idx
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border hover:border-primary/40 text-foreground"
                }`}
              >
                <span className="font-mono text-xs text-muted-foreground mr-2">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {opt}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          disabled={currentStep === 0}
          onClick={() => setCurrentStep((c) => c - 1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t("common.back")}
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button
            disabled={decisions[step.id] == null}
            onClick={() => setCurrentStep((c) => c + 1)}
          >
            {t("common.next")}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            disabled={decisions[step.id] == null}
            onClick={finishSimulation}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            {t("simulation.finish")}
          </Button>
        )}
      </div>
    </div>
  );
}
