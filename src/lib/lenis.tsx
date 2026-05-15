import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";
import { EASE } from "@/lib/sculpture/tokens";

/**
 * LenisProvider — global smooth scroll, surgically disabled where it would
 * harm the clinical UX or accessibility.
 *
 * Disabled when:
 *   - prefers-reduced-motion is set
 *   - route matches a clinical-critical pattern (forms, DICOM viewer, scoring)
 *   - the user is on a touch primary device (Lenis already handles this internally
 *     for touch via `syncTouch: false`, but we keep wheel smoothing on)
 *
 * Exposes the live Lenis instance via context for advanced consumers
 * (e.g. parallax sections that need scroll progress).
 */

const LenisContext = createContext<Lenis | null>(null);

export const useLenis = () => useContext(LenisContext);

/** Routes where we want native scroll, not smooth. */
const NO_SMOOTH_ROUTES: ReadonlyArray<RegExp> = [
  /^\/app\/patients/,
  /^\/app\/l1-decision-board/,
  /^\/app\/ci-aki-engine/,
  /^\/app\/fusion-viewer/,
  /^\/app\/vascscreen\/(patient-entry|assessment|abi)/,
  /^\/app\/governance\/audit-search/,
  /^\/app\/admin\/protocol-audit/,
];

function shouldDisableForRoute(pathname: string): boolean {
  return NO_SMOOTH_ROUTES.some((r) => r.test(pathname));
}

interface LenisProviderProps {
  children: ReactNode;
}

export function LenisProvider({ children }: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const disabledForRoute = shouldDisableForRoute(location.pathname);

    if (reduced || disabledForRoute) {
      // Make sure no leftover instance is running.
      lenisRef.current?.destroy();
      lenisRef.current = null;
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3), // mirrors EASE.signature feel
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      smoothWheel: true,
      syncTouch: false,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lenis.destroy();
      lenisRef.current = null;
      document.documentElement.classList.remove("lenis", "lenis-smooth");
    };
    // Re-evaluate when the route changes.
  }, [location.pathname]);

  // Listen for reduced-motion preference flips at runtime.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => {
      // Force re-mount of the effect by toggling a key would be heavier;
      // simplest: destroy + the next route change recreates if appropriate.
      if (mql.matches) {
        lenisRef.current?.destroy();
        lenisRef.current = null;
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return <LenisContext.Provider value={lenisRef.current}>{children}</LenisContext.Provider>;
}

// Re-export easing for any consumer that wants to align an animation with Lenis.
export { EASE as LENIS_EASE };
