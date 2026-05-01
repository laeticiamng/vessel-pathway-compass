import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { PremiumCard, PremiumCardTone } from "./PremiumCard";

interface ModuleCardProps {
  title: string;
  to: string;
  icon?: LucideIcon;
  /** Optional signature illustration (PNG/SVG). */
  image?: string;
  description?: string;
  tone?: PremiumCardTone;
  className?: string;
}

/**
 * Large illustrated module tile — bottom row of dashboards / landing
 * "modules cliniques" rows. Drop-in successor of NeonModuleTile,
 * built on PremiumCard for a single source of truth.
 */
export function ModuleCard({
  title,
  to,
  icon: Icon,
  image,
  description,
  tone = "cyan",
  className,
}: ModuleCardProps) {
  return (
    <Link to={to} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl">
      <PremiumCard
        tone={tone}
        padding="lg"
        className={cn(
          "min-h-[180px] flex flex-col items-center justify-center gap-4 text-center",
          className,
        )}
      >
        <div
          className={cn(
            "h-16 w-16 sm:h-20 sm:w-20 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-105",
            tone === "violet"
              ? "border-accent/40 text-accent bg-accent/5"
              : "border-primary/40 text-primary bg-primary/5",
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
              className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
            />
          ) : Icon ? (
            <Icon className="h-9 w-9 sm:h-10 sm:w-10" strokeWidth={1.5} />
          ) : null}
        </div>
        <div>
          <h3
            className={cn(
              "text-lg sm:text-xl font-semibold tracking-tight text-foreground",
              "dark:[text-shadow:0_0_10px_hsl(var(--primary)/0.18)]",
              tone === "violet" && "dark:[text-shadow:0_0_10px_hsl(var(--accent)/0.18)]",
            )}
          >
            {title}
          </h3>
          {description && (
            <p className="text-sm text-foreground/75 mt-1.5 max-w-[24ch] mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </PremiumCard>
    </Link>
  );
}
