import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ClipboardList, TrendingUp, CheckCircle2, ChevronRight } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

// VascuQoL-6 validated questionnaire items (keys only — labels come from validated instrument, kept in English as clinical standard)
const VASCUQOL6_ITEMS = [
  { id: "vq1", text: "Pain in the affected leg during rest", domain: "Pain" },
  { id: "vq2", text: "Walking ability on flat ground", domain: "Activity" },
  { id: "vq3", text: "Feeling anxious about your leg condition", domain: "Emotional" },
  { id: "vq4", text: "Limitations in social activities due to your leg", domain: "Social" },
  { id: "vq5", text: "Overall quality of life related to your vascular condition", domain: "Symptom" },
  { id: "vq6", text: "How much does leg pain affect your daily activities", domain: "Activity" },
];

// CIVIQ-14 validated questionnaire items
const CIVIQ14_ITEMS = [
  { id: "c1", text: "Pain or discomfort in your legs when standing", domain: "Pain" },
  { id: "c2", text: "Difficulty falling asleep because of your legs", domain: "Pain" },
  { id: "c3", text: "Feeling limited in physical activities", domain: "Physical" },
  { id: "c4", text: "Difficulty standing for long periods", domain: "Physical" },
  { id: "c5", text: "Difficulty climbing stairs", domain: "Physical" },
  { id: "c6", text: "Difficulty crouching or kneeling", domain: "Physical" },
  { id: "c7", text: "Difficulty walking briskly", domain: "Physical" },
  { id: "c8", text: "Feeling limited in activities with friends or family", domain: "Social" },
  { id: "c9", text: "Feeling embarrassed about showing your legs", domain: "Psychological" },
  { id: "c10", text: "Easily irritable", domain: "Psychological" },
  { id: "c11", text: "Feeling like a burden to others", domain: "Psychological" },
  { id: "c12", text: "Difficulty choosing clothes because of your legs", domain: "Psychological" },
  { id: "c13", text: "Feeling limited at work or daily activities", domain: "Social" },
  { id: "c14", text: "Impact on your overall quality of life", domain: "Social" },
];

