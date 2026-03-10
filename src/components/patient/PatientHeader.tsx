import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, HeartPulse, Edit, Trash2 } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import type { Tables } from "@/integrations/supabase/types";

interface PatientHeaderProps {
  patient: Tables<"patients">;
  latestCase?: Tables<"cases">;
  casesCount: number;
  onEdit: () => void;
  onDelete: () => void;
}

export default function PatientHeader({ patient, latestCase, casesCount, onEdit, onDelete }: PatientHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" onClick={() => navigate("/app/patients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <HeartPulse className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
            <h1 className="text-xl sm:text-2xl font-bold font-mono truncate">{patient.pseudonym}</h1>
            {latestCase && <Badge variant="secondary" className="text-xs">{latestCase.category}</Badge>}
            {latestCase && <Badge variant="outline" className="capitalize text-xs">{latestCase.status}</Badge>}
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1 ml-7 sm:ml-8">
            {patient.age_range && `${t("patientDetail.age")}: ${patient.age_range}`}
            {patient.sex && ` · ${patient.sex}`}
            {` · ${casesCount} ${t("patientDetail.cases").toLowerCase()}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-12 sm:ml-0 shrink-0">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{t("common.edit")}</span>
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{t("common.delete")}</span>
        </Button>
      </div>
    </div>
  );
}
