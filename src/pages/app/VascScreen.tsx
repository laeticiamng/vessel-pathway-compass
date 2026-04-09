import { useTranslation } from "@/i18n/context";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  ClipboardList,
  Activity,
  FileText,
  BarChart3,
  FlaskConical,
  UserCheck,
  BookOpen,
} from "lucide-react";
import { PatientFlowChart } from "@/components/vascscreen/PatientFlowChart";

export default function VascScreen() {
  const { t } = useTranslation();

  const modules = [
    {
      title: t("vascscreen.newPatient"),
      description: t("vascscreen.newPatientDesc"),
      icon: ClipboardList,
      href: "/app/vascscreen/patient-entry",
      color: "text-blue-600",
    },
    {
      title: t("vascscreen.abiMeasurement"),
      description: t("vascscreen.abi.subtitle"),
      icon: Stethoscope,
      href: "/app/vascscreen/abi",
      color: "text-green-600",
    },
    {
      title: t("vascscreen.results.title"),
      description: t("vascscreen.results.subtitle"),
      icon: FileText,
      href: "/app/vascscreen/results",
      color: "text-purple-600",
    },
    {
      title: t("vascscreen.dashboard"),
      description: t("vascscreen.stats.totalAssessed"),
      icon: BarChart3,
      href: "/app/vascscreen/dashboard",
      color: "text-amber-600",
    },
    {
      title: t("vascscreen.angiologistDashboard"),
      description: t("vascscreen.referral"),
      icon: UserCheck,
      href: "/app/vascscreen/angiologist",
      color: "text-red-600",
    },
    {
      title: t("vascscreen.analytics"),
      description: t("vascscreen.stats.screeningOverTime"),
      icon: Activity,
      href: "/app/vascscreen/analytics",
      color: "text-teal-600",
    },
    {
      title: t("vascscreen.studyModule.title"),
      description: t("vascscreen.studyModule.subtitle"),
      icon: FlaskConical,
      href: "/app/vascscreen/study",
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <SEOHead
        title={t("vascscreen.title")}
        description={t("vascscreen.subtitle")}
        path="/app/vascscreen"
        noindex
      />

      <div>
        <div className="flex items-center gap-3 mb-1">
          <Stethoscope className="h-7 w-7 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">{t("vascscreen.title")}</h1>
          <Badge variant="secondary" className="text-xs">{t("common.betaPreview")}</Badge>
        </div>
        <p className="text-muted-foreground">{t("vascscreen.subtitle")}</p>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          <span>{t("vascscreen.guidelineReference")}</span>
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((mod) => (
          <Link key={mod.href} to={mod.href}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <mod.icon className={`h-6 w-6 ${mod.color}`} />
                <CardTitle className="text-sm">{mod.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{mod.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* ESC 2024 Flowchart */}
      <PatientFlowChart />

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center">
        {t("common.notAMedicalDevice")} — {t("vascscreen.guidelineReference")}
      </p>
    </div>
  );
}
