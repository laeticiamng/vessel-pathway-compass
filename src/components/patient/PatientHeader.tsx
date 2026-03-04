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
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={() => navigate("/app/patients")}>
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <HeartPulse className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-mono">{patient.pseudonym}</h1>
          {latestCase && <Badge variant="secondary">{latestCase.category}</Badge>}
          {latestCase && <Badge variant="outline" className="capitalize">{latestCase.status}</Badge>}
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          {patient.age_range && `${t("patientDetail.age")}: ${patient.age_range}`}
          {patient.sex && ` · ${patient.sex}`}
          {` · ${casesCount} ${t("patientDetail.cases").toLowerCase()}`}
        </p>
      </div>
      <Button variant="outline" onClick={onEdit}>
        <Edit className="h-4 w-4 mr-2" />{t("common.edit")}
      </Button>
      <Button variant="destructive" onClick={onDelete}>
        <Trash2 className="h-4 w-4 mr-2" />{t("common.delete")}
      </Button>
    </div>
  );
}
