import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BookOpen, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { toast } from "sonner";

interface CourseDetailProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    track: string;
    difficulty: string;
    duration_hours: number | null;
  };
  modules: { id: string; title: string; content: string | null; sort_order: number; module_type: string }[];
  quizzes: { id: string; module_id: string; title: string; questions: any; passing_score: number }[];
  attempts: { id: string; quiz_id: string; score: number; passed: boolean; completed_at: string }[];
  onBack: () => void;
}

export default function CourseDetail({ course, modules, quizzes, attempts, onBack }: CourseDetailProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const activeQuiz = quizzes.find((q) => q.id === activeQuizId);
  const questions: { question: string; options: string[]; correctIndex: number }[] =
    Array.isArray(activeQuiz?.questions) ? activeQuiz!.questions : [];

  const submitMutation = useMutation({
    mutationFn: async () => {
      let correct = 0;
      for (let i = 0; i < questions.length; i++) {
        if (answers[i] === questions[i].correctIndex) correct++;
      }
      const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
      const passed = score >= (activeQuiz?.passing_score ?? 70);
      const { error } = await supabase.from("quiz_attempts").insert({
        quiz_id: activeQuiz!.id,
        user_id: user!.id,
        score,
        passed,
        answers: answers as any,
      });
      if (error) throw error;
      return { score, passed };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
      if (data.passed) {
        toast.success(`${t("education.quiz.passed")} ${data.score}%`);
      } else {
        toast.error(`${t("education.quiz.failed")} ${data.score}%`);
      }
      setActiveQuizId(null);
      setAnswers({});
    },
    onError: () => toast.error(t("education.quiz.errorSubmitting")),
  });

  // Quiz taking mode
  if (activeQuiz && questions.length > 0) {
    const allAnswered = questions.every((_, i) => answers[i] != null);
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" onClick={() => { setActiveQuizId(null); setAnswers({}); }}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t("education.quiz.backToCourse")}
        </Button>
        <h2 className="text-xl font-bold">{activeQuiz.title}</h2>
        <p className="text-sm text-muted-foreground">
          {t("education.quiz.passingScore")}: {activeQuiz.passing_score}%
        </p>
        <div className="space-y-6">
          {questions.map((q, qi) => (
            <Card key={qi}>
              <CardContent className="pt-6 space-y-3">
                <p className="font-medium">
                  <span className="text-muted-foreground mr-2">{qi + 1}.</span>
                  {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <button
                      key={oi}
                      onClick={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        answers[qi] === oi
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <span className="font-mono text-xs text-muted-foreground mr-2">
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button className="w-full" disabled={!allAnswered || submitMutation.isPending} onClick={() => submitMutation.mutate()}>
          {submitMutation.isPending ? t("common.loading") : t("education.quiz.submit")}
        </Button>
      </div>
    );
  }

  // Build attempt map: quizId -> best attempt
  const bestAttempts = new Map<string, { score: number; passed: boolean }>();
  for (const a of attempts) {
    const existing = bestAttempts.get(a.quiz_id);
    if (!existing || a.score > existing.score) {
      bestAttempts.set(a.quiz_id, { score: a.score, passed: a.passed });
    }
  }

  const passedCount = quizzes.filter((q) => bestAttempts.get(q.id)?.passed).length;
  const progress = quizzes.length > 0 ? Math.round((passedCount / quizzes.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        {t("education.backToCourses")}
      </Button>

      <div>
        <h1 className="text-2xl font-bold">{course.title}</h1>
        {course.description && <p className="text-muted-foreground mt-1">{course.description}</p>}
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="capitalize">{course.track.replace("-", " ")}</Badge>
          <Badge variant="outline" className="capitalize">{course.difficulty}</Badge>
          {course.duration_hours && <Badge variant="outline">{course.duration_hours}h</Badge>}
        </div>
      </div>

      {quizzes.length > 0 && (
        <div className="flex items-center gap-3">
          <Progress value={progress} className="flex-1" />
          <span className="text-sm font-medium">{progress}%</span>
        </div>
      )}

      <div className="space-y-3">
        {modules.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-muted-foreground">{t("education.noModules")}</p>
            </CardContent>
          </Card>
        ) : (
          modules.map((mod, idx) => {
            const quiz = quizzes.find((q) => q.module_id === mod.id);
            const attempt = quiz ? bestAttempts.get(quiz.id) : null;
            return (
              <Card key={mod.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-mono font-bold text-muted-foreground shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{mod.title}</h3>
                        <Badge variant="outline" className="text-xs mt-1 capitalize">{mod.module_type}</Badge>
                        {mod.content && (
                          <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line line-clamp-3">{mod.content}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {attempt?.passed && <CheckCircle2 className="h-5 w-5 text-success" />}
                      {attempt && !attempt.passed && (
                        <Badge variant="secondary" className="text-xs">{attempt.score}%</Badge>
                      )}
                      {quiz && (
                        <Button size="sm" variant={attempt?.passed ? "outline" : "default"} onClick={() => { setActiveQuizId(quiz.id); setAnswers({}); }}>
                          <HelpCircle className="h-3.5 w-3.5 mr-1" />
                          {attempt ? t("education.quiz.retry") : t("education.quiz.take")}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
