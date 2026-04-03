import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, TrendingUp, TrendingDown, Minus, Clock, Leaf } from "lucide-react";
import { CONTRAST_FREE_FEASIBILITY, FEASIBILITY_COLORS, type ContrastFreeFeasibility } from "./VascularMap";

interface Measurement {
  id: string;
  measurement_type: string;
  value: number;
  unit: string;
  site: string | null;
  measured_at: string;
}

interface SegmentDetailProps {
  segmentLabel: string;
  measurements: Measurement[];
  isLoading: boolean;
  contrastFreeMode?: boolean;
  segmentId?: string;
}

const FEASIBILITY_BADGE_COLORS: Record<ContrastFreeFeasibility, string> = {
  excellent: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  moderate: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30",
  limited: "bg-red-500/15 text-red-700 border-red-500/30",
};

export default function SegmentDetail({ segmentLabel, measurements, isLoading, contrastFreeMode = false, segmentId }: SegmentDetailProps) {
  const { t } = useTranslation();

  // Group by measurement type
  const byType = new Map<string, Measurement[]>();
  for (const m of measurements) {
    const arr = byType.get(m.measurement_type) ?? [];
    arr.push(m);
    byType.set(m.measurement_type, arr);
  }

  // Sort each group by date desc
  for (const arr of byType.values()) {
    arr.sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime());
  }

  const getTrend = (values: Measurement[]) => {
    if (values.length < 2) return "stable";
    const latest = values[0].value;
    const previous = values[1].value;
    const diff = ((latest - previous) / previous) * 100;
    if (diff > 5) return "up";
    if (diff < -5) return "down";
    return "stable";
  };

  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const feasibility = segmentId ? CONTRAST_FREE_FEASIBILITY[segmentId] : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          {segmentLabel}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Contrast-free feasibility panel */}
        {contrastFreeMode && feasibility && (
          <div className="mb-4 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Leaf className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium">{t("digitalTwin.segmentDetail.contrastFree.title")}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={FEASIBILITY_BADGE_COLORS[feasibility.level]}>
                  {t(`digitalTwin.segmentDetail.contrastFree.level.${feasibility.level}`)}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{feasibility.note}</p>
              <p className="text-xs font-medium">
                {feasibility.level === "excellent"
                  ? t("digitalTwin.segmentDetail.contrastFree.recNoContrast")
                  : feasibility.level === "moderate"
                    ? t("digitalTwin.segmentDetail.contrastFree.recBBCA")
                    : t("digitalTwin.segmentDetail.contrastFree.recTraditional")}
              </p>
            </div>
          </div>
        )}

        {measurements.length === 0 ? (
          <div className="text-center py-6">
            <Activity className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">{t("digitalTwin.noMeasurements")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from(byType.entries()).map(([type, values]) => {
              const latest = values[0];
              const trend = getTrend(values);
              return (
                <div key={type} className="p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium capitalize">{type.replace(/_/g, " ")}</span>
                    <div className="flex items-center gap-2">
                      <TrendIcon trend={trend} />
                      <span className="text-lg font-bold font-mono">
                        {latest.value}
                      </span>
                      <span className="text-xs text-muted-foreground">{latest.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(latest.measured_at).toLocaleDateString()}
                    </div>
                    {values.length > 1 && (
                      <Badge variant="outline" className="text-xs">
                        {values.length} {t("digitalTwin.readings")}
                      </Badge>
                    )}
                  </div>
                  {/* Mini sparkline of values */}
                  {values.length > 1 && (
                    <div className="flex items-end gap-1 mt-2 h-10 sm:h-8">
                      {values.slice(0, 10).reverse().map((v, i) => {
                        const max = Math.max(...values.map((x) => x.value));
                        const min = Math.min(...values.map((x) => x.value));
                        const range = max - min || 1;
                        const height = ((v.value - min) / range) * 100;
                        return (
                          <div
                            key={i}
                            className="flex-1 rounded-sm bg-primary/40 transition-all"
                            style={{ height: `${Math.max(10, height)}%` }}
                            title={`${v.value} ${v.unit} — ${new Date(v.measured_at).toLocaleDateString()}`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