export default function PatientOutcomes() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeQuestionnaire, setActiveQuestionnaire] = useState<"vascuqol6" | "civiq14">("vascuqol6");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const items = activeQuestionnaire === "vascuqol6" ? VASCUQOL6_ITEMS : CIVIQ14_ITEMS;

  const SCORE_OPTIONS = [
    { value: "1", label: t("patientOutcomes.scoreOptions.none") as string },
    { value: "2", label: t("patientOutcomes.scoreOptions.slightly") as string },
    { value: "3", label: t("patientOutcomes.scoreOptions.moderately") as string },
    { value: "4", label: t("patientOutcomes.scoreOptions.quiteALot") as string },
    { value: "5", label: t("patientOutcomes.scoreOptions.extremely") as string },
  ];

  // Fetch user's cases (explicit user filter)
  const { data: cases } = useQuery({
    queryKey: ["outcomes-cases", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cases")
        .select("id, title, category, patient_id")
        .eq("created_by", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch PROMs data — filter by user's cases for defense-in-depth
  const { data: proms, isLoading } = useQuery({
    queryKey: ["proms-all", user?.id],
    queryFn: async () => {
      // First get user's case IDs, then fetch proms for those cases
      const { data: userCases } = await supabase
        .from("cases")
        .select("id")
        .eq("created_by", user!.id);
      const caseIds = userCases?.map((c) => c.id) ?? [];
      if (caseIds.length === 0) return [];
      const { data, error } = await supabase
        .from("proms")
        .select("id, case_id, questionnaire_type, score, responses, completed_at")
        .in("case_id", caseIds)
        .order("completed_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Submit PROM
  const submitMutation = useMutation({
    mutationFn: async () => {
      const totalScore = Object.values(answers).reduce((sum, v) => sum + parseInt(v), 0);
      const maxScore = items.length * 5;
      const normalizedScore = Math.round((totalScore / maxScore) * 100);

      const { error } = await supabase.from("proms").insert({
        case_id: selectedCaseId,
        questionnaire_type: activeQuestionnaire,
        score: normalizedScore,
        responses: answers,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proms-all"] });
      setDialogOpen(false);
      setAnswers({});
      setCurrentStep(0);
      toast.success(t("patientOutcomes.submitSuccess") as string);
    },
    onError: () => toast.error(t("patientOutcomes.submitError") as string),
  });

  // Chart data grouped by questionnaire type
  const chartData = useMemo(() => {
    if (!proms) return { vascuqol6: [], civiq14: [] };
    const vq = proms.filter((p) => p.questionnaire_type === "vascuqol6").map((p) => ({
      date: new Date(p.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: p.score ?? 0,
      raw: p.completed_at,
    }));
    const cq = proms.filter((p) => p.questionnaire_type === "civiq14").map((p) => ({
      date: new Date(p.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: p.score ?? 0,
      raw: p.completed_at,
    }));
    return { vascuqol6: vq, civiq14: cq };
  }, [proms]);

  const stats = useMemo(() => {
    if (!proms || proms.length === 0) return { total: 0, avgScore: 0, lastWeek: 0, trend: "stable" as const };
    const total = proms.length;
    const avgScore = Math.round(proms.reduce((s, p) => s + (p.score ?? 0), 0) / total);
    const weekAgo = Date.now() - 7 * 86400000;
    const lastWeek = proms.filter((p) => new Date(p.completed_at).getTime() > weekAgo).length;
    const recent = proms.slice(-5);
    const trend = recent.length >= 2
      ? (recent[recent.length - 1].score ?? 0) > (recent[0].score ?? 0) ? "improving" as const : "declining" as const
      : "stable" as const;
    return { total, avgScore, lastWeek, trend };
  }, [proms]);

  const allAnswered = items.every((item) => answers[item.id]);
  const currentItems = items.slice(currentStep * 3, currentStep * 3 + 3);
  const totalSteps = Math.ceil(items.length / 3);

  return (
    <div className="space-y-6 max-w-6xl">
      <SEOHead title={t("seo.outcomes.title") as string} description={t("seo.outcomes.description") as string} path="/app/outcomes" noindex />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            {t("patientOutcomes.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("patientOutcomes.subtitle")}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} disabled={!cases?.length}>
          <ClipboardList className="h-4 w-4 mr-2" /> {t("patientOutcomes.newQuestionnaire")}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("patientOutcomes.totalSubmissions")}</p>
            <p className="text-3xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("patientOutcomes.avgScore")}</p>
            <p className="text-3xl font-bold mt-1">{stats.avgScore}<span className="text-sm text-muted-foreground">/100</span></p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("patientOutcomes.thisWeek")}</p>
            <p className="text-3xl font-bold mt-1">{stats.lastWeek}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("patientOutcomes.trend")}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={stats.trend === "improving" ? "default" : stats.trend === "declining" ? "destructive" : "secondary"}>
                {stats.trend === "improving" ? t("patientOutcomes.improving") : stats.trend === "declining" ? t("patientOutcomes.declining") : t("patientOutcomes.stable")}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Charts */}
      <Tabs defaultValue="vascuqol6">
        <TabsList>
          <TabsTrigger value="vascuqol6">VascuQoL-6</TabsTrigger>
          <TabsTrigger value="civiq14">CIVIQ-14</TabsTrigger>
        </TabsList>

        {(["vascuqol6", "civiq14"] as const).map((type) => (
          <TabsContent key={type} value={type} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  {type === "vascuqol6" ? "VascuQoL-6" : "CIVIQ-14"} — {t("patientOutcomes.scoreTrend")}
                </CardTitle>
                <CardDescription>
                  {type === "vascuqol6" ? t("patientOutcomes.vascuqol6Desc") : t("patientOutcomes.civiq14Desc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : chartData[type].length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p>{t("patientOutcomes.noSubmissions")}</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => { setActiveQuestionnaire(type); setDialogOpen(true); }}>
                        {t("patientOutcomes.startFirst")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData[type]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--card-foreground))" }}
                      />
                      <ReferenceLine y={50} stroke="hsl(var(--warning))" strokeDasharray="5 5" label={{ value: t("patientOutcomes.clinicalThreshold") as string, position: "insideTopRight", fontSize: 11, fill: "hsl(var(--warning))" }} />
                      <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Recent Submissions Table */}
      {proms && proms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("patientOutcomes.recentSubmissions")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("patientOutcomes.date")}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("patientOutcomes.questionnaire")}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("patientOutcomes.score")}</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("patientOutcomes.status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {proms.slice(-10).reverse().map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="p-4 text-sm">{new Date(p.completed_at).toLocaleDateString()}</td>
                      <td className="p-4"><Badge variant="secondary">{p.questionnaire_type === "vascuqol6" ? "VascuQoL-6" : "CIVIQ-14"}</Badge></td>
                      <td className="p-4">
                        <span className={`font-bold ${(p.score ?? 0) >= 70 ? "text-success" : (p.score ?? 0) >= 40 ? "text-warning" : "text-destructive"}`}>
                          {p.score}/100
                        </span>
                      </td>
                      <td className="p-4"><Badge variant="outline"><CheckCircle2 className="h-3 w-3 mr-1" /> {t("patientOutcomes.completed")}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questionnaire Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setAnswers({}); setCurrentStep(0); } }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{activeQuestionnaire === "vascuqol6" ? "VascuQoL-6" : "CIVIQ-14"} {t("patientOutcomes.questionnaire")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {currentStep === 0 && (
              <div className="space-y-2">
                <Label>{t("patientOutcomes.selectCase")}</Label>
                <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                  <SelectTrigger><SelectValue placeholder={t("patientOutcomes.chooseCase") as string} /></SelectTrigger>
                  <SelectContent>
                    {cases?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title} ({c.category})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {currentStep === 0 && (
              <div className="space-y-2">
                <Label>{t("patientOutcomes.questionnaireType")}</Label>
                <Select value={activeQuestionnaire} onValueChange={(v) => { setActiveQuestionnaire(v as "vascuqol6" | "civiq14"); setAnswers({}); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vascuqol6">VascuQoL-6 (PAD)</SelectItem>
                    <SelectItem value="civiq14">CIVIQ-14 (Venous)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t("patientOutcomes.step")} {currentStep + 1} {t("patientOutcomes.of")} {totalSteps}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }} />
              </div>
            </div>

            {currentItems.map((item) => (
              <div key={item.id} className="space-y-2 p-3 rounded-lg bg-muted/50">
                <div className="flex items-start justify-between gap-2">
                  <Label className="text-sm font-medium">{item.text}</Label>
                  <Badge variant="outline" className="text-xs shrink-0">{item.domain}</Badge>
                </div>
                <RadioGroup value={answers[item.id] || ""} onValueChange={(v) => setAnswers((prev) => ({ ...prev, [item.id]: v }))}>
                  {SCORE_OPTIONS.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`${item.id}-${opt.value}`} />
                      <Label htmlFor={`${item.id}-${opt.value}`} className="text-sm font-normal cursor-pointer">{opt.value}. {opt.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>

          <DialogFooter className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={() => setCurrentStep((s) => s - 1)}>{t("patientOutcomes.back")}</Button>
            )}
            {currentStep < totalSteps - 1 ? (
              <Button onClick={() => setCurrentStep((s) => s + 1)} disabled={!selectedCaseId || currentItems.some((item) => !answers[item.id])}>
                {t("patientOutcomes.next")} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={() => submitMutation.mutate()} disabled={!allAnswered || !selectedCaseId || submitMutation.isPending}>
                {submitMutation.isPending ? t("patientOutcomes.submitting") : t("patientOutcomes.submitQuestionnaire")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
