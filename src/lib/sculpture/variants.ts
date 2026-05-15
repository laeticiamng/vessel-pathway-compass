/**
 * Shared framer-motion variants — sculptural reveals.
 * All variants honor `prefers-reduced-motion` via the consumer's check.
 */
import type { Variants } from "framer-motion";
import { EASE, DURATION } from "./tokens";

// Convert tuple to mutable array for framer-motion's Easing type.
const ease = (t: readonly number[]): [number, number, number, number] =>
  [t[0], t[1], t[2], t[3]] as [number, number, number, number];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.medium, ease: ease(EASE.signature) },
  },
};

export const maskReveal: Variants = {
  hidden: { clipPath: "inset(0 100% 0 0)", opacity: 0.6 },
  visible: {
    clipPath: "inset(0 0% 0 0)",
    opacity: 1,
    transition: { duration: DURATION.reveal, ease: ease(EASE.signature) },
  },
};

export const slideMask: Variants = {
  hidden: { y: "110%" },
  visible: {
    y: "0%",
    transition: { duration: DURATION.long, ease: ease(EASE.velvet) },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.medium, ease: ease(EASE.signature) },
  },
};

export const stagger = (childDelay = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: childDelay,
      delayChildren,
    },
  },
});

/** Variant for instant render in reduced-motion mode. */
export const noMotion: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};
