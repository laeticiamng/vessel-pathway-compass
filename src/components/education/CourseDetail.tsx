import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, BookOpen, CheckCircle2, HelpCircle, Plus, Trash2, GripVertical,
} from "lucide-react";
import { toast } from "sonner";

interface CourseDetailProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    track: string;
    difficulty: string;
    duration_hours: number | null;
    created_by: string;
  };
  modules: { id: string; title: string; content: string | null; sort_order: number; module_type: string }[];
  quizzes: { id: string; module_id: string; title: string; questions: any; passing_score: number }[];
  attempts: { id: string; quiz_id: string; score: number; passed: boolean; completed_at: string }[];
  onBack: () => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export default function CourseDetail({ course, modules, quizzes, attempts, onBack }: CourseDetailProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Quiz taking state
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  // Module creation dialog
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleContent, setModuleContent] = useState("");
  const [moduleType, setModuleType] = useState("lesson");

  // Quiz creation dialog
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [quizModuleId, setQuizModuleId] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [quizPassingScore, setQuizPassingScore] = useState("70");
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    { question: "", options: ["", "", "", ""], correctIndex: 0 },
  ]);

  const isAuthor = user?.id === course.created_by;

  const activeQuiz = quizzes.find((q) => q.id === activeQuizId);
  const questions: QuizQuestion[] =
    Array.isArray(activeQuiz?.questions) ? activeQuiz!.questions : [];

  // Submit quiz attempt
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

  // Create module
  const createModuleMutation = useMutation({
    mutationFn: async () => {
      const nextOrder = modules.length > 0 ? Math.max(...modules.map((m) => m.sort_order)) + 1 : 0;
      const { error } = await supabase.from("modules").insert({
        course_id: course.id,
        title: moduleTitle.trim(),
        content: moduleContent.trim() || null,
        module_type: moduleType,
        sort_order: nextOrder,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-modules"] });
      setModuleDialogOpen(false);
      setModuleTitle("");
      setModuleContent("");
      setModuleType("lesson");
      toast.success(t("education.modules.created"));
    },
    onError: () => toast.error(t("education.modules.errorCreating")),
  });

  // Delete module
  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      // Delete quizzes for this module first
      await supabase.from("quizzes").delete().eq("module_id", moduleId);
      const { error } = await supabase.from("modules").delete().eq("id", moduleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-modules"] });
      queryClient.invalidateQueries({ queryKey: ["all-quizzes"] });
      toast.success(t("education.modules.deleted"));
    },
  });

  // Create quiz
  const createQuizMutation = useMutation({
    mutationFn: async () => {
      const validQuestions = quizQuestions.filter(
        (q) => q.question.trim() && q.options.every((o) => o.trim())
      );
      if (validQuestions.length === 0) throw new Error("No valid questions");
      const { error } = await supabase.from("quizzes").insert({
        module_id: quizModuleId,
        title: quizTitle.trim(),
        passing_score: parseInt(quizPassingScore) || 70,
        questions: validQuestions as any,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-quizzes"] });
      setQuizDialogOpen(false);
      resetQuizForm();
      toast.success(t("education.quizBuilder.created"));
    },
    onError: () => toast.error(t("education.quizBuilder.errorCreating")),
  });

  // Delete quiz
  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const { error } = await supabase.from("quizzes").delete().eq("id", quizId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-quizzes"] });
      toast.success(t("education.quizBuilder.deleted"));
    },
  });

  function resetQuizForm() {
    setQuizTitle("");
    setQuizModuleId("");
    setQuizPassingScore("70");
    setQuizQuestions([{ question: "", options: ["", "", "", ""], correctIndex: 0 }]);
  }

  function addQuestion() {
    setQuizQuestions((prev) => [...prev, { question: "", options: ["", "", "", ""], correctIndex: 0 }]);
  }

  function removeQuestion(idx: number) {
    setQuizQuestions((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateQuestion(idx: number, field: string, value: any) {
    setQuizQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );
  }

  function updateOption(qIdx: number, oIdx: number, value: string) {
    setQuizQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.map((o, j) => (j === oIdx ? value : o)) } : q
      )
    );
  }

  // ── Quiz taking mode ──
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

  // ── Build attempt map ──
  const bestAttempts = new Map<string, { score: number; passed: boolean }>();
  for (const a of attempts) {
    const existing = bestAttempts.get(a.quiz_id);
    if (!existing || a.score > existing.score) {
      bestAttempts.set(a.quiz_id, { score: a.score, passed: a.passed });
    }
  }

  const passedCount = quizzes.filter((q) => bestAttempts.get(q.id)?.passed).length;
  const progress = quizzes.length > 0 ? Math.round((passedCount / quizzes.length) * 100) : 0;

  // Modules without a quiz yet (for quiz creation)
  const modulesWithoutQuiz = modules.filter((m) => !quizzes.some((q) => q.module_id === m.id));

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

      {/* Author actions */}
      {isAuthor && (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setModuleDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t("education.modules.add")}
          </Button>
          {modules.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (modulesWithoutQuiz.length > 0) {
                  setQuizModuleId(modulesWithoutQuiz[0].id);
                } else if (modules.length > 0) {
                  setQuizModuleId(modules[0].id);
                }
                setQuizDialogOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              {t("education.quizBuilder.add")}
            </Button>
          )}
        </div>
      )}

      {/* Modules list */}
      <div className="space-y-3">
        {modules.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <BookOpen className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-muted-foreground">{t("education.noModules")}</p>
              {isAuthor && (
                <Button variant="outline" className="mt-3" size="sm" onClick={() => setModuleDialogOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  {t("education.modules.add")}
                </Button>
              )}
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
                        {quiz && (
                          <div className="mt-2 flex items-center gap-2">
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{quiz.title}</span>
                            {isAuthor && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-muted-foreground hover:text-destructive"
                                onClick={(e) => { e.stopPropagation(); deleteQuizMutation.mutate(quiz.id); }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {attempt?.passed && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      {attempt && !attempt.passed && (
                        <Badge variant="secondary" className="text-xs">{attempt.score}%</Badge>
                      )}
                      {quiz && (
                        <Button size="sm" variant={attempt?.passed ? "outline" : "default"} onClick={() => { setActiveQuizId(quiz.id); setAnswers({}); }}>
                          <HelpCircle className="h-3.5 w-3.5 mr-1" />
                          {attempt ? t("education.quiz.retry") : t("education.quiz.take")}
                        </Button>
                      )}
                      {isAuthor && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => deleteModuleMutation.mutate(mod.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* ── Add Module Dialog ── */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("education.modules.add")}</DialogTitle>
            <DialogDescription>{t("education.modules.addDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("education.fields.title")}</Label>
              <Input
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder={t("education.modules.titlePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("education.modules.type")}</Label>
              <Select value={moduleType} onValueChange={setModuleType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lesson">{t("education.modules.types.lesson")}</SelectItem>
                  <SelectItem value="video">{t("education.modules.types.video")}</SelectItem>
                  <SelectItem value="case_study">{t("education.modules.types.caseStudy")}</SelectItem>
                  <SelectItem value="practical">{t("education.modules.types.practical")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("education.modules.content")}</Label>
              <Textarea
                value={moduleContent}
                onChange={(e) => setModuleContent(e.target.value)}
                placeholder={t("education.modules.contentPlaceholder")}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button
              onClick={() => createModuleMutation.mutate()}
              disabled={!moduleTitle.trim() || createModuleMutation.isPending}
            >
              {createModuleMutation.isPending ? t("common.loading") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Quiz Dialog ── */}
      <Dialog open={quizDialogOpen} onOpenChange={(open) => { setQuizDialogOpen(open); if (!open) resetQuizForm(); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("education.quizBuilder.add")}</DialogTitle>
            <DialogDescription>{t("education.quizBuilder.addDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("education.fields.title")}</Label>
                <Input
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder={t("education.quizBuilder.titlePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("education.quizBuilder.module")}</Label>
                <Select value={quizModuleId} onValueChange={setQuizModuleId}>
                  <SelectTrigger><SelectValue placeholder={t("education.quizBuilder.selectModule")} /></SelectTrigger>
                  <SelectContent>
                    {modules.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("education.quiz.passingScore")} (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={quizPassingScore}
                onChange={(e) => setQuizPassingScore(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">{t("education.quizBuilder.questions")}</Label>
                <Button variant="outline" size="sm" onClick={addQuestion}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  {t("education.quizBuilder.addQuestion")}
                </Button>
              </div>

              {quizQuestions.map((q, qi) => (
                <Card key={qi} className="border-dashed">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        {`${t("education.quizBuilder.question")} ${qi + 1}`}
                      </span>
                      {quizQuestions.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeQuestion(qi)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder={t("education.quizBuilder.questionPlaceholder")}
                      value={q.question}
                      onChange={(e) => updateQuestion(qi, "question", e.target.value)}
                    />
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuestion(qi, "correctIndex", oi)}
                            className={`h-6 w-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                              q.correctIndex === oi
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/30 hover:border-primary/50"
                            }`}
                          >
                            {q.correctIndex === oi && <CheckCircle2 className="h-3.5 w-3.5" />}
                          </button>
                          <Input
                            placeholder={`${t("education.quizBuilder.option")} ${String.fromCharCode(65 + oi)}`}
                            value={opt}
                            onChange={(e) => updateOption(qi, oi, e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground">{t("education.quizBuilder.selectCorrect")}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setQuizDialogOpen(false); resetQuizForm(); }}>{t("common.cancel")}</Button>
            <Button
              onClick={() => createQuizMutation.mutate()}
              disabled={
                !quizTitle.trim() ||
                !quizModuleId ||
                quizQuestions.every((q) => !q.question.trim()) ||
                createQuizMutation.isPending
              }
            >
              {createQuizMutation.isPending ? t("common.loading") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
