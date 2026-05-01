import { cn } from "@/lib/utils";
import logoImg from "@/assets/icons/aquamr-logo.png";

interface AquaMRLogoProps {
  className?: string;
  /**
   * - `inline` (default): standalone water-droplet mark, transparent background.
   *   Use everywhere — navbar, dashboard header, footer, auth screens.
   * - `badge`: kept for backwards compatibility but now renders the same
   *   transparent droplet (no more solid pastille — that diverged from the
   *   AquaMR Flow reference branding).
   */
  variant?: "inline" | "badge";
  /** Pixel size of the rendered droplet. Defaults to 40 (matches reference). */
  size?: number;
}

/**
 * AquaMR Flow brand mark — a cyan water droplet containing a snowflake,
 * shown on a transparent background to match the reference design exactly.
 * No solid badge, no color filter applied to the artwork.
 */
export const AquaMRLogo = ({
  className,
  variant = "inline",
  size,
}: AquaMRLogoProps) => {
  const px = size ?? (variant === "badge" ? 40 : 28);
  return (
    <img
      src={logoImg}
      alt=""
      aria-hidden="true"
      width={px}
      height={px}
      className={cn(
        "object-contain select-none drop-shadow-[0_0_10px_hsl(188_100%_60%/0.35)]",
        className,
      )}
      style={{ width: px, height: px }}
    />
  );
};
