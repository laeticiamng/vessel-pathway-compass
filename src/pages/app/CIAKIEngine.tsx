import { useState } from "react";
import { useTranslation } from "@/i18n/context";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calculator, AlertTriangle, Info, Shield, Printer, FileText, Leaf, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type RiskTier = "low" | "moderate" | "high";
type ContrastAgentType = "gbca" | "bbca" | "none";

interface CIAKIResult {
  riskTier: RiskTier;
  riskScore: number;
  strategy: string;
  details: string;
  agentType: ContrastAgentType;
  ecoImpact: {
    gadoliniumAvoided: boolean;
    nephrotoxicityRisk: "standard" | "reduced" | "none";
    environmentalNote: string;
  };
}

function calculateCIAKIRisk(params: {
  egfr: number;
  age: number;
  diabetes: boolean;
  lvef: number;
  contrastVolume: number;
  hydration: string;
  agentType: ContrastAgentType;
}): CIAKIResult {
  const { egfr, age, diabetes, lvef, contrastVolume, hydration, agentType } = params;

  let score = 0;

  // eGFR scoring (Mehran score-inspired)
  if (egfr < 20) score += 6;
  else if (egfr < 30) score += 4;
  else if (egfr < 45) score += 2;
  else if (egfr < 60) score += 1;

  // Age scoring
  if (age >= 75) score += 2;
  else if (age >= 65) score += 1;

  // Diabetes
  if (diabetes) score += 1;

  // LVEF
  if (lvef < 30) score += 3;
  else if (lvef < 40) score += 2;
  else if (lvef < 50) score += 1;

  // Contrast volume / eGFR ratio — modulated by agent type
  const ratio = contrastVolume / Math.max(egfr, 1);
  if (agentType === "none") {
    // No contrast → no nephrotoxicity contribution
  } else if (agentType === "bbca") {
    // BBCA (betalain-based) — plant-derived, no nephrotoxicity in preclinical data
    // Reduced scoring: only count extreme volumes as a minor factor
    if (ratio > 3.7) score += 1;
  } else {
    // Standard GBCA — full nephrotoxicity scoring
    if (ratio > 3.7) score += 3;
    else if (ratio > 2.0) score += 2;
    else if (ratio > 1.0) score += 1;
  }

  // Hydration protocol bonus
  if (hydration === "none") score += 1;

  let riskTier: RiskTier;
  let strategy: string;
  let details: string;

  if (score <= 3) {
    riskTier = "low";
    strategy = "standardContrast";
    details = "lowDetails";
  } else if (score <= 7) {
    riskTier = "moderate";
    strategy = agentType === "bbca" ? "bioContrast" : "ultraLowContrast";
    details = "moderateDetails";
  } else {
    riskTier = "high";
    strategy = "zeroContrast";
    details = "highDetails";
  }

  // Eco-impact assessment
  const ecoImpact = {
    gadoliniumAvoided: agentType !== "gbca",
    nephrotoxicityRisk: agentType === "none" ? "none" as const : agentType === "bbca" ? "reduced" as const : "standard" as const,
    environmentalNote: agentType === "gbca" ? "envGBCA" : agentType === "bbca" ? "envBBCA" : "envNone",
  };

  return { riskTier, riskScore: score, strategy, details, agentType, ecoImpact };
}

