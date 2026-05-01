import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PremiumCard, PremiumCardTone } from "./PremiumCard";

interface ClinicalChartCardProps {
  title: string;
  legend?: ReactNode;
  description?: string;
  tone?: PremiumCardTone;
  className?: string;
  children: ReactNode;
}

/**
 * Container for clinical charts (Risk Distribution, eGFR trend, registry curves).
 * Provides the cockpit-grade frame: title row + legend + scrollable plot area.
 */
export function ClinicalChartCard({
  title,
  legend,
  description,
  tone = "cyan",
  className,
  children,
}: ClinicalChartCardProps) {
  return (
    <PremiumCard tone={tone} padding="md" className={cn("flex flex-col gap-3", className)}>
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-foreground/70 mt-0.5">{description}</p>
          )}
        </div>
        {legend && (
          <div className="text-xs text-foreground/75 flex items-center gap-3">{legend}</div>
        )}
      </header>
      <div className="cockpit-grid rounded-xl p-2 sm:p-3 -mx-1 overflow-hidden">{children}</div>
    </PremiumCard>
  );
}
