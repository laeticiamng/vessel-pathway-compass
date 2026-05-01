import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PremiumCard, PremiumCardTone } from "./PremiumCard";
import { NeonIcon } from "./NeonIcon";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  icon?: LucideIcon;
  tone?: PremiumCardTone;
  trend?: string;
  loading?: boolean;
  className?: string;
}

/**
 * Compact KPI card for dashboards, cockpit headers and analytics pages.
 * Visually aligned with the AquaMR Flow reference: large neon value,
 * minimalist icon ring, optional trend caption.
 */
export function MetricCard({
  label,
  value,
  unit,
  icon,
  tone = "cyan",
  trend,
  loading,
  className,
}: MetricCardProps) {
  return (
    <PremiumCard tone={tone} padding="md" className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-semibold text-foreground/90 tracking-wide">{label}</span>
        {icon && <NeonIcon icon={icon} tone={tone === "violet" ? "violet" : "cyan"} size="md" />}
      </div>
      <div className="flex items-baseline gap-1.5">
        {loading ? (
          <div className="h-12 w-20 rounded-md bg-muted/50 animate-pulse" />
        ) : (
          <>
            <span className={cn("neon-kpi-value", tone === "violet" && "violet")}>{value}</span>
            {unit && <span className="text-lg font-semibold text-foreground/80">{unit}</span>}
          </>
        )}
      </div>
      {trend && <p className="text-xs text-foreground/75 -mt-2">{trend}</p>}
    </PremiumCard>
  );
}
