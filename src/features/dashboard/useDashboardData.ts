"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { accountApi } from "@/features/account/api/accountApi";
import { useSwrData, getScopedKey } from "@/lib/cache/swrCache";
import { useRealtimeSync } from "@/lib/useRealtimeSync";
import type { Order, Subscription, Address } from "@/types/models";

export interface DashboardData {
  orders: Order[];
  subscription: Subscription | null;
  defaultAddress: Address | null;
  loading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface DashboardPayload {
  orders: Order[];
  subscription: Subscription | null;
  defaultAddress: Address | null;
}

export function useDashboardData(): DashboardData {
  const { user } = useAuth();
  const cacheKey = getScopedKey(user?.id, "dashboard");

  const fetchDashboard = async (): Promise<DashboardPayload> => {
    const [ordersRes, subRes, addrRes] = await Promise.all([
      accountApi.getOrders(),
      accountApi.getSubscription(),
      accountApi.getAddresses(),
    ]);

    const orders = ordersRes?.orders || [];
    const subscription = subRes?.subscription || null;
    const addrs = (addrRes as any)?.addresses || [];
    const defaultAddress = addrs.find((a: Address) => a.isDefault) || addrs[0] || null;

    return { orders, subscription, defaultAddress };
  };

  const { data, error, isLoading, isRefreshing, revalidate } = useSwrData<DashboardPayload>(
    cacheKey,
    fetchDashboard,
    {
      staleTime: 45000,
      enabled: Boolean(user),
    }
  );

  useRealtimeSync(() => {
    void revalidate();
  }, { intervalMs: 35000, enabled: Boolean(user) });

  return {
    orders: data?.orders ?? [],
    subscription: data?.subscription ?? null,
    defaultAddress: data?.defaultAddress ?? null,
    loading: isLoading && data === undefined,
    isRefreshing,
    error: error?.message ?? null,
    refresh: async () => {
      await revalidate();
    },
  };
}
