import { useEffect, useState } from "react";

/**
 * useGlassScroll — emits true once the user has scrolled past `threshold` px.
 * Use to dynamically opacify a glass header (B&O / Sonos signature transition).
 *
 * Passive listener, cleaned up on unmount. Defaults to 16px.
 */
export function useGlassScroll(threshold = 16): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}
