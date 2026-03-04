import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { HeartPulse, Plus, Search, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["PAD", "Aortic", "Venous", "Carotid", "DVT/PE"] as const;
const STATUSES = ["active", "completed", "archived"] as const;
const AGE_RANGES = ["18-30", "31-40", "41-50", "51-60", "61-70", "71-80", "80+"] as const;

function riskFromFactors(factors: unknown): string {
  if (!Array.isArray(factors)) return "Low";
  const count = factors.length;
  if (count >= 4) return "Critical";
  if (count >= 3) return "High";
  if (count >= 1) return "Moderate";
  return "Low";
}

const riskColor: Record<string, string> = {
  Low: "bg-success/10 text-success",
  Moderate: "bg-warning/10 text-warning",
  High: "bg-destructive/10 text-destructive",
  Critical: "bg-destructive text-destructive-foreground",
};

export default function Patients() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [pseudonym, setPseudonym] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [sex, setSex] = useState("");
  const [category, setCategory] = useState("");
  const [caseTitle, setCaseTitle] = useState("");

  const { data: patients, isLoading } = useQuery({
    queryKey: ["patients", filterCategory, filterStatus],
    queryFn: async () => {
      const { data: patientsData, error: pErr } = await supabase
        .from("patients")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(50);
      if (pErr) throw pErr;

      const patientIds = patientsData.map((p) => p.id);
      let casesQuery = supabase
        .from("cases")
        .select("*")
        .in("patient_id", patientIds.length > 0 ? patientIds : ["00000000-0000-0000-0000-000000000000"])
        .order("updated_at", { ascending: false });

      if (filterCategory && filterCategory !== "all") {
        casesQuery = casesQuery.eq("category", filterCategory);
      }
      if (filterStatus && filterStatus !== "all") {
        casesQuery = casesQuery.eq("status", filterStatus);
      }

      const { data: casesData, error: cErr } = await casesQuery;
      if (cErr) throw cErr;

      const casesByPatient = new Map<string, typeof casesData>();
      for (const c of casesData ?? []) {
        const arr = casesByPatient.get(c.patient_id) ?? [];
        arr.push(c);
        casesByPatient.set(c.patient_id, arr);
      }

      const hasActiveFilters = (filterCategory && filterCategory !== "all") || (filterStatus && filterStatus !== "all");

      return patientsData
        .map((p) => {
          const cases = casesByPatient.get(p.id) ?? [];
          const latestCase = cases[0];
          return {
            ...p,
            latestCase,
            caseCount: cases.length,
            risk: riskFromFactors(p.risk_factors),
          };
        })
        .filter((p) => !hasActiveFilters || p.caseCount > 0);
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { data: patient, error: pErr } = await supabase
        .from("patients")
        .insert({
          pseudonym,
          age_range: ageRange || null,
          sex: sex || null,
          created_by: user.id,
        })
        .select()
        .single();
      if (pErr) throw pErr;

      const { error: cErr } = await supabase.from("cases").insert({
        patient_id: patient.id,
        category: category || "pad",
        title: caseTitle || pseudonym,
        created_by: user.id,
      });
      if (cErr) throw cErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: t("common.create"), description: t("patients.newCase") });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  function resetForm() {
    setPseudonym("");
    setAgeRange("");
    setSex("");
    setCategory("");
    setCaseTitle("");
  }

  const filtered = patients?.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.pseudonym.toLowerCase().includes(q) ||
      (p.latestCase?.category ?? "").toLowerCase().includes(q) ||
      (p.latestCase?.status ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("patients.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("patients.subtitle")}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("patients.newCase")}
        </Button>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("patients.searchPlaceholder")}
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("patients.filters.allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("patients.filters.allCategories")}</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("patients.filters.allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("patients.filters.allStatuses")}</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("patients.columns.caseId")}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("patients.columns.category")}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("patients.columns.status")}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("patients.columns.risk")}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("patients.columns.lastVisit")}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                    </tr>
                  ))}
                {!isLoading && filtered?.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => navigate(`/app/patients/${p.id}`)}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <HeartPulse className="h-4 w-4 text-primary" />
                        <span className="font-mono text-sm font-medium">{p.pseudonym}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">{p.latestCase?.category ?? "—"}</Badge>
                    </td>
                    <td className="p-4 text-sm capitalize">{p.latestCase?.status ?? "—"}</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${riskColor[p.risk]}`}>
                        {p.risk}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {p.latestCase?.updated_at
                        ? new Date(p.latestCase.updated_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
                {!isLoading && filtered?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
                      <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">{t("patients.empty")}</p>
                      <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("patients.newCase")}
                      </Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* New Case Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("patients.newCase")}</DialogTitle>
            <DialogDescription>{t("patients.form.description")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("patients.form.pseudonym")}</Label>
              <Input
                placeholder="e.g. PAT-2026-001"
                value={pseudonym}
                onChange={(e) => setPseudonym(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("patients.form.ageRange")}</Label>
                <Select value={ageRange} onValueChange={setAgeRange}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {AGE_RANGES.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("patients.form.sex")}</Label>
                <Select value={sex} onValueChange={setSex}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("patients.form.male")}</SelectItem>
                    <SelectItem value="female">{t("patients.form.female")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("patients.form.category")}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("patients.form.caseTitle")}</Label>
              <Input
                placeholder="e.g. Right SFA occlusion"
                value={caseTitle}
                onChange={(e) => setCaseTitle(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => createMutation.mutate()}
              disabled={!pseudonym || createMutation.isPending}
            >
              {createMutation.isPending ? t("common.loading") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
