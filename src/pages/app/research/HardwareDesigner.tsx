import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ProjectCollabPanel } from "@/components/research/ProjectCollabPanel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Cpu, Download, Save, Leaf, FolderOpen, FileText, AlertTriangle, ArrowLeft } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Module = {
  id: string;
  name: string;
  cost: number;
  weightKg: number;
  powerW: number;
  ecoScore: number;
  ref: string;
};

const OSI2ONE_MODULES: Module[] = [
  { id: "magnet", name: "Permanent magnet array (0.05 T)", cost: 4500, weightKg: 220, powerW: 0, ecoScore: 85, ref: "OSI²ONE BoM v0.9" },
  { id: "gradient", name: "Gradient coil set (3-axis)", cost: 3800, weightKg: 18, powerW: 200, ecoScore: 60, ref: "OSI²ONE" },
  { id: "rf-tx", name: "RF transmit coil (head)", cost: 1200, weightKg: 2, powerW: 50, ecoScore: 70, ref: "OSI²ONE" },
  { id: "rf-rx", name: "RF receive array (8-ch)", cost: 2400, weightKg: 1.5, powerW: 20, ecoScore: 70, ref: "OSI²ONE" },
  { id: "console", name: "Open-source MRI console (MaRCoS)", cost: 3500, weightKg: 6, powerW: 80, ecoScore: 78, ref: "Negnevitsky 2022" },
  { id: "amp-grad", name: "Gradient power amplifier", cost: 2200, weightKg: 12, powerW: 1500, ecoScore: 45, ref: "OSI²ONE" },
  { id: "amp-rf", name: "RF power amplifier (1kW)", cost: 1800, weightKg: 9, powerW: 1000, ecoScore: 50, ref: "OSI²ONE" },
  { id: "shim", name: "Passive shimming kit", cost: 600, weightKg: 4, powerW: 0, ecoScore: 90, ref: "OSI²ONE" },
  { id: "cooling", name: "Passive cooling (no cryogen)", cost: 400, weightKg: 8, powerW: 100, ecoScore: 95, ref: "Hennig low-field PMID 37289275" },
  { id: "enclosure", name: "Shielded enclosure (recycled)", cost: 2800, weightKg: 180, powerW: 0, ecoScore: 80, ref: "OSI²ONE" },
];

// Hardware constraints (single-room install)
const MAX_WEIGHT_KG = 600;
const MAX_POWER_W = 5000;
const ESSENTIAL = ["magnet", "console", "rf-tx", "rf-rx"];

