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
                <th className="text-left p-2 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground">{t("patients.columns.caseId")}</th>
                <th className="text-left p-2 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground hidden sm:table-cell">{t("patients.columns.category")}</th>
                <th className="text-left p-2 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground">{t("patients.columns.status")}</th>
                <th className="text-left p-2 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground">{t("patients.columns.risk")}</th>
                <th className="text-left p-2 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground hidden md:table-cell">{t("patients.columns.lastVisit")}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 sm:p-4"><Skeleton className="h-4 w-20 sm:w-24" /></td>
                    <td className="p-2 sm:p-4 hidden sm:table-cell"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-2 sm:p-4"><Skeleton className="h-4 w-14 sm:w-16" /></td>
                    <td className="p-2 sm:p-4"><Skeleton className="h-4 w-14 sm:w-16" /></td>
                    <td className="p-2 sm:p-4 hidden md:table-cell"><Skeleton className="h-4 w-20" /></td>
                  </tr>
                ))}
              {!isLoading && patients?.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors active:bg-muted/70" onClick={() => onRowClick(p.id)}>
                  <td className="p-2 sm:p-4">
                    <div className="flex items-center gap-2">
                      <HeartPulse className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <span className="font-mono text-xs sm:text-sm font-medium block truncate">{p.pseudonym}</span>
                        {/* Show category inline on mobile */}
                        <span className="text-xs text-muted-foreground sm:hidden">{p.latestCase?.category ?? ""}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-2 sm:p-4 hidden sm:table-cell">
                    <Badge variant="secondary" className="text-xs">{p.latestCase?.category ?? "—"}</Badge>
                  </td>
                  <td className="p-2 sm:p-4 text-xs sm:text-sm capitalize">{p.latestCase?.status ?? "—"}</td>
                  <td className="p-2 sm:p-4">
                    <span className={`text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${riskColor[p.risk]}`}>
                      {t(`patients.risk.${p.risk}`)}
                    </span>
                  </td>
                  <td className="p-2 sm:p-4 text-xs sm:text-sm text-muted-foreground hidden md:table-cell">
                    {p.latestCase?.updated_at
                      ? new Date(p.latestCase.updated_at).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
              {!isLoading && patients?.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 sm:p-12 text-center">
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
