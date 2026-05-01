import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Activity } from "lucide-react";
import { z } from "zod";
import { hemodynamicsSchema } from "@/lib/l1/schemas";

export type Hemodynamics = z.infer<typeof hemodynamicsSchema>;

interface Props {
  value: Hemodynamics;
  onChange: (next: Hemodynamics) => void;
  disabled?: boolean;
}

function parseNumber(input: string): number | undefined {
  if (input === "") return undefined;
  const v = Number(input);
  return Number.isFinite(v) ? v : undefined;
}

export function HemodynamicsPanel({ value, onChange, disabled }: Props) {
  const update = <K extends keyof Hemodynamics>(key: K, v: Hemodynamics[K]) =>
    onChange({ ...value, [key]: v });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" />
          Hemodynamics
        </CardTitle>
        <CardDescription>
          ABI / TBI / Doppler — confronted with AquaMR cartography in the C4-i analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="l1-abi-left">ABI left</Label>
            <Input
              id="l1-abi-left"
              type="number"
              step="0.01"
              placeholder="0.80"
              value={value.abi_left ?? ""}
              onChange={(e) => update("abi_left", parseNumber(e.target.value))}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="l1-abi-right">ABI right</Label>
            <Input
              id="l1-abi-right"
              type="number"
              step="0.01"
              placeholder="0.85"
              value={value.abi_right ?? ""}
              onChange={(e) => update("abi_right", parseNumber(e.target.value))}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="l1-tbi-left">TBI left</Label>
            <Input
              id="l1-tbi-left"
              type="number"
              step="0.01"
              placeholder="0.55"
              value={value.tbi_left ?? ""}
              onChange={(e) => update("tbi_left", parseNumber(e.target.value))}
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="l1-tbi-right">TBI right</Label>
            <Input
              id="l1-tbi-right"
              type="number"
              step="0.01"
              placeholder="0.60"
              value={value.tbi_right ?? ""}
              onChange={(e) => update("tbi_right", parseNumber(e.target.value))}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="l1-oximetry">TcPO2 / oximetry (mmHg)</Label>
          <Input
            id="l1-oximetry"
            type="number"
            placeholder="40"
            value={value.oximetry ?? ""}
            onChange={(e) => update("oximetry", parseNumber(e.target.value))}
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="l1-doppler">Doppler summary</Label>
          <Textarea
            id="l1-doppler"
            rows={3}
            placeholder="Triphasic / biphasic / monophasic, peak systolic velocities, occlusion sites…"
            value={value.doppler_summary ?? ""}
            onChange={(e) => update("doppler_summary", e.target.value)}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}
