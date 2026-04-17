import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, ShieldAlert, FileText, Plus, Download } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import jsPDF from "jspdf";

type RiskLevel = "low" | "medium" | "high" | "critical";
type Status = "draft" | "review" | "approved" | "archived";

type Dpia = {
  id: string;
  title: string;
  scope: string;
  data_categories: string[];
  processing_purpose: string;
  legal_basis: string;
  risks: { label: string; impact: string }[];
  mitigation_measures: { label: string }[];
  residual_risk_level: RiskLevel;
  status: Status;
  created_at: string;
  updated_at: string;
};

const riskColor: Record<RiskLevel, "default" | "secondary" | "destructive" | "outline"> = {
  low: "secondary", medium: "outline", high: "default", critical: "destructive",
};

export default function Dpia() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [isDpo, setIsDpo] = useState(false);
  const [checking, setChecking] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", scope: "", data_categories: "", processing_purpose: "", legal_basis: "consent",
    risks: "", mitigation_measures: "", residual_risk_level: "low" as RiskLevel,
  });

  useEffect(() => {
    if (!user) { setChecking(false); return; }
    (async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      setIsDpo((data ?? []).some((r) => r.role === "admin" || r.role === "super_admin"));
      setChecking(false);
    })();
  }, [user]);

  const { data: dpias, isLoading } = useQuery({
    queryKey: ["dpias"],
    enabled: !!user && isDpo,
    queryFn: async (): Promise<Dpia[]> => {
      const { data, error } = await supabase.from("dpia_assessments" as never).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data as unknown as Dpia[]) ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const payload = {
        title: form.title,
        scope: form.scope,
        data_categories: form.data_categories.split(",").map((s) => s.trim()).filter(Boolean),
        processing_purpose: form.processing_purpose,
        legal_basis: form.legal_basis,
        risks: form.risks.split("\n").filter(Boolean).map((label) => ({ label, impact: "à évaluer" })),
        mitigation_measures: form.mitigation_measures.split("\n").filter(Boolean).map((label) => ({ label })),
        residual_risk_level: form.residual_risk_level,
        status: "draft" as Status,
        created_by: user.id,
      };
      const { error } = await supabase.from("dpia_assessments" as never).insert(payload as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("DPIA créée");
      setOpen(false);
      setForm({ title: "", scope: "", data_categories: "", processing_purpose: "", legal_basis: "consent", risks: "", mitigation_measures: "", residual_risk_level: "low" });
      qc.invalidateQueries({ queryKey: ["dpias"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const patch: { status: Status; approved_at?: string; approved_by?: string } = { status };
      if (status === "approved") { patch.approved_at = new Date().toISOString(); patch.approved_by = user!.id; }
      const { error } = await supabase.from("dpia_assessments" as never).update(patch as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Statut mis à jour"); qc.invalidateQueries({ queryKey: ["dpias"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const exportPdf = (d: Dpia) => {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text("Rapport DPIA — RGPD art. 35", 14, 20);
    doc.setFontSize(11); doc.text(`Titre : ${d.title}`, 14, 32);
    doc.text(`Statut : ${d.status} · Risque résiduel : ${d.residual_risk_level}`, 14, 40);
    doc.text(`Créé le : ${format(new Date(d.created_at), "dd/MM/yyyy")}`, 14, 48);
    doc.setFontSize(10);
    let y = 60;
    const section = (label: string, body: string) => {
      doc.setFont("helvetica", "bold"); doc.text(label, 14, y); y += 6;
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(body || "—", 180);
      doc.text(lines, 14, y); y += lines.length * 5 + 4;
    };
    section("Périmètre", d.scope);
    section("Catégories de données", d.data_categories.join(", "));
    section("Finalité du traitement", d.processing_purpose);
    section("Base légale", d.legal_basis);
    section("Risques identifiés", d.risks.map((r) => `• ${r.label}`).join("\n"));
    section("Mesures de mitigation", d.mitigation_measures.map((m) => `• ${m.label}`).join("\n"));
    doc.save(`dpia-${d.id.slice(0, 8)}.pdf`);
  };

  if (checking) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!isDpo) {
    return (
      <Card className="max-w-2xl mx-auto mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-destructive" />Accès refusé</CardTitle>
          <CardDescription>Réservé aux DPO (admin / super_admin).</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <SEOHead title="DPIA" description="Analyses d'impact RGPD" path="/app/governance/dpia" noindex />
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
              DPIA — Analyses d'impact
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">RGPD art. 35 · documentez les traitements à risque élevé.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nouvelle DPIA</Button></DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Créer une DPIA</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Titre *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div><Label>Périmètre *</Label><Textarea rows={2} value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} /></div>
                <div><Label>Catégories de données (séparées par virgules)</Label><Input value={form.data_categories} onChange={(e) => setForm({ ...form, data_categories: e.target.value })} placeholder="PHI, données de santé, identifiants" /></div>
                <div><Label>Finalité *</Label><Textarea rows={2} value={form.processing_purpose} onChange={(e) => setForm({ ...form, processing_purpose: e.target.value })} /></div>
                <div>
                  <Label>Base légale</Label>
                  <Select value={form.legal_basis} onValueChange={(v) => setForm({ ...form, legal_basis: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consent">Consentement</SelectItem>
                      <SelectItem value="contract">Contrat</SelectItem>
                      <SelectItem value="legal_obligation">Obligation légale</SelectItem>
                      <SelectItem value="vital_interests">Intérêts vitaux</SelectItem>
                      <SelectItem value="public_task">Mission d'intérêt public</SelectItem>
                      <SelectItem value="legitimate_interests">Intérêts légitimes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Risques identifiés (un par ligne)</Label><Textarea rows={3} value={form.risks} onChange={(e) => setForm({ ...form, risks: e.target.value })} /></div>
                <div><Label>Mesures de mitigation (une par ligne)</Label><Textarea rows={3} value={form.mitigation_measures} onChange={(e) => setForm({ ...form, mitigation_measures: e.target.value })} /></div>
                <div>
                  <Label>Niveau de risque résiduel</Label>
                  <Select value={form.residual_risk_level} onValueChange={(v) => setForm({ ...form, residual_risk_level: v as RiskLevel })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Faible</SelectItem><SelectItem value="medium">Moyen</SelectItem>
                      <SelectItem value="high">Élevé</SelectItem><SelectItem value="critical">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => create.mutate()} disabled={!form.title || !form.scope || !form.processing_purpose || create.isPending} className="w-full">
                  {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Créer la DPIA
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : !dpias?.length ? (
          <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Aucune DPIA. Créez la première pour documenter un traitement à risque.</CardContent></Card>
        ) : (
          <div className="grid gap-3">
            {dpias.map((d) => (
              <Card key={d.id}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-semibold">{d.title}</p>
                      <p className="text-xs text-muted-foreground">Mis à jour {format(new Date(d.updated_at), "dd/MM/yyyy")}</p>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant={riskColor[d.residual_risk_level]}>Risque {d.residual_risk_level}</Badge>
                      <Badge variant="outline">{d.status}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{d.scope}</p>
                  <div className="flex gap-2 flex-wrap pt-2 border-t">
                    {d.status === "draft" && <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: d.id, status: "review" })}>Soumettre en revue</Button>}
                    {d.status === "review" && <Button size="sm" onClick={() => updateStatus.mutate({ id: d.id, status: "approved" })}>Approuver</Button>}
                    {d.status === "approved" && <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: d.id, status: "archived" })}>Archiver</Button>}
                    <Button size="sm" variant="outline" onClick={() => exportPdf(d)}><Download className="h-3 w-3 mr-1" />PDF</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
