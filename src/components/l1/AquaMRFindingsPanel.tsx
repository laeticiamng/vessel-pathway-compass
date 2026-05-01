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

const QUALITY_LABEL: Record<ImageQuality, string> = {
  unknown: "Unknown",
  interpretable: "Interpretable",
  limited: "Limited",
  non_interpretable: "Non-interpretable",
};

export function AquaMRFindingsPanel({ value, onChange, disabled }: Props) {
  const update = <K extends keyof AquaMRFindings>(key: K, v: AquaMRFindings[K]) =>
    onChange({ ...value, [key]: v });

  const nonInterp = value.image_quality === "non_interpretable";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ImagePlus className="h-4 w-4 text-primary" />
          AquaMR cartography
          {nonInterp && (
            <Badge variant="destructive" className="ml-2">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Standard imaging required
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          4-zero contrast-free cartography. Document interpretability before any L1 reading.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="l1-image-quality">Image quality</Label>
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
            <p className="text-xs text-destructive">
              AquaMR is non-interpretable. The decision board will recommend
              fallback to standard-of-care imaging (angio-CT / contrast MRA).
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="l1-segment-target">Target segment</Label>
            <Input
              id="l1-segment-target"
              placeholder="e.g. SFA-mid, popliteal-P3, BTK-AT"
              value={value.segment_target ?? ""}
              onChange={(e) => update("segment_target", e.target.value)}
              disabled={disabled || nonInterp}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="l1-stenosis">Max stenosis %</Label>
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
            <Label htmlFor="l1-lesion-length">Lesion length (mm)</Label>
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
            <Label htmlFor="l1-runoff">Runoff score (0-10)</Label>
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
            <Label htmlFor="l1-confidence">Confidence (0–1)</Label>
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
            <Label htmlFor="l1-occlusion">Occlusion present</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="l1-aqua-notes">AquaMR notes</Label>
          <Textarea
            id="l1-aqua-notes"
            rows={2}
            placeholder="Reading caveats, motion, segment gaps, calcified shadows…"
            value={value.notes ?? ""}
            onChange={(e) => update("notes", e.target.value)}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}
