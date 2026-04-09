import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope } from "lucide-react";

export function ABIGuide() {
  const { t } = useTranslation();

  const steps = [
    { num: 1, text: t("vascscreen.abi.step1") },
    { num: 2, text: t("vascscreen.abi.step2") },
    { num: 3, text: t("vascscreen.abi.step3") },
    { num: 4, text: t("vascscreen.abi.step4") },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Stethoscope className="h-5 w-5" />
          {t("vascscreen.abi.guideTitle")}
        </CardTitle>
        <CardDescription>{t("vascscreen.abi.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {steps.map((step) => (
            <li key={step.num} className="flex gap-3">
              <Badge variant="outline" className="h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold">
                {step.num}
              </Badge>
              <p className="text-sm pt-1">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">ABI Interpretation Thresholds</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span>&gt; 1.00 — {t("vascscreen.abi.normal")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <span>0.91–0.99 — {t("vascscreen.abi.borderline")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500" />
              <span>0.71–0.90 — {t("vascscreen.abi.mildPAD")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span>0.41–0.70 — {t("vascscreen.abi.moderatePAD")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-800" />
              <span>≤ 0.40 — {t("vascscreen.abi.severePAD")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-400" />
              <span>&gt; 1.40 — {t("vascscreen.abi.nonCompressible")}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
