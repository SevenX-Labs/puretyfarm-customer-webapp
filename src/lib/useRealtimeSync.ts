"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRealtimeContext } from "@/context/RealtimeContext";

export type CustomerSyncEventType =
  | "wallet.updated"
  | "orders.updated"
  | "plan.updated"
  | "plans.catalog.updated"
  | (string & {});

export interface RealtimeSyncOptions {
  /**
   * Realtime SSE event types this page cares about.
   * When a matching event arrives, refreshFn is called with debouncing and trailing-refresh safety.
   */
  events?: CustomerSyncEventType[];
  /**
   * Fallback interval in milliseconds for polling.
   * Default: 35000ms when stream is down, 120000ms when stream is healthy.
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
 * Synchronizes customer views with backend changes via real-time SSE stream
 * with fallback safety polling (120s when healthy, ~35s when stream down).
 *
 * 1. Event-driven immediate refresh when matching backend events arrive.
 * 2. 300ms debounce with in-flight deduplication and trailing-refresh guarantee.
 * 3. Polling interval: 120s when stream is healthy, 35s when stream is down.
 * 4. Paused when tab is hidden, stopped on 401 or 429.
 * 5. Revalidates immediately on reconnect, window focus, tab visibility return, network online.
 */
export function useRealtimeSync(
  refreshFn: () => void | Promise<void>,
  options: RealtimeSyncOptions = {}
) {
  const { events, intervalMs = 35000, enabled = true, onFocus = true } = options;
  const fnRef = useRef(refreshFn);

  useEffect(() => {
    fnRef.current = refreshFn;
  });

  const realtimeCtx = useRealtimeContext();
  const isStreamHealthy = realtimeCtx?.isStreamHealthy ?? false;

  const inFlightRef = useRef(false);
  const trailingRefreshNeededRef = useRef(false);
  const isSuspendedRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const executeRefresh = useCallback(async () => {
    if (typeof document !== "undefined" && document.visibilityState !== "visible") {
      return;
    }
    if (isSuspendedRef.current) return;

    if (inFlightRef.current) {
      // An event arrived while a refresh request is already in flight.
      // Record that a single trailing refresh is required when the current request completes.
      trailingRefreshNeededRef.current = true;
      return;
    }

    inFlightRef.current = true;
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
      inFlightRef.current = false;
      // If an event arrived while in-flight, execute ONE trailing refresh
      if (trailingRefreshNeededRef.current) {
        trailingRefreshNeededRef.current = false;
        void executeRefresh();
      }
    }
  }, []);

  const triggerDebouncedRefresh = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      void executeRefresh();
    }, 300);
  }, [executeRefresh]);

  // 1. Subscribe to SSE events from RealtimeProvider if events are specified
  useEffect(() => {
    if (!enabled || !events || events.length === 0 || !realtimeCtx) return;

    const unsubscribe = realtimeCtx.subscribe(
      events as any,
      () => {
        triggerDebouncedRefresh();
      }
    );

    return () => {
      unsubscribe();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [enabled, events, realtimeCtx, triggerDebouncedRefresh]);

  // 2. Safety-net polling timer
  // When stream is healthy, interval is relaxed to 120s; when stream is down, uses intervalMs (~35s).
  useEffect(() => {
    if (!enabled) return;

    const effectiveInterval = isStreamHealthy ? 120000 : intervalMs;

    const intervalId = setInterval(() => {
      void executeRefresh();
    }, effectiveInterval);

    // Immediate revalidation triggers
    const handleRevalidate = () => {
      void executeRefresh();
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
  }, [enabled, isStreamHealthy, intervalMs, onFocus, executeRefresh]);
}
