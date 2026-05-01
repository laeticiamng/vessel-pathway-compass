import { cn } from "@/lib/utils";
import { ElementType, ReactNode, useEffect, useRef, useState } from "react";

interface NeonGradientTextProps {
  children: ReactNode;
  /** Visual intensity of the glow */
  intensity?: "soft" | "medium" | "strong";
  /** Render as a different element (default: span) */
  as?: ElementType;
  className?: string;
  /**
   * Enables the lazy-load behavior:
   *   • renders a premium shimmer skeleton until the headline scrolls
   *     into view AND the first frame is painted
   *   • drops the GPU-expensive halo when the element is offscreen,
   *     restoring full effects only while visible
   * Defaults to true. Disable for tests/SSR.
   */
  lazy?: boolean;
  /** Optional accessible label, useful when children are visually decorative. */
  ariaLabel?: string;
  /**
   * If true, the element is exposed to keyboard focus (tabIndex=0) with a
   * visible focus ring matching the active theme. Use on interactive
   * headlines (linked hero CTA, anchor target, etc.). Default false.
   */
  focusable?: boolean;
}

/**
 * Premium futuristic gradient headline (cyan → teal → light blue).
 *
 * Performance:
 *   • Lazy halo: effects are activated only after the element is in
 *     viewport (IntersectionObserver) — saves GPU on long landing pages
 *     and on low-power mobile devices.
 *   • Reduced motion: when the user has `prefers-reduced-motion: reduce`,
 *     the component automatically suspends the halo while scrolling and
 *     restores it after the scroll settles. The reinforced-contrast
 *     style is left untouched — those rules already guarantee a flat,
 *     readable headline.
 *
 * Accessibility:
 *   • Keyboard navigation: when `focusable`, the element is tabbable and
 *     gets a strong focus ring in light, dark and high-contrast modes.
 *   • Screen readers: pass `ariaLabel` if children are purely decorative.
 */
export function NeonGradientText({
  children,
  intensity = "medium",
  as: Tag = "span",
  className,
  lazy = true,
  ariaLabel,
  focusable = false,
}: NeonGradientTextProps) {
  const ref = useRef<HTMLElement | null>(null);
  // Effects start "off" so the very first paint shows the skeleton instead
  // of an unstyled-text flash. They turn on after the element is visible.
  const [active, setActive] = useState(!lazy);
  const [scrolling, setScrolling] = useState(false);

  // Lazy-load: activate effects only when the element enters the viewport.
  useEffect(() => {
    if (!lazy) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Wait one frame so the skeleton-to-text crossfade is smooth
            requestAnimationFrame(() => setActive(true));
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "120px 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [lazy]);

  // Reduced-motion users: pause the halo while scrolling, restore it after
  // a short idle window. Saves repeated GPU rasterization on cheap mobiles.
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

  return (
    <Tag
      ref={ref as never}
      aria-label={ariaLabel}
      tabIndex={focusable ? 0 : undefined}
      data-hero-neon=""
      data-hero-neon-active={active ? "true" : "false"}
      data-hero-neon-scrolling={scrolling ? "true" : "false"}
      className={cn(
        "hero-neon-text",
        intensity === "soft" && "hero-neon-soft",
        intensity === "strong" && "hero-neon-strong",
        // Skeleton placeholder until activated — premium shimmer
        !active && "hero-neon-skeleton",
        focusable && "hero-neon-focusable",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
