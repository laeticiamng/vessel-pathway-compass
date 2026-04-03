import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Copy,
  Download,
  Loader2,
  Shield,
  Info,
  History,
  Clock,
  Leaf,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "@/i18n/context";
import { useSubscription } from "@/hooks/useSubscription";
import { UsageLimitBanner } from "@/components/UsageLimitBanner";
import { SEOHead } from "@/components/SEOHead";

interface AiOutput {
  id: string;
  input_summary: Record<string, string>;
  output_text: string;
  model_version: string;
  user_signoff: boolean;
  signed_off_at: string | null;
  created_at: string;
}

const FREE_DAILY_LIMIT = 3;

export default function ProcedurePlanner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [currentOutputId, setCurrentOutputId] = useState<string | null>(null);
  const [history, setHistory] = useState<AiOutput[]>([]);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { subscribed } = useSubscription();

  const todayCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return history.filter((h) => h.created_at.slice(0, 10) === today).length;
  }, [history]);

  const [preferBioContrast, setPreferBioContrast] = useState(false);

  const [formData, setFormData] = useState({
    clinicalPresentation: "",
    renalFunction: "",
    plannedProcedure: "",
    priorImaging: "",
    labs: "",
    medications: "",
    comorbidities: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadHistory();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadHistory();
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadHistory = async () => {
    const { data } = await supabase
      .from("ai_outputs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setHistory(data as AiOutput[]);
  };

  const saveOutput = async (outputText: string) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("ai_outputs")
      .insert({
        user_id: user.id,
        input_summary: formData as any,
        output_text: outputText,
        model_version: "google/gemini-3-flash-preview",
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to save output:", error);
      return null;
    }

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "ai_report_generated",
      entity_type: "ai_output",
      entity_id: data.id,
      details: { model: "google/gemini-3-flash-preview", input_fields: Object.keys(formData).filter(k => (formData as any)[k]) },
    });

    setCurrentOutputId(data.id);
    loadHistory();
    return data.id;
  };

  const handleSignOff = async () => {
    if (!currentOutputId || !user) return;
    const { error } = await supabase
      .from("ai_outputs")
      .update({ user_signoff: true, signed_off_at: new Date().toISOString() })
      .eq("id", currentOutputId);

    if (error) {
      toast({ title: t("auth.error"), description: t("procedurePlanner.errors.signOffFailed"), variant: "destructive" });
      return;
    }

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: "ai_report_signed_off",
      entity_type: "ai_output",
      entity_id: currentOutputId,
      details: { signed_off_at: new Date().toISOString() },
    });

    toast({ title: t("procedurePlanner.output.signedOff"), description: t("procedurePlanner.output.signedOffDesc") });
    loadHistory();
  };

  const handleGenerate = async () => {
    if (!user) {
      toast({ title: t("auth.authRequired"), description: t("auth.authRequiredDesc"), variant: "destructive" });
      navigate("/auth");
      return;
    }

    if (!subscribed && todayCount >= FREE_DAILY_LIMIT) {
      toast({ title: t("premiumGate.title"), description: (t("premiumGate.limitReached") as string).replace("{{feature}}", t("premiumGate.features.aiReports") as string), variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult(null);
    setCurrentOutputId(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-clinical-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ clinicalData: { ...formData, preferBioContrast } }),
        }
      );

      if (response.status === 429) {
        toast({ title: t("procedurePlanner.errors.rateLimited"), description: t("procedurePlanner.errors.rateLimitedDesc"), variant: "destructive" });
        return;
      }
      if (response.status === 402) {
        toast({ title: t("procedurePlanner.errors.creditsRequired"), description: t("procedurePlanner.errors.creditsRequiredDesc"), variant: "destructive" });
        return;
      }
      if (!response.ok || !response.body) throw new Error("Failed to generate plan");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setResult(fullText);
            }
          } catch {}
        }
      }

      if (fullText) {
        await saveOutput(fullText);
      }
    } catch (error: any) {
      toast({ title: t("auth.error"), description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadPastReport = (output: AiOutput) => {
    setResult(output.output_text);
    setCurrentOutputId(output.id);
    if (output.input_summary) {
      setFormData({
        clinicalPresentation: output.input_summary.clinicalPresentation || output.input_summary.symptoms || "",
        renalFunction: output.input_summary.renalFunction || "",
        plannedProcedure: output.input_summary.plannedProcedure || "",
        priorImaging: output.input_summary.priorImaging || output.input_summary.imaging || "",
        labs: output.input_summary.labs || "",
        medications: output.input_summary.medications || "",
        comorbidities: output.input_summary.comorbidities || output.input_summary.riskFactors || "",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <SEOHead title={t("seo.procedurePlanner.title") as string} description={t("seo.procedurePlanner.description") as string} path="/app/procedure-planner" noindex />
      <UsageLimitBanner current={todayCount} limit={FREE_DAILY_LIMIT} featureKey="aiReports" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            {t("procedurePlanner.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("procedurePlanner.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="outline" className="flex items-center gap-1.5">
            <Shield className="h-3 w-3" />
            {t("procedurePlanner.badge")}
          </Badge>
          <Badge variant="secondary" className="text-xs">Research Prototype</Badge>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">{t("procedurePlanner.disclaimer.title")}</p>
          <p className="text-muted-foreground mt-1">{t("procedurePlanner.disclaimer.body")}</p>
        </div>
      </div>

      {!user && (
        <div className="p-4 rounded-xl bg-info/10 border border-info/30 text-center">
          <p className="text-sm font-medium">{t("procedurePlanner.signInPrompt")}</p>
          <Button size="sm" className="mt-2" onClick={() => navigate("/auth")}>{t("common.signIn")}</Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t("procedurePlanner.intake.title")}</CardTitle>
            <CardDescription>{t("procedurePlanner.intake.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {([
              ["clinicalPresentation", "clinicalPresentation", "clinicalPresentationPlaceholder", true],
              ["renalFunction", "renalFunction", "renalFunctionPlaceholder", false],
              ["plannedProcedure", "plannedProcedure", "plannedProcedurePlaceholder", false],
              ["priorImaging", "priorImaging", "priorImagingPlaceholder", true],
              ["labs", "labs", "labsPlaceholder", false],
              ["medications", "medications", "medicationsPlaceholder", false],
              ["comorbidities", "comorbidities", "comorbiditiesPlaceholder", true],
            ] as const).map(([field, labelKey, placeholderKey, isTextarea]) => (
              <div key={field} className="space-y-2">
                <Label>{t(`procedurePlanner.intake.${labelKey}`)}</Label>
                {isTextarea ? (
                  <Textarea
                    placeholder={t(`procedurePlanner.intake.${placeholderKey}`)}
                    value={(formData as any)[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    rows={field === "clinicalPresentation" ? 3 : 2}
                  />
                ) : (
                  <Input
                    placeholder={t(`procedurePlanner.intake.${placeholderKey}`)}
                    value={(formData as any)[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  />
                )}
              </div>
            ))}
            <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-emerald-500" />
                <Label htmlFor="prefer-bio" className="text-sm cursor-pointer">
                  {t("procedurePlanner.preferBioContrast")}
                </Label>
              </div>
              <Switch
                id="prefer-bio"
                checked={preferBioContrast}
                onCheckedChange={setPreferBioContrast}
              />
            </div>
            {preferBioContrast && (
              <div className="p-2 rounded-lg bg-warning/10 border border-warning/20 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3 inline mr-1 text-warning" />
                {t("procedurePlanner.bbcaDisclaimer")}
              </div>
            )}
            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t("procedurePlanner.generating")}
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  {t("procedurePlanner.generate")}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t("procedurePlanner.output.title")}</CardTitle>
            <CardDescription>{t("procedurePlanner.output.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <Tabs defaultValue="plan">
                  <TabsList className="w-full">
                    <TabsTrigger value="plan" className="flex-1">{t("procedurePlanner.output.plan")}</TabsTrigger>
                    <TabsTrigger value="evidence" className="flex-1">{t("procedurePlanner.output.evidence")}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="plan" className="mt-4">
                    <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap text-sm leading-relaxed bg-muted/50 p-4 rounded-lg max-h-[500px] overflow-auto">
                      {result}
                    </div>
                  </TabsContent>
                  <TabsContent value="evidence" className="mt-4">
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Info className="h-4 w-4 text-info" />
                          <span className="text-sm font-medium">{t("procedurePlanner.output.dataUsed")}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t("procedurePlanner.output.dataUsedDesc")}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-warning" />
                          <span className="text-sm font-medium">{t("procedurePlanner.output.uncertainty")}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t("procedurePlanner.output.uncertaintyDesc")}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="h-4 w-4 text-destructive" />
                          <span className="text-sm font-medium">{t("procedurePlanner.output.clinicianRequired")}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t("procedurePlanner.output.clinicianRequiredDesc")}</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(result);
                      toast({ title: t("procedurePlanner.output.copied"), description: t("procedurePlanner.output.copiedDesc") });
                    }}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    {t("procedurePlanner.output.copyEHR")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast({ title: t("common.comingSoon"), description: t("procedurePlanner.output.exportPDFSoon") })}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    {t("procedurePlanner.output.exportPDF")}
                  </Button>
                  {user && (
                    <Button size="sm" className="ml-auto" onClick={handleSignOff}>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      {t("procedurePlanner.output.confirmSign")}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Brain className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm">{t("procedurePlanner.output.empty")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              {t("procedurePlanner.history.title")}
            </CardTitle>
            <CardDescription>{t("procedurePlanner.history.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <div className="space-y-3 max-h-[550px] overflow-auto">
                {history.map((output) => (
                  <button
                    key={output.id}
                    onClick={() => loadPastReport(output)}
                    className={`w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors ${
                      currentOutputId === output.id ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-muted-foreground">
                        {output.id.slice(0, 8)}
                      </span>
                      {output.user_signoff ? (
                        <Badge variant="default" className="text-[10px] h-5">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {t("procedurePlanner.history.signed")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] h-5">{t("procedurePlanner.history.pending")}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {output.output_text.slice(0, 120)}...
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(output.created_at).toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <FileText className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">{t("procedurePlanner.history.empty")}</p>
                <p className="text-xs">{t("procedurePlanner.history.emptyDesc")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
