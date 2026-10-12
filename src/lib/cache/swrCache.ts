"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  error?: Error | null;
}

// In-memory key-value cache
const store = new Map<string, CacheEntry<any>>();

// In-flight request deduplication map
const inFlightRequests = new Map<string, Promise<any>>();

// Subscribers for cross-component cache update notification
type CacheSubscriber = (key: string, data: any) => void;
const subscribers = new Set<CacheSubscriber>();

export function subscribeToCache(fn: CacheSubscriber): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

function notifySubscribers(key: string, data: any) {
  subscribers.forEach((fn) => {
    try {
      fn(key, data);
    } catch {
      // Ignore subscriber errors
    }
  });
}

/**
 * Generates a scoped cache key by user ID.
 */
export function getScopedKey(userId: string | undefined | null, resource: string): string {
  const uid = userId?.trim() || "anonymous";
  return `${uid}:${resource}`;
}

/**
 * Retrieves cached data if present and not expired.
 */
export function getCacheData<T>(key: string, maxAgeMs = 45000): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > maxAgeMs) {
    return entry.data; // Stale data, caller can return immediately while revalidating
  }
  return entry.data as T;
}

export function isCacheStale(key: string, staleTimeMs = 45000): boolean {
  const entry = store.get(key);
  if (!entry) return true;
  return Date.now() - entry.timestamp > staleTimeMs;
}

/**
 * Sets data in the cache and notifies all mounted components using this key.
 */
export function setCacheData<T>(key: string, data: T): void {
  store.set(key, { data, timestamp: Date.now(), error: null });
  notifySubscribers(key, data);
}

/**
 * Clears all cache entries for a specific user, e.g. on logout or user switch.
 */
export function clearUserCache(userId?: string): void {
  if (!userId) {
    store.clear();
    return;
  }
  const prefix = `${userId}:`;
  for (const k of Array.from(store.keys())) {
    if (k.startsWith(prefix)) {
      store.delete(k);
    }
  }
}

/**
 * Clears the entire in-memory cache.
 */
export function clearAllCache(): void {
  store.clear();
  inFlightRequests.clear();
}

/**
 * Invalidates all cache entries belonging to a given resource domain,
 * e.g. 'wallet', 'orders', 'plan', 'dashboard'.
 * Ensures that when an SSE event arrives, any cached 45s values are cleared
 * so revisiting or re-querying immediately gets fresh data.
 */
export function invalidateCacheByResource(
  resource: 'wallet' | 'orders' | 'plan' | 'dashboard' | string
): void {
  const res = resource.toLowerCase();
  for (const key of Array.from(store.keys())) {
    const k = key.toLowerCase();
    let matches = false;
    if (res === 'wallet' && (k.includes('wallet:') || k.includes(':wallet') || k === 'wallet')) {
      matches = true;
    } else if (res === 'orders' && (k.includes('order'))) {
      matches = true;
    } else if (res === 'plan' && (k.includes('plan') || k.includes('subscription'))) {
      matches = true;
    } else if (res === 'dashboard' && k.includes('dashboard')) {
      matches = true;
    } else if (k.includes(res)) {
      matches = true;
    }

    if (matches) {
      store.delete(key);
    }
  }
}

export interface UseSwrOptions<T> {
  staleTime?: number; // ms before data is considered stale (default: 45,000)
  enabled?: boolean;
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (err: Error) => void;
}

export interface UseSwrReturn<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean; // True ONLY on first fetch when no cached data exists
  isRefreshing: boolean; // True when cached data is being revalidated in background
  mutate: (newData: T | ((prev: T | undefined) => T), shouldRevalidate?: boolean) => void;
  revalidate: () => Promise<T | undefined>;
}

/**
 * Shared SWR hook providing deduplicated in-flight requests,
 * zero-flash navigation from cache, and last-good-data retention on error.
 */
export function useSwrData<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: UseSwrOptions<T> = {}
): UseSwrReturn<T> {
  const {
    staleTime = 45000,
    enabled = true,
    initialData,
    onSuccess,
    onError,
  } = options;

  const initialCached = key ? store.get(key)?.data as T | undefined : undefined;
  const [data, setData] = useState<T | undefined>(() => initialCached ?? initialData);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(enabled && key && initialCached === undefined));
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetcherRef = useRef(fetcher);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    fetcherRef.current = fetcher;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  // Subscribe to external cache updates (from other components or tabs)
  useEffect(() => {
    if (!key) return;

    const unsubscribe = subscribeToCache((updatedKey, updatedData) => {
      if (updatedKey === key) {
        setData(updatedData);
        setIsLoading(false);
        setIsRefreshing(false);
      }
    });

    return unsubscribe;
  }, [key]);

  const executeFetch = useCallback(
    async (isBackground = false): Promise<T | undefined> => {
      if (!key || !enabled) return undefined;

      // In-flight deduplication: reuse running promise if one already exists for this exact key
      let promise = inFlightRequests.get(key);
      if (!promise) {
        promise = (async () => {
          try {
            return await fetcherRef.current();
          } finally {
            inFlightRequests.delete(key);
          }
        })();
        inFlightRequests.set(key, promise);
      }

      if (isBackground) {
        setIsRefreshing(true);
      } else {
        const cached = store.get(key)?.data;
        if (cached === undefined) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }
      }

      try {
        const result = await promise;
        store.set(key, { data: result, timestamp: Date.now(), error: null });
        setData(result);
        setError(null);
        onSuccessRef.current?.(result);
        notifySubscribers(key, result);
        return result;
      } catch (err: any) {
        const errObj = err instanceof Error ? err : new Error(String(err?.message || err));
        setError(errObj);
        onErrorRef.current?.(errObj);
        // CRITICAL: NEVER wipe existing good data on refetch error!
        const existing = store.get(key);
        if (existing) {
          existing.error = errObj;
        }
        return undefined;
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [key, enabled]
  );

  useEffect(() => {
    if (!key || !enabled) return;

    const cachedEntry = store.get(key);
    if (cachedEntry) {
      const isStale = Date.now() - cachedEntry.timestamp > staleTime;
      if (isStale) {
        void executeFetch(true);
      }
    } else {
      void executeFetch(false);
    }
  }, [key, enabled, staleTime, executeFetch]);

  const mutate = useCallback(
    (newData: T | ((prev: T | undefined) => T), shouldRevalidate = false) => {
      if (!key) return;
      const resolved = typeof newData === "function" ? (newData as any)(data) : newData;
      store.set(key, { data: resolved, timestamp: Date.now(), error: null });
      setData(resolved);
      notifySubscribers(key, resolved);
      if (shouldRevalidate) {
        void executeFetch(true);
      }
    },
    [key, data, executeFetch]
  );

  return {
    data,
    error,
    isLoading,
    isRefreshing,
    mutate,
    revalidate: () => executeFetch(true),
  };
}
