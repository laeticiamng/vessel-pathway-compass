import { useState } from "react";
import { useTranslation } from "@/i18n/context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle2 } from "lucide-react";

interface StudyConsentFormProps {
  onConsent: (consented: boolean) => void;
  isConsented?: boolean;
}

export function StudyConsentForm({ onConsent, isConsented = false }: StudyConsentFormProps) {
  const { t } = useTranslation();
  const [dataCollection, setDataCollection] = useState(isConsented);
  const [pseudonymization, setPseudonymization] = useState(isConsented);
  const [voluntaryParticipation, setVoluntaryParticipation] = useState(isConsented);

  const allChecked = dataCollection && pseudonymization && voluntaryParticipation;

  const handleConfirm = () => {
    if (allChecked) {
      onConsent(true);
    }
  };

  if (isConsented) {
    return (
      <Card className="border-green-200 dark:border-green-800">
        <CardContent className="pt-6 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium">{t("vascscreen.studyModule.consentObtained")}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t("vascscreen.studyModule.consentForm")}
        </CardTitle>
        <CardDescription>
          Patient information and consent for data collection in the VascScreen clinical study
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
          <p>
            This study evaluates the impact of a digital PAD screening tool (VascScreen) on
            screening rates in Swiss primary care. Your data will be pseudonymized and used
            exclusively for research purposes.
          </p>
          <p>
            Participation is voluntary. You may withdraw at any time without impact on your care.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="data-collection" className="cursor-pointer text-sm">
              I consent to the collection and analysis of my health screening data
            </Label>
            <Switch
              id="data-collection"
              checked={dataCollection}
              onCheckedChange={setDataCollection}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="pseudonymization" className="cursor-pointer text-sm">
              I understand that my data will be pseudonymized (no direct identifiers stored)
            </Label>
            <Switch
              id="pseudonymization"
              checked={pseudonymization}
              onCheckedChange={setPseudonymization}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="voluntary" className="cursor-pointer text-sm">
              I confirm that my participation is voluntary and I may withdraw at any time
            </Label>
            <Switch
              id="voluntary"
              checked={voluntaryParticipation}
              onCheckedChange={setVoluntaryParticipation}
            />
          </div>
        </div>

        <Button onClick={handleConfirm} className="w-full" disabled={!allChecked}>
          {t("common.confirm")} — {t("vascscreen.studyModule.consent")}
        </Button>
      </CardContent>
    </Card>
  );
}
