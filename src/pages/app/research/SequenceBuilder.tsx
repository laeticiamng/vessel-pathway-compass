import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Layers, Plus, Trash2, Save, Download, FolderOpen, GitBranch } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

type Block = { id: string; type: "RF" | "Gx" | "Gy" | "Gz" | "ADC"; duration: number };
type SavedRow = { id: string; name: string; version: number; project_id: string | null; updated_at: string };

const COLORS: Record<Block["type"], string> = {
  RF: "bg-rose-500", Gx: "bg-sky-500", Gy: "bg-emerald-500", Gz: "bg-amber-500", ADC: "bg-violet-500",
};

const buildSeqText = (name: string, blocks: Block[]) => [
  `# VASCU-LINK sequence export — research only`,
  `# Name: ${name} · ${new Date().toISOString()}`,
  `[FILE]`, `format_version = 1.4.0`,
  `[BLOCKS]`,
  ...blocks.map((b, i) => `${i + 1} ${b.type} ${b.duration}`),
].join("\n");

export default function SequenceBuilder() {
  const { session } = useAuth();
  const [blocks, setBlocks] = useState<Block[]>([
    { id: "1", type: "RF", duration: 2 },
    { id: "2", type: "Gz", duration: 4 },
    { id: "3", type: "ADC", duration: 6 },
  ]);
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState<string>("none");
  const [projects, setProjects] = useState<any[]>([]);
  const [saved, setSaved] = useState<SavedRow[]>([]);
  const [currentVersion, setCurrentVersion] = useState<number | null>(null);

  const totalTime = blocks.reduce((s, b) => s + b.duration, 0);

  const loadSaved = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from("sequence_designs")
      .select("id,name,version,project_id,updated_at")
      .order("updated_at", { ascending: false });
    setSaved(data ?? []);
  }, [session]);

  const loadProjects = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase.from("hardware_projects").select("id,name").order("created_at", { ascending: false });
    setProjects(data ?? []);
  }, [session]);

  useEffect(() => { loadSaved(); loadProjects(); }, [loadSaved, loadProjects]);

  const add = (type: Block["type"]) => setBlocks((b) => [...b, { id: crypto.randomUUID(), type, duration: 2 }]);
  const remove = (id: string) => setBlocks((b) => b.filter((x) => x.id !== id));

  const save = async (asNewVersion = true) => {
    if (!session) return toast.error("Sign in required");
    if (!name.trim()) return toast.error("Name required");
    const { data: existing } = await supabase
      .from("sequence_designs")
      .select("version")
      .eq("user_id", session.user.id)
      .eq("name", name.trim())
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextVersion = asNewVersion ? ((existing?.version ?? 0) + 1) : (currentVersion ?? 1);
    const seq_text = buildSeqText(name.trim(), blocks);
    const { error } = await supabase.from("sequence_designs").insert({
      user_id: session.user.id,
      name: name.trim(),
      version: nextVersion,
      blocks: blocks as any,
      seq_text,
      project_id: projectId === "none" ? null : projectId,
    });
    if (error) toast.error(error.message);
    else { toast.success(`Saved v${nextVersion}`); setCurrentVersion(nextVersion); loadSaved(); }
  };

  const load = async (id: string) => {
    const { data } = await supabase.from("sequence_designs").select("*").eq("id", id).maybeSingle();
    if (!data) return;
    setName(data.name);
    setBlocks((data.blocks as any) ?? []);
    setProjectId(data.project_id ?? "none");
    setCurrentVersion(data.version);
    toast.success(`Loaded ${data.name} v${data.version}`);
  };

  const remove_ = async (id: string) => {
    const { error } = await supabase.from("sequence_designs").delete().eq("id", id);
    if (error) toast.error(error.message); else loadSaved();
  };

  const exportSeq = () => {
    const text = buildSeqText(name || "untitled", blocks);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${(name || "sequence").replace(/\s+/g, "_")}_v${currentVersion ?? "draft"}.seq`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <>
      <SEOHead title="Sequence Builder — VASCU-LINK" description="Versioned MRI sequence builder." />
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <Layers className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold">Sequence Builder</h1>
            <Badge variant="outline">Versioned</Badge>
          </div>
          <p className="text-muted-foreground">Compose pulse-sequence event blocks. Save, version and export .seq.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Total: {totalTime} ms {currentVersion && <Badge variant="secondary" className="ml-2">v{currentVersion}</Badge>}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(["RF", "Gx", "Gy", "Gz", "ADC"] as const).map((t) => (
                  <Button key={t} size="sm" variant="outline" onClick={() => add(t)}>
                    <Plus className="mr-1 h-3 w-3" />{t}
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                {(["RF", "Gx", "Gy", "Gz", "ADC"] as const).map((channel) => (
                  <div key={channel} className="flex items-center gap-2">
                    <span className="w-10 text-xs font-mono text-muted-foreground">{channel}</span>
                    <div className="relative flex h-8 flex-1 items-stretch overflow-hidden rounded border bg-muted/30">
                      {blocks.map((b) => (
                        <div
                          key={b.id}
                          className={b.type === channel ? `${COLORS[b.type]} opacity-90` : "bg-transparent"}
                          style={{ width: `${(b.duration / Math.max(totalTime, 1)) * 100}%` }}
                          title={`${b.type} · ${b.duration}ms`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                {blocks.map((b, i) => (
                  <div key={b.id} className="flex items-center gap-2 text-sm">
                    <span className={`h-3 w-3 rounded ${COLORS[b.type]}`} />
                    <span className="w-8 text-muted-foreground">#{i + 1}</span>
                    <span className="flex-1">{b.type} · {b.duration} ms</span>
                    <Button size="sm" variant="ghost" onClick={() => remove(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Save / Export</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="space-y-1">
                <Label>Linked project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger><SelectValue placeholder="(none)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">(none)</SelectItem>
                    {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => save(true)} className="w-full"><Save className="mr-2 h-4 w-4" />Save as new version</Button>
              <Button variant="outline" onClick={exportSeq} className="w-full"><Download className="mr-2 h-4 w-4" />Export .seq</Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FolderOpen className="h-4 w-4" />Saved sequences ({saved.length})</CardTitle></CardHeader>
          <CardContent>
            {saved.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved sequences yet.</p>
            ) : (
              <ul className="divide-y">
                {saved.map((s) => (
                  <li key={s.id} className="flex items-center gap-2 py-2 text-sm">
                    <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="flex-1">{s.name}</span>
                    <Badge variant="secondary">v{s.version}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(s.updated_at).toLocaleDateString()}</span>
                    <Button size="sm" variant="outline" onClick={() => load(s.id)}>Load</Button>
                    <Button size="sm" variant="ghost" onClick={() => remove_(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
