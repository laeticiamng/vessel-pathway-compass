import { cn } from "@/lib/utils";
import { ElementType, ReactNode, useEffect, useRef, useState } from "react";
import { recordHeroNeonEvent } from "@/lib/heroNeonMetrics";

/**
 * Tunable IntersectionObserver options for the hero-neon component.
 * Exported so visual-regression tests can assert the strategy directly.
 *
 * Strategy:
 *   • `rootMargin` is **viewport-relative** (`25%`) so the observer fires
 *     earlier on tall mobile screens (where 25% of vh ≈ 200px) than on
 *     desktop (where 25% of vh ≈ 250px). A fixed pixel margin would
 *     under-trigger on small phones and over-trigger on 4K displays.
 *   • Multiple `threshold`s catch fast flick-scroll where the headline
 *     would otherwise skip past the single 0.05 sample window without
 *     ever being reported as visible (= halo flicker).
 */
export const HERO_NEON_IO_OPTIONS: IntersectionObserverInit = {
  rootMargin: "25% 0px 25% 0px",
  threshold: [0, 0.05, 0.25],
};

interface NeonGradientTextProps {
  children: ReactNode;
  intensity?: "soft" | "medium" | "strong";
  as?: ElementType;
  className?: string;
  /** When false, effects are active immediately (skip skeleton + IO). */
  lazy?: boolean;
  /** Accessible label for screen readers. Use when children is decorative. */
  ariaLabel?: string;
  /** When true, element is keyboard-focusable with a strong focus ring. */
  focusable?: boolean;
  /**
   * Mark as purely decorative — element is hidden from the accessibility
   * tree (`aria-hidden="true"`). Use when an adjacent semantic element
   * already conveys the same text to screen readers.
   */
  decorative?: boolean;
}

export function NeonGradientText({
  children,
  intensity = "medium",
  as: Tag = "span",
  className,
  lazy = true,
  ariaLabel,
  focusable = false,
  decorative = false,
}: NeonGradientTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(!lazy);
  const [scrolling, setScrolling] = useState(false);
  const skeletonStartRef = useRef<number>(
    typeof performance !== "undefined" ? performance.now() : 0,
  );

  // Lazy activation via IntersectionObserver tuned for mobile-first.
  useEffect(() => {
    if (!lazy) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          // Two-frame debounce → guarantees the skeleton→effects swap
          // lands on a real paint frame, no flash on fast flick-scroll.
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setActive(true);
              const now =
                typeof performance !== "undefined" ? performance.now() : 0;
              recordHeroNeonEvent({
                kind: "skeleton-to-active",
                value: Math.max(0, now - skeletonStartRef.current),
              });
            });
          });
          io.disconnect();
          break;
        }
      }
    }, HERO_NEON_IO_OPTIONS);
    io.observe(el);
    return () => io.disconnect();
  }, [lazy]);

  // Pause halo while scrolling for users with reduced-motion preference.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!mq.matches) return;

    let timeout: number | null = null;
    const onScroll = () => {
      setScrolling(true);
      if (timeout !== null) window.clearTimeout(timeout);
      timeout = window.setTimeout(() => setScrolling(false), 220);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeout !== null) window.clearTimeout(timeout);
    };
  }, []);

  // ARIA wiring:
  //  • decorative → hide the whole element from SR
  //  • skeleton → mark as busy + hidden so SR doesn't read placeholder
  const isSkeleton = !active;
  const ariaHidden = decorative || isSkeleton ? true : undefined;
  const ariaBusy = isSkeleton ? true : undefined;
  // Mirror text into aria-label when the parent is purely a string and no
  // explicit label is given — preserves a clean SR announcement once the
  // skeleton lifts (we still hide the skeleton itself via aria-hidden).
  const computedLabel =
    ariaLabel ??
    (typeof children === "string" && !decorative ? children : undefined);

  return (
    <Tag
      ref={ref as never}
      aria-label={computedLabel}
      aria-hidden={ariaHidden || undefined}
      aria-busy={ariaBusy || undefined}
      tabIndex={focusable ? 0 : undefined}
      data-hero-neon=""
      data-hero-neon-active={active ? "true" : "false"}
      data-hero-neon-scrolling={scrolling ? "true" : "false"}
      className={cn(
        "hero-neon-text",
        intensity === "soft" && "hero-neon-soft",
        intensity === "strong" && "hero-neon-strong",
        !active && "hero-neon-skeleton",
        focusable && "hero-neon-focusable",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
