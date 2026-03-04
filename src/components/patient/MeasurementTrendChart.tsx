import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/i18n/context";

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

  const { chartData, measurementTypes, chartConfig } = useMemo(() => {
    if (!measurements || measurements.length === 0) {
      return { chartData: [], measurementTypes: [], chartConfig: {} as ChartConfig };
    }

    // Group by type
    const types = [...new Set(measurements.map((m) => m.measurement_type))];

    // Group by date, then pivot types as columns
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

    const config: ChartConfig = {};
    types.forEach((type, i) => {
      config[type] = {
        label: type.toUpperCase(),
        color: COLORS[i % COLORS.length],
      };
    });

    return { chartData: data, measurementTypes: types, chartConfig: config };
  }, [measurements]);

  if (chartData.length < 2 && measurementTypes.length <= 1) {
    // Not enough data points for a meaningful chart
    return null;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          {t("patientDetail.measurementTrends")}
        </h3>
        <ChartContainer config={chartConfig} className="h-[280px] w-full">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 12 }}
            />
            <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
            <Tooltip content={<ChartTooltipContent />} />
            {measurementTypes.length > 1 && <Legend />}
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
      </CardContent>
    </Card>
  );
}
