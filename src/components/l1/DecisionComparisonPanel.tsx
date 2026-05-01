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
import { useTranslation } from "@/i18n/context";

interface Props {
  before: RevascularizationDecision | null;
  after: RevascularizationDecision | null;
  computed: ComputedDecision;
  onChangeBefore: (next: RevascularizationDecision | null) => void;
  onChangeAfter: (next: RevascularizationDecision | null) => void;
  disabled?: boolean;
}

const DELTA_VARIANT: Record<ComputedDecision["delta"], "secondary" | "default" | "outline" | "destructive"> = {
  unchanged: "secondary",
  escalation: "default",
  de_escalation: "outline",
  reclassification: "outline",
  insufficient_image_quality: "destructive",
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
  decisionLabel,
  placeholder,
}: {
  id: string;
  value: RevascularizationDecision | null;
  onChange: (v: RevascularizationDecision | null) => void;
  disabled?: boolean;
  decisionLabel: Record<RevascularizationDecision, string>;
  placeholder: string;
}) {
  return (
    <Select
      value={value ?? ""}
      onValueChange={(v) => onChange((v || null) as RevascularizationDecision | null)}
      disabled={disabled}
    >
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {REVASCULARIZATION_DECISIONS.map((d) => (
          <SelectItem key={d} value={d}>
            {decisionLabel[d]}
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
  const { t } = useTranslation();

  const DECISION_LABEL: Record<RevascularizationDecision, string> = {
    medical_optimized: t("l1.decision.medical"),
    surveillance: t("l1.decision.surveillance"),
    standard_imaging: t("l1.decision.standardImaging"),
    endovascular_discussion: t("l1.decision.endovascular"),
    surgical_discussion: t("l1.decision.surgical"),
  };

  const DELTA_LABEL: Record<ComputedDecision["delta"], string> = {
    unchanged: t("l1.decision.unchanged"),
    escalation: t("l1.decision.escalation"),
    de_escalation: t("l1.decision.deEscalation"),
    reclassification: t("l1.decision.reclassification"),
    insufficient_image_quality: t("l1.decision.insufficient"),
  };

  const Icon = DELTA_ICON[computed.delta];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GitCompareArrows className="h-4 w-4 text-primary" />
          {t("l1.decision.title")}
        </CardTitle>
        <CardDescription>{t("l1.decision.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="l1-decision-before">{t("l1.decision.before")}</Label>
            <DecisionSelect
              id="l1-decision-before"
              value={before}
              onChange={onChangeBefore}
              disabled={disabled}
              decisionLabel={DECISION_LABEL}
              placeholder={t("l1.decision.selectPlaceholder")}
            />
          </div>
          <div className="hidden md:flex justify-center pb-2">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="l1-decision-after">{t("l1.decision.after")}</Label>
            <DecisionSelect
              id="l1-decision-after"
              value={after}
              onChange={onChangeAfter}
              disabled={disabled}
              decisionLabel={DECISION_LABEL}
              placeholder={t("l1.decision.selectPlaceholder")}
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
                {t("l1.decision.recommended")} <strong>{DECISION_LABEL[computed.recommendedStrategy]}</strong>
              </span>
            )}
          </div>
          {computed.requiresStandardImaging && (
            <p className="text-xs text-destructive">{t("l1.decision.standardRequired")}</p>
          )}
          {computed.failureReason && (
            <p className="text-xs text-muted-foreground">{computed.failureReason}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
