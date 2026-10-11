"use client";

import { useEffect, useRef } from "react";

export interface RealtimeSyncOptions {
  /**
   * Interval in milliseconds for high-frequency live syncing while tab is active.
   * Default: 3500ms (3.5 seconds) for real-time responsiveness without browser reload.
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
 * High-Frequency Live Data Sync:
 * Automatically keeps customer views (Orders, Approvals, Credit/Debit Wallet, Plans, Deliveries)
 * synchronized with backend & admin updates in real time without manual browser reloads.
 *
 * 1. Fast background polling (every ~3.5s by default) when the tab is visible.
 * 2. Instant revalidation on window focus, tab visibility return, and network reconnection.
 * 3. Cross-tab and cross-component broadcast synchronization.
 * 4. In-flight request deduplication so slow network requests never stack up.
 */
export function useRealtimeSync(
  refreshFn: () => void | Promise<void>,
  options: RealtimeSyncOptions = {}
) {
  const { intervalMs = 3500, enabled = true, onFocus = true } = options;
  const fnRef = useRef(refreshFn);
  fnRef.current = refreshFn;

  const isRunningRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const executeRefresh = async () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }
      if (isRunningRef.current) return;
      isRunningRef.current = true;
      try {
        const res = fnRef.current();
        if (res && typeof (res as Promise<void>).then === "function") {
          await res;
        }
      } catch {
        // Silently swallow live sync background errors to avoid UI disruption
      } finally {
        isRunningRef.current = false;
      }
    };

    // 1. Live high-frequency timer (active when document is visible)
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
