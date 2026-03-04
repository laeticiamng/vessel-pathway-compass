import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Ruler, Trash2 } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import MeasurementTrendChart from "@/components/patient/MeasurementTrendChart";
import type { Tables } from "@/integrations/supabase/types";

interface PatientMeasurementsProps {
  measurements: Tables<"measurements">[] | undefined;
  measLoading: boolean;
  hasCases: boolean;
  onAddMeasurement: () => void;
  onDeleteMeasurement: (id: string) => void;
}

export default function PatientMeasurements({ measurements, measLoading, hasCases, onAddMeasurement, onDeleteMeasurement }: PatientMeasurementsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{t("patientDetail.measurements")}</h2>
        <Button size="sm" onClick={onAddMeasurement} disabled={!hasCases}>
          <Plus className="h-4 w-4 mr-1" /> {t("patientDetail.addMeasurement")}
        </Button>
      </div>

      {measLoading && Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3">
          <Skeleton className="h-4 w-20" /><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-12" />
        </div>
      ))}

      {!measLoading && measurements && measurements.length > 0 ? (
        <>
          <MeasurementTrendChart measurements={measurements} />
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("patientDetail.table.type")}</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("patientDetail.table.value")}</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("patientDetail.table.unit")}</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("patientDetail.table.site")}</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("patientDetail.table.date")}</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((m) => (
                    <tr key={m.id} className="border-b last:border-0 group">
                      <td className="p-3 font-medium capitalize">{m.measurement_type}</td>
                      <td className="p-3 font-mono">{m.value}</td>
                      <td className="p-3">{m.unit}</td>
                      <td className="p-3">{m.site ?? "—"}</td>
                      <td className="p-3 text-muted-foreground">{new Date(m.measured_at).toLocaleDateString()}</td>
                      <td className="p-3">
                        <Button
                          variant="ghost" size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => onDeleteMeasurement(m.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      ) : !measLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Ruler className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">{t("patientDetail.noMeasurements")}</p>
            {hasCases && (
              <Button variant="outline" className="mt-4" onClick={onAddMeasurement}>
                <Plus className="h-4 w-4 mr-2" /> {t("patientDetail.addFirstMeasurement")}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
