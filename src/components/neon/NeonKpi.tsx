import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NeonKpiProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  /** Optional Lucide icon (used as fallback if no image is supplied). */
  icon?: LucideIcon;
  /** Optional illustrated PNG/SVG (preferred — AquaMR Flow signature artwork). */
  image?: string;
  variant?: "cyan" | "violet";
  trend?: string;
  loading?: boolean;
  className?: string;
}

/**
 * AquaMR Flow KPI card.
 * Large neon-glow value, minimalist icon ring (or signature illustration), optional trend caption.
 * Reusable across Dashboard, Patients, Registry, Analytics, etc.
 */
export function NeonKpi({
  label,
  value,
  unit,
  icon: Icon,
  image,
  variant = "cyan",
  trend,
  loading,
  className,
}: NeonKpiProps) {
  const isViolet = variant === "violet";
  return (
    <div
      className={cn(
        "neon-card p-5 sm:p-6 flex flex-col gap-4",
        isViolet && "neon-violet",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-semibold text-foreground tracking-wide">
          {label}
        </span>
        <div className={cn("neon-icon-ring", isViolet && "violet")}>
          {image ? (
            <img
              src={image}
              alt=""
              aria-hidden="true"
              loading="lazy"
              width={40}
              height={40}
              data-neon-illustration=""
              className="h-7 w-7 object-contain [filter:brightness(0.42)_saturate(1.95)_contrast(1.28)] dark:[filter:none]"
            />
          ) : Icon ? (
            <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
          ) : null}
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        {loading ? (
          <div className="h-12 w-20 rounded-md bg-foreground/10 animate-pulse" />
        ) : (
          <>
            <span className={cn("neon-kpi-value", isViolet && "violet")}>{value}</span>
            {unit && (
              <span className="text-lg font-semibold text-foreground">{unit}</span>
            )}
          </>
        )}
      </div>

      {trend && (
        <p className="text-xs text-foreground/80 -mt-2">{trend}</p>
      )}
    </div>
  );
}
