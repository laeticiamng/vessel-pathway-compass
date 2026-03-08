import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, AlertCircle, Minus } from "lucide-react";

interface FHIRBadgeProps {
  hasCase: boolean;
  hasMeasurements: boolean;
}

/**
 * FHIR R4 interoperability readiness badge.
 * Green  = Patient resource + Condition + Observation mappable
 * Yellow = Partial (patient exists but missing data)
 * Gray   = No case data
 */
export default function FHIRBadge({ hasCase, hasMeasurements }: FHIRBadgeProps) {
  const level = hasCase && hasMeasurements ? "ready" : hasCase ? "partial" : "none";

  const config = {
    ready: {
      icon: CheckCircle2,
      label: "FHIR R4 Ready",
      color: "bg-success/10 text-success border-success/30",
      tooltip: "Patient, Condition, and Observation resources are mappable to FHIR R4 format for interoperability.",
    },
    partial: {
      icon: AlertCircle,
      label: "FHIR Partial",
      color: "bg-warning/10 text-warning border-warning/30",
      tooltip: "Patient and Condition resources available. Add measurements for full Observation mapping.",
    },
    none: {
      icon: Minus,
      label: "FHIR N/A",
      color: "bg-muted text-muted-foreground border-border",
      tooltip: "No clinical data yet. Add cases and measurements for FHIR interoperability.",
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
