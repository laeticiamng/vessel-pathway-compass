import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { HeartPulse } from "lucide-react";
import { z } from "zod";
import { clinicalContextSchema } from "@/lib/l1/schemas";

export type ClinicalContext = z.infer<typeof clinicalContextSchema>;

interface Props {
  value: ClinicalContext;
  onChange: (next: ClinicalContext) => void;
  disabled?: boolean;
}

export function PatientContextCard({ value, onChange, disabled }: Props) {
  const update = <K extends keyof ClinicalContext>(key: K, v: ClinicalContext[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <HeartPulse className="h-4 w-4 text-primary" />
          Patient context
        </CardTitle>
        <CardDescription>
          Fragility profile of the AOMI patient: age range, comorbidities, symptomatology.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="l1-age-range">Age range</Label>
            <Input
              id="l1-age-range"
              placeholder="70-79"
              value={value.age_range ?? ""}
              onChange={(e) => update("age_range", e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="l1-sex">Sex</Label>
            <Input
              id="l1-sex"
              placeholder="F / M / other"
              value={value.sex ?? ""}
              onChange={(e) => update("sex", e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="l1-ckd">CKD stage</Label>
            <Input
              id="l1-ckd"
              placeholder="3a / 3b / 4 / 5"
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
            <Label htmlFor="l1-diabetes">Diabetes</Label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="l1-fontaine">Fontaine</Label>
            <Input
              id="l1-fontaine"
              placeholder="IIa / IIb / III / IV"
              value={value.fontaine ?? ""}
              onChange={(e) => update("fontaine", e.target.value)}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="l1-rutherford">Rutherford</Label>
            <Input
              id="l1-rutherford"
              placeholder="0-6"
              value={value.rutherford ?? ""}
              onChange={(e) => update("rutherford", e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="l1-symptoms">Symptoms</Label>
          <Textarea
            id="l1-symptoms"
            rows={3}
            placeholder="Claudication distance, rest pain, ulcer, gangrene…"
            value={value.symptoms ?? ""}
            onChange={(e) => update("symptoms", e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="l1-comorb">Comorbidities</Label>
          <Textarea
            id="l1-comorb"
            rows={2}
            placeholder="HTN, HF, prior stroke, cancer history…"
            value={value.comorbidities ?? ""}
            onChange={(e) => update("comorbidities", e.target.value)}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}
