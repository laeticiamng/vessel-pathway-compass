import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { useMagneticHover } from "@/hooks/useMagneticHover";
import { SPRING, MAGNETIC } from "@/lib/sculpture/tokens";
import { cn } from "@/lib/utils";

interface SculpturalProps {
  children: ReactNode;
  /** Magnetic pull amplitude in pixels. */
  strength?: number;
  /** Apply subtle 3D tilt on hover. */
  tilt?: boolean;
  className?: string;
  as?: "div" | "button" | "a";
}

/**
 * Sculptural — wraps any element with magnetic hover + optional tilt.
 * Disabled automatically under `prefers-reduced-motion`.
 *
 * Use sparingly: hero CTAs, primary nav logos, signature cards.
 * Not for clinical forms, tables, or DICOM viewers.
 */
export function Sculptural({
  children,
  strength = MAGNETIC.subtle,
  tilt = false,
  className,
  as = "div",
}: SculpturalProps) {
  const shouldReduce = useReducedMotion();
  const { ref, pos, onMouseMove, onMouseLeave } = useMagneticHover<HTMLDivElement>(strength);

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      ref={ref as never}
      className={cn("inline-block will-change-transform", className)}
      onMouseMove={shouldReduce ? undefined : onMouseMove}
      onMouseLeave={shouldReduce ? undefined : onMouseLeave}
      animate={
        shouldReduce
          ? { x: 0, y: 0, rotateX: 0, rotateY: 0 }
          : {
              x: pos.x,
              y: pos.y,
              rotateX: tilt ? -pos.y * 0.4 : 0,
              rotateY: tilt ? pos.x * 0.4 : 0,
            }
      }
      transition={SPRING.magnetic}
      style={tilt ? { transformPerspective: 800 } : undefined}
    >
      {children}
    </MotionTag>
  );
}
