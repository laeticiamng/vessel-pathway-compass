import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, GitCompareArrows, MoveDown, MoveUp, Repeat } from "lucide-react";
import {
  REVASCULARIZATION_DECISIONS,
  RevascularizationDecision,
} from "@/lib/l1/types";
import { ComputedDecision } from "@/lib/l1/decision";

interface Props {
  before: RevascularizationDecision | null;
  after: RevascularizationDecision | null;
  computed: ComputedDecision;
  onChangeBefore: (next: RevascularizationDecision | null) => void;
  onChangeAfter: (next: RevascularizationDecision | null) => void;
  disabled?: boolean;
}

const DECISION_LABEL: Record<RevascularizationDecision, string> = {
  medical_optimized: "Medical therapy optimized",
  surveillance: "Surveillance",
  standard_imaging: "Standard imaging",
  endovascular_discussion: "Endovascular — discussion",
  surgical_discussion: "Surgical — discussion",
};

const DELTA_VARIANT: Record<ComputedDecision["delta"], "secondary" | "default" | "outline" | "destructive"> = {
  unchanged: "secondary",
  escalation: "default",
  de_escalation: "outline",
  reclassification: "outline",
  insufficient_image_quality: "destructive",
};

const DELTA_LABEL: Record<ComputedDecision["delta"], string> = {
  unchanged: "Unchanged",
  escalation: "Escalation",
  de_escalation: "De-escalation",
  reclassification: "Reclassification",
  insufficient_image_quality: "Image insufficient — fallback",
};

const DELTA_ICON: Record<ComputedDecision["delta"], typeof MoveUp> = {
  unchanged: Repeat,
  escalation: MoveUp,
  de_escalation: MoveDown,
  reclassification: GitCompareArrows,
  insufficient_image_quality: GitCompareArrows,
};

function DecisionSelect({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string;
  value: RevascularizationDecision | null;
  onChange: (v: RevascularizationDecision | null) => void;
  disabled?: boolean;
}) {
  return (
    <Select
      value={value ?? ""}
      onValueChange={(v) => onChange((v || null) as RevascularizationDecision | null)}
      disabled={disabled}
    >
      <SelectTrigger id={id}>
        <SelectValue placeholder="Select decision…" />
      </SelectTrigger>
      <SelectContent>
        {REVASCULARIZATION_DECISIONS.map((d) => (
          <SelectItem key={d} value={d}>
            {DECISION_LABEL[d]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function DecisionComparisonPanel({
  before,
  after,
  computed,
  onChangeBefore,
  onChangeAfter,
  disabled,
}: Props) {
  const Icon = DELTA_ICON[computed.delta];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GitCompareArrows className="h-4 w-4 text-primary" />
          Decision pre-revascularization
        </CardTitle>
        <CardDescription>
          Compare the strategy before and after AquaMR. L1 does not treat — it makes the
          patient legible, classable and routable.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="l1-decision-before">Before AquaMR</Label>
            <DecisionSelect
              id="l1-decision-before"
              value={before}
              onChange={onChangeBefore}
              disabled={disabled}
            />
          </div>
          <div className="hidden md:flex justify-center pb-2">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="l1-decision-after">After AquaMR</Label>
            <DecisionSelect
              id="l1-decision-after"
              value={after}
              onChange={onChangeAfter}
              disabled={disabled}
            />
          </div>
        </div>

        <div className="rounded-xl border p-4 bg-muted/30 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={DELTA_VARIANT[computed.delta]} className="gap-1">
              <Icon className="h-3 w-3" />
              {DELTA_LABEL[computed.delta]}
            </Badge>
            {computed.recommendedStrategy && (
              <span className="text-sm text-muted-foreground">
                Recommended: <strong>{DECISION_LABEL[computed.recommendedStrategy]}</strong>
              </span>
            )}
          </div>
          {computed.requiresStandardImaging && (
            <p className="text-xs text-destructive">
              Standard imaging required: AquaMR cartography is insufficient for L1 reading.
            </p>
          )}
          {computed.failureReason && (
            <p className="text-xs text-muted-foreground">{computed.failureReason}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
