"use client";

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

const BACKEND_BASE_URL = (
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "https://api-puretyfarm.onrender.com"
).replace(/\/+$/, "");

interface ActiveToast {
  id: string;
  message: string;
}

const TOAST_MESSAGES: Record<string, string> = {
  "wallet.updated": "Your wallet was updated",
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
    if (status !== "authenticated" || !user?.id) {
      setIsStreamHealthy(false);
      isHealthyRef.current = false;
      return;
    }

    const currentUserId = user.id;
    let abortController: AbortController | null = null;
    let isTerminated = false;
    let failedAttempts = 0;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let hiddenCloseTimer: NodeJS.Timeout | null = null;

    const setHealthy = (val: boolean) => {
      isHealthyRef.current = val;
      setIsStreamHealthy(val);
    };

    const scheduleReconnect = (delayMs: number) => {
      if (isTerminated) return;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => {
        void connectStream();
      }, delayMs);
    };

    const connectStream = async () => {
      if (isTerminated) return;
      if (abortController) {
        abortController.abort();
      }
      abortController = new AbortController();

      const token = tokenStorage.getAccessToken();
      if (!token) {
        failedAttempts++;
        if (failedAttempts >= 2) setHealthy(false);
        scheduleReconnect(3000);
        return;
      }

      const streamUrl = `${BACKEND_BASE_URL}/api/v1/customer/events/stream`;

      try {
        const response = await fetch(streamUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "text/event-stream",
          },
          credentials: "omit",
          signal: abortController.signal,
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid: single-flight refresh
            try {
              const freshToken = await refreshSession();
              if (freshToken && !isTerminated) {
                // Reconnect immediately with refreshed token
                void connectStream();
                return;
              }
            } catch {
              // Refresh failed
              setHealthy(false);
              return;
            }
          }

          failedAttempts++;
          if (failedAttempts >= 2) {
            setHealthy(false);
          }

          // Exponential backoff + jitter up to 30s
          const backoff = Math.min(
            30000,
            1000 * Math.pow(2, failedAttempts) + Math.random() * 1000
          );
          scheduleReconnect(backoff);
          return;
        }

        if (!response.body) {
          throw new Error("No response body received for SSE stream");
        }

        // Successfully connected!
        failedAttempts = 0;
        setHealthy(true);

        // On every successful (re)connect, revalidate active resources
        triggerGlobalLiveSync("stream_connected");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const parser = new SSEParser();

        while (!isTerminated) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const messages = parser.feed(chunk);

          for (const msg of messages) {
            if (msg.event === "sync" && msg.data) {
              try {
                const parsed = JSON.parse(msg.data);
                if (parsed?.types && Array.isArray(parsed.types)) {
                  dispatchEvents(parsed.types);
                }
              } catch {}
            }
          }
        }
      } catch (err: any) {
        if (isTerminated || abortController.signal.aborted) {
          return;
        }
        failedAttempts++;
        if (failedAttempts >= 2) {
          setHealthy(false);
        }
        const backoff = Math.min(
          30000,
          1000 * Math.pow(2, failedAttempts) + Math.random() * 1000
        );
        scheduleReconnect(backoff);
      }
    };

    // Initial connection
    void connectStream();

    // 2. Tab visibility tracking: close stream after 2 minutes of hidden tab
    const handleVisibilityChange = () => {
      if (typeof document === "undefined") return;

      if (document.visibilityState === "hidden") {
        if (hiddenCloseTimer) clearTimeout(hiddenCloseTimer);
        hiddenCloseTimer = setTimeout(() => {
          if (document.visibilityState === "hidden" && abortController) {
            abortController.abort();
            setHealthy(false);
          }
        }, 120000); // 2 minutes
      } else if (document.visibilityState === "visible") {
        if (hiddenCloseTimer) {
          clearTimeout(hiddenCloseTimer);
          hiddenCloseTimer = null;
        }
        if (!isHealthyRef.current && !isTerminated) {
          void connectStream();
        }
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    // 3. Listen to auth session end / logout
    const unsubscribeSession = subscribeToAuthSession((event) => {
      if (event.type === "ended") {
        isTerminated = true;
        abortController?.abort();
        setHealthy(false);
      }
    });

    return () => {
      isTerminated = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (hiddenCloseTimer) clearTimeout(hiddenCloseTimer);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      unsubscribeSession();
      abortController?.abort();
      setHealthy(false);
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
