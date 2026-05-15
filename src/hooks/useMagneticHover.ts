import { useCallback, useEffect, useRef, useState } from "react";
import { prefersReducedMotion, MAGNETIC } from "@/lib/sculpture/tokens";

/**
 * Magnetic hover hook — pulls an element toward the cursor with subtle
 * spring-like translation. Honors `prefers-reduced-motion` (returns 0,0).
 *
 * @param strength Pixel amplitude. Defaults to MAGNETIC.subtle (4px).
 */
export function useMagneticHover<T extends HTMLElement = HTMLDivElement>(
  strength: number = MAGNETIC.subtle,
) {
  const ref = useRef<T | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = prefersReducedMotion();
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      if (reducedMotion.current) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = ((e.clientX - cx) / rect.width) * 2 * strength;
      const dy = ((e.clientY - cy) / rect.height) * 2 * strength;
      setPos({ x: dx, y: dy });
    },
    [strength],
  );

  const onMouseLeave = useCallback(() => setPos({ x: 0, y: 0 }), []);

  return { ref, pos, onMouseMove, onMouseLeave };
}
