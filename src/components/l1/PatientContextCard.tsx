import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { HeartPulse } from "lucide-react";
import { z } from "zod";
import { clinicalContextSchema } from "@/lib/l1/schemas";
import { useTranslation } from "@/i18n/context";

export type ClinicalContext = z.infer<typeof clinicalContextSchema>;

interface Props {
  value: ClinicalContext;
  onChange: (next: ClinicalContext) => void;
  disabled?: boolean;
}

export function PatientContextCard({ value, onChange, disabled }: Props) {
  const { t } = useTranslation();
  const update = <K extends keyof ClinicalContext>(key: K, v: ClinicalContext[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <HeartPulse className="h-4 w-4 text-primary" />
          {t("l1.patientContext.title")}
        </CardTitle>
        <CardDescription>{t("l1.patientContext.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="l1-age-range">{t("l1.patientContext.ageRange")}</Label>
            <Input
              id="l1-age-range"
              placeholder={t("l1.patientContext.ageRangePlaceholder")}
              value={value.age_range ?? ""}
              onChange={(e) => update("age_range", e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="l1-sex">{t("l1.patientContext.sex")}</Label>
            <Input
              id="l1-sex"
              placeholder={t("l1.patientContext.sexPlaceholder")}
              value={value.sex ?? ""}
              onChange={(e) => update("sex", e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="l1-ckd">{t("l1.patientContext.ckdStage")}</Label>
            <Input
              id="l1-ckd"
              placeholder={t("l1.patientContext.ckdPlaceholder")}
              value={value.ckd_stage ?? ""}
              onChange={(e) => update("ckd_stage", e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Switch
              id="l1-diabetes"
              checked={!!value.diabetes}
              onCheckedChange={(checked) => update("diabetes", checked)}
              disabled={disabled}
            />
            <Label htmlFor="l1-diabetes">{t("l1.patientContext.diabetes")}</Label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="l1-fontaine">{t("l1.patientContext.fontaine")}</Label>
            <Input
              id="l1-fontaine"
              placeholder={t("l1.patientContext.fontainePlaceholder")}
              value={value.fontaine ?? ""}
              onChange={(e) => update("fontaine", e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="l1-rutherford">{t("l1.patientContext.rutherford")}</Label>
            <Input
              id="l1-rutherford"
              placeholder={t("l1.patientContext.rutherfordPlaceholder")}
              value={value.rutherford ?? ""}
              onChange={(e) => update("rutherford", e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="l1-symptoms">{t("l1.patientContext.symptoms")}</Label>
          <Textarea
            id="l1-symptoms"
            rows={3}
            placeholder={t("l1.patientContext.symptomsPlaceholder")}
            value={value.symptoms ?? ""}
            onChange={(e) => update("symptoms", e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="l1-comorb">{t("l1.patientContext.comorbidities")}</Label>
          <Textarea
            id="l1-comorb"
            rows={2}
            placeholder={t("l1.patientContext.comorbidPlaceholder")}
            value={value.comorbidities ?? ""}
            onChange={(e) => update("comorbidities", e.target.value)}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}
