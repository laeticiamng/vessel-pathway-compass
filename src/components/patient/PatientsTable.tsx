import { useTranslation } from "@/i18n/context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HeartPulse, Plus, Users } from "lucide-react";

function riskFromFactors(factors: unknown): string {
  if (!Array.isArray(factors)) return "low";
  const count = factors.length;
  if (count >= 4) return "critical";
  if (count >= 3) return "high";
  if (count >= 1) return "moderate";
  return "low";
}

const riskColor: Record<string, string> = {
  low: "bg-success/10 text-success",
  moderate: "bg-warning/10 text-warning",
  high: "bg-destructive/10 text-destructive",
  critical: "bg-destructive text-destructive-foreground",
};

export interface PatientRow {
  id: string;
  pseudonym: string;
  risk_factors: unknown;
  latestCase?: {
    category?: string;
    status?: string;
    updated_at?: string;
  };
  caseCount: number;
  risk: string;
}

interface PatientsTableProps {
  patients: PatientRow[] | undefined;
  isLoading: boolean;
  onRowClick: (id: string) => void;
  onNewCase: () => void;
}

export function PatientsTable({ patients, isLoading, onRowClick, onNewCase }: PatientsTableProps) {
  const { t } = useTranslation();

  return (
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
              {!isLoading && patients?.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => onRowClick(p.id)}>
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
                      {t(`patients.risk.${p.risk}`)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {p.latestCase?.updated_at
                      ? new Date(p.latestCase.updated_at).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
              {!isLoading && patients?.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">{t("patients.empty")}</p>
                    <Button variant="outline" className="mt-4" onClick={onNewCase}>
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
  );
}
