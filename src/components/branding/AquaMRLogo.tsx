import { cn } from "@/lib/utils";
import logoImg from "@/assets/icons/aquamr-logo.png";

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
        <img
          src={logoImg}
          alt=""
          aria-hidden="true"
          width={36}
          height={36}
          className="h-6 w-6 object-contain brightness-0 invert"
        />
      </div>
    );
  }

  return (
    <img
      src={logoImg}
      alt=""
      aria-hidden="true"
      width={20}
      height={20}
      className={cn("h-5 w-5 object-contain", className)}
    />
  );
};
