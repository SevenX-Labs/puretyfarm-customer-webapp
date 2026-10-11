import { useEffect, useRef } from "react";

export interface RealtimeSyncOptions {
  intervalMs?: number; // default: 12000 (12 seconds)
  enabled?: boolean;
  onFocus?: boolean;
}

/**
 * Automatically syncs fresh data from the server in the background:
 * 1. Periodic background polling every `intervalMs` (only when browser tab is active/visible).
 * 2. Window focus & visibility change revalidation (when user returns to the tab).
 * Keeps customer views (Active Plans, Deliveries, Wallet Balance, Pricing/Config) live in real time without manual browser refreshes.
 */
export function useRealtimeSync(
  refreshFn: () => void | Promise<void>,
  options: RealtimeSyncOptions = {}
) {
  const { intervalMs = 12000, enabled = true, onFocus = true } = options;
  const fnRef = useRef(refreshFn);
  fnRef.current = refreshFn;

  useEffect(() => {
    if (!enabled) return;

    // 1. Periodic background timer
    const intervalId = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        try {
          const res = fnRef.current();
          if (res && typeof (res as Promise<void>).catch === "function") {
            (res as Promise<void>).catch(() => {});
          }
        } catch {
          // Ignore background sync errors
        }
      }
    }, intervalMs);

    // 2. Revalidate on window focus & visibility change
    const handleRevalidate = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        try {
          const res = fnRef.current();
          if (res && typeof (res as Promise<void>).catch === "function") {
            (res as Promise<void>).catch(() => {});
          }
        } catch {
          // Ignore background sync errors
        }
      }
    };

    if (onFocus && typeof window !== "undefined") {
      window.addEventListener("focus", handleRevalidate);
      document.addEventListener("visibilitychange", handleRevalidate);
    }

    return () => {
      clearInterval(intervalId);
      if (onFocus && typeof window !== "undefined") {
        window.removeEventListener("focus", handleRevalidate);
        document.removeEventListener("visibilitychange", handleRevalidate);
      }
    };
  }, [enabled, intervalMs, onFocus]);
}
