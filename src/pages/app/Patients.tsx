import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/i18n/context";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PatientFilters } from "@/components/patient/PatientFilters";
import { PatientsTable } from "@/components/patient/PatientsTable";
import { NewCaseDialog } from "@/components/patient/NewCaseDialog";

function riskFromFactors(factors: unknown): string {
  if (!Array.isArray(factors)) return "Low";
  const count = factors.length;
  if (count >= 4) return "Critical";
  if (count >= 3) return "High";
  if (count >= 1) return "Moderate";
  return "Low";
}

export default function Patients() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

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

      if (filterCategory && filterCategory !== "all") casesQuery = casesQuery.eq("category", filterCategory);
      if (filterStatus && filterStatus !== "all") casesQuery = casesQuery.eq("status", filterStatus);

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
          return { ...p, latestCase, caseCount: cases.length, risk: riskFromFactors(p.risk_factors) };
        })
        .filter((p) => !hasActiveFilters || p.caseCount > 0);
    },
    enabled: !!user,
  });

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

      <PatientFilters
        search={search} onSearchChange={setSearch}
        filterCategory={filterCategory} onFilterCategoryChange={setFilterCategory}
        filterStatus={filterStatus} onFilterStatusChange={setFilterStatus}
      />

      <PatientsTable
        patients={filtered}
        isLoading={isLoading}
        onRowClick={(id) => navigate(`/app/patients/${id}`)}
        onNewCase={() => setDialogOpen(true)}
      />

      <NewCaseDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
