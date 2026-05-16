import { useState, useMemo, useEffect } from "react";
import { ResearchPreviewBanner } from "@/components/ResearchPreviewBanner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Download, Save, FlaskConical } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

type Field = "0.55T" | "1.5T" | "3T" | "7T";
type Sequence = "QISS" | "TWIST" | "T1-VIBE" | "TOF" | "T2-SPACE";

const FIELDS: { value: Field; b0: number; mT: number; snrFactor: number }[] = [
  { value: "0.55T", b0: 0.55, mT: 550, snrFactor: 0.37 },
  { value: "1.5T", b0: 1.5, mT: 1500, snrFactor: 1.0 },
  { value: "3T", b0: 3.0, mT: 3000, snrFactor: 2.0 },
  { value: "7T", b0: 7.0, mT: 7000, snrFactor: 4.67 },
];

const SEQUENCES: { value: Sequence; baseTime: number; baseSnr: number; ref: string }[] = [
  { value: "QISS", baseTime: 240, baseSnr: 18, ref: "Edelman PMID 28109932" },
  { value: "TWIST", baseTime: 180, baseSnr: 14, ref: "Lim et al. JMRI 2008" },
  { value: "T1-VIBE", baseTime: 120, baseSnr: 22, ref: "Rofsky JMRI 1999" },
  { value: "TOF", baseTime: 360, baseSnr: 12, ref: "Laub Radiology 1990" },
  { value: "T2-SPACE", baseTime: 300, baseSnr: 20, ref: "Mugler MRM 2000" },
];

export default function SimulationLab() {
  const { session } = useAuth();
  const [name, setName] = useState("");
  const [field, setField] = useState<Field>("1.5T");
  const [sequence, setSequence] = useState<Sequence>("QISS");
  const [matrix, setMatrix] = useState(256);
  const [nex, setNex] = useState(1);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const fieldCfg = FIELDS.find((f) => f.value === field)!;
  const seqCfg = SEQUENCES.find((s) => s.value === sequence)!;

  const metrics = useMemo(() => {
    const snr = seqCfg.baseSnr * fieldCfg.snrFactor * Math.sqrt(nex) * (matrix / 256);
    const tAcq = seqCfg.baseTime * (matrix / 256) ** 2 * nex;
    const sar = (fieldCfg.b0 ** 2) * 0.5 * (matrix / 256);
    return { snr: snr.toFixed(2), tAcq: Math.round(tAcq), sar: sar.toFixed(2) };
  }, [fieldCfg, seqCfg, matrix, nex]);

  useEffect(() => {
    if (!session) return;
    supabase
      .from("mri_simulations")
      .select("id,name,field_strength_mt,sequence_type,created_at")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => setHistory(data ?? []));
  }, [session]);

  const handleSave = async () => {
    if (!session) {
      toast.error("Sign in to save simulations");
      return;
    }
    if (!name.trim()) {
      toast.error("Name required");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("mri_simulations").insert({
      user_id: session.user.id,
      name: name.trim(),
      field_strength_mt: fieldCfg.mT,
      sequence_type: sequence,
      parameters: { matrix, nex, field },
      results: metrics,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Simulation saved");
      setName("");
    }
  };

  const exportSeq = () => {
    const seq = [
      `# VASCU-LINK simulation export — research only`,
      `# Sequence: ${sequence} | Field: ${field} | Matrix: ${matrix} | NEX: ${nex}`,
      `# SNR (a.u.): ${metrics.snr} | T_acq (s): ${metrics.tAcq} | SAR (W/kg est.): ${metrics.sar}`,
      `# Reference: ${seqCfg.ref}`,
      `[FILE]`,
      `format_version = 1.4.0`,
      `[SEQUENCE]`,
      `name = ${sequence}`,
      `B0 = ${fieldCfg.b0}`,
    ].join("\n");
    const blob = new Blob([seq], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sequence}_${field}_${Date.now()}.seq`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <SEOHead title="MRI Simulation Lab — VASCU-LINK" description="Research-only MRI sequence simulator." />
      <ResearchPreviewBanner />
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold">MRI Simulation Lab</h1>
            <Badge variant="outline">Research preview</Badge>
          </div>
          <p className="text-muted-foreground">
            Explore SNR / T<sub>acq</sub> / SAR across field strengths and pulse sequences. Estimates only.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Sequence parameters</CardTitle>
              <CardDescription>4 field strengths · 5 sequences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. AOMI lower-limb baseline" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Field strength</Label>
                  <Select value={field} onValueChange={(v) => setField(v as Field)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FIELDS.map((f) => <SelectItem key={f.value} value={f.value}>{f.value}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sequence</Label>
                  <Select value={sequence} onValueChange={(v) => setSequence(v as Sequence)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SEQUENCES.map((s) => <SelectItem key={s.value} value={s.value}>{s.value}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Matrix</Label>
                  <Input type="number" min={64} max={1024} step={64} value={matrix} onChange={(e) => setMatrix(Number(e.target.value) || 256)} />
                </div>
                <div className="space-y-2">
                  <Label>NEX</Label>
                  <Input type="number" min={1} max={16} value={nex} onChange={(e) => setNex(Number(e.target.value) || 1)} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Reference: {seqCfg.ref}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estimated metrics</CardTitle>
              <CardDescription>Educational approximations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border bg-muted/30 p-4 text-center">
                  <p className="text-xs uppercase text-muted-foreground">SNR (a.u.)</p>
                  <p className="text-2xl font-bold text-primary">{metrics.snr}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4 text-center">
                  <p className="text-xs uppercase text-muted-foreground">T<sub>acq</sub> (s)</p>
                  <p className="text-2xl font-bold text-primary">{metrics.tAcq}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4 text-center">
                  <p className="text-xs uppercase text-muted-foreground">SAR est.</p>
                  <p className="text-2xl font-bold text-primary">{metrics.sar}</p>
                </div>
              </div>

              <svg viewBox="0 0 200 200" className="mx-auto h-40 w-40 rounded border bg-background">
                <defs>
                  <radialGradient id="kspace" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="200" height="200" fill="hsl(var(--muted))" />
                <circle cx="100" cy="100" r="80" fill="url(#kspace)" />
                <text x="100" y="195" textAnchor="middle" className="fill-muted-foreground text-[8px]">k-space (illustrative)</text>
              </svg>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
                <Button variant="outline" onClick={exportSeq}>
                  <Download className="mr-2 h-4 w-4" /> .seq
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {history.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Recent simulations</CardTitle></CardHeader>
            <CardContent>
              <ul className="divide-y">
                {history.map((h) => (
                  <li key={h.id} className="flex items-center justify-between py-2 text-sm">
                    <span>{h.name}</span>
                    <span className="text-muted-foreground">{h.field_strength_mt} mT · {h.sequence_type}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
