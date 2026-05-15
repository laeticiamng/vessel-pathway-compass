import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export type ExportJob = {
  id: string;
  user_id: string;
  format: "csv" | "pdf";
  status: "queued" | "running" | "done" | "failed";
  rows_total: number | null;
  rows_processed: number;
  download_path: string | null;
  error: string | null;
  created_at: string;
};

const ACTIVE: ExportJob["status"][] = ["queued", "running"];

export function ExportJobsPanel() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<ExportJob[]>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("governance_export_jobs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (!cancelled) setJobs((data ?? []) as ExportJob[]);
    };
    void load();
    const channel = supabase
      .channel(`gov-export-jobs-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "governance_export_jobs", filter: `user_id=eq.${user.id}` },
        () => { void load(); },
      )
      .subscribe();
    return () => { cancelled = true; void supabase.removeChannel(channel); };
  }, [user]);

  const download = async (job: ExportJob) => {
    if (!job.download_path) return;
    const { data, error } = await supabase.storage
      .from("governance-exports")
      .createSignedUrl(job.download_path, 3600);
    if (error || !data?.signedUrl) {
      toast.error("Could not generate download link", { description: error?.message });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const visible = jobs.filter((j) => ACTIVE.includes(j.status) || (Date.now() - new Date(j.created_at).getTime()) < 1000 * 60 * 60);
  if (visible.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-base">Background exports</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visible.map((j) => {
          const total = j.rows_total ?? 0;
          const pct = total > 0 ? Math.min(100, Math.round((j.rows_processed / total) * 100)) : 0;
          return (
            <div key={j.id} className="border border-border rounded-md p-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{j.format.toUpperCase()}</Badge>
                  {j.status === "queued" && <span className="text-muted-foreground">Queued…</span>}
                  {j.status === "running" && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Processing
                    </span>
                  )}
                  {j.status === "done" && (
                    <span className="flex items-center gap-1 text-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Ready
                    </span>
                  )}
                  {j.status === "failed" && (
                    <span className="flex items-center gap-1 text-destructive">
                      <AlertCircle className="h-3.5 w-3.5" /> Failed
                    </span>
                  )}
                  <span className="text-muted-foreground">
                    {j.rows_processed}{total ? ` / ${total}` : ""} rows
                  </span>
                </div>
                {j.status === "done" && (
                  <Button size="sm" variant="outline" onClick={() => download(j)}>
                    <Download className="h-4 w-4" /><span className="ml-2">Download</span>
                  </Button>
                )}
              </div>
              {(j.status === "running" || j.status === "queued") && (
                <Progress value={pct} className="mt-2 h-1.5" />
              )}
              {j.error && (
                <p className="mt-2 text-xs text-destructive">{j.error}</p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
