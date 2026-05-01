import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Network, Stethoscope } from "lucide-react";
import { z } from "zod";
import {
  c4iAssessmentSchema,
  promsSummarySchema,
} from "@/lib/l1/schemas";
import { C4iConcordance } from "@/lib/l1/types";

export type C4iAssessment = z.infer<typeof c4iAssessmentSchema>;
export type PromsSummary = z.infer<typeof promsSummarySchema>;

interface Props {
  c4i: C4iAssessment;
  proms: PromsSummary;
  onChangeC4i: (next: C4iAssessment) => void;
  onChangeProms: (next: PromsSummary) => void;
  disabled?: boolean;
}

function parseNumber(input: string): number | undefined {
  if (input === "") return undefined;
  const v = Number(input);
  return Number.isFinite(v) ? v : undefined;
}

const CONCORDANCE_LABEL: Record<C4iConcordance, string> = {
  concordant: "Concordant",
  discordant_mild: "Discordant — mild",
  discordant_high: "Discordant — high",
};

export function C4iAssessmentPanel({
  c4i,
  proms,
  onChangeC4i,
  onChangeProms,
  disabled,
}: Props) {
  const updateC4i = <K extends keyof C4iAssessment>(key: K, v: C4iAssessment[K]) =>
    onChangeC4i({ ...c4i, [key]: v });
  const updateProms = <K extends keyof PromsSummary>(key: K, v: PromsSummary[K]) =>
    onChangeProms({ ...proms, [key]: v });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Network className="h-4 w-4 text-primary" />
          C4-i & PROMs
        </CardTitle>
        <CardDescription>
          Clinical–imaging concordance (C4-i) and patient-reported outcome measures.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="l1-concordance">Clinico-physiological concordance</Label>
          <Select
            value={c4i.concordance ?? ""}
            onValueChange={(v) => updateC4i("concordance", v as C4iConcordance)}
            disabled={disabled}
          >
            <SelectTrigger id="l1-concordance">
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(CONCORDANCE_LABEL) as C4iConcordance[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {CONCORDANCE_LABEL[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="l1-c4i-reason">C4-i reasoning</Label>
          <Textarea
            id="l1-c4i-reason"
            rows={3}
            placeholder="Why concordant or discordant: hemodynamic vs anatomical mismatch, PROMs…"
            value={c4i.reason ?? ""}
            onChange={(e) => updateC4i("reason", e.target.value)}
            disabled={disabled}
          />
        </div>

        <div className="border-t pt-4 space-y-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <Stethoscope className="h-3.5 w-3.5 text-primary" />
            PROMs
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="l1-wiq">WIQ (0–100)</Label>
              <Input
                id="l1-wiq"
                type="number"
                placeholder="45"
                value={proms.wiq ?? ""}
                onChange={(e) => updateProms("wiq", parseNumber(e.target.value))}
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="l1-vascuqol">VascuQol-6</Label>
              <Input
                id="l1-vascuqol"
                type="number"
                placeholder="14"
                value={proms.vascuqol6 ?? ""}
                onChange={(e) => updateProms("vascuqol6", parseNumber(e.target.value))}
                disabled={disabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="l1-6mwt">6-MWT (m)</Label>
              <Input
                id="l1-6mwt"
                type="number"
                placeholder="320"
                value={proms.six_mwt_meters ?? ""}
                onChange={(e) => updateProms("six_mwt_meters", parseNumber(e.target.value))}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="l1-proms-notes">PROMs notes</Label>
            <Textarea
              id="l1-proms-notes"
              rows={2}
              placeholder="Trajectory across visits, patient priorities…"
              value={proms.notes ?? ""}
              onChange={(e) => updateProms("notes", e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
