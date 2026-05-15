import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ReactNode } from "react";
import { fadeUp, maskReveal, slideMask, scaleIn, noMotion } from "@/lib/sculpture/variants";

const VARIANT_MAP: Record<string, Variants> = {
  fade: fadeUp,
  mask: maskReveal,
  slide: slideMask,
  scale: scaleIn,
};

interface RevealOnScrollProps {
  children: ReactNode;
  variant?: keyof typeof VARIANT_MAP;
  delay?: number;
  once?: boolean;
  className?: string;
  amount?: number;
  as?: "div" | "section" | "article" | "header" | "footer" | "span";
}

/**
 * RevealOnScroll — sculptural reveal triggered on scroll into view.
 * Automatically falls back to `noMotion` when `prefers-reduced-motion` is set.
 */
export function RevealOnScroll({
  children,
  variant = "fade",
  delay = 0,
  once = true,
  className,
  amount = 0.2,
  as = "div",
}: RevealOnScrollProps) {
  const shouldReduce = useReducedMotion();
  const variants = shouldReduce ? noMotion : (VARIANT_MAP[variant] ?? fadeUp);

  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}
