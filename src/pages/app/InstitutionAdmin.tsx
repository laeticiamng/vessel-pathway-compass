import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Building2, Save, MapPin, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";

interface Institution { id: string; name: string; city: string | null; country: string | null; }
interface Settings {
  institution_id: string;
  data_region: string;
  retention_override_days: number | null;
  dpo_contact_email: string | null;
  mdr_class: string;
}
interface Health {
  patients_active: number;
  patients_total: number;
  cases_total: number;
  members_count: number;
  pending_signoffs: number;
  anomalies_7d: number;
  events_30d: number;
}

export default function InstitutionAdmin() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Settings>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data: rolesData } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      const roles = (rolesData ?? []).map((r) => r.role);
      const allowed = roles.some((r) => ["hospital_admin", "admin", "super_admin"].includes(r as string));
      setAuthorized(allowed);
      if (allowed) {
        const { data: inst } = await supabase.from("institutions").select("id,name,city,country").order("name");
        setInstitutions((inst ?? []) as Institution[]);
        if (inst && inst.length > 0) setSelectedId(inst[0].id);
      }
      setLoading(false);
    })();
  }, [user]);

  const { data: settings } = useQuery({
    queryKey: ["institution-settings", selectedId],
    enabled: !!selectedId,
    queryFn: async (): Promise<Settings | null> => {
      if (!selectedId) return null;
      const { data, error } = await supabase
        .from("institution_settings" as never)
        .select("*")
        .eq("institution_id", selectedId)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Settings) ?? null;
    },
  });

  useEffect(() => {
    if (settings) setForm(settings);
    else if (selectedId)
      setForm({ institution_id: selectedId, data_region: "eu-west", mdr_class: "I", retention_override_days: null, dpo_contact_email: "" });
  }, [settings, selectedId]);

  const { data: health } = useQuery({
    queryKey: ["institution-health", selectedId],
    enabled: !!selectedId,
    queryFn: async (): Promise<Health | null> => {
      if (!selectedId) return null;
      const { data, error } = await supabase.rpc("institution_health" as never, { _institution_id: selectedId } as never);
      if (error) throw error;
      return (data as unknown as Health) ?? null;
    },
  });

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const payload = {
        institution_id: selectedId,
        data_region: form.data_region ?? "eu-west",
        retention_override_days: form.retention_override_days,
        dpo_contact_email: form.dpo_contact_email || null,
        mdr_class: form.mdr_class ?? "I",
      };
      const { error } = await supabase
        .from("institution_settings" as never)
        .upsert(payload as never, { onConflict: "institution_id" });
      if (error) throw error;
      await supabase.rpc("log_governance_event" as never, {
        _category: "administration",
        _action: "institution.settings.updated",
        _severity: "info",
        _institution_id: selectedId,
        _context: payload as never,
      } as never);
      toast.success("Paramètres enregistrés");
      qc.invalidateQueries({ queryKey: ["institution-settings", selectedId] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!authorized) {
    return (
      <Card className="max-w-2xl mx-auto mt-12">
        <CardHeader>
          <CardTitle>Accès refusé</CardTitle>
          <CardDescription>Réservé aux hospital admins et administrateurs.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <SEOHead title="Administration institution" description="Tableau de bord cloisonné par hôpital" path="/app/admin/institution" noindex />
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            Administration institution
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Métriques cloisonnées par hôpital, paramètres de conformité et data residency.
          </p>
        </div>

        {institutions.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">Aucune institution rattachée à votre compte.</CardContent></Card>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Label className="shrink-0">Institution :</Label>
              <Select value={selectedId ?? ""} onValueChange={setSelectedId}>
                <SelectTrigger className="max-w-md"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {institutions.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name} {i.city && `· ${i.city}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Health metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activité opérationnelle</CardTitle>
                <CardDescription>Métriques scopées à cette institution uniquement.</CardDescription>
              </CardHeader>
              <CardContent>
                {!health ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <Card><CardHeader className="pb-2">
                      <CardDescription className="flex items-center gap-1.5 text-xs"><Users className="h-3.5 w-3.5" /> Patients actifs</CardDescription>
                      <CardTitle className="text-2xl">{health.patients_active}</CardTitle>
                    </CardHeader></Card>
                    <Card><CardHeader className="pb-2">
                      <CardDescription className="text-xs">Cas cliniques</CardDescription>
                      <CardTitle className="text-2xl">{health.cases_total}</CardTitle>
                    </CardHeader></Card>
                    <Card><CardHeader className="pb-2">
                      <CardDescription className="text-xs">Membres</CardDescription>
                      <CardTitle className="text-2xl">{health.members_count}</CardTitle>
                    </CardHeader></Card>
                    <Card className={health.anomalies_7d > 0 ? "border-destructive/50" : ""}><CardHeader className="pb-2">
                      <CardDescription className="text-xs">Anomalies 7j</CardDescription>
                      <CardTitle className="text-2xl">{health.anomalies_7d}</CardTitle>
                    </CardHeader></Card>
                    <Card><CardHeader className="pb-2">
                      <CardDescription className="text-xs">Signoffs en attente</CardDescription>
                      <CardTitle className="text-2xl">{health.pending_signoffs}</CardTitle>
                    </CardHeader></Card>
                    <Card><CardHeader className="pb-2">
                      <CardDescription className="text-xs">Événements 30j</CardDescription>
                      <CardTitle className="text-2xl">{health.events_30d}</CardTitle>
                    </CardHeader></Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Paramètres de conformité</CardTitle>
                <CardDescription>Data residency, classe de dispositif médical et contact DPO.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="region" className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Région de données</Label>
                    <Select value={form.data_region ?? "eu-west"} onValueChange={(v) => setForm({ ...form, data_region: v })}>
                      <SelectTrigger id="region"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eu-west">EU West (Irlande)</SelectItem>
                        <SelectItem value="eu-central">EU Central (Francfort)</SelectItem>
                        <SelectItem value="eu-north">EU North (Stockholm)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="mdr">Classe MDR</Label>
                    <Select value={form.mdr_class ?? "I"} onValueChange={(v) => setForm({ ...form, mdr_class: v })}>
                      <SelectTrigger id="mdr"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="I">Classe I</SelectItem>
                        <SelectItem value="IIa">Classe IIa</SelectItem>
                        <SelectItem value="IIb">Classe IIb</SelectItem>
                        <SelectItem value="III">Classe III</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dpo">Contact DPO (email)</Label>
                    <Input id="dpo" type="email" value={form.dpo_contact_email ?? ""} onChange={(e) => setForm({ ...form, dpo_contact_email: e.target.value })} placeholder="dpo@hopital.fr" />
                  </div>
                  <div>
                    <Label htmlFor="ret">Rétention spécifique (jours)</Label>
                    <Input id="ret" type="number" value={form.retention_override_days ?? ""} onChange={(e) => setForm({ ...form, retention_override_days: e.target.value ? parseInt(e.target.value) : null })} placeholder="laisse vide pour défaut" />
                  </div>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Enregistrer
                </Button>
                <p className="text-xs text-muted-foreground">
                  ADR-013 — La sélection de région applique le routage de stockage au prochain provisioning. Les contrats SLA sont alignés sur la classe MDR.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
