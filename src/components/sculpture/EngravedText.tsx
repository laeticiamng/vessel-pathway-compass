import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EngravedTextProps {
  children: ReactNode;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}

/**
 * EngravedText — typography that reads as carved into the surface.
 * Uses paired text-shadow (inset feel) — works in light & dark via tokens.
 */
export function EngravedText({ children, className, as: Tag = "span" }: EngravedTextProps) {
  return (
    <Tag
      className={cn("inline-block text-foreground/90", className)}
      style={{
        textShadow:
          "0 1px 0 hsl(var(--background) / 0.7), 0 -1px 0 hsl(var(--foreground) / 0.08)",
      }}
    >
      {children}
    </Tag>
  );
}
