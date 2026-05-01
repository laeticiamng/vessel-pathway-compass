import { cn } from "@/lib/utils";

export type RiskLevel = "low" | "moderate" | "high" | "critical";

interface RiskBadgeProps {
  level: RiskLevel;
  /** Override default label (defaults: LOW / MODERATE / HIGH / CRITICAL). */
  label?: string;
  className?: string;
  /** Hide the leading dot. */
  noDot?: boolean;
}

const cls: Record<RiskLevel, string> = {
  low: "risk-low",
  moderate: "risk-moderate",
  high: "risk-high",
  critical: "risk-high",
};

const dot: Record<RiskLevel, string> = {
  low: "bg-success",
  moderate: "bg-warning",
  high: "bg-destructive",
  critical: "bg-destructive",
};

const defaultLabel: Record<RiskLevel, string> = {
  low: "LOW",
  moderate: "MODERATE",
  high: "HIGH",
  critical: "CRITICAL",
};

/**
 * Clinical risk pill (LOW / MODERATE / HIGH / CRITICAL) with neon glow in dark mode.
 * Drop-in replacement for ad-hoc Badge usages across CI-AKI / Patients / Risk tables.
 */
export function RiskBadge({ level, label, className, noDot }: RiskBadgeProps) {
  return (
    <span
      role="status"
      aria-label={`Risk level: ${label ?? defaultLabel[level]}`}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider",
        cls[level],
        className,
      )}
    >
      {!noDot && <span className={cn("h-1.5 w-1.5 rounded-full", dot[level])} />}
      {label ?? defaultLabel[level]}
    </span>
  );
}
