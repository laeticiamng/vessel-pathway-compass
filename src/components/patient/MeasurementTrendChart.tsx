import { useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ReferenceArea, ReferenceLine,
} from "recharts";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/i18n/context";

// Clinical reference ranges for common vascular measurements
const REFERENCE_RANGES: Record<string, { min: number; max: number; label: string; critical?: { below?: number; above?: number } }> = {
  ABI: { min: 0.9, max: 1.3, label: "Normal (0.9–1.3)", critical: { below: 0.5 } },
  Diameter: { min: 1.5, max: 3.0, label: "Normal (1.5–3.0 cm)", critical: { above: 5.5 } },
  PSV: { min: 60, max: 125, label: "Normal (60–125 cm/s)", critical: { above: 400 } },
  "Blood Pressure": { min: 90, max: 140, label: "Normal (90–140 mmHg)", critical: { above: 180 } },
  "Heart Rate": { min: 60, max: 100, label: "Normal (60–100 bpm)" },
  Stenosis: { min: 0, max: 50, label: "Normal (<50%)", critical: { above: 70 } },
};

interface Measurement {
  id: string;
  measurement_type: string;
  value: number;
  unit: string;
  site: string | null;
  measured_at: string;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

interface Props {
  measurements: Measurement[];
}

export default function MeasurementTrendChart({ measurements }: Props) {
  const { t } = useTranslation();

  const { chartData, measurementTypes, chartConfig, typeData } = useMemo(() => {
    if (!measurements || measurements.length === 0) {
      return { chartData: [], measurementTypes: [], chartConfig: {} as ChartConfig, typeData: new Map<string, { data: Record<string, number | string>[]; unit: string }>() };
    }

    const types = [...new Set(measurements.map((m) => m.measurement_type))];

    // Combined chart data (all types pivoted by date)
    const byDate = new Map<string, Record<string, number | string>>();
    for (const m of measurements) {
      const dateKey = new Date(m.measured_at).toLocaleDateString();
      const existing = byDate.get(dateKey) ?? { date: dateKey, _ts: new Date(m.measured_at).getTime() };
      existing[m.measurement_type] = Number(m.value);
      byDate.set(dateKey, existing);
    }

    const data = [...byDate.values()].sort(
      (a, b) => (a._ts as number) - (b._ts as number)
    );

    // Per-type chart data
    const perType = new Map<string, { data: Record<string, number | string>[]; unit: string }>();
    for (const type of types) {
      const typeMeasurements = measurements
        .filter((m) => m.measurement_type === type)
        .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());

      const unit = typeMeasurements[0]?.unit ?? "";
      const typePoints = typeMeasurements.map((m) => ({
        date: new Date(m.measured_at).toLocaleDateString(),
        value: Number(m.value),
        site: m.site ?? "",
        _ts: new Date(m.measured_at).getTime(),
      }));

      perType.set(type, { data: typePoints, unit });
    }

    const config: ChartConfig = {};
    types.forEach((type, i) => {
      config[type] = {
        label: type.toUpperCase(),
        color: COLORS[i % COLORS.length],
      };
    });
    config["value"] = { label: "Value", color: COLORS[0] };

    return { chartData: data, measurementTypes: types, chartConfig: config, typeData: perType };
  }, [measurements]);

  if (measurements.length === 0) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          {t("patientDetail.measurementTrends")}
        </h3>

