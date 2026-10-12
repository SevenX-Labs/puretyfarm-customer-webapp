"use client";

import { RealtimeStreamClient } from "@/lib/realtime/realtimeStreamClient";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import {
  refreshSession,
  subscribeToAuthSession,
} from "@/lib/auth/refreshSession";
import { SSEParser, SSEMessage } from "@/lib/realtime/sseParser";
import { triggerGlobalLiveSync } from "@/lib/useRealtimeSync";
import { invalidateCacheByResource } from "@/lib/cache/swrCache";

export type CustomerRealtimeEventType =
  | "wallet.updated"
  | "orders.updated"
  | "plan.updated"
  | "plans.catalog.updated";

export interface RealtimeContextType {
  isStreamHealthy: boolean;
  subscribe: (
    types: CustomerRealtimeEventType[],
    callback: (eventTypes: CustomerRealtimeEventType[]) => void
  ) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export function getResolvedApiUrl(): string | null {
  const envUrl =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.trim()
      : "";

  if (!envUrl) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[RealtimeContext] NEXT_PUBLIC_API_URL is not configured. Realtime SSE connection disabled for local development/testing."
      );
    }
    return null;
  }

  if (
    process.env.NODE_ENV !== "production" &&
    envUrl.includes("api-puretyfarm.onrender.com")
  ) {
    console.warn(
      "[RealtimeContext] Refusing to connect to production API URL in non-production environment. Realtime SSE connection disabled."
    );
    return null;
  }

  return envUrl.replace(/\/+$/, "").replace(/\/api\/v1\/?$/, "");
}

interface ActiveToast {
  id: string;
  message: string;
}

const TOAST_MESSAGES: Record<string, string> = {
  "wallet.updated": "Amount credited successfully · Wallet balance updated",
  "plan.updated": "Your plan was updated",
  "orders.updated": "Your orders were updated",
};

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  const [isStreamHealthy, setIsStreamHealthy] = useState(false);
  const isHealthyRef = useRef(false);

  const listenersRef = useRef<
    Set<{
      types: CustomerRealtimeEventType[];
      callback: (eventTypes: CustomerRealtimeEventType[]) => void;
    }>
  >(new Set());

  // Toast notifications state
  const [toasts, setToasts] = useState<ActiveToast[]>([]);
  const lastToastTimeRef = useRef<Map<string, number>>(new Map());

  const showToast = useCallback((type: string) => {
    if (typeof document !== "undefined" && document.visibilityState !== "visible") {
      return;
    }
    const message = TOAST_MESSAGES[type];
    if (!message) return;

    const now = Date.now();
    const lastTime = lastToastTimeRef.current.get(type) || 0;
    if (now - lastTime < 10000) {
      // De-duplicate over 10 seconds
      return;
    }
    lastToastTimeRef.current.set(type, now);

    const toastId = `${type}_${now}`;
    setToasts((prev) => [...prev, { id: toastId, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, 3500);
  }, []);

  const subscribe = useCallback(
    (
      types: CustomerRealtimeEventType[],
      callback: (eventTypes: CustomerRealtimeEventType[]) => void
    ) => {
      const listener = { types, callback };
      listenersRef.current.add(listener);
      return () => {
        listenersRef.current.delete(listener);
      };
    },
    []
  );

  const dispatchEvents = useCallback(
    (eventTypes: CustomerRealtimeEventType[]) => {
      // 1. Invalidate matching cache resources
      if (eventTypes.includes("wallet.updated")) {
        invalidateCacheByResource("wallet");
        showToast("wallet.updated");
      }
      if (eventTypes.includes("orders.updated")) {
        invalidateCacheByResource("orders");
        showToast("orders.updated");
      }
      if (
        eventTypes.includes("plan.updated") ||
        eventTypes.includes("plans.catalog.updated")
      ) {
        invalidateCacheByResource("plan");
        showToast("plan.updated");
      }

      // 2. Notify subscribers
      for (const listener of listenersRef.current) {
        const matches = eventTypes.some((t) => listener.types.includes(t));
        if (matches) {
          try {
            listener.callback(eventTypes);
          } catch (err) {
            console.error("[realtime] Error in event listener", err);
          }
        }
      }

      // 3. Trigger cross-tab sync channel
      triggerGlobalLiveSync(`realtime:${eventTypes.join(",")}`);
    },
    [showToast]
  );

  useEffect(() => {
    const resolvedApiUrl = getResolvedApiUrl();
    if (!resolvedApiUrl) {
      setIsStreamHealthy(false);
      isHealthyRef.current = false;
      return;
    }

    if (status !== "authenticated" || !user?.id) {
      setIsStreamHealthy(false);
      isHealthyRef.current = false;
      return;
    }

    let hiddenCloseTimer: NodeJS.Timeout | null = null;

    const client = new RealtimeStreamClient({
      streamUrl: `${resolvedApiUrl}/api/v1/customer/events/stream`,
      getAccessToken: () => tokenStorage.getAccessToken(),
      refreshSession: () => refreshSession(),
      onEvents: (types) => dispatchEvents(types as CustomerRealtimeEventType[]),
      onConnected: () => triggerGlobalLiveSync("stream_connected"),
      createParser: () => new SSEParser(),
      onHealthChange: (healthy) => {
        isHealthyRef.current = healthy;
        setIsStreamHealthy(healthy);
      },
    });

    void client.connect();

    // Tab visibility tracking: close stream after 2 minutes of hidden tab
    const handleVisibilityChange = () => {
      if (typeof document === "undefined") return;

      if (document.visibilityState === "hidden") {
        if (hiddenCloseTimer) clearTimeout(hiddenCloseTimer);
        hiddenCloseTimer = setTimeout(() => {
          if (document.visibilityState === "hidden") {
            client.disconnect();
          }
        }, 120000);
      } else if (document.visibilityState === "visible") {
        if (hiddenCloseTimer) {
          clearTimeout(hiddenCloseTimer);
          hiddenCloseTimer = null;
        }
        if (!isHealthyRef.current) {
          void client.connect();
        }
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    // Listen to auth session end / logout
    const unsubscribeSession = subscribeToAuthSession((event) => {
      if (event.type === "ended") {
        client.disconnect();
      }
    });

    return () => {
      if (hiddenCloseTimer) clearTimeout(hiddenCloseTimer);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      unsubscribeSession();
      client.disconnect();
    };
  }, [user?.id, status, dispatchEvents]);

  return (
    <RealtimeContext.Provider value={{ isStreamHealthy, subscribe }}>
      {children}

      {/* Accessible minimal toast region */}
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text)] text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <div className="w-2 h-2 rounded-full bg-[var(--pf-success)] shrink-0" />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </RealtimeContext.Provider>
  );
}

export function useRealtimeContext(): RealtimeContextType | null {
  return useContext(RealtimeContext);
}
