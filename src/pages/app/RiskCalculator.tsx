import { useState } from "react";
import { useTranslation } from "@/i18n/context";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calculator, AlertTriangle, Info } from "lucide-react";

// ---- SCORE2 Calculator ----
function Score2Tab() {
  const { t } = useTranslation();
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [systolic, setSystolic] = useState("");
  const [cholesterol, setCholesterol] = useState("");
  const [smoker, setSmoker] = useState(false);
  const [result, setResult] = useState<null | { risk: number; categoryKey: string; recommendationKey: string }>(null);

  const calculate = () => {
    const a = parseInt(age);
    const sbp = parseInt(systolic);
    const chol = parseFloat(cholesterol);
    if (!a || !sbp || !chol) return;

    let baseRisk = 2;
    baseRisk += (a - 40) * 0.15;
    baseRisk += sex === "male" ? 1.5 : 0;
    baseRisk += (sbp - 120) * 0.03;
    baseRisk += (chol - 4) * 0.8;
    baseRisk += smoker ? 2.5 : 0;
    baseRisk = Math.max(0.5, Math.min(baseRisk, 30));

    let categoryKey: string;
    let recommendationKey: string;
    if (baseRisk < 2.5) {
      categoryKey = "low"; recommendationKey = "lowRec";
    } else if (baseRisk < 7.5) {
      categoryKey = "moderate"; recommendationKey = "moderateRec";
    } else if (baseRisk < 10) {
      categoryKey = "high"; recommendationKey = "highRec";
    } else {
      categoryKey = "veryHigh"; recommendationKey = "veryHighRec";
    }

    setResult({ risk: Math.round(baseRisk * 10) / 10, categoryKey, recommendationKey });
  };

  const category = result ? t(`riskCalculator.score2.${result.categoryKey}`) as string : "";
  const riskColor = !result ? "" : result.categoryKey === "low" ? "text-success" : result.categoryKey === "moderate" ? "text-warning" : "text-destructive";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("riskCalculator.score2.title")}</CardTitle>
          <CardDescription>{t("riskCalculator.score2.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("riskCalculator.score2.age")}</Label>
              <Input type="number" placeholder="40–69" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("riskCalculator.score2.sex")}</Label>
              <Select value={sex} onValueChange={(v) => setSex(v as "male" | "female")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t("riskCalculator.score2.male")}</SelectItem>
                  <SelectItem value="female">{t("riskCalculator.score2.female")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("riskCalculator.score2.systolic")}</Label>
            <Input type="number" placeholder="120" value={systolic} onChange={(e) => setSystolic(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("riskCalculator.score2.cholesterol")}</Label>
            <Input type="number" step="0.1" placeholder="5.0" value={cholesterol} onChange={(e) => setCholesterol(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={smoker} onCheckedChange={setSmoker} id="smoker" />
            <Label htmlFor="smoker">{t("riskCalculator.score2.smoker")}</Label>
          </div>
          <Button onClick={calculate} className="w-full">{t("riskCalculator.score2.calculate")}</Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{t("riskCalculator.score2.tenYearRisk")}</p>
              <p className={`text-5xl font-bold mt-2 ${riskColor}`}>{result.risk}%</p>
              <Badge className="mt-2" variant={result.categoryKey === "low" ? "secondary" : result.categoryKey === "moderate" ? "outline" : "destructive"}>
                {category} {t("riskCalculator.score2.risk")}
              </Badge>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm font-medium flex items-center gap-2"><Info className="h-4 w-4 text-primary" /> {t("riskCalculator.score2.recommendation")}</p>
              <p className="text-sm text-muted-foreground">{t(`riskCalculator.score2.${result.recommendationKey}`)}</p>
            </div>
            <p className="text-xs text-muted-foreground">{t("riskCalculator.score2.disclaimer")}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---- Wells DVT Score ----
function WellsDVTTab() {
  const { t } = useTranslation();
  const criteriaKeys = ["cancer", "paralysis", "bedridden", "tenderness", "swelling", "calf", "pitting", "collateral", "previous", "alternative"] as const;
  const criteriaPoints: Record<string, number> = { cancer: 1, paralysis: 1, bedridden: 1, tenderness: 1, swelling: 1, calf: 1, pitting: 1, collateral: 1, previous: 1, alternative: -2 };

  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const score = Object.entries(checked).reduce((sum, [id, val]) => {
    if (!val) return sum;
    return sum + (criteriaPoints[id] ?? 0);
  }, 0);

  let categoryKey: string;
  if (score <= 0) categoryKey = "lowProb";
  else if (score <= 2) categoryKey = "moderateProb";
  else categoryKey = "highProb";

  const riskColor = score <= 0 ? "text-success" : score <= 2 ? "text-warning" : "text-destructive";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("riskCalculator.wells.title")}</CardTitle>
          <CardDescription>{t("riskCalculator.wells.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {criteriaKeys.map((key) => (
            <div key={key} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors">
              <Switch checked={!!checked[key]} onCheckedChange={(val) => setChecked((prev) => ({ ...prev, [key]: val }))} id={key} />
              <Label htmlFor={key} className="text-sm cursor-pointer flex-1">{t(`riskCalculator.wells.criteria.${key}`)}</Label>
              <Badge variant="outline" className="shrink-0">{criteriaPoints[key] > 0 ? `+${criteriaPoints[key]}` : criteriaPoints[key]}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{t("riskCalculator.wells.score")}</p>
            <p className={`text-5xl font-bold mt-2 ${riskColor}`}>{score}</p>
            <Badge className="mt-2" variant={score <= 0 ? "secondary" : score <= 2 ? "outline" : "destructive"}>
              {t(`riskCalculator.wells.${categoryKey}`)}
            </Badge>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <p className="text-sm font-medium flex items-center gap-2"><Info className="h-4 w-4 text-primary" /> {t("riskCalculator.wells.approach")}</p>
            <p className="text-sm text-muted-foreground">{t(`riskCalculator.wells.${categoryKey}`)}</p>
          </div>
          <p className="text-xs text-muted-foreground">{t("riskCalculator.wells.disclaimer")}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- ABI Interpretation ----
function ABITab() {
  const { t } = useTranslation();
  const [rightArm, setRightArm] = useState("");
  const [leftArm, setLeftArm] = useState("");
  const [rightAnkle, setRightAnkle] = useState("");
  const [leftAnkle, setLeftAnkle] = useState("");
  const [result, setResult] = useState<null | { rightABI: number; leftABI: number; interpretationKey: string }>(null);

  const calculate = () => {
    const ra = parseFloat(rightArm);
    const la = parseFloat(leftArm);
    const rak = parseFloat(rightAnkle);
    const lak = parseFloat(leftAnkle);
    if (!ra || !la || !rak || !lak) return;

    const highestArm = Math.max(ra, la);
    const rightABI = Math.round((rak / highestArm) * 100) / 100;
    const leftABI = Math.round((lak / highestArm) * 100) / 100;
    const lowestABI = Math.min(rightABI, leftABI);

    let interpretationKey: string;
    if (lowestABI > 1.4) interpretationKey = "nonCompressible";
    else if (lowestABI >= 1.0) interpretationKey = "normal";
    else if (lowestABI >= 0.9) interpretationKey = "borderline";
    else if (lowestABI >= 0.4) interpretationKey = "pad";
    else interpretationKey = "severe";

    setResult({ rightABI, leftABI, interpretationKey });
  };

  const abiColor = (abi: number) => abi >= 1.0 && abi <= 1.4 ? "text-success" : abi >= 0.9 ? "text-warning" : "text-destructive";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("riskCalculator.abi.title")}</CardTitle>
          <CardDescription>{t("riskCalculator.abi.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("riskCalculator.abi.rightArm")}</Label>
              <Input type="number" placeholder="130" value={rightArm} onChange={(e) => setRightArm(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("riskCalculator.abi.leftArm")}</Label>
              <Input type="number" placeholder="128" value={leftArm} onChange={(e) => setLeftArm(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("riskCalculator.abi.rightAnkle")}</Label>
              <Input type="number" placeholder="110" value={rightAnkle} onChange={(e) => setRightAnkle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("riskCalculator.abi.leftAnkle")}</Label>
              <Input type="number" placeholder="105" value={leftAnkle} onChange={(e) => setLeftAnkle(e.target.value)} />
            </div>
          </div>
          <Button onClick={calculate} className="w-full">{t("riskCalculator.abi.calculate")}</Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">{t("riskCalculator.abi.rightABI")}</p>
                <p className={`text-4xl font-bold mt-1 ${abiColor(result.rightABI)}`}>{result.rightABI}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("riskCalculator.abi.leftABI")}</p>
                <p className={`text-4xl font-bold mt-1 ${abiColor(result.leftABI)}`}>{result.leftABI}</p>
              </div>
            </div>
            <div className="text-center">
              <Badge variant={result.interpretationKey === "normal" ? "secondary" : "destructive"} className="text-sm">
                {t(`riskCalculator.abi.${result.interpretationKey}`)}
              </Badge>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm font-medium flex items-center gap-2"><Info className="h-4 w-4 text-primary" /> {t("riskCalculator.abi.recommendation")}</p>
              <p className="text-sm text-muted-foreground">{t(`riskCalculator.abi.${result.interpretationKey}`)}</p>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>{t("riskCalculator.abi.normal")}:</strong> 1.00–1.40 | <strong>{t("riskCalculator.abi.borderline")}:</strong> 0.90–0.99 | <strong>{t("riskCalculator.abi.pad")}:</strong> 0.40–0.89 | <strong>{t("riskCalculator.abi.severe")}:</strong> &lt;0.40</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function RiskCalculator() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-6xl">
      <SEOHead title={t("seo.riskCalculator.title") as string} description={t("seo.riskCalculator.description") as string} path="/app/risk-calculator" noindex />

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <Calculator className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
          {t("riskCalculator.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("riskCalculator.subtitle")}</p>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline"><AlertTriangle className="h-3 w-3 mr-1" /> {t("riskCalculator.clinicalSupport")}</Badge>
        <Badge variant="secondary">{t("riskCalculator.notSubstitute")}</Badge>
      </div>

      <Tabs defaultValue="score2">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="score2">SCORE2</TabsTrigger>
          <TabsTrigger value="wells">Wells DVT</TabsTrigger>
          <TabsTrigger value="abi">ABI</TabsTrigger>
        </TabsList>

        <TabsContent value="score2" className="mt-6"><Score2Tab /></TabsContent>
        <TabsContent value="wells" className="mt-6"><WellsDVTTab /></TabsContent>
        <TabsContent value="abi" className="mt-6"><ABITab /></TabsContent>
      </Tabs>
    </div>
  );
}