        {measurementTypes.length > 1 ? (
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              {measurementTypes.map((type) => (
                <TabsTrigger key={type} value={type} className="capitalize">{type.replace("_", " ")}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all">
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
                  <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  {measurementTypes.map((type, i) => (
                    <Line
                      key={type}
                      type="monotone"
                      dataKey={type}
                      name={type.toUpperCase()}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ChartContainer>
            </TabsContent>

            {measurementTypes.map((type, i) => {
              const td = typeData.get(type);
              if (!td) return null;
              return (
                <TabsContent key={type} value={type}>
                  <SingleTypeChart
                    data={td.data}
                    unit={td.unit}
                    color={COLORS[i % COLORS.length]}
                    chartConfig={chartConfig}
                    typeName={type}
                  />
                </TabsContent>
              );
            })}
          </Tabs>
        ) : (
          <SingleTypeChart
            data={typeData.get(measurementTypes[0])?.data ?? []}
            unit={typeData.get(measurementTypes[0])?.unit ?? ""}
            color={COLORS[0]}
            chartConfig={chartConfig}
            typeName={measurementTypes[0]}
          />
        )}
      </CardContent>
    </Card>
  );
}

function SingleTypeChart({
  data,
  unit,
  color,
  chartConfig,
  typeName,
}: {
  data: Record<string, number | string>[];
  unit: string;
  color: string;
  chartConfig: ChartConfig;
  typeName: string;
}) {
  if (data.length === 0) return null;

  // Single data point — show as a stat card
  if (data.length === 1) {
    const point = data[0];
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-4xl font-bold font-mono" style={{ color }}>{String(point.value)}</p>
          <p className="text-sm text-muted-foreground mt-1">{unit} · {String(point.date)}</p>
          {point.site && <p className="text-xs text-muted-foreground">{String(point.site)}</p>}
        </div>
      </div>
    );
  }

  const ref = REFERENCE_RANGES[typeName];

  // Compute Y domain to include reference range
  const values = data.map((d) => Number(d.value));
  let yMin = Math.min(...values);
  let yMax = Math.max(...values);
  if (ref) {
    yMin = Math.min(yMin, ref.min, ref.critical?.below ?? ref.min);
    yMax = Math.max(yMax, ref.max, ref.critical?.above ?? ref.max);
  }
  const padding = (yMax - yMin) * 0.15 || 1;
  const domainMin = Math.max(0, Math.floor(yMin - padding));
  const domainMax = Math.ceil(yMax + padding);

  return (
    <div className="relative">
      {ref && (
        <div className="flex items-center gap-4 mb-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--chart-3) / 0.15)", border: "1px solid hsl(var(--chart-3) / 0.4)" }} />
            {ref.label}
          </span>
          {ref.critical && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(0 84% 60% / 0.1)", border: "1px solid hsl(0 84% 60% / 0.3)" }} />
              Critical
            </span>
          )}
        </div>
      )}
      <ChartContainer config={chartConfig} className="h-[280px] w-full">
        <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id={`gradient-${typeName}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="date" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
          <YAxis
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
            domain={[domainMin, domainMax]}
            label={{ value: unit, angle: -90, position: "insideLeft", className: "fill-muted-foreground text-xs" }}
          />
          {/* Normal reference range shaded area */}
          {ref && (
            <ReferenceArea
              y1={ref.min}
              y2={ref.max}
              fill="hsl(var(--chart-3))"
              fillOpacity={0.1}
              stroke="hsl(var(--chart-3))"
              strokeOpacity={0.3}
              strokeDasharray="4 4"
            />
          )}
          {/* Critical threshold lines */}
          {ref?.critical?.above && (
            <ReferenceLine
              y={ref.critical.above}
              stroke="hsl(0 84% 60%)"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              strokeOpacity={0.6}
              label={{ value: `Critical ≥${ref.critical.above}`, position: "right", className: "fill-destructive text-[10px]" }}
            />
          )}
          {ref?.critical?.below && (
            <ReferenceLine
              y={ref.critical.below}
              stroke="hsl(0 84% 60%)"
              strokeDasharray="6 3"
              strokeWidth={1.5}
              strokeOpacity={0.6}
              label={{ value: `Critical ≤${ref.critical.below}`, position: "right", className: "fill-destructive text-[10px]" }}
            />
          )}
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload;
              const val = Number(p.value);
              const inRange = ref ? val >= ref.min && val <= ref.max : true;
              const isCritical = ref?.critical
                ? (ref.critical.above && val >= ref.critical.above) || (ref.critical.below && val <= ref.critical.below)
                : false;
              return (
                <div className="rounded-lg border bg-background p-3 shadow-md">
                  <p className="text-sm font-medium">{String(p.date)}</p>
                  <p className="text-lg font-bold font-mono" style={{ color: isCritical ? "hsl(0 84% 60%)" : color }}>
                    {String(p.value)} {unit}
                  </p>
                  {ref && (
                    <p className={`text-xs mt-1 ${isCritical ? "text-destructive font-semibold" : inRange ? "text-green-500" : "text-yellow-500"}`}>
                      {isCritical ? "⚠ Critical" : inRange ? "✓ Normal range" : "↗ Outside normal"}
                    </p>
                  )}
                  {p.site && <p className="text-xs text-muted-foreground">{String(p.site)}</p>}
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${typeName})`}
            dot={{ r: 4, fill: color }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
