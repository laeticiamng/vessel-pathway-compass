import { cn } from "@/lib/utils";

interface AquaMRLogoProps {
  className?: string;
  /** Render as a solid rounded badge (used in the navbar) instead of inline icon */
  variant?: "inline" | "badge";
}

/**
 * AquaMR Flow brand mark: a water droplet containing a snowflake,
 * matching the dashboard preview branding.
 */
export const AquaMRLogo = ({ className, variant = "inline" }: AquaMRLogoProps) => {
  if (variant === "badge") {
    return (
      <div
        className={cn(
          "h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-md",
          className,
        )}
        aria-hidden="true"
      >
        <DropletSnowflake className="h-5 w-5 text-primary-foreground" />
      </div>
    );
  }

  return <DropletSnowflake className={cn("h-5 w-5 text-primary", className)} aria-hidden="true" />;
};

const DropletSnowflake = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Droplet outline */}
    <path d="M12 2.5c3.5 4.2 6 7.6 6 11a6 6 0 1 1-12 0c0-3.4 2.5-6.8 6-11z" />
    {/* Snowflake inside */}
    <g transform="translate(12 14)" strokeWidth={1.2}>
      <line x1="0" y1="-3.2" x2="0" y2="3.2" />
      <line x1="-2.8" y1="-1.6" x2="2.8" y2="1.6" />
      <line x1="-2.8" y1="1.6" x2="2.8" y2="-1.6" />
      <line x1="-0.6" y1="-3.2" x2="0.6" y2="-3.2" />
      <line x1="-0.6" y1="3.2" x2="0.6" y2="3.2" />
    </g>
  </svg>
);
