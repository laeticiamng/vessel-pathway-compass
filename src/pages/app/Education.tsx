import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Award, Clock, ArrowRight, Plus, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import CourseDetail from "@/components/education/CourseDetail";

const TRACK_EMOJI: Record<string, string> = {
  "vascular-ultrasound": "🔊",
  "pad-limb": "🦵",
  "aorta": "❤️",
  "venous": "🩸",
  "thrombosis": "⚡",
};

export default function Education() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [track, setTrack] = useState("vascular-ultrasound");
  const [difficulty, setDifficulty] = useState("beginner");
  const [durationHours, setDurationHours] = useState("2");

  // Fetch courses
  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("track", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch modules for all courses to calculate progress
  const courseIds = courses?.map((c) => c.id) ?? [];
  const { data: allModules } = useQuery({
    queryKey: ["all-modules", courseIds],
    queryFn: async () => {
      if (courseIds.length === 0) return [];
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .in("course_id", courseIds)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: courseIds.length > 0,
  });

  // Fetch quizzes
  const moduleIds = allModules?.map((m) => m.id) ?? [];
  const { data: allQuizzes } = useQuery({
    queryKey: ["all-quizzes", moduleIds],
    queryFn: async () => {
      if (moduleIds.length === 0) return [];
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .in("module_id", moduleIds);
      if (error) throw error;
      return data;
    },
    enabled: moduleIds.length > 0,
  });

  // Fetch quiz attempts for progress
  const { data: myAttempts } = useQuery({
    queryKey: ["quiz-attempts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .order("completed_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Create course mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("courses").insert({
        title,
        description: description || null,
        track,
        difficulty,
        duration_hours: parseFloat(durationHours) || 2,
        created_by: user!.id,
        is_published: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setCreateOpen(false);
      setTitle("");
      setDescription("");
      toast.success(t("education.courseCreated"));
    },
    onError: () => toast.error(t("education.errorCreating")),
  });

  // Compute progress per course
  const passedQuizIds = new Set(
    (myAttempts ?? []).filter((a) => a.passed).map((a) => a.quiz_id)
  );

  function getCourseProgress(courseId: string) {
    const mods = (allModules ?? []).filter((m) => m.course_id === courseId);
    const quizzes = (allQuizzes ?? []).filter((q) =>
      mods.some((m) => m.id === q.module_id)
    );
    if (quizzes.length === 0) return { total: mods.length, completed: 0, progress: 0 };
    const passed = quizzes.filter((q) => passedQuizIds.has(q.id)).length;
    return { total: quizzes.length, completed: passed, progress: quizzes.length > 0 ? Math.round((passed / quizzes.length) * 100) : 0 };
  }

  // Group courses by track
  const trackGroups = new Map<string, typeof courses>();
  for (const c of courses ?? []) {
    const arr = trackGroups.get(c.track) ?? [];
    arr.push(c);
    trackGroups.set(c.track, arr);
  }

  // Stats
  const totalModulesCompleted = passedQuizIds.size;
  const totalBadges = Array.from(trackGroups.entries()).filter(([, cs]) => {
    return cs!.every((c) => getCourseProgress(c.id).progress === 100);
  }).length;
  const tracksInProgress = Array.from(trackGroups.entries()).filter(([, cs]) => {
    const anyProgress = cs!.some((c) => {
      const p = getCourseProgress(c.id);
      return p.completed > 0 && p.progress < 100;
    });
    return anyProgress;
  }).length;

  // If viewing a course detail
  const selectedCourse = courses?.find((c) => c.id === selectedCourseId);
  if (selectedCourse) {
    return (
      <CourseDetail
        course={selectedCourse}
        modules={(allModules ?? []).filter((m) => m.course_id === selectedCourse.id)}
        quizzes={(allQuizzes ?? []).filter((q) =>
          (allModules ?? []).some((m) => m.course_id === selectedCourse.id && m.id === q.module_id)
        )}
        attempts={(myAttempts ?? []).filter((a) =>
          (allQuizzes ?? []).some((q) =>
            (allModules ?? []).some((m) => m.course_id === selectedCourse.id && m.id === q.module_id) && q.id === a.quiz_id
          )
        )}
        onBack={() => setSelectedCourseId(null)}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            {t("education.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("education.subtitle")}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("education.createCourse")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalModulesCompleted}</p>
              <p className="text-sm text-muted-foreground">{t("education.stats.modulesCompleted")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Award className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalBadges}</p>
              <p className="text-sm text-muted-foreground">{t("education.stats.badgesEarned")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tracksInProgress}</p>
              <p className="text-sm text-muted-foreground">{t("education.stats.tracksInProgress")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{t("education.tracks")}</h2>
        {isLoading && Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
        ))}
        {!isLoading && (courses?.length ?? 0) === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground">{t("education.emptyCourses")}</p>
              <Button variant="outline" className="mt-4" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t("education.createCourse")}
              </Button>
            </CardContent>
          </Card>
        )}
        {courses?.map((course) => {
          const prog = getCourseProgress(course.id);
          const emoji = TRACK_EMOJI[course.track] ?? "📚";
          return (
            <Card key={course.id} className="hover:border-primary/30 transition-colors cursor-pointer" onClick={() => setSelectedCourseId(course.id)}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <h3 className="font-semibold">{course.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs capitalize">{course.track.replace("-", " ")}</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{course.difficulty}</Badge>
                        {course.duration_hours && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {course.duration_hours}h
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedCourseId(course.id); }}>
                    {prog.progress > 0 ? t("common.continue") : t("common.start")}
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={prog.progress} className="flex-1" />
                  <span className="text-sm font-medium w-12 text-right">{prog.progress}%</span>
                </div>
                {prog.total > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {prog.completed}/{prog.total} {t("education.quizzesPassed")}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Badges */}
      {totalBadges > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              {t("education.digitalBadges")}
            </CardTitle>
            <CardDescription>{t("education.badgesDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from(trackGroups.entries())
                .filter(([, cs]) => cs!.every((c) => getCourseProgress(c.id).progress === 100))
                .map(([trackName]) => (
                  <div key={trackName} className="flex items-center gap-4 p-4 rounded-lg border bg-success/5">
                    <div className="h-14 w-14 rounded-full bg-success/20 flex items-center justify-center text-2xl">
                      {TRACK_EMOJI[trackName] ?? "📚"}
                    </div>
                    <div>
                      <p className="font-semibold capitalize">{trackName.replace("-", " ")}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle2 className="h-3 w-3 text-success" />
                        <span className="text-xs text-success">{t("education.badges.verified")}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("education.createCourse")}</DialogTitle>
            <DialogDescription>{t("education.createCourseDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("education.fields.title")}</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("education.placeholders.title")} />
            </div>
            <div>
              <label className="text-sm font-medium">{t("education.fields.description")}</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("education.placeholders.description")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t("education.fields.track")}</label>
                <Select value={track} onValueChange={setTrack}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vascular-ultrasound">Vascular Ultrasound</SelectItem>
                    <SelectItem value="pad-limb">PAD / Limb</SelectItem>
                    <SelectItem value="aorta">Aorta</SelectItem>
                    <SelectItem value="venous">Venous</SelectItem>
                    <SelectItem value="thrombosis">Thrombosis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">{t("education.fields.difficulty")}</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">{t("education.difficulties.beginner")}</SelectItem>
                    <SelectItem value="intermediate">{t("education.difficulties.intermediate")}</SelectItem>
                    <SelectItem value="advanced">{t("education.difficulties.advanced")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t("education.fields.duration")}</label>
              <Input type="number" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} />
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
