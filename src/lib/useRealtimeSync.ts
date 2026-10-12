"use client";

import { useEffect, useRef } from "react";

export interface RealtimeSyncOptions {
  /**
   * Interval in milliseconds for live syncing while tab is active.
   * Default: 35000ms (35 seconds) to avoid spamming the backend while remaining fresh.
   */
  intervalMs?: number;
  enabled?: boolean;
  onFocus?: boolean;
}

// In-memory cross-component event dispatcher + BroadcastChannel for multi-tab sync
const SYNC_EVENT_NAME = "puretyfarm:livesync";
const BROADCAST_CHANNEL_NAME = "puretyfarm_live_sync_channel";

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && typeof BroadcastChannel !== "undefined") {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch {
    broadcastChannel = null;
  }
}

/**
 * Triggers an immediate live sync across all active views in the current tab
 * and any other open PuretyFarm tabs.
 */
export function triggerGlobalLiveSync(reason?: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT_NAME, { detail: { reason } }));
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ reason, timestamp: Date.now() });
      } catch {
        // Ignore channel errors
      }
    }
  }
}

/**
 * Live Data Sync:
 * Keeps customer views (Orders, Approvals, Credit/Debit Wallet, Plans, Deliveries)
 * synchronized with backend & admin updates without manual browser reloads.
 *
 * 1. Safe background polling (every ~35s by default) when tab is visible.
 * 2. Instant revalidation on window focus, tab visibility return, and network reconnection.
 * 3. Cross-tab and cross-component broadcast synchronization.
 * 4. In-flight request deduplication so slow network requests never stack up.
 * 5. Paused when tab is hidden, stopped on 401 or 429.
 */
export function useRealtimeSync(
  refreshFn: () => void | Promise<void>,
  options: RealtimeSyncOptions = {}
) {
  const { intervalMs = 35000, enabled = true, onFocus = true } = options;
  const fnRef = useRef(refreshFn);

  useEffect(() => {
    fnRef.current = refreshFn;
  });

  const isRunningRef = useRef(false);
  const isSuspendedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const executeRefresh = async () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }
      if (isSuspendedRef.current) return;
      if (isRunningRef.current) return;

      isRunningRef.current = true;
      try {
        const res = fnRef.current();
        if (res && typeof (res as Promise<void>).then === "function") {
          await res;
        }
      } catch (err: any) {
        if (err?.status === 401 || err?.status === 429) {
          isSuspendedRef.current = true;
        }
      } finally {
        isRunningRef.current = false;
      }
    };

    // 1. Live timer (active when document is visible)
    const intervalId = setInterval(executeRefresh, intervalMs);

    // 2. Immediate revalidation triggers
    const handleRevalidate = () => {
      executeRefresh();
    };

    if (onFocus && typeof window !== "undefined") {
      window.addEventListener("focus", handleRevalidate);
      document.addEventListener("visibilitychange", handleRevalidate);
      window.addEventListener("online", handleRevalidate);
      window.addEventListener(SYNC_EVENT_NAME, handleRevalidate);

      if (broadcastChannel) {
        broadcastChannel.addEventListener("message", handleRevalidate);
      }
    }

    return () => {
      clearInterval(intervalId);
      if (onFocus && typeof window !== "undefined") {
        window.removeEventListener("focus", handleRevalidate);
        document.removeEventListener("visibilitychange", handleRevalidate);
        window.removeEventListener("online", handleRevalidate);
        window.removeEventListener(SYNC_EVENT_NAME, handleRevalidate);

        if (broadcastChannel) {
          broadcastChannel.removeEventListener("message", handleRevalidate);
        }
      }
    };
  }, [enabled, intervalMs, onFocus]);
}