export default function HardwareDesigner() {
  const { session } = useAuth();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<"list" | "designer">("list");
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [currentOwner, setCurrentOwner] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set(OSI2ONE_MODULES.map((m) => m.id)));
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState<any[]>([]);

  const totals = useMemo(() => {
    const modules = OSI2ONE_MODULES.filter((m) => selected.has(m.id));
    const cost = modules.reduce((s, m) => s + m.cost, 0);
    const weight = modules.reduce((s, m) => s + m.weightKg, 0);
    const power = modules.reduce((s, m) => s + m.powerW, 0);
    const eco = modules.length ? Math.round(modules.reduce((s, m) => s + m.ecoScore, 0) / modules.length) : 0;
    const missingEssential = ESSENTIAL.filter((id) => !selected.has(id));
    const issues: string[] = [];
    if (weight > MAX_WEIGHT_KG) issues.push(`Weight ${weight} kg > ${MAX_WEIGHT_KG} kg limit`);
    if (power > MAX_POWER_W) issues.push(`Power ${power} W > ${MAX_POWER_W} W single-phase limit`);
    if (missingEssential.length) issues.push(`Missing essential modules: ${missingEssential.join(", ")}`);
    return { cost, weight, power, eco, modules, issues };
  }, [selected]);

  const loadProjects = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from("hardware_projects")
      .select("id,name,eco_score,user_id,created_at,total_cost_eur")
      .order("created_at", { ascending: false });
    setProjects(data ?? []);
  }, [session]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  // Accept invitation flow
  useEffect(() => {
    const token = params.get("accept");
    const projectId = params.get("project");
    if (!token || !projectId || !session) return;
    (async () => {
      const { data: inv } = await supabase
        .from("project_invitations")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .maybeSingle();
      if (!inv) {
        toast.error("Invalid or expired invitation");
      } else {
        const { error: memErr } = await supabase.from("project_members").insert({
          project_id: inv.project_id, user_id: session.user.id, project_role: inv.invited_role, added_by: inv.invited_by,
        });
        if (memErr && !memErr.message.includes("duplicate")) toast.error(memErr.message);
        else {
          await supabase.from("project_invitations").update({ status: "accepted", responded_at: new Date().toISOString() }).eq("id", inv.id);
          toast.success("Joined project");
          setCurrentId(projectId);
          setView("designer");
          loadProjects();
        }
      }
      params.delete("accept"); params.delete("project"); setParams(params);
    })();
  }, [params, session, setParams, loadProjects]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const openProject = async (id: string) => {
    const { data } = await supabase.from("hardware_projects").select("*").eq("id", id).maybeSingle();
    if (!data) return;
    setCurrentId(id);
    setCurrentOwner(data.user_id);
    setProjectName(data.name);
    const ids = Array.isArray(data.modules) ? (data.modules as any[]).map((m) => m.id) : [];
    setSelected(new Set(ids.length ? ids : OSI2ONE_MODULES.map((m) => m.id)));
    setView("designer");
  };

  const newDesign = () => {
    setCurrentId(null); setCurrentOwner(null); setProjectName("");
    setSelected(new Set(OSI2ONE_MODULES.map((m) => m.id)));
    setView("designer");
  };

  const exportCsv = () => {
    const rows = [
      "Module,Cost (EUR),Weight (kg),Power (W),Eco-score,Reference",
      ...totals.modules.map((m) => `"${m.name}",${m.cost},${m.weightKg},${m.powerW},${m.ecoScore},"${m.ref}"`),
      `TOTAL,${totals.cost},${totals.weight},${totals.power},${totals.eco},`,
    ].join("\n");
    downloadBlob(new Blob([rows], { type: "text/csv" }), `bom_${Date.now()}.csv`);
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text("VASCU-LINK — Hardware BoM", 14, 18);
    doc.setFontSize(10); doc.setTextColor(120);
    doc.text(`Project: ${projectName || "(unsaved)"}  ·  ${new Date().toLocaleString()}`, 14, 26);
    doc.text("Research preview — not a medical device", 14, 32);

    autoTable(doc, {
      startY: 38,
      head: [["Module", "Cost €", "Weight kg", "Power W", "Eco", "Reference"]],
      body: totals.modules.map((m) => [m.name, m.cost.toLocaleString(), m.weightKg, m.powerW, m.ecoScore, m.ref]),
      foot: [["TOTAL", totals.cost.toLocaleString(), totals.weight, totals.power, totals.eco, ""]],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 64, 175] },
    });

    if (totals.issues.length) {
      const y = (doc as any).lastAutoTable.finalY + 10;
      doc.setTextColor(180, 30, 30); doc.setFontSize(11);
      doc.text("⚠ Constraint issues:", 14, y);
      doc.setFontSize(9);
      totals.issues.forEach((iss, i) => doc.text(`• ${iss}`, 16, y + 6 + i * 5));
    }
    doc.save(`bom_${(projectName || "design").replace(/\s+/g, "_")}.pdf`);
  };

  const save = async () => {
    if (!session) return toast.error("Sign in required");
    if (!projectName.trim()) return toast.error("Project name required");
    if (currentId) {
      const { error } = await supabase.from("hardware_projects").update({
        name: projectName.trim(),
        modules: totals.modules,
        total_cost_eur: { eur: totals.cost, weight_kg: totals.weight, power_w: totals.power } as any,
        eco_score: totals.eco,
      }).eq("id", currentId);
      if (error) toast.error(error.message); else { toast.success("Saved"); loadProjects(); }
    } else {
      const { data, error } = await supabase.from("hardware_projects").insert({
        user_id: session.user.id,
        name: projectName.trim(),
        modules: totals.modules,
        total_cost_eur: { eur: totals.cost, weight_kg: totals.weight, power_w: totals.power } as any,
        eco_score: totals.eco,
      }).select("id,user_id").maybeSingle();
      if (error) toast.error(error.message);
      else if (data) { setCurrentId(data.id); setCurrentOwner(data.user_id); toast.success("Created"); loadProjects(); }
    }
  };

  if (view === "list") {
    return (
      <>
        <SEOHead title="Hardware Designer — VASCU-LINK" description="Open-source low-field MRI BoM designer." />
        <div className="container mx-auto max-w-7xl space-y-6 p-6">
          <header className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Cpu className="h-7 w-7 text-primary" />
                <h1 className="text-3xl font-bold">Hardware Designer</h1>
              </div>
              <p className="text-muted-foreground">Your OSI²ONE projects.</p>
            </div>
            <Button onClick={newDesign}>+ New design</Button>
          </header>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <Card key={p.id} className="cursor-pointer transition hover:border-primary" onClick={() => openProject(p.id)}>
                <CardHeader>
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <CardDescription>
                    Eco {p.eco_score}/100
                    {p.user_id !== session?.user.id && <Badge className="ml-2" variant="outline">Shared</Badge>}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
            {projects.length === 0 && <p className="text-muted-foreground">No projects yet.</p>}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Hardware Designer — VASCU-LINK" description="Open-source low-field MRI BoM designer." />
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        <header className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setView("list")}><ArrowLeft className="mr-1 h-4 w-4" />Back</Button>
          <h1 className="text-2xl font-bold">{currentId ? projectName : "New design"}</h1>
          <div className="w-20" />
        </header>

        {totals.issues.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Constraint issues</AlertTitle>
            <AlertDescription>
              <ul className="ml-4 list-disc text-sm">{totals.issues.map((i) => <li key={i}>{i}</li>)}</ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Modules (10)</CardTitle>
              <CardDescription>Limits: {MAX_WEIGHT_KG} kg · {MAX_POWER_W} W single-phase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {OSI2ONE_MODULES.map((m) => (
                <label key={m.id} className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/40">
                  <Checkbox checked={selected.has(m.id)} onCheckedChange={() => toggle(m.id)} />
                  <div className="flex-1">
                    <p className="font-medium">{m.name} {ESSENTIAL.includes(m.id) && <Badge variant="outline" className="ml-1 text-[10px]">essential</Badge>}</p>
                    <p className="text-xs text-muted-foreground">{m.ref}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{m.cost.toLocaleString()} €</p>
                    <p className="text-xs text-muted-foreground">{m.weightKg} kg · {m.powerW} W · eco {m.ecoScore}</p>
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
              <div className="grid grid-cols-2 gap-2">
                <Metric label="Cost" value={`${totals.cost.toLocaleString()} €`} />
                <Metric label="Weight" value={`${totals.weight.toFixed(1)} kg`} warn={totals.weight > MAX_WEIGHT_KG} />
                <Metric label="Power" value={`${totals.power} W`} warn={totals.power > MAX_POWER_W} />
                <Metric label="Eco" value={`${totals.eco}/100`} green />
              </div>
              <Input placeholder="Project name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={save} className="col-span-3"><Save className="mr-2 h-4 w-4" />{currentId ? "Update" : "Save"}</Button>
                <Button variant="outline" onClick={exportCsv}><Download className="mr-1 h-3.5 w-3.5" />CSV</Button>
                <Button variant="outline" onClick={exportPdf}><FileText className="mr-1 h-3.5 w-3.5" />PDF</Button>
                <Button variant="outline" onClick={() => setView("list")}><FolderOpen className="mr-1 h-3.5 w-3.5" />Open</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {currentId && currentOwner && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Collaboration</h2>
            <ProjectCollabPanel projectId={currentId} ownerId={currentOwner} />
          </section>
        )}
      </div>
    </>
  );
}

function Metric({ label, value, warn, green }: { label: string; value: string; warn?: boolean; green?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${warn ? "border-destructive bg-destructive/10" : green ? "border-green-500/30 bg-green-500/10" : "bg-muted/30"}`}>
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${warn ? "text-destructive" : green ? "text-green-700 dark:text-green-400" : ""}`}>{value}</p>
    </div>
  );
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}
