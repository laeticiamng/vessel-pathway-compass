import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAuditLog } from "@/hooks/useAuditLog";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, ShieldAlert, Database, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Policy = {
  id: string;
  entity_type: string;
  retention_days: number;
  legal_basis: string;
  automatic_action: string;
  description: string | null;
};

const ENTITY_TYPES = [
  "patients", "patients_purge", "governance_events", "audit_logs",
  "notifications", "ai_outputs", "case_events", "exports",
];
const ACTIONS = ["soft_delete", "hard_delete", "anonymize", "archive"];

export default function LifecyclePolicies() {
  const { user } = useAuth();
  const { log } = useAuditLog();
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [editing, setEditing] = useState<Policy | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<Policy, "id">>({
    entity_type: "patients", retention_days: 365, legal_basis: "",
    automatic_action: "soft_delete", description: "",
  });
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) { setChecking(false); return; }
    (async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      setIsAdmin((data ?? []).some((r) => r.role === "super_admin" || r.role === "admin"));
      setChecking(false);
    })();
  }, [user]);

  const { data: policies, isLoading } = useQuery({
    queryKey: ["lifecycle-policies-admin"],
    enabled: !!user,
    queryFn: async (): Promise<Policy[]> => {
      const { data, error } = await supabase.from("data_lifecycle_policies" as never).select("*").order("entity_type");
      if (error) throw error;
      return (data as unknown as Policy[]) ?? [];
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ entity_type: "patients", retention_days: 365, legal_basis: "", automatic_action: "soft_delete", description: "" });
    setPreviewCount(null);
    setOpen(true);
  };
  const openEdit = (p: Policy) => {
    setEditing(p);
    setForm({ entity_type: p.entity_type, retention_days: p.retention_days, legal_basis: p.legal_basis, automatic_action: p.automatic_action, description: p.description ?? "" });
    setPreviewCount(null);
    setOpen(true);
  };

  const previewImpact = async () => {
    // Approximate: count rows older than retention threshold for the chosen entity_type
    const tableMap: Record<string, string> = {
      patients: "patients", patients_purge: "patients", governance_events: "governance_events",
      audit_logs: "audit_logs", notifications: "notifications", ai_outputs: "ai_outputs",
      case_events: "case_events", exports: "exports",
    };
    const t = tableMap[form.entity_type];
    if (!t) { setPreviewCount(0); return; }
    const cutoff = new Date(Date.now() - form.retention_days * 86400000).toISOString();
    const col = form.entity_type === "patients_purge" ? "deleted_at" : "created_at";
    const { count, error } = await supabase
      .from(t as never)
      .select("id", { count: "exact", head: true })
      .lt(col, cutoff);
    if (error) { toast.error(error.message); return; }
    setPreviewCount(count ?? 0);
  };

  const save = async () => {
    if (!form.legal_basis.trim()) { toast.error("Base légale requise"); return; }
    const payload = { ...form, description: form.description || null };
    const { error } = editing
      ? await supabase.from("data_lifecycle_policies" as never).update(payload as never).eq("id", editing.id)
      : await supabase.from("data_lifecycle_policies" as never).insert(payload as never);
    if (error) { toast.error(error.message); return; }
    await log({
      category: "compliance",
      action: editing ? "lifecycle.policy.updated" : "lifecycle.policy.created",
      severity: "info",
      targetEntityType: "lifecycle_policy",
      targetEntityId: editing?.id,
      context: { entity_type: form.entity_type, retention_days: form.retention_days },
    });
    toast.success(editing ? "Politique mise à jour" : "Politique créée");
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["lifecycle-policies-admin"] });
    qc.invalidateQueries({ queryKey: ["lifecycle-policies"] });
  };

  const remove = async (p: Policy) => {
    if (!confirm(`Supprimer la politique "${p.entity_type}" ?`)) return;
    const { error } = await supabase.from("data_lifecycle_policies" as never).delete().eq("id", p.id);
    if (error) { toast.error(error.message); return; }
    await log({
      category: "compliance", action: "lifecycle.policy.deleted", severity: "warn",
      targetEntityType: "lifecycle_policy", targetEntityId: p.id,
      context: { entity_type: p.entity_type },
    });
    toast.success("Politique supprimée");
    qc.invalidateQueries({ queryKey: ["lifecycle-policies-admin"] });
  };

  if (checking) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!isAdmin) {
    return (
      <Card className="max-w-2xl mx-auto mt-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-destructive" />Accès refusé</CardTitle>
          <CardDescription>Cette page est réservée aux DPO (admin / super_admin).</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <SEOHead title="Politiques de cycle de vie" description="Gestion RGPD des durées de conservation" path="/app/governance/policies" noindex />
      <div className="space-y-6 max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
              <Database className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
              Politiques de cycle de vie
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Configurez les durées de conservation et les actions automatiques (RGPD art. 5 & 17).
            </p>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nouvelle politique</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Politiques actives</CardTitle>
            <CardDescription>Exécutées quotidiennement par le job <code className="text-xs">lifecycle-enforcer</code>.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : !policies?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune politique configurée.</p>
            ) : (
              <ul className="space-y-2">
                {policies.map((p) => (
                  <li key={p.id} className="rounded-md border p-3 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{p.entity_type}</span>
                        <Badge variant="outline">{p.automatic_action}</Badge>
                        <Badge variant="secondary">{p.retention_days} jours</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Base légale : {p.legal_basis}</p>
                      {p.description && <p className="text-xs mt-1 text-muted-foreground">{p.description}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Modifier la politique" : "Nouvelle politique"}</DialogTitle>
              <DialogDescription>Une politique = un type d'entité + une durée + une action automatique.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Type d'entité</Label>
                <Select value={form.entity_type} onValueChange={(v) => setForm({ ...form, entity_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ENTITY_TYPES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Action automatique</Label>
                <Select value={form.automatic_action} onValueChange={(v) => setForm({ ...form, automatic_action: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ACTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Durée de rétention (jours)</Label>
                <Input type="number" min={1} value={form.retention_days} onChange={(e) => setForm({ ...form, retention_days: parseInt(e.target.value) || 1 })} />
              </div>
              <div>
                <Label>Base légale</Label>
                <Input value={form.legal_basis} onChange={(e) => setForm({ ...form, legal_basis: e.target.value })} placeholder="ex. RGPD art. 5.1.e – minimisation" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="rounded-md border p-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Impact estimé</span>
                  <Button size="sm" variant="outline" onClick={previewImpact}>Calculer</Button>
                </div>
                {previewCount !== null && (
                  <p className="text-sm mt-2">
                    <span className="font-bold text-primary">{previewCount}</span> ligne(s) seraient affectées par <code>{form.automatic_action}</code> dès la prochaine exécution.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button onClick={save}>{editing ? "Mettre à jour" : "Créer"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
