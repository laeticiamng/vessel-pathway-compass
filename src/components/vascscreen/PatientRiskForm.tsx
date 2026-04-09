import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PatientRiskProfile } from "@/lib/vascscreen/esc2024-criteria";

const schema = z.object({
  age: z.number().min(18).max(120),
  sex: z.enum(["male", "female", "other"]),
  smokingStatus: z.enum(["never", "former", "current"]),
  diabetes: z.boolean(),
  hypertension: z.boolean(),
  dyslipidemia: z.boolean(),
  familyHistoryCVD: z.boolean(),
  knownCVD: z.boolean(),
  ckd: z.boolean(),
  claudication: z.boolean(),
  restPain: z.boolean(),
  nonHealingWounds: z.boolean(),
  erectileDysfunction: z.boolean(),
});

interface PatientRiskFormProps {
  onSubmit: (data: PatientRiskProfile) => void;
  defaultValues?: Partial<PatientRiskProfile>;
  isLoading?: boolean;
}

export function PatientRiskForm({ onSubmit, defaultValues, isLoading }: PatientRiskFormProps) {
  const { t } = useTranslation();

  const form = useForm<PatientRiskProfile>({
    resolver: zodResolver(schema),
    defaultValues: {
      age: defaultValues?.age ?? 50,
      sex: defaultValues?.sex ?? "male",
      smokingStatus: defaultValues?.smokingStatus ?? "never",
      diabetes: defaultValues?.diabetes ?? false,
      hypertension: defaultValues?.hypertension ?? false,
      dyslipidemia: defaultValues?.dyslipidemia ?? false,
      familyHistoryCVD: defaultValues?.familyHistoryCVD ?? false,
      knownCVD: defaultValues?.knownCVD ?? false,
      ckd: defaultValues?.ckd ?? false,
      claudication: defaultValues?.claudication ?? false,
      restPain: defaultValues?.restPain ?? false,
      nonHealingWounds: defaultValues?.nonHealingWounds ?? false,
      erectileDysfunction: defaultValues?.erectileDysfunction ?? false,
    },
  });

  const { register, handleSubmit, setValue, watch } = form;
  const sex = watch("sex");

  const booleanFields = [
    { name: "diabetes" as const, label: t("vascscreen.form.diabetes") },
    { name: "hypertension" as const, label: t("vascscreen.form.hypertension") },
    { name: "dyslipidemia" as const, label: t("vascscreen.form.dyslipidemia") },
    { name: "familyHistoryCVD" as const, label: t("vascscreen.form.familyHistoryCVD") },
    { name: "knownCVD" as const, label: t("vascscreen.form.knownCVD") },
    { name: "ckd" as const, label: t("vascscreen.form.ckd") },
  ];

  const symptomFields = [
    { name: "claudication" as const, label: t("vascscreen.form.claudication") },
    { name: "restPain" as const, label: t("vascscreen.form.restPain") },
    { name: "nonHealingWounds" as const, label: t("vascscreen.form.nonHealingWounds") },
    ...(sex === "male"
      ? [{ name: "erectileDysfunction" as const, label: t("vascscreen.form.erectileDysfunction") }]
      : []),
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Demographics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("vascscreen.form.demographics")}</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="age">{t("vascscreen.form.age")}</Label>
            <Input
              id="age"
              type="number"
              min={18}
              max={120}
              {...register("age", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sex">{t("vascscreen.form.sex")}</Label>
            <Select
              value={watch("sex")}
              onValueChange={(v) => setValue("sex", v as PatientRiskProfile["sex"])}
            >
              <SelectTrigger id="sex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t("vascscreen.form.male")}</SelectItem>
                <SelectItem value="female">{t("vascscreen.form.female")}</SelectItem>
                <SelectItem value="other">{t("vascscreen.form.other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Risk factors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("vascscreen.form.riskFactorsTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="smokingStatus">{t("vascscreen.form.smokingStatus")}</Label>
            <Select
              value={watch("smokingStatus")}
              onValueChange={(v) => setValue("smokingStatus", v as PatientRiskProfile["smokingStatus"])}
            >
              <SelectTrigger id="smokingStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">{t("vascscreen.form.never")}</SelectItem>
                <SelectItem value="former">{t("vascscreen.form.former")}</SelectItem>
                <SelectItem value="current">{t("vascscreen.form.current")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {booleanFields.map((field) => (
              <div key={field.name} className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor={field.name} className="cursor-pointer">{field.label}</Label>
                <Switch
                  id={field.name}
                  checked={watch(field.name)}
                  onCheckedChange={(v) => setValue(field.name, v)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Symptoms */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("vascscreen.form.symptoms")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {symptomFields.map((field) => (
              <div key={field.name} className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor={field.name} className="cursor-pointer">{field.label}</Label>
                <Switch
                  id={field.name}
                  checked={watch(field.name)}
                  onCheckedChange={(v) => setValue(field.name, v)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? t("common.loading") : t("vascscreen.assessment.title")}
      </Button>
    </form>
  );
}
