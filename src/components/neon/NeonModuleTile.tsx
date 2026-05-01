import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NeonModuleTileProps {
  title: string;
  /** Optional Lucide icon (used as fallback if no image is supplied). */
  icon?: LucideIcon;
  /** Optional illustrated PNG/SVG (preferred — AquaMR Flow signature artwork). */
  image?: string;
  to: string;
  variant?: "cyan" | "violet";
  description?: string;
}

/**
 * Large illustrated module tile (Procedure Planner / Digital Twin /
 * Registry / Education) — bottom row of the AquaMR Flow dashboard.
 *
 * If `image` is provided, it renders the AquaMR Flow signature illustration;
 * otherwise it falls back to the Lucide `icon`.
 */
export function NeonModuleTile({
  title,
  icon: Icon,
  image,
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
            ? "border-accent/60 text-accent bg-accent/15 dark:bg-accent/5"
            : "border-primary/60 text-primary bg-primary/15 dark:bg-primary/5"
        )}
      >
        {image ? (
          <img
            src={image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            width={80}
            height={80}
            className={cn(
              "h-12 w-12 sm:h-14 sm:w-14 object-contain",
              "[filter:brightness(0.42)_saturate(1.95)_contrast(1.28)] dark:[filter:none]"
            )}
          />
        ) : Icon ? (
          <Icon className="h-9 w-9 sm:h-10 sm:w-10 shrink-0" strokeWidth={1.9} />
        ) : null}
      </div>
      <div>
        <h3
          className={cn(
            "text-lg sm:text-xl font-semibold tracking-tight text-foreground",
            "dark:[text-shadow:0_0_10px_hsl(var(--primary)/0.18)]",
            isViolet && "dark:[text-shadow:0_0_10px_hsl(var(--accent)/0.18)]"
          )}
        >
          {title}
        </h3>
        {description && (
          <p className="text-sm text-foreground/82 mt-1.5 max-w-[24ch] mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
