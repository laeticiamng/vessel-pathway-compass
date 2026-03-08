import { useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calculator, AlertTriangle, CheckCircle2, Info } from "lucide-react";

// ---- SCORE2 Calculator ----
function Score2Tab() {
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [systolic, setSystolic] = useState("");
  const [cholesterol, setCholesterol] = useState("");
  const [smoker, setSmoker] = useState(false);
  const [result, setResult] = useState<null | { risk: number; category: string; recommendation: string }>(null);

  const calculate = () => {
    const a = parseInt(age);
    const sbp = parseInt(systolic);
    const chol = parseFloat(cholesterol);
    if (!a || !sbp || !chol) return;

    // Simplified SCORE2 approximation
    let baseRisk = 2;
    baseRisk += (a - 40) * 0.15;
    baseRisk += sex === "male" ? 1.5 : 0;
    baseRisk += (sbp - 120) * 0.03;
    baseRisk += (chol - 4) * 0.8;
    baseRisk += smoker ? 2.5 : 0;
    baseRisk = Math.max(0.5, Math.min(baseRisk, 30));

    let category: string;
    let recommendation: string;
    if (baseRisk < 2.5) {
      category = "Low";
      recommendation = "Lifestyle modification. Reassess in 5 years.";
    } else if (baseRisk < 7.5) {
      category = "Moderate";
      recommendation = "Consider lipid-lowering therapy. Target LDL <2.6 mmol/L. Annual follow-up.";
    } else if (baseRisk < 10) {
      category = "High";
      recommendation = "Initiate statin therapy. Target LDL <1.8 mmol/L. Consider antihypertensive if SBP >140.";
    } else {
      category = "Very High";
      recommendation = "Intensive lipid-lowering (high-intensity statin ± ezetimibe). Target LDL <1.4 mmol/L. Antihypertensive therapy. Consider antiplatelet.";
    }

    setResult({ risk: Math.round(baseRisk * 10) / 10, category, recommendation });
  };

  const riskColor = !result ? "" : result.category === "Low" ? "text-success" : result.category === "Moderate" ? "text-warning" : "text-destructive";

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>SCORE2 — 10-Year CVD Risk</CardTitle>
          <CardDescription>European Society of Cardiology risk estimation for fatal and non-fatal cardiovascular events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Age (years)</Label>
              <Input type="number" placeholder="40–69" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sex</Label>
              <Select value={sex} onValueChange={(v) => setSex(v as "male" | "female")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Systolic Blood Pressure (mmHg)</Label>
            <Input type="number" placeholder="120" value={systolic} onChange={(e) => setSystolic(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Total Cholesterol (mmol/L)</Label>
            <Input type="number" step="0.1" placeholder="5.0" value={cholesterol} onChange={(e) => setCholesterol(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={smoker} onCheckedChange={setSmoker} id="smoker" />
            <Label htmlFor="smoker">Current smoker</Label>
          </div>
          <Button onClick={calculate} className="w-full">Calculate SCORE2 Risk</Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">10-Year CVD Risk</p>
              <p className={`text-5xl font-bold mt-2 ${riskColor}`}>{result.risk}%</p>
              <Badge className="mt-2" variant={result.category === "Low" ? "secondary" : result.category === "Moderate" ? "outline" : "destructive"}>
                {result.category} Risk
              </Badge>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm font-medium flex items-center gap-2"><Info className="h-4 w-4 text-primary" /> Treatment Recommendation</p>
              <p className="text-sm text-muted-foreground">{result.recommendation}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on ESC/EAS 2021 guidelines. This is a simplified estimation — use validated SCORE2 charts for clinical decisions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---- Wells DVT Score ----
function WellsDVTTab() {
  const criteria = [
    { id: "cancer", label: "Active cancer (treatment within 6 months)", points: 1 },
    { id: "paralysis", label: "Paralysis, paresis, or recent cast of lower extremity", points: 1 },
    { id: "bedridden", label: "Bedridden >3 days or major surgery within 12 weeks", points: 1 },
    { id: "tenderness", label: "Localized tenderness along deep venous system", points: 1 },
    { id: "swelling", label: "Entire leg swollen", points: 1 },
    { id: "calf", label: "Calf swelling >3cm compared to asymptomatic leg", points: 1 },
    { id: "pitting", label: "Pitting edema confined to symptomatic leg", points: 1 },
    { id: "collateral", label: "Collateral superficial veins (non-varicose)", points: 1 },
    { id: "previous", label: "Previously documented DVT", points: 1 },
    { id: "alternative", label: "Alternative diagnosis at least as likely as DVT", points: -2 },
  ];

  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const score = Object.entries(checked).reduce((sum, [id, val]) => {
    if (!val) return sum;
    return sum + (criteria.find((c) => c.id === id)?.points ?? 0);
  }, 0);

  let category: string;
  let recommendation: string;
  if (score <= 0) {
    category = "Low probability";
    recommendation = "D-dimer testing. If negative, DVT excluded. If positive, proceed to compression ultrasonography.";
  } else if (score <= 2) {
    category = "Moderate probability";
    recommendation = "D-dimer testing followed by compression ultrasonography if positive. Consider serial ultrasound if initial is negative.";
  } else {
    category = "High probability";
    recommendation = "Immediate compression ultrasonography. Consider empiric anticoagulation while awaiting imaging. If negative, consider repeat in 5–7 days or alternative imaging.";
  }

  const riskColor = score <= 0 ? "text-success" : score <= 2 ? "text-warning" : "text-destructive";

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Wells Score — DVT Probability</CardTitle>
          <CardDescription>Clinical prediction rule for deep vein thrombosis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {criteria.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors">
              <Switch checked={!!checked[c.id]} onCheckedChange={(val) => setChecked((prev) => ({ ...prev, [c.id]: val }))} id={c.id} />
              <Label htmlFor={c.id} className="text-sm cursor-pointer flex-1">{c.label}</Label>
              <Badge variant="outline" className="shrink-0">{c.points > 0 ? `+${c.points}` : c.points}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Wells DVT Score</p>
            <p className={`text-5xl font-bold mt-2 ${riskColor}`}>{score}</p>
            <Badge className="mt-2" variant={score <= 0 ? "secondary" : score <= 2 ? "outline" : "destructive"}>
              {category}
            </Badge>
          </div>
          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
            <p className="text-sm font-medium flex items-center gap-2"><Info className="h-4 w-4 text-primary" /> Recommended Approach</p>
            <p className="text-sm text-muted-foreground">{recommendation}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Based on Wells et al. Clinical decision rule. For clinical use, combine with D-dimer and imaging as appropriate.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ---- ABI Interpretation ----
function ABITab() {
  const [rightArm, setRightArm] = useState("");
  const [leftArm, setLeftArm] = useState("");
  const [rightAnkle, setRightAnkle] = useState("");
  const [leftAnkle, setLeftAnkle] = useState("");
  const [result, setResult] = useState<null | { rightABI: number; leftABI: number; interpretation: string; recommendation: string }>(null);

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

    let interpretation: string;
    let recommendation: string;
    if (lowestABI > 1.4) {
      interpretation = "Non-compressible vessels (calcification)";
      recommendation = "Consider Toe-Brachial Index (TBI) or duplex ultrasonography for accurate assessment. Common in diabetic or ESRD patients.";
    } else if (lowestABI >= 1.0) {
      interpretation = "Normal";
      recommendation = "No evidence of PAD. Continue standard cardiovascular risk management. Reassess if symptoms develop.";
    } else if (lowestABI >= 0.9) {
      interpretation = "Borderline";
      recommendation = "Borderline PAD. Consider exercise ABI testing. Optimize cardiovascular risk factors. Annual follow-up.";
    } else if (lowestABI >= 0.4) {
      interpretation = "Peripheral Arterial Disease (PAD)";
      recommendation = "Confirmed PAD. Supervised exercise therapy. Antiplatelet + statin therapy. Specialist referral for further evaluation (duplex, CTA).";
    } else {
      interpretation = "Severe PAD / Critical Limb Ischemia";
      recommendation = "Urgent vascular surgery referral. Consider revascularization. Wound care if tissue loss present. Start dual antiplatelet + high-intensity statin.";
    }

    setResult({ rightABI, leftABI, interpretation, recommendation });
  };

  const abiColor = (abi: number) => abi >= 1.0 && abi <= 1.4 ? "text-success" : abi >= 0.9 ? "text-warning" : "text-destructive";

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>ABI — Ankle-Brachial Index</CardTitle>
          <CardDescription>Enter systolic blood pressure measurements (mmHg)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Right Arm (mmHg)</Label>
              <Input type="number" placeholder="130" value={rightArm} onChange={(e) => setRightArm(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Left Arm (mmHg)</Label>
              <Input type="number" placeholder="128" value={leftArm} onChange={(e) => setLeftArm(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Right Ankle (mmHg)</Label>
              <Input type="number" placeholder="110" value={rightAnkle} onChange={(e) => setRightAnkle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Left Ankle (mmHg)</Label>
              <Input type="number" placeholder="105" value={leftAnkle} onChange={(e) => setLeftAnkle(e.target.value)} />
            </div>
          </div>
          <Button onClick={calculate} className="w-full">Calculate ABI</Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Right ABI</p>
                <p className={`text-4xl font-bold mt-1 ${abiColor(result.rightABI)}`}>{result.rightABI}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Left ABI</p>
                <p className={`text-4xl font-bold mt-1 ${abiColor(result.leftABI)}`}>{result.leftABI}</p>
              </div>
            </div>
            <div className="text-center">
              <Badge variant={result.interpretation.includes("Normal") ? "secondary" : "destructive"} className="text-sm">
                {result.interpretation}
              </Badge>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <p className="text-sm font-medium flex items-center gap-2"><Info className="h-4 w-4 text-primary" /> Clinical Recommendation</p>
              <p className="text-sm text-muted-foreground">{result.recommendation}</p>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Normal:</strong> 1.00–1.40 | <strong>Borderline:</strong> 0.90–0.99 | <strong>PAD:</strong> 0.40–0.89 | <strong>Severe:</strong> &lt;0.40</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function RiskCalculator() {
  return (
    <div className="space-y-6 max-w-6xl">
      <SEOHead title="Risk Calculator — Vascular Atlas" description="Clinical risk calculators: SCORE2, Wells DVT, ABI interpretation" path="/app/risk-calculator" noindex />

      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Calculator className="h-8 w-8 text-primary" />
          Vascular Risk Calculator
        </h1>
        <p className="text-muted-foreground mt-1">Interactive clinical scoring tools with instant results and treatment recommendations</p>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline"><AlertTriangle className="h-3 w-3 mr-1" /> Clinical Decision Support</Badge>
        <Badge variant="secondary">Not a substitute for clinical judgment</Badge>
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
