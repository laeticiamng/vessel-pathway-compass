import { useCallback, useEffect, useState } from "react";

/**
 * v8.3 medical disclaimer acceptance — first-session gate for CDS surfaces.
 *
 * Persists in `localStorage['vlink_disclaimer_accepted_v83']` with values:
 *   - `"accepted"` → user accepted the strong disclaimer (CDS unlocked)
 *   - `"declined"` → user explicitly declined (CDS blocked, can re-open)
 *   - missing      → never seen → modal must appear on next mount
 *
 * The hook is SSR-safe (defaults to `pending` until mount).
 */
export type DisclaimerStatus = "pending" | "accepted" | "declined";

const STORAGE_KEY = "vlink_disclaimer_accepted_v83";

function readStatus(): DisclaimerStatus {
  if (typeof window === "undefined") return "pending";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "accepted" || raw === "declined") return raw;
  } catch {
    // Storage may be unavailable (private mode); treat as pending.
  }
  return "pending";
}

export function useDisclaimerAcceptance() {
  const [status, setStatus] = useState<DisclaimerStatus>("pending");

  useEffect(() => {
    setStatus(readStatus());
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setStatus(readStatus());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const accept = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // ignore — UI still updates
    }
    setStatus("accepted");
  }, []);

  const decline = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "declined");
    } catch {
      // ignore
    }
    setStatus("declined");
  }, []);

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setStatus("pending");
  }, []);

  return {
    status,
    isAccepted: status === "accepted",
    isDeclined: status === "declined",
    isPending: status === "pending",
    accept,
    decline,
    reset,
  };
}
