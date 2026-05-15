import { useCallback, useEffect, useState } from "react";

/**
 * v8.3 low-resource mode — global toggle that defaults RSVP to Level 1
 * (no advanced imaging) for clinical decision support modules.
 *
 * Persists in `localStorage['vlink_low_resource_mode']` (`"on"` | `"off"`).
 * Listens to the `storage` event so multiple tabs stay in sync.
 */
const STORAGE_KEY = "vlink_low_resource_mode";

function read(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

export function useLowResourceMode() {
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    setEnabled(read());
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setEnabled(read());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setMode = useCallback((next: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      // ignore
    }
    setEnabled(next);
  }, []);

  const toggle = useCallback(() => setMode(!read()), [setMode]);

  return { enabled, setMode, toggle };
}
