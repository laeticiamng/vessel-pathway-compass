import { useState, useMemo } from "react";
import { ResearchPreviewBanner } from "@/components/ResearchPreviewBanner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Cpu, Download, Save, Leaf } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

type Module = {
  id: string;
  name: string;
  cost: number;
  weightKg: number;
  ecoScore: number; // 0-100, higher = greener
  ref: string;
};

const OSI2ONE_MODULES: Module[] = [
  { id: "magnet", name: "Permanent magnet array (0.05 T)", cost: 4500, weightKg: 220, ecoScore: 85, ref: "OSI²ONE BoM v0.9" },
  { id: "gradient", name: "Gradient coil set (3-axis)", cost: 3800, weightKg: 18, ecoScore: 60, ref: "OSI²ONE" },
  { id: "rf-tx", name: "RF transmit coil (head)", cost: 1200, weightKg: 2, ecoScore: 70, ref: "OSI²ONE" },
  { id: "rf-rx", name: "RF receive array (8-ch)", cost: 2400, weightKg: 1.5, ecoScore: 70, ref: "OSI²ONE" },
  { id: "console", name: "Open-source MRI console (MaRCoS)", cost: 3500, weightKg: 6, ecoScore: 78, ref: "Negnevitsky 2022" },
  { id: "amp-grad", name: "Gradient power amplifier", cost: 2200, weightKg: 12, ecoScore: 45, ref: "OSI²ONE" },
  { id: "amp-rf", name: "RF power amplifier (1kW)", cost: 1800, weightKg: 9, ecoScore: 50, ref: "OSI²ONE" },
  { id: "shim", name: "Passive shimming kit", cost: 600, weightKg: 4, ecoScore: 90, ref: "OSI²ONE" },
  { id: "cooling", name: "Passive cooling (no cryogen)", cost: 400, weightKg: 8, ecoScore: 95, ref: "Hennig low-field PMID 37289275" },
  { id: "enclosure", name: "Shielded enclosure (recycled)", cost: 2800, weightKg: 180, ecoScore: 80, ref: "OSI²ONE" },
];

export default function HardwareDesigner() {
  const { session } = useAuth();
  const [selected, setSelected] = useState<Set<string>>(new Set(OSI2ONE_MODULES.map((m) => m.id)));
  const [projectName, setProjectName] = useState("");

  const totals = useMemo(() => {
    const modules = OSI2ONE_MODULES.filter((m) => selected.has(m.id));
    const cost = modules.reduce((s, m) => s + m.cost, 0);
    const weight = modules.reduce((s, m) => s + m.weightKg, 0);
    const eco = modules.length ? Math.round(modules.reduce((s, m) => s + m.ecoScore, 0) / modules.length) : 0;
    return { cost, weight, eco, modules };
  }, [selected]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const exportCsv = () => {
    const rows = [
      "Module,Cost (EUR),Weight (kg),Eco-score,Reference",
      ...totals.modules.map((m) => `"${m.name}",${m.cost},${m.weightKg},${m.ecoScore},"${m.ref}"`),
      `TOTAL,${totals.cost},${totals.weight},${totals.eco},`,
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bom_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const save = async () => {
    if (!session) return toast.error("Sign in required");
    if (!projectName.trim()) return toast.error("Project name required");
    const { error } = await supabase.from("hardware_projects").insert({
      user_id: session.user.id,
      name: projectName.trim(),
      modules: totals.modules,
      total_cost: totals.cost,
      total_weight_kg: totals.weight,
      eco_score: totals.eco,
    });
    error ? toast.error(error.message) : toast.success("Project saved");
  };

  return (
    <>
      <SEOHead title="Hardware Designer — VASCU-LINK" description="Open-source low-field MRI BoM designer." />
      <ResearchPreviewBanner />
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <Cpu className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold">Hardware Designer</h1>
            <Badge variant="outline">OSI²ONE BoM</Badge>
          </div>
          <p className="text-muted-foreground">Compose a low-field MRI bill-of-materials. Open-hardware references only.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Modules (10)</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {OSI2ONE_MODULES.map((m) => (
                <label key={m.id} className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/40">
                  <Checkbox checked={selected.has(m.id)} onCheckedChange={() => toggle(m.id)} />
                  <div className="flex-1">
                    <p className="font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.ref}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{m.cost.toLocaleString()} €</p>
                    <p className="text-xs text-muted-foreground">{m.weightKg} kg · eco {m.ecoScore}</p>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>{totals.modules.length} modules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs uppercase text-muted-foreground">Total cost</p>
                <p className="text-2xl font-bold">{totals.cost.toLocaleString()} €</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs uppercase text-muted-foreground">Total weight</p>
                <p className="text-2xl font-bold">{totals.weight.toFixed(1)} kg</p>
              </div>
              <div className="rounded-lg border bg-green-500/10 p-3">
                <p className="flex items-center gap-1 text-xs uppercase text-green-700 dark:text-green-400"><Leaf className="h-3 w-3" /> Eco-score</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{totals.eco}/100</p>
              </div>

              <Input placeholder="Project name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={save} className="flex-1"><Save className="mr-2 h-4 w-4" />Save</Button>
                <Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />CSV</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
