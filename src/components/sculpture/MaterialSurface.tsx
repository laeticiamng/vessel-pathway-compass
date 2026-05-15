import { useRef, useState, MouseEvent, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DEPTH, SPRING } from "@/lib/sculpture/tokens";

interface MaterialSurfaceProps {
  children: ReactNode;
  className?: string;
  /** Show a light reflection that follows the cursor. */
  reflective?: boolean;
  /** Brushed gradient overlay. */
  brushed?: boolean;
}

/**
 * MaterialSurface — sculptural card with multi-layer depth, brushed gradient
 * overlay, and optional cursor-tracked light reflection.
 *
 * Pure presentation — no business logic. Honors reduced motion (no reflection).
 */
export function MaterialSurface({
  children,
  className,
  reflective = true,
  brushed = true,
}: MaterialSurfaceProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [light, setLight] = useState({ x: 50, y: 50, visible: false });
  const shouldReduce = useReducedMotion();

  function onMove(e: MouseEvent<HTMLDivElement>) {
    if (shouldReduce || !reflective) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setLight({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
      visible: true,
    });
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setLight((l) => ({ ...l, visible: false }))}
      whileHover={shouldReduce ? undefined : { y: -2 }}
      transition={SPRING.soft}
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-border/60 bg-card",
        "transition-shadow",
        className,
      )}
      style={{ boxShadow: DEPTH.rest }}
    >
      {brushed && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, hsl(var(--foreground)) 0 1px, transparent 1px 3px)",
          }}
        />
      )}
      {reflective && !shouldReduce && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: light.visible ? 1 : 0,
            background: `radial-gradient(420px circle at ${light.x}% ${light.y}%, hsl(var(--primary) / 0.12), transparent 60%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
