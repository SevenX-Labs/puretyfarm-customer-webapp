"use client";

import { useCallback, useEffect, useState } from "react";
import { accountApi } from "@/features/account/api/accountApi";
import { useRealtimeSync } from "@/lib/useRealtimeSync";
import type { Order, Subscription, Address } from "@/types/models";

export interface DashboardData {
  orders: Order[];
  subscription: Subscription | null;
  defaultAddress: Address | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDashboardData(): DashboardData {
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [ordersRes, subRes, addrRes] = await Promise.all([
        accountApi.getOrders().catch(() => ({ success: false, orders: [] as Order[] })),
        accountApi
          .getSubscription()
          .catch(() => ({ success: false, subscription: null })),
        accountApi
          .getAddresses()
          .catch(() => ({ success: false, addresses: [] as Address[] })),
      ]);

      setOrders(ordersRes.orders || []);
      setSubscription(subRes.subscription || null);

      const addrs = (addrRes as any).addresses || [];
      const def =
        addrs.find((a: Address) => a.isDefault) || addrs[0] || null;
      setDefaultAddress(def);
      if (!isSilent) setError(null);
    } catch (e: any) {
      if (!isSilent) setError(e?.message || "Could not load your dashboard.");
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  useRealtimeSync(() => {
    load(true);
  });

  return {
    orders,
    subscription,
    defaultAddress,
    loading,
    error,
    refresh: load,
  };
}
