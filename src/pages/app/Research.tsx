import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Users, Database, Download, BarChart3, Loader2 } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "@/i18n/context";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export default function Research() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");

  const { data: studies = [], isLoading } = useQuery({
    queryKey: ["studies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studies")
        .select("*, study_members(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: exportCount = 0 } = useQuery({
    queryKey: ["exports-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("exports").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
  });

  const createStudy = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("studies").insert({
        title,
        description: description || null,
        status,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studies"] });
      setDialogOpen(false);
      setTitle("");
      setDescription("");
      setStatus("draft");
      toast.success(t("research.studyCreated"));
    },
    onError: () => toast.error(t("auth.error")),
  });

  const activeStudies = studies.filter((s) => s.status !== "draft").length;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            {t("research.title")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("research.subtitle")}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("research.newStudy")}
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("research.stats.activeStudies")}</p>
            <p className="text-3xl font-bold mt-1">{activeStudies}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("research.stats.eligiblePatients")}</p>
            <p className="text-3xl font-bold mt-1">—</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("research.stats.dataExports")}</p>
            <p className="text-3xl font-bold mt-1">{exportCount}</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : studies.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>{t("research.empty")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {studies.map((s) => (
            <Card key={s.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{s.title}</h3>
                      <Badge variant={s.status === "active" ? "default" : s.status === "recruiting" ? "secondary" : "outline"}>
                        {t(`research.statuses.${s.status}` as any) || s.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {(s as any).study_members?.[0]?.count ?? 0} {t("research.members")}
                      </span>
                      {s.description && <span className="truncate max-w-[300px]">{s.description}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toast.info(t("common.comingSoon"))}>
                      <BarChart3 className="h-3.5 w-3.5 mr-1" />
                      {t("common.analytics")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toast.info(t("common.comingSoon"))}>
                      <Download className="h-3.5 w-3.5 mr-1" />
                      {t("common.export")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("research.newStudy")}</DialogTitle>
            <DialogDescription>{t("research.newStudyDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("research.form.title")}</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("research.form.titlePlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("research.form.description")}</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("research.form.descPlaceholder")} />
            </div>
            <div className="space-y-2">
              <Label>{t("research.form.status")}</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t("research.statuses.draft")}</SelectItem>
                  <SelectItem value="recruiting">{t("research.statuses.recruiting")}</SelectItem>
                  <SelectItem value="active">{t("research.statuses.active")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => createStudy.mutate()} disabled={!title.trim() || createStudy.isPending} className="w-full">
              {createStudy.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("common.create")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
