import { apiClient } from "@/lib/api/client";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import { walletApi } from "@/features/wallet/api/walletApi";
import {
  CustomerOrder,
  ListOrdersParams,
  ListOrdersResponse,
  CreateOrderPayload,
  CreateOrderResponse,
  ReorderPayload,
  ReorderResponse,
  OrderInvoiceDetail,
  PayOrderPayload,
  PayOrderResponse,
} from "../types";

function getAccountIdentity(): string {
  const token = tokenStorage.getAccessToken();
  if (!token) return "anonymous";
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const decoded =
        typeof atob === "function"
          ? atob(b64)
          : Buffer.from(b64, "base64").toString("utf-8");
      const payload = JSON.parse(decoded);
      return String(payload.userId || payload.sub || payload.id || token);
    }
  } catch {}
  return token;
}

const ORDERS_CACHE_TTL_MS = 15 * 1000;
const cachedOrdersMap = new Map<string, { data: ListOrdersResponse; expiresAt: number }>();
const inFlightOrdersMap = new Map<string, { id: number; promise: Promise<ListOrdersResponse> }>();
let nextOrdersRequestId = 0;
let ordersCacheEpoch = 0;

export const ordersApi = {
  clearCache(): void {
    ordersCacheEpoch++;
    cachedOrdersMap.clear();
    inFlightOrdersMap.clear();
  },

  /**
   * 1. List Orders
   * GET /api/v1/customer/orders
   */
  async listOrders(params?: ListOrdersParams, forceRefresh = false): Promise<ListOrdersResponse> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      if (params.status) queryParams.status = params.status;
      if (params.planType) queryParams.planType = params.planType;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;
      if (params.orderNumber) queryParams.orderNumber = params.orderNumber;
      if (params.page !== undefined) queryParams.page = params.page;
      if (params.limit !== undefined) queryParams.limit = params.limit;
    }

    const accountId = getAccountIdentity();
    const cacheKey = `${accountId}::${JSON.stringify(queryParams)}`;
    const now = Date.now();
    const cached = cachedOrdersMap.get(cacheKey);
    if (!forceRefresh && cached && cached.expiresAt > now) {
      return cached.data;
    }
    const inFlightEntry = inFlightOrdersMap.get(cacheKey);
    if (!forceRefresh && inFlightEntry) {
      return inFlightEntry.promise;
    }

    const requestId = ++nextOrdersRequestId;
    const requestEpoch = ordersCacheEpoch;

    const promise = apiClient
      .get<any>("/api/v1/customer/orders", { params: queryParams })
      .then((res) => {

    // Normalize response if backend returns { data: [...], pagination: {...} }
    if (res && Array.isArray(res.data)) {
      return {
        data: res.data,
        pendingPlanPurchases: res.pendingPlanPurchases || [],
        pagination: res.pagination || {
          page: params?.page || 1,
          limit: params?.limit || res.data.length,
          total: res.data.length,
          totalPages: 1,
        },
      };
    }

    // Direct array fallback
    if (Array.isArray(res)) {
      return {
        data: res,
        pagination: {
          page: 1,
          limit: res.length,
          total: res.length,
          totalPages: 1,
        },
      };
    }

      // Legacy { orders: [...] } fallback
      if (res && Array.isArray(res.orders)) {
        return {
          data: res.orders,
          pagination: {
            page: 1,
            limit: res.orders.length,
            total: res.orders.length,
            totalPages: 1,
          },
        };
      }

      return {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };
    })
    .then((normalizedResult) => {
      if (requestEpoch === ordersCacheEpoch) {
        cachedOrdersMap.set(cacheKey, {
          data: normalizedResult,
          expiresAt: Date.now() + ORDERS_CACHE_TTL_MS,
        });
      }
      return normalizedResult;
    })
    .finally(() => {
      const currentEntry = inFlightOrdersMap.get(cacheKey);
      if (currentEntry?.id === requestId) {
        inFlightOrdersMap.delete(cacheKey);
      }
    });

    inFlightOrdersMap.set(cacheKey, { id: requestId, promise });
    return promise;
  },

  /**
   * 2. Get Order by ID
   * GET /api/v1/customer/orders/:id
   */
  async getOrder(id: string): Promise<CustomerOrder> {
    const res = await apiClient.get<any>(`/api/v1/customer/orders/${id}`);
    if (res && res.order) {
      return res.order;
    }
    if (res && res.data) {
      return res.data;
    }
    return res as CustomerOrder;
  },

  /**
   * 3. Create Order
   * POST /api/v1/customer/orders
   */
  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
    const res = await apiClient.post<any>("/api/v1/customer/orders", payload);
    const isSuccess = res?.success ?? true;
    if (isSuccess) {
      ordersApi.clearCache();
    }
    return {
      success: isSuccess,
      message: res?.message || "Order created successfully.",
      order: res?.order || res?.data || res,
    };
  },

  /**
   * 4. Reorder (only DELIVERED orders)
   * POST /api/v1/customer/orders/:id/reorder
   */
  async reorder(orderId: string, payload?: ReorderPayload): Promise<ReorderResponse> {
    const res = await apiClient.post<any>(
      `/api/v1/customer/orders/${orderId}/reorder`,
      payload || {}
    );
    const isSuccess = res?.success ?? true;
    if (isSuccess) {
      ordersApi.clearCache();
    }
    return {
      success: isSuccess,
      message: res?.message || "Reorder created successfully.",
      order: res?.order || res?.data || res,
    };
  },

  /**
   * 5. Get Invoice
   * GET /api/v1/customer/orders/:id/invoice
   */
  async getInvoice(orderId: string): Promise<OrderInvoiceDetail> {
    const res = await apiClient.get<any>(`/api/v1/customer/orders/${orderId}/invoice`);
    if (res && res.invoice) {
      return res.invoice;
    }
    if (res && res.data) {
      return res.data;
    }
    return res as OrderInvoiceDetail;
  },

  /**
   * 6. Pay for Order
   * POST /api/v1/customer/orders/:orderId/pay
   */
  async payOrder(
    orderId: string,
    payload: PayOrderPayload = { paymentMethod: "WALLET" }
  ): Promise<PayOrderResponse> {
    const res = await apiClient.post<any>(
      `/api/v1/customer/orders/${orderId}/pay`,
      payload
    );

    const paymentStatus = res?.paymentStatus || "PAID";
    const isSuccess = (res?.success ?? true) && paymentStatus !== "FAILED";

    if (isSuccess) {
      ordersApi.clearCache();
      const method = payload?.paymentMethod || res?.paymentMethod || "WALLET";
      if (method === "WALLET") {
        walletApi.clearCache();
      }
    }

    return {
      success: isSuccess,
      orderId: res?.orderId || orderId,
      paymentMethod: res?.paymentMethod || payload?.paymentMethod || "WALLET",
      paymentStatus,
      orderStatus: res?.orderStatus || (isSuccess ? "CONFIRMED" : "PENDING"),
      message: res?.message,
    };
  },
};
