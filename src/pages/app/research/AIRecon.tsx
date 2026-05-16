import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Brain, Upload, Play, Trash2, AlertTriangle, Info, ChevronDown } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { ModelCard } from "@/components/research/ModelCard";
import {
  MODEL_REGISTRY,
  PIPELINE_ORDER,
  BASELINE_METHOD,
  buildSimulatedResult,
  type PipelineId,
} from "@/lib/aiRecon/modelRegistry";

const MAX_BYTES = 50 * 1024 * 1024;

export default function AIRecon() {
  const { session } = useAuth();
  const [pipeline, setPipeline] = useState<PipelineId>("compressed-sensing");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadJobs = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from("ai_recon_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setJobs(data ?? []);
  }, [session]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  useEffect(() => {
    if (!session) return;
    const ch = supabase
      .channel("ai-recon-jobs")
      .on("postgres_changes", { event: "*", schema: "public", table: "ai_recon_jobs", filter: `user_id=eq.${session.user.id}` }, () => loadJobs())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [session, loadJobs]);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_BYTES) { toast.error("File > 50 MB"); return; }
    setFile(f);
  };

  const detectType = (name: string): "kspace" | "dicom" | "other" => {
    const lower = name.toLowerCase();
    if (lower.endsWith(".dcm") || lower.endsWith(".dicom")) return "dicom";
    if (lower.endsWith(".npy") || lower.endsWith(".h5") || lower.endsWith(".mat") || lower.endsWith(".raw")) return "kspace";
    return "other";
  };

  const launch = async () => {
    if (!session) return toast.error("Sign in required");
    if (!file) return toast.error("Select a file");
    setUploading(true);
    const path = `recon-inputs/${session.user.id}/${Date.now()}_${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error: upErr } = await supabase.storage.from("dicom-uploads").upload(path, file, { upsert: false });
    if (upErr) { setUploading(false); return toast.error(`Upload failed: ${upErr.message}`); }

    const { data: job, error: jobErr } = await supabase.from("ai_recon_jobs").insert({
      user_id: session.user.id,
      pipeline,
      input_path: path,
      input_type: detectType(file.name),
      parameters: { file_name: file.name, file_size: file.size },
      status: "queued",
    }).select().single();

    setUploading(false);
    if (jobErr) return toast.error(jobErr.message);
    toast.success("Job queued (simulated)");
    setFile(null); if (fileRef.current) fileRef.current.value = "";

    simulateProcessing(job.id, pipeline);
  };

  const simulateProcessing = async (jobId: string, pipelineId: PipelineId) => {
    await supabase.from("ai_recon_jobs").update({ status: "running", started_at: new Date().toISOString(), progress: 10 }).eq("id", jobId);
    for (const p of [30, 55, 80]) {
      await new Promise((r) => setTimeout(r, 1200));
      await supabase.from("ai_recon_jobs").update({ progress: p }).eq("id", jobId);
    }
    await new Promise((r) => setTimeout(r, 1200));
    const results = buildSimulatedResult(pipelineId);
    await supabase.from("ai_recon_jobs").update({
      status: "completed", progress: 100, completed_at: new Date().toISOString(), results,
    }).eq("id", jobId);
  };

  const remove = async (id: string, path: string | null) => {
    if (path) await supabase.storage.from("dicom-uploads").remove([path]);
    const { error } = await supabase.from("ai_recon_jobs").delete().eq("id", id);
    if (error) toast.error(error.message); else loadJobs();
  };

  const currentModel = MODEL_REGISTRY[pipeline];

  return (
    <>
      <SEOHead title="AI Reconstruction — VASCU-LINK" description="Research preview of MRI reconstruction pipelines — simulated output, transparent provenance, baseline comparison." />
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        {/* Sticky honesty banner */}
        <div className="sticky top-0 z-30 -mx-6 border-b border-amber-500/40 bg-amber-500/10 px-6 py-2 backdrop-blur">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-amber-900 dark:text-amber-200">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>Research preview</span>
            <span aria-hidden>·</span>
            <span>Simulated output (no GPU backend)</span>
            <span aria-hidden>·</span>
            <span>Not a medical device · No CE/FDA</span>
            <span aria-hidden>·</span>
            <span>TRL 2–4 per pipeline</span>
          </p>
        </div>

        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <Brain className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold">AI Reconstruction Lab</h1>
            <Badge variant="outline">{PIPELINE_ORDER.length} pipelines</Badge>
          </div>
          <p className="text-muted-foreground">
            Upload a k-space (.npy/.h5/.mat) or DICOM file and explore reconstruction pipelines.
            Each pipeline carries a public <strong>model card</strong> (provenance, training data, limitations) and every
            simulated result is shown against the <strong>{BASELINE_METHOD.name}</strong> baseline.
          </p>
        </header>

        <Tabs defaultValue="run" className="space-y-4">
          <TabsList>
            <TabsTrigger value="run">Run</TabsTrigger>
            <TabsTrigger value="model">Model card</TabsTrigger>
            <TabsTrigger value="methodology">Methodology</TabsTrigger>
          </TabsList>

          {/* RUN ----------------------------------------------------------- */}
          <TabsContent value="run" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>New job</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Pipeline</label>
                    <Select value={pipeline} onValueChange={(v) => setPipeline(v as PipelineId)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PIPELINE_ORDER.map((id) => (
                          <SelectItem key={id} value={id}>{MODEL_REGISTRY[id].name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      TRL {currentModel.trl} · {currentModel.currentStatus}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Input file (≤ 50 MB)</label>
                    <input ref={fileRef} type="file" onChange={onSelectFile} accept=".npy,.h5,.mat,.raw,.dcm,.dicom" className="block w-full text-sm" />
                    {file && <p className="text-xs text-muted-foreground">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB · {detectType(file.name)}</p>}
                  </div>
                </div>
                <Alert variant="default" className="border-amber-500/40 bg-amber-500/5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-xs">
                    Launching a job will produce <strong>simulated metrics</strong> only (no GPU inference).
                    The baseline ({BASELINE_METHOD.name}) is computed alongside so no AI metric is shown in isolation.
                  </AlertDescription>
                </Alert>
                <Button onClick={launch} disabled={!file || uploading} className="w-full">
                  {uploading ? <Upload className="mr-2 h-4 w-4 animate-pulse" /> : <Play className="mr-2 h-4 w-4" />}
                  {uploading ? "Uploading…" : "Launch (simulated) reconstruction"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent jobs ({jobs.length})</CardTitle>
                <CardDescription>Last 20 — live updates. All metrics below are simulated.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {jobs.length === 0 && <p className="text-sm text-muted-foreground">No jobs yet.</p>}
                {jobs.map((j) => (
                  <JobResult key={j.id} job={j} onRemove={() => remove(j.id, j.input_path)} />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MODEL CARD --------------------------------------------------- */}
          <TabsContent value="model">
            <ModelCard entry={currentModel} />
          </TabsContent>

          {/* METHODOLOGY -------------------------------------------------- */}
          <TabsContent value="methodology" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Baseline: {BASELINE_METHOD.name}</CardTitle>
                <CardDescription>{BASELINE_METHOD.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Why a baseline is mandatory.</strong> Any "+X dB SNR" or "×N acceleration" number is meaningless without a comparator. We always report the baseline next to the AI output so improvements can be judged in context.</p>
                <p className="text-xs">Reference: {BASELINE_METHOD.reference}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Metrics defined</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p><strong>PSNR (dB)</strong> — Peak Signal-to-Noise Ratio against a reference image. Higher is better, but invariant to perceptual structure.</p>
                <p><strong>SSIM</strong> — Structural Similarity Index ∈ [0, 1]. Captures local luminance/contrast/structure agreement.</p>
                <p><strong>NRMSE</strong> — Normalised Root Mean Squared Error. Lower is better; sensitive to outliers.</p>
                <p className="text-xs">None of these metrics measure diagnostic accuracy. A high PSNR does not imply clinical safety. VASCU-LINK does not claim diagnostic superiority over MRI/CTA/MRA/DSA (v8.3).</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Fair-comparison conditions</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <ul className="list-disc space-y-1 pl-5">
                  <li>Identical undersampling mask between baseline and AI run.</li>
                  <li>Identical coil sensitivities and normalisation.</li>
                  <li>Acceleration factor reported with every metric.</li>
                  <li>Pipeline TRL and weight provenance disclosed (see Model card tab).</li>
                  <li>Domain-shift warning when training data ≠ target anatomy (peripheral MRA).</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// -----------------------------------------------------------------------------
// Job result card — baseline vs AI, never a single isolated number
// -----------------------------------------------------------------------------

function JobResult({ job, onRemove }: { job: any; onRemove: () => void }) {
  const r = job.results as ReturnType<typeof buildSimulatedResult> | null;
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 flex items-center gap-2">
        <Badge variant="outline">{MODEL_REGISTRY[job.pipeline as PipelineId]?.name ?? job.pipeline}</Badge>
        <Badge variant={job.status === "completed" ? "default" : job.status === "failed" ? "destructive" : "secondary"}>
          {job.status}
        </Badge>
        {r?.status === "simulated" && (
          <Badge variant="secondary" className="gap-1"><Info className="h-3 w-3" />simulated</Badge>
        )}
        <span className="text-xs text-muted-foreground">{job.input_type}</span>
        <span className="flex-1" />
        <span className="text-xs text-muted-foreground">{new Date(job.created_at).toLocaleString()}</span>
        <Button size="sm" variant="ghost" onClick={onRemove}><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>

      {(job.status === "running" || job.status === "queued") && <Progress value={job.progress} className="h-2" />}

      {job.status === "completed" && r && (
        <div className="mt-2 space-y-3">
          <div className="overflow-x-auto rounded border border-border/60">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-2 text-left">Metric</th>
                  <th className="p-2 text-left">Baseline ({r.baseline.method})</th>
                  <th className="p-2 text-left">AI output (simulated)</th>
                  <th className="p-2 text-left">Δ vs baseline</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border/60">
                  <td className="p-2 font-medium">PSNR (dB)</td>
                  <td className="p-2 font-mono">{r.baseline.psnr_db}</td>
                  <td className="p-2 font-mono">{r.ai_output.psnr_db}</td>
                  <td className="p-2 font-mono text-primary">+{r.delta_vs_baseline.psnr_db}</td>
                </tr>
                <tr className="border-t border-border/60">
                  <td className="p-2 font-medium">SSIM</td>
                  <td className="p-2 font-mono">{r.baseline.ssim}</td>
                  <td className="p-2 font-mono">{r.ai_output.ssim}</td>
                  <td className="p-2 font-mono text-primary">+{r.delta_vs_baseline.ssim}</td>
                </tr>
                <tr className="border-t border-border/60">
                  <td className="p-2 font-medium">NRMSE</td>
                  <td className="p-2 font-mono text-muted-foreground">N/A</td>
                  <td className="p-2 font-mono">{r.ai_output.nrmse}</td>
                  <td className="p-2 font-mono text-muted-foreground">—</td>
                </tr>
              </tbody>
            </table>
          </div>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
              <ChevronDown className="h-3 w-3" /> Acquisition assumptions
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 grid gap-2 rounded border border-border/60 bg-muted/20 p-2 text-xs md:grid-cols-3">
              <span>Acceleration: <strong>×{r.acquisition_assumptions.acceleration_factor}</strong></span>
              <span>Mask: <strong>{r.acquisition_assumptions.undersampling_mask}</strong></span>
              <span>Coils: <strong>{r.acquisition_assumptions.coil_count}</strong></span>
              <span>Runtime: <strong>{r.runtime_s}s</strong></span>
              <span className="col-span-2">Generated by: <strong>{r.generated_by}</strong></span>
            </CollapsibleContent>
          </Collapsible>

          <Alert variant="default" className="border-destructive/40 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-xs">
              These results are <strong>simulated</strong> and <strong>must not be cited</strong> outside a research-preview
              context. See the <em>Model card</em> tab for full provenance and limitations.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {job.error && <p className="mt-1 text-xs text-destructive">{job.error}</p>}
    </div>
  );
}
