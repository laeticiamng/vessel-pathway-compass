import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Stethoscope, Clock, TrendingUp, AlertTriangle } from "lucide-react";

interface ScreeningStatsProps {
  totalAssessed: number;
  thisMonth: number;
  thisWeek: number;
  eligiblePatients: number;
  patientsScreened: number;
  padDetected: number;
  referralsMade: number;
  meanTimeToReferral: number;
}

export function ScreeningStats({
  totalAssessed,
  thisMonth,
  thisWeek,
  eligiblePatients,
  patientsScreened,
  padDetected,
  referralsMade,
  meanTimeToReferral,
}: ScreeningStatsProps) {
  const { t } = useTranslation();

  const screeningRate = eligiblePatients > 0
    ? ((patientsScreened / eligiblePatients) * 100).toFixed(1)
    : "0";

  const detectionRate = patientsScreened > 0
    ? ((padDetected / patientsScreened) * 100).toFixed(1)
    : "0";

  const statCards = [
    {
      label: t("vascscreen.stats.totalAssessed"),
      value: totalAssessed,
      sub: `${t("vascscreen.stats.thisMonth")}: ${thisMonth} | ${t("vascscreen.stats.thisWeek")}: ${thisWeek}`,
      icon: Users,
    },
    {
      label: t("vascscreen.stats.screeningRate"),
      value: `${screeningRate}%`,
      sub: `${patientsScreened} / ${eligiblePatients} ${t("vascscreen.stats.eligiblePatients").toLowerCase()}`,
      icon: TrendingUp,
    },
    {
      label: t("vascscreen.stats.padDetected"),
      value: padDetected,
      sub: `Detection rate: ${detectionRate}%`,
      icon: AlertTriangle,
    },
    {
      label: t("vascscreen.stats.referralsMade"),
      value: referralsMade,
      sub: `${t("vascscreen.stats.meanTimeToReferral")}: ${meanTimeToReferral.toFixed(1)}`,
      icon: Stethoscope,
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold font-mono">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
              </div>
              <stat.icon className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