export default function CIAKIEngine() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [egfr, setEgfr] = useState("");
  const [saving, setSaving] = useState(false);
  const [age, setAge] = useState("");
  const [diabetes, setDiabetes] = useState(false);
  const [lvef, setLvef] = useState("");
  const [contrastVolume, setContrastVolume] = useState("");
  const [hydration, setHydration] = useState("iv_normal");
  const [agentType, setAgentType] = useState<ContrastAgentType>("gbca");
  const [result, setResult] = useState<CIAKIResult | null>(null);

  const handleCalculate = () => {
    const e = parseFloat(egfr);
    const a = parseInt(age);
    const l = parseFloat(lvef);
    const c = parseFloat(contrastVolume);
    if (!e || !a || !l || !c) return;

    setResult(calculateCIAKIRisk({
      egfr: e,
      age: a,
      diabetes,
      lvef: l,
      contrastVolume: c,
      hydration,
      agentType,
    }));
  };

  const riskColor = !result ? "" :
    result.riskTier === "low" ? "text-success" :
    result.riskTier === "moderate" ? "text-warning" :
    "text-destructive";

  const riskBadgeVariant = !result ? "secondary" as const :
    result.riskTier === "low" ? "secondary" as const :
    result.riskTier === "moderate" ? "outline" as const :
    "destructive" as const;

  return (
    <div className="space-y-6 max-w-5xl">
      <SEOHead title={t("seo.ciAkiEngine.title") as string} description={t("seo.ciAkiEngine.description") as string} path="/app/ci-aki-engine" noindex />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            {t("ciAkiEngine.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("ciAkiEngine.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="outline">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {t("ciAkiEngine.clinicalSupport")}
          </Badge>
          <Badge variant="secondary">{t("ciAkiEngine.notSubstitute")}</Badge>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">{t("ciAkiEngine.disclaimer.title")}</p>
          <p className="text-muted-foreground mt-1">{t("ciAkiEngine.disclaimer.body")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("ciAkiEngine.inputTitle")}</CardTitle>
            <CardDescription>{t("ciAkiEngine.inputDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("ciAkiEngine.fields.egfr")}</Label>
                <Input type="number" placeholder="60" value={egfr} onChange={(e) => setEgfr(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("ciAkiEngine.fields.age")}</Label>
                <Input type="number" placeholder="65" value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("ciAkiEngine.fields.lvef")}</Label>
                <Input type="number" placeholder="55" value={lvef} onChange={(e) => setLvef(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t("ciAkiEngine.fields.contrastVolume")}</Label>
                <Input type="number" placeholder="100" value={contrastVolume} onChange={(e) => setContrastVolume(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={diabetes} onCheckedChange={setDiabetes} id="diabetes" />
              <Label htmlFor="diabetes">{t("ciAkiEngine.fields.diabetes")}</Label>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Leaf className="h-3.5 w-3.5 text-emerald-500" />
                {t("ciAkiEngine.fields.agentType")}
              </Label>
              <Select value={agentType} onValueChange={(v) => setAgentType(v as ContrastAgentType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gbca">{t("ciAkiEngine.agentOptions.gbca")}</SelectItem>
                  <SelectItem value="bbca">{t("ciAkiEngine.agentOptions.bbca")}</SelectItem>
                  <SelectItem value="none">{t("ciAkiEngine.agentOptions.none")}</SelectItem>
                </SelectContent>
              </Select>
              {agentType === "bbca" && (
                <p className="text-xs text-emerald-500/80 flex items-center gap-1">
                  <Leaf className="h-3 w-3" />
                  {t("ciAkiEngine.agentOptions.bbcaNote")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("ciAkiEngine.fields.hydration")}</Label>
              <Select value={hydration} onValueChange={setHydration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="iv_normal">{t("ciAkiEngine.hydrationOptions.ivNormal")}</SelectItem>
                  <SelectItem value="iv_bicarb">{t("ciAkiEngine.hydrationOptions.ivBicarb")}</SelectItem>
                  <SelectItem value="oral">{t("ciAkiEngine.hydrationOptions.oral")}</SelectItem>
                  <SelectItem value="none">{t("ciAkiEngine.hydrationOptions.none")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleCalculate} className="w-full">
              <Calculator className="h-4 w-4 mr-2" />
              {t("ciAkiEngine.calculate")}
            </Button>
          </CardContent>
        </Card>

        {result ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t("ciAkiEngine.riskScore")}</p>
                  <p className={`text-5xl font-bold mt-2 ${riskColor}`}>{result.riskScore}</p>
                  <Badge className="mt-2" variant={riskBadgeVariant}>
                    {t(`ciAkiEngine.riskTiers.${result.riskTier}`)}
                  </Badge>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    {t("ciAkiEngine.strategyLabel")}
                  </p>
                  <p className="text-sm font-semibold">{t(`ciAkiEngine.strategies.${result.strategy}`)}</p>
                  <p className="text-xs text-muted-foreground">{t(`ciAkiEngine.strategies.${result.details}`)}</p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    {t("ciAkiEngine.contrastRatio")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("ciAkiEngine.contrastRatioValue")}: {(parseFloat(contrastVolume) / Math.max(parseFloat(egfr), 1)).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("ciAkiEngine.contrastRatioNote")}</p>
                </div>

                {result.ecoImpact.gadoliniumAvoided && (
                  <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-emerald-500" />
                      {t("ciAkiEngine.ecoImpact.title")}
                    </p>
                    <p className="text-sm text-emerald-400/90">
                      {t(`ciAkiEngine.ecoImpact.${result.ecoImpact.environmentalNote}`)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("ciAkiEngine.ecoImpact.nephroRisk")}: {t(`ciAkiEngine.ecoImpact.nephro.${result.ecoImpact.nephrotoxicityRisk}`)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-3.5 w-3.5 mr-1" />
                {t("ciAkiEngine.printSummary")}
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-3.5 w-3.5 mr-1" />
                {t("ciAkiEngine.auditTrail")}
              </Button>
              <Button
                size="sm"
                disabled={saving || !user}
                onClick={async () => {
                  if (!user || !result) return;
                  setSaving(true);
                  try {
                    // We need a case_id; pick the user's most recent case
                    const { data: latestCase } = await supabase
                      .from("cases")
                      .select("id")
                      .eq("created_by", user.id)
                      .order("created_at", { ascending: false })
                      .limit(1)
                      .single();
                    if (!latestCase) {
                      toast.error(t("ciAkiEngine.noCaseError") || "Create a patient case first");
                      return;
                    }
                    const cv = parseFloat(contrastVolume) || 0;
                    const gadoAvoided = result.agentType !== "gbca" ? cv * 0.5 : 0;
                    const { error } = await supabase.from("eco_metrics").insert({
                      case_id: latestCase.id,
                      created_by: user.id,
                      contrast_agent_type: result.agentType === "gbca" ? "gadolinium" : result.agentType === "bbca" ? "betalain" : "none",
                      contrast_volume_ml: cv,
                      gadolinium_avoided_mg: gadoAvoided,
                      water_contamination_prevented_l: gadoAvoided * 0.01,
                      eco_impact_score: result.riskScore,
                    });
                    if (error) throw error;
                    toast.success(t("ciAkiEngine.saved") || "Result saved to eco dashboard");
                  } catch (err: any) {
                    toast.error(err.message);
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                {t("ciAkiEngine.saveResult") || "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Calculator className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">{t("ciAkiEngine.emptyState")}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{t("ciAkiEngine.disclaimerFooter")}</p>
    </div>
  );
}
