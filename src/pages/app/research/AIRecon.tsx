import { useState, useEffect, useCallback, useRef } from "react";
import { ResearchPreviewBanner } from "@/components/ResearchPreviewBanner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Brain, Upload, Play, Trash2, AlertTriangle } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

type Pipeline = "compressed-sensing" | "unet-denoising" | "modl" | "diffusion";

const PIPELINES: { value: Pipeline; name: string; desc: string; ref: string }[] = [
  { value: "compressed-sensing", name: "Compressed Sensing", desc: "L1-wavelet reconstruction from undersampled k-space.", ref: "Lustig PMID 17969013" },
  { value: "unet-denoising", name: "U-Net Denoising", desc: "Patch-based CNN for low-SNR.", ref: "Ronneberger MICCAI 2015" },
  { value: "modl", name: "MoDL", desc: "Unrolled iterative network with data consistency.", ref: "Aggarwal PMID 30106719" },
  { value: "diffusion", name: "Score-based Diffusion", desc: "Posterior sampling for accelerated MRA.", ref: "Chung MedIA 2022" },
];

const MAX_BYTES = 50 * 1024 * 1024;

export default function AIRecon() {
  const { session } = useAuth();
  const [pipeline, setPipeline] = useState<Pipeline>("compressed-sensing");
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

  // Realtime job updates
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
    toast.success("Job queued");
    setFile(null); if (fileRef.current) fileRef.current.value = "";

    // Client-side simulated processing (research preview — no real GPU backend)
    simulateProcessing(job.id);
  };

  const simulateProcessing = async (jobId: string) => {
    await supabase.from("ai_recon_jobs").update({ status: "running", started_at: new Date().toISOString(), progress: 10 }).eq("id", jobId);
    for (const p of [30, 55, 80]) {
      await new Promise((r) => setTimeout(r, 1200));
      await supabase.from("ai_recon_jobs").update({ progress: p }).eq("id", jobId);
    }
    await new Promise((r) => setTimeout(r, 1200));
    const results = {
      snr_gain_db: +(Math.random() * 6 + 2).toFixed(2),
      acceleration_factor: +(Math.random() * 4 + 2).toFixed(1),
      runtime_s: +(Math.random() * 30 + 10).toFixed(1),
      note: "Simulated metrics — no real GPU reconstruction performed.",
    };
    await supabase.from("ai_recon_jobs").update({
      status: "completed", progress: 100, completed_at: new Date().toISOString(), results,
    }).eq("id", jobId);
  };

  const remove = async (id: string, path: string | null) => {
    if (path) await supabase.storage.from("dicom-uploads").remove([path]);
    const { error } = await supabase.from("ai_recon_jobs").delete().eq("id", id);
    if (error) toast.error(error.message); else loadJobs();
  };

  return (
    <>
      <SEOHead title="AI Reconstruction — VASCU-LINK" description="Upload k-space/DICOM and run AI reconstruction pipelines." />
      <ResearchPreviewBanner />
      <div className="container mx-auto max-w-7xl space-y-6 p-6">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <Brain className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-bold">AI Reconstruction Lab</h1>
            <Badge variant="outline">4 pipelines</Badge>
          </div>
          <p className="text-muted-foreground">Upload a k-space (.npy/.h5/.mat) or DICOM file and launch a reconstruction job.</p>
        </header>

        <Alert variant="default" className="border-amber-500/40 bg-amber-500/5">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            Processing currently runs in <strong>simulation mode</strong> (no GPU backend). Metrics are illustrative and not clinically valid.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader><CardTitle>New job</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Pipeline</label>
                <Select value={pipeline} onValueChange={(v) => setPipeline(v as Pipeline)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PIPELINES.map((p) => <SelectItem key={p.value} value={p.value}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{PIPELINES.find((p) => p.value === pipeline)?.ref}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Input file (≤ 50 MB)</label>
                <input ref={fileRef} type="file" onChange={onSelectFile} accept=".npy,.h5,.mat,.raw,.dcm,.dicom" className="block w-full text-sm" />
                {file && <p className="text-xs text-muted-foreground">{file.name} · {(file.size / 1024 / 1024).toFixed(2)} MB · {detectType(file.name)}</p>}
              </div>
            </div>
            <Button onClick={launch} disabled={!file || uploading} className="w-full">
              {uploading ? <Upload className="mr-2 h-4 w-4 animate-pulse" /> : <Play className="mr-2 h-4 w-4" />}
              {uploading ? "Uploading…" : "Launch reconstruction"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent jobs ({jobs.length})</CardTitle>
            <CardDescription>Last 20 — live updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobs.length === 0 && <p className="text-sm text-muted-foreground">No jobs yet.</p>}
            {jobs.map((j) => (
              <div key={j.id} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">{j.pipeline}</Badge>
                  <Badge variant={j.status === "completed" ? "default" : j.status === "failed" ? "destructive" : "secondary"}>{j.status}</Badge>
                  <span className="text-xs text-muted-foreground">{j.input_type}</span>
                  <span className="flex-1" />
                  <span className="text-xs text-muted-foreground">{new Date(j.created_at).toLocaleString()}</span>
                  <Button size="sm" variant="ghost" onClick={() => remove(j.id, j.input_path)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
                {(j.status === "running" || j.status === "queued") && <Progress value={j.progress} className="h-2" />}
                {j.status === "completed" && j.results && (
                  <div className="mt-2 grid gap-2 text-sm md:grid-cols-3">
                    <Metric label="SNR gain" value={`+${j.results.snr_gain_db} dB`} />
                    <Metric label="Acceleration" value={`×${j.results.acceleration_factor}`} />
                    <Metric label="Runtime" value={`${j.results.runtime_s}s`} />
                  </div>
                )}
                {j.error && <p className="mt-1 text-xs text-destructive">{j.error}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border bg-muted/30 p-2 text-center">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="font-bold text-primary">{value}</p>
    </div>
  );
}
