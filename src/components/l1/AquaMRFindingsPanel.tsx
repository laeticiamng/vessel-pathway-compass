import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ImagePlus } from "lucide-react";
import { z } from "zod";
import { aquaMrFindingsSchema } from "@/lib/l1/schemas";
import { ImageQuality } from "@/lib/l1/types";
import { useTranslation } from "@/i18n/context";

export type AquaMRFindings = z.infer<typeof aquaMrFindingsSchema>;

interface Props {
  value: AquaMRFindings;
  onChange: (next: AquaMRFindings) => void;
  disabled?: boolean;
}

function parseNumber(input: string): number | undefined {
  if (input === "") return undefined;
  const v = Number(input);
  return Number.isFinite(v) ? v : undefined;
}

export function AquaMRFindingsPanel({ value, onChange, disabled }: Props) {
  const { t } = useTranslation();
  const update = <K extends keyof AquaMRFindings>(key: K, v: AquaMRFindings[K]) =>
    onChange({ ...value, [key]: v });

  const QUALITY_LABEL: Record<ImageQuality, string> = {
    unknown: t("l1.aquaMR.qualityUnknown"),
    interpretable: t("l1.aquaMR.qualityInterpretable"),
    limited: t("l1.aquaMR.qualityLimited"),
    non_interpretable: t("l1.aquaMR.qualityNonInterpretable"),
  };

  const nonInterp = value.image_quality === "non_interpretable";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ImagePlus className="h-4 w-4 text-primary" />
          {t("l1.aquaMR.title")}
          {nonInterp && (
            <Badge variant="destructive" className="ml-2">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {t("l1.aquaMR.standardImagingRequired")}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{t("l1.aquaMR.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="l1-image-quality">{t("l1.aquaMR.imageQuality")}</Label>
          <Select
            value={value.image_quality}
            onValueChange={(v) => update("image_quality", v as ImageQuality)}
            disabled={disabled}
          >
            <SelectTrigger id="l1-image-quality">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(QUALITY_LABEL) as ImageQuality[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {QUALITY_LABEL[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {nonInterp && (
            <p className="text-xs text-destructive">{t("l1.aquaMR.nonInterpWarning")}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="l1-segment-target">{t("l1.aquaMR.segmentTarget")}</Label>
            <Input
              id="l1-segment-target"
              placeholder={t("l1.aquaMR.segmentPlaceholder")}
              value={value.segment_target ?? ""}
              onChange={(e) => update("segment_target", e.target.value)}
              disabled={disabled || nonInterp}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="l1-stenosis">{t("l1.aquaMR.maxStenosis")}</Label>
            <Input
              id="l1-stenosis"
              type="number"
              placeholder="70"
              value={value.max_stenosis_percent ?? ""}
              onChange={(e) => update("max_stenosis_percent", parseNumber(e.target.value))}
              disabled={disabled || nonInterp}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="l1-lesion-length">{t("l1.aquaMR.lesionLength")}</Label>
            <Input
              id="l1-lesion-length"
              type="number"
              placeholder="40"
              value={value.lesion_length_mm ?? ""}
              onChange={(e) => update("lesion_length_mm", parseNumber(e.target.value))}
              disabled={disabled || nonInterp}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="l1-runoff">{t("l1.aquaMR.runoffScore")}</Label>
            <Input
              id="l1-runoff"
              type="number"
              step="0.5"
              placeholder="6.5"
              value={value.runoff_score ?? ""}
              onChange={(e) => update("runoff_score", parseNumber(e.target.value))}
              disabled={disabled || nonInterp}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="l1-confidence">{t("l1.aquaMR.confidence")}</Label>
            <Input
              id="l1-confidence"
              type="number"
              step="0.05"
              placeholder="0.85"
              value={value.confidence_score ?? ""}
              onChange={(e) => update("confidence_score", parseNumber(e.target.value))}
              disabled={disabled || nonInterp}
            />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Switch
              id="l1-occlusion"
              checked={!!value.occlusion}
              onCheckedChange={(checked) => update("occlusion", checked)}
              disabled={disabled || nonInterp}
            />
            <Label htmlFor="l1-occlusion">{t("l1.aquaMR.occlusion")}</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="l1-aqua-notes">{t("l1.aquaMR.notes")}</Label>
          <Textarea
            id="l1-aqua-notes"
            rows={2}
            placeholder={t("l1.aquaMR.notesPlaceholder")}
            value={value.notes ?? ""}
            onChange={(e) => update("notes", e.target.value)}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}
