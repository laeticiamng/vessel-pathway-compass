import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, FlaskConical, Trophy, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Step {
  id: string;
  prompt: string;
  options: string[];
  correctIndex?: number;
}

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

export default function SimulationRunner({ simulation, rubrics, onComplete, onCancel }: SimulationProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const steps: Step[] = simulation.scenario?.steps ?? [];
  const [currentStep, setCurrentStep] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (finished) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [finished]);

  // Auto-submit if time limit exceeded
  useEffect(() => {
    if (simulation.time_limit_seconds && elapsed >= simulation.time_limit_seconds && !finished) {
      finishSimulation();
    }
  }, [elapsed]);

  const saveMutation = useMutation({
    mutationFn: async (data: { score: number; decisions: Record<string, number>; duration: number }) => {
      const { error } = await supabase.from("simulation_runs").insert({
        simulation_id: simulation.id,
        user_id: user!.id,
        score: data.score,
        decisions: data.decisions as any,
        duration_seconds: data.duration,
        completed_at: new Date().toISOString(),
        feedback: { rubrics: rubrics.map((r) => ({ criteria: r.criteria, score: Math.round((data.score / 100) * r.max_score) })) } as any,
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
    // Simple scoring: each step equally weighted, option index 0 or 3 ("all of above") = best
    const totalSteps = steps.length;
    let correct = 0;
    for (const step of steps) {
      const chosen = decisions[step.id];
      const correctIdx = step.correctIndex ?? 0;
      if (chosen === correctIdx) correct++;
    }
    const finalScore = totalSteps > 0 ? Math.round((correct / totalSteps) * 100) : 0;
    setScore(finalScore);
    setFinished(true);
    const duration = Math.floor((Date.now() - startTime.current) / 1000);
    saveMutation.mutate({ score: finalScore, decisions, duration });
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  const step = steps[currentStep];
  const progress = steps.length > 0 ? ((currentStep + (finished ? 1 : 0)) / steps.length) * 100 : 0;
  const timeLimit = simulation.time_limit_seconds;
  const timeRemaining = timeLimit ? Math.max(0, timeLimit - elapsed) : null;

  if (finished) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {score! >= 70 ? (
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
              <p className="text-5xl font-bold font-mono">{score}%</p>
              <p className="text-sm text-muted-foreground mt-1">
                {score! >= 70 ? t("simulation.results.passed") : t("simulation.results.needsWork")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-lg bg-muted">
                <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="font-mono text-sm">{formatTime(elapsed)}</p>
                <p className="text-xs text-muted-foreground">{t("simulation.results.duration")}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-success" />
                <p className="font-mono text-sm">{Object.keys(decisions).length}/{steps.length}</p>
                <p className="text-xs text-muted-foreground">{t("simulation.results.answered")}</p>
              </div>
            </div>
            {rubrics.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t("simulation.results.rubrics")}</p>
                {rubrics.map((r) => (
                  <div key={r.id} className="flex justify-between text-sm p-2 rounded bg-muted/50">
                    <span>{r.criteria}</span>
                    <span className="font-mono">{Math.round((score! / 100) * r.max_score)}/{r.max_score}</span>
                  </div>
                ))}
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
        <Button variant="outline" className="mt-4" onClick={onCancel}>{t("common.back")}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t("simulation.backToList")}
        </Button>
        <div className="flex items-center gap-3">
          {timeRemaining != null && (
            <Badge variant={timeRemaining < 60 ? "destructive" : "secondary"} className="font-mono">
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

      {/* Step Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{simulation.title}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("simulation.step")} {currentStep + 1}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base">{step.prompt}</p>
          <div className="space-y-2">
            {step.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => selectOption(step.id, idx)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  decisions[step.id] === idx
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border hover:border-primary/40 text-foreground"
                }`}
              >
                <span className="font-mono text-xs text-muted-foreground mr-2">{String.fromCharCode(65 + idx)}.</span>
                {opt}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" disabled={currentStep === 0} onClick={() => setCurrentStep((c) => c - 1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t("common.back")}
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button disabled={decisions[step.id] == null} onClick={() => setCurrentStep((c) => c + 1)}>
            {t("common.next")}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button disabled={decisions[step.id] == null} onClick={finishSimulation}>
            <CheckCircle2 className="h-4 w-4 mr-1" />
            {t("simulation.finish")}
          </Button>
        )}
      </div>
    </div>
  );
}
