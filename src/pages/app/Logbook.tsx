import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Plus, CheckCircle2, Clock, Loader2, Trash2 } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";

const PROCEDURE_TYPES = [
  "angioplasty", "stenting", "atherectomy", "thrombectomy", "embolization",
  "bypass_graft", "endarterectomy", "diagnostic_angiography", "ivus", "oct",
  "low_field_mri", "non_contrast_mra", "duplex_ultrasound",
] as const;

const TRACKS = ["low-field-mri", "non-contrast-mra", "ivus-guided-pci", "contrast-sparing", "simulation-linked", "green-imaging"] as const;

export default function Logbook() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [procedureType, setProcedureType] = useState<string>("angioplasty");
  const [track, setTrack] = useState<string>("low-field-mri");
  const [description, setDescription] = useState("");

  const { data: entries, isLoading } = useQuery({
    queryKey: ["logbook-entries", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logbook_entries")
        .select("*")
        .order("performed_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createEntry = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("logbook_entries").insert({
        user_id: user.id,
        procedure_type: procedureType,
        track,
        description: description || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logbook-entries"] });
      setCreateOpen(false);
      setDescription("");
      toast.success(t("logbook.entryCreated") || "Entry added");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("logbook_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logbook-entries"] });
      toast.success("Entry deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const totalEntries = entries?.length ?? 0;
  const validatedEntries = entries?.filter((e) => e.supervisor_validated).length ?? 0;

  return (
    <div className="space-y-6 max-w-6xl">
      <SEOHead title="Logbook" description="Procedure logbook" path="/app/logbook" noindex />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <ClipboardList className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            {t("logbook.title") || "Procedure Logbook"}
          </h1>
          <p className="text-muted-foreground mt-1">{t("logbook.subtitle") || "Track and validate your clinical procedures"}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="self-start sm:self-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t("logbook.addEntry") || "Add Entry"}
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalEntries}</p>
              <p className="text-sm text-muted-foreground">{t("logbook.stats.total") || "Total Entries"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{validatedEntries}</p>
              <p className="text-sm text-muted-foreground">{t("logbook.stats.validated") || "Validated"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalEntries - validatedEntries}</p>
              <p className="text-sm text-muted-foreground">{t("logbook.stats.pending") || "Pending Validation"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        {!isLoading && totalEntries === 0 && (
          <Card><CardContent className="py-12 text-center"><ClipboardList className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">{t("logbook.empty") || "No entries yet"}</p></CardContent></Card>
        )}
        {entries?.map((entry) => (
          <Card key={entry.id} className="hover:border-primary/20 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold capitalize">{entry.procedure_type.replace(/_/g, " ")}</h3>
                    <Badge variant="secondary" className="text-xs capitalize">{entry.track.replace(/-/g, " ")}</Badge>
                    {entry.supervisor_validated ? (
                      <Badge variant="default" className="text-xs gap-1"><CheckCircle2 className="h-3 w-3" /> Validated</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
                    )}
                  </div>
                  {entry.description && <p className="text-sm text-muted-foreground line-clamp-1">{entry.description}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(entry.performed_at).toLocaleDateString()}</p>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => deleteEntry.mutate(entry.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("logbook.addEntry") || "Add Logbook Entry"}</DialogTitle>
            <DialogDescription>{t("logbook.addEntryDesc") || "Record a clinical procedure for your training portfolio"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("logbook.fields.procedure") || "Procedure Type"}</label>
              <Select value={procedureType} onValueChange={setProcedureType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROCEDURE_TYPES.map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">{p.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{t("logbook.fields.track") || "Training Track"}</label>
              <Select value={track} onValueChange={setTrack}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRACKS.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t.replace(/-/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">{t("logbook.fields.description") || "Description (optional)"}</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the procedure..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={() => createEntry.mutate()} disabled={createEntry.isPending}>
              {createEntry.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("common.create") || "Add Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
