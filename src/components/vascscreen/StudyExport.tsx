import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileSpreadsheet, FileJson, Shield } from "lucide-react";
import { toast } from "sonner";

interface StudyPatient {
  pseudonym: string;
  age: number;
  sex: string;
  smokingStatus: string;
  diabetes: boolean;
  hypertension: boolean;
  dyslipidemia: boolean;
  knownCVD: boolean;
  ckd: boolean;
  claudication: boolean;
  restPain: boolean;
  nonHealingWounds: boolean;
  screeningEligible: boolean;
  riskScore: number;
  abiRight?: number;
  abiLeft?: number;
  abiInterpretation?: string;
  referredToAngiologist: boolean;
  padConfirmed?: boolean;
  padFontaineStage?: string;
  timeToDiagnosisDays?: number;
}

interface StudyExportProps {
  patients: StudyPatient[];
  cohortName: string;
}

export function StudyExport({ patients, cohortName }: StudyExportProps) {
  const { t } = useTranslation();

  const generateCSV = () => {
    if (patients.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = Object.keys(patients[0]);
    const rows = patients.map((p) =>
      headers.map((h) => {
        const val = (p as Record<string, unknown>)[h];
        return typeof val === "string" ? `"${val}"` : String(val ?? "");
      }).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vascscreen-${cohortName}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const generateJSON = () => {
    if (patients.length === 0) {
      toast.error("No data to export");
      return;
    }

    const json = JSON.stringify(
      {
        cohort: cohortName,
        exportDate: new Date().toISOString(),
        patientCount: patients.length,
        data: patients,
      },
      null,
      2
    );

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vascscreen-${cohortName}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON exported");
  };

  // Compute summary stats
  const totalScreened = patients.filter((p) => p.screeningEligible).length;
  const padDetected = patients.filter((p) => p.padConfirmed).length;
  const referred = patients.filter((p) => p.referredToAngiologist).length;
  const diagnosisTimes = patients
    .filter((p) => p.timeToDiagnosisDays != null)
    .map((p) => p.timeToDiagnosisDays!);
  const meanDiagnosis = diagnosisTimes.length > 0
    ? (diagnosisTimes.reduce((a, b) => a + b, 0) / diagnosisTimes.length).toFixed(1)
    : "N/A";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Download className="h-5 w-5" />
          {t("vascscreen.studyModule.exportData")}
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5" />
          {t("vascscreen.studyModule.pseudonymization")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold">{patients.length}</p>
            <p className="text-xs text-muted-foreground">Total patients</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold">{totalScreened}</p>
            <p className="text-xs text-muted-foreground">Screened</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold">{padDetected}</p>
            <p className="text-xs text-muted-foreground">PAD confirmed</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold">{meanDiagnosis}</p>
            <p className="text-xs text-muted-foreground">Mean dx delay (d)</p>
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex gap-3">
          <Button onClick={generateCSV} variant="outline" className="flex-1 gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            {t("vascscreen.studyModule.exportCSV")}
          </Button>
          <Button onClick={generateJSON} variant="outline" className="flex-1 gap-2">
            <FileJson className="h-4 w-4" />
            {t("vascscreen.studyModule.exportJSON")}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          {patients.length} pseudonymized records available for export
        </p>
      </CardContent>
    </Card>
  );
}
