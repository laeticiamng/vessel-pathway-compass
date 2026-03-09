import { useTranslation } from "@/i18n/context";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, AlertCircle, Minus } from "lucide-react";

interface FHIRBadgeProps {
  hasCase: boolean;
  hasMeasurements: boolean;
}

export default function FHIRBadge({ hasCase, hasMeasurements }: FHIRBadgeProps) {
  const { t } = useTranslation();
  const level = hasCase && hasMeasurements ? "ready" : hasCase ? "partial" : "none";

  const config = {
    ready: {
      icon: CheckCircle2,
      label: t("fhir.ready") as string,
      color: "bg-success/10 text-success border-success/30",
      tooltip: t("fhir.readyTooltip") as string,
    },
    partial: {
      icon: AlertCircle,
      label: t("fhir.partial") as string,
      color: "bg-warning/10 text-warning border-warning/30",
      tooltip: t("fhir.partialTooltip") as string,
    },
    none: {
      icon: Minus,
      label: t("fhir.na") as string,
      color: "bg-muted text-muted-foreground border-border",
      tooltip: t("fhir.naTooltip") as string,
    },
  }[level];

  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant="outline" className={`gap-1 ${config.color} cursor-help`}>
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p className="text-sm">{config.tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
