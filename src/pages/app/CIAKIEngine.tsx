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
import { Calculator, AlertTriangle, Info, Shield, Printer, FileText } from "lucide-react";

type RiskTier = "low" | "moderate" | "high";

interface CIAKIResult {
  riskTier: RiskTier;
  riskScore: number;
  strategy: string;
  details: string;
}

function calculateCIAKIRisk(params: {
  egfr: number;
  age: number;
  diabetes: boolean;
  lvef: number;
  contrastVolume: number;
  hydration: string;
}): CIAKIResult {
  const { egfr, age, diabetes, lvef, contrastVolume, hydration } = params;

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

  // Contrast volume / eGFR ratio
  const ratio = contrastVolume / Math.max(egfr, 1);
  if (ratio > 3.7) score += 3;
  else if (ratio > 2.0) score += 2;
  else if (ratio > 1.0) score += 1;

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
    strategy = "ultraLowContrast";
    details = "moderateDetails";
  } else {
    riskTier = "high";
    strategy = "zeroContrast";
    details = "highDetails";
  }

  return { riskTier, riskScore: score, strategy, details };
}

export default function CIAKIEngine() {
  const { t } = useTranslation();
  const [egfr, setEgfr] = useState("");
  const [age, setAge] = useState("");
  const [diabetes, setDiabetes] = useState(false);
  const [lvef, setLvef] = useState("");
  const [contrastVolume, setContrastVolume] = useState("");
  const [hydration, setHydration] = useState("iv_normal");
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
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-3.5 w-3.5 mr-1" />
                {t("ciAkiEngine.printSummary")}
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-3.5 w-3.5 mr-1" />
                {t("ciAkiEngine.auditTrail")}
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
