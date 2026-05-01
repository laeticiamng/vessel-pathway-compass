import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

type HighContrastContextValue = {
  highContrast: boolean;
  toggle: () => void;
  setHighContrast: (value: boolean) => void;
};

const HighContrastContext = createContext<HighContrastContextValue | null>(null);

const STORAGE_KEY = "aquamr-high-contrast";

/**
 * Provides a reinforced-contrast mode that thickens borders, deepens icon
 * colors and removes glow effects across the platform. Persists in
 * localStorage and respects the OS-level `prefers-contrast: more` query.
 */
export function HighContrastProvider({ children }: { children: ReactNode }) {
  const [highContrast, setHighContrastState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) return stored === "true";
    return window.matchMedia?.("(prefers-contrast: more)").matches ?? false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, String(highContrast));
    } catch {
      // storage unavailable — ignore
    }
  }, [highContrast]);

  const setHighContrast = useCallback((value: boolean) => setHighContrastState(value), []);
  const toggle = useCallback(() => setHighContrastState((v) => !v), []);

  return (
    <HighContrastContext.Provider value={{ highContrast, toggle, setHighContrast }}>
      {children}
    </HighContrastContext.Provider>
  );
}

export function useHighContrast() {
  const ctx = useContext(HighContrastContext);
  if (!ctx) {
    // Safe fallback so components don't crash if provider is missing (HMR).
    return { highContrast: false, toggle: () => {}, setHighContrast: () => {} };
  }
  return ctx;
}
