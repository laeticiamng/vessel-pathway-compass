import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NeonModuleTileProps {
  title: string;
  icon: LucideIcon;
  to: string;
  variant?: "cyan" | "violet";
  description?: string;
}

/**
 * Large illustrated module tile (Procedure Planner / Digital Twin /
 * Registry / Education) — bottom row of the AquaMR Flow dashboard.
 */
export function NeonModuleTile({
  title,
  icon: Icon,
  to,
  variant = "cyan",
  description,
}: NeonModuleTileProps) {
  const isViolet = variant === "violet";
  return (
    <Link
      to={to}
      className={cn(
        "neon-card group flex flex-col items-center justify-center gap-4 p-6 sm:p-8 min-h-[180px] text-center",
        isViolet && "neon-violet"
      )}
    >
      <div
        className={cn(
          "h-16 w-16 sm:h-20 sm:w-20 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-105",
          isViolet
            ? "border-accent/40 text-accent bg-accent/5"
            : "border-primary/40 text-primary bg-primary/5"
        )}
      >
        <Icon className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={1.5} />
      </div>
      <div>
        <h3
          className={cn(
            "text-lg sm:text-xl font-semibold tracking-tight",
            "dark:[text-shadow:0_0_18px_hsl(var(--primary)/0.35)]",
            isViolet && "dark:[text-shadow:0_0_18px_hsl(var(--accent)/0.35)]"
          )}
        >
          {title}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-1.5 max-w-[22ch] mx-auto">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
