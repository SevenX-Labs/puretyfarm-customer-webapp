import { apiClient } from "@/lib/api/client";
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

export const ordersApi = {
  /**
   * 1. List Orders
   * GET /api/v1/customer/orders
   */
  async listOrders(params?: ListOrdersParams): Promise<ListOrdersResponse> {
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

    const res = await apiClient.get<any>("/api/v1/customer/orders", {
      params: queryParams,
    });

    // Normalize response if backend returns { data: [...], pagination: {...} }
    if (res && Array.isArray(res.data)) {
      return {
        data: res.data,
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
    return {
      success: res?.success ?? true,
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
    return {
      success: res?.success ?? true,
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
    return {
      success: res?.success ?? true,
      orderId: res?.orderId || orderId,
      paymentMethod: res?.paymentMethod || "WALLET",
      paymentStatus: res?.paymentStatus || "PAID",
      orderStatus: res?.orderStatus || "CONFIRMED",
      message: res?.message,
    };
  },
};
