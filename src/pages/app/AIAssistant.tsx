import { useState } from "react";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AIAssistant() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    symptoms: "",
    riskFactors: "",
    abi: "",
    doppler: "",
    imaging: "",
    labs: "",
    medications: "",
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-clinical-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ clinicalData: formData }),
        }
      );

      if (response.status === 429) {
        toast({ title: "Rate limited", description: "Please try again in a moment.", variant: "destructive" });
        return;
      }
      if (response.status === 402) {
        toast({ title: "Credits required", description: "Please add credits to continue using AI features.", variant: "destructive" });
        return;
      }

      if (!response.ok || !response.body) throw new Error("Failed to generate report");

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
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            AI Clinical Assistant
          </h1>
          <p className="text-muted-foreground mt-1">Generate structured clinical reports with AI-powered analysis</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1.5">
          <Shield className="h-3 w-3" />
          Clinician Confirmation Required
        </Badge>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/30">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium">AI-Generated Content — Not a Diagnosis</p>
          <p className="text-muted-foreground mt-1">
            All outputs require clinician review and confirmation. Citation fields use placeholders.
            This tool does not provide medical advice or diagnoses.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Intake Form */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical Intake</CardTitle>
            <CardDescription>Enter patient data for AI analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Symptoms & Presentation</Label>
              <Textarea
                placeholder="e.g., Intermittent claudication, rest pain, walking distance 200m..."
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Risk Factors</Label>
              <Textarea
                placeholder="e.g., Diabetes, hypertension, smoking history 30 pack-years..."
                value={formData.riskFactors}
                onChange={(e) => setFormData({ ...formData, riskFactors: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ABI / IPS</Label>
                <Input
                  placeholder="e.g., Right: 0.65, Left: 0.82"
                  value={formData.abi}
                  onChange={(e) => setFormData({ ...formData, abi: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Doppler Summary</Label>
                <Input
                  placeholder="e.g., Monophasic flow SFA right"
                  value={formData.doppler}
                  onChange={(e) => setFormData({ ...formData, doppler: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>CTA/MRA Summary</Label>
              <Textarea
                placeholder="e.g., Occlusion of right SFA, patent popliteal..."
                value={formData.imaging}
                onChange={(e) => setFormData({ ...formData, imaging: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Labs</Label>
                <Input
                  placeholder="e.g., HbA1c 7.8%, LDL 160mg/dL"
                  value={formData.labs}
                  onChange={(e) => setFormData({ ...formData, labs: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Current Medications</Label>
                <Input
                  placeholder="e.g., Aspirin, Statin, Cilostazol"
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Clinical Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Report</CardTitle>
            <CardDescription>Review, confirm, and export</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <Tabs defaultValue="report">
                  <TabsList>
                    <TabsTrigger value="report">Report</TabsTrigger>
                    <TabsTrigger value="evidence">Evidence & Rationale</TabsTrigger>
                  </TabsList>
                  <TabsContent value="report" className="mt-4">
                    <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap text-sm leading-relaxed bg-muted/50 p-4 rounded-lg max-h-96 overflow-auto">
                      {result}
                    </div>
                  </TabsContent>
                  <TabsContent value="evidence" className="mt-4">
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Info className="h-4 w-4 text-info" />
                          <span className="text-sm font-medium">Data Used</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Patient-provided clinical data from intake form above.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-warning" />
                          <span className="text-sm font-medium">Uncertainty & Limits</span>
                        </div>
                        <p className="text-xs text-muted-foreground">AI analysis is based on structured input only. Guidelines use placeholder citations. Clinical judgment is essential.</p>
                      </div>
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="h-4 w-4 text-destructive" />
                          <span className="text-sm font-medium">Clinician Confirmation Required</span>
                        </div>
                        <p className="text-xs text-muted-foreground">This output must be reviewed by a qualified clinician before any clinical action.</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(result);
                      toast({ title: "Copied", description: "Report copied as plain text (EHR format)" });
                    }}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy to EHR
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Export PDF
                  </Button>
                  <Button size="sm" className="ml-auto">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    Confirm & Sign
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Brain className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm">Enter clinical data and generate a report</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
