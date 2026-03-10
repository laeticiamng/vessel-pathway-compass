import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Ruler, Trash2, Download } from "lucide-react";
import { useTranslation } from "@/i18n/context";
import MeasurementTrendChart from "@/components/patient/MeasurementTrendChart";
import type { Tables } from "@/integrations/supabase/types";

interface PatientMeasurementsProps {
  measurements: Tables<"measurements">[] | undefined;
  measLoading: boolean;
  hasCases: boolean;
  onAddMeasurement: () => void;
  onDeleteMeasurement: (id: string) => void;
  onBulkDeleteMeasurements?: (ids: string[]) => void;
  bulkDeletePending?: boolean;
}

export default function PatientMeasurements({
  measurements, measLoading, hasCases, onAddMeasurement, onDeleteMeasurement,
  onBulkDeleteMeasurements, bulkDeletePending,
}: PatientMeasurementsProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!measurements) return;
    setSelected((prev) =>
      prev.size === measurements.length ? new Set() : new Set(measurements.map((m) => m.id))
    );
  };

  const handleBulkDelete = () => {
    if (onBulkDeleteMeasurements && selected.size > 0) {
      onBulkDeleteMeasurements([...selected]);
      setSelected(new Set());
    }
  };

  const exportCSV = useCallback(() => {
    if (!measurements || measurements.length === 0) return;
    const headers = ["Type", "Value", "Unit", "Site", "Date"];
    const rows = measurements.map((m) => [
      m.measurement_type,
      String(m.value),
      m.unit,
      m.site ?? "",
      new Date(m.measured_at).toISOString(),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `measurements-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [measurements]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-lg font-semibold">{t("patientDetail.measurements")}</h2>
        <div className="flex gap-2 shrink-0 flex-wrap">
          {selected.size > 0 && (
            <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={bulkDeletePending}>
              <Trash2 className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">{bulkDeletePending ? t("common.loading") : `${t("patientDetail.bulkDelete")} (${selected.size})`}</span>
              <span className="sm:hidden">{selected.size}</span>
            </Button>
          )}
          {measurements && measurements.length > 0 && selected.size === 0 && (
            <Button size="sm" variant="outline" onClick={exportCSV}>
              <Download className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">{t("patientDetail.exportCSV")}</span>
            </Button>
          )}
          <Button size="sm" onClick={onAddMeasurement} disabled={!hasCases}>
            <Plus className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">{t("patientDetail.addMeasurement")}</span>
          </Button>
        </div>
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
                    <th className="p-2 sm:p-3 w-10">
                      <Checkbox
                        checked={selected.size === measurements.length && measurements.length > 0}
                        onCheckedChange={toggleAll}
                        aria-label="Select all"
                      />
                    </th>
                    <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium text-muted-foreground">{t("patientDetail.table.type")}</th>
                    <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium text-muted-foreground">{t("patientDetail.table.value")}</th>
                    <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium text-muted-foreground hidden sm:table-cell">{t("patientDetail.table.unit")}</th>
                    <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium text-muted-foreground hidden md:table-cell">{t("patientDetail.table.site")}</th>
                    <th className="text-left p-2 sm:p-3 text-xs sm:text-sm font-medium text-muted-foreground hidden sm:table-cell">{t("patientDetail.table.date")}</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((m) => (
                    <tr key={m.id} className={`border-b last:border-0 group ${selected.has(m.id) ? "bg-primary/5" : ""}`}>
                      <td className="p-2 sm:p-3">
                        <Checkbox
                          checked={selected.has(m.id)}
                          onCheckedChange={() => toggleOne(m.id)}
                          aria-label={`Select ${m.measurement_type}`}
                        />
                      </td>
                      <td className="p-2 sm:p-3 font-medium capitalize">
                        <span>{m.measurement_type}</span>
                        <span className="block text-xs text-muted-foreground sm:hidden">{m.unit} · {new Date(m.measured_at).toLocaleDateString()}</span>
                      </td>
                      <td className="p-2 sm:p-3 font-mono">{m.value}</td>
                      <td className="p-2 sm:p-3 hidden sm:table-cell">{m.unit}</td>
                      <td className="p-2 sm:p-3 hidden md:table-cell">{m.site ?? "—"}</td>
                      <td className="p-2 sm:p-3 text-muted-foreground hidden sm:table-cell">{new Date(m.measured_at).toLocaleDateString()}</td>
                      <td className="p-2 sm:p-3">
                        <Button
                          variant="ghost" size="icon"
                          className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
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
