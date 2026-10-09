import { apiClient } from "@/lib/api/client";
import {
  CreatePaymentPayload,
  CreatePaymentResponse,
  CreatePaymentOnlineResponse,
  CreatePaymentCashResponse,
  VerifyPaymentPayload,
  VerifyPaymentResponse,
  RetryPaymentPayload,
  RetryPaymentResponse,
  CancelPaymentPayload,
  CancelPaymentResponse,
  ListPaymentsParams,
  ListPaymentsResponse,
  PaymentRecord,
  PayUCheckout,
} from "../types";

export function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `idem_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function submitPayUHostedForm(checkout: PayUCheckout): void {
  if (typeof document === "undefined") return;

  const form = document.createElement("form");
  form.method = checkout.method || "POST";
  form.action = checkout.endpoint;
  form.style.display = "none";

  Object.entries(checkout.fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    }
  });

  document.body.appendChild(form);
  form.submit();
}

export const paymentsApi = {
  /**
   * 6.1 Create Top-up Payment
   * POST /api/v1/customer/payments/create
   */
  async createPayment(
    payload: CreatePaymentPayload,
    idempotencyKey?: string
  ): Promise<CreatePaymentResponse> {
    const key = idempotencyKey || generateIdempotencyKey();

    const res = await apiClient.post<any>(
      "/api/v1/customer/payments/create",
      {
        amount: Math.round(payload.amount),
        paymentMethod: payload.paymentMethod,
      },
      {
        headers: {
          "Idempotency-Key": key,
        },
      }
    );

    return res as CreatePaymentResponse;
  },

  /**
   * Convenience helper to create an ONLINE top-up and optionally auto-submit to PayU
   */
  async initiateOnlineTopup(
    amountPaise: number,
    options?: { autoRedirect?: boolean; idempotencyKey?: string }
  ): Promise<CreatePaymentOnlineResponse> {
    const res = (await this.createPayment(
      {
        amount: amountPaise,
        paymentMethod: "ONLINE",
      },
      options?.idempotencyKey
    )) as CreatePaymentOnlineResponse;

    if (options?.autoRedirect !== false && res.checkout) {
      submitPayUHostedForm(res.checkout);
    }

    return res;
  },

  /**
   * Convenience helper to request a CASH top-up
   */
  async requestCashTopup(
    amountPaise: number,
    idempotencyKey?: string
  ): Promise<CreatePaymentCashResponse> {
    return (await this.createPayment(
      {
        amount: amountPaise,
        paymentMethod: "CASH",
      },
      idempotencyKey
    )) as CreatePaymentCashResponse;
  },

  /**
   * 6.2 Verify Payment State with Server & PayU Source of Truth
   * POST /api/v1/customer/payments/verify
   */
  async verifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> {
    return apiClient.post<VerifyPaymentResponse>(
      "/api/v1/customer/payments/verify",
      {
        transactionId: payload.transactionId,
      }
    );
  },

  /**
   * 6.3 Retry a Failed / Cancelled / Expired Online Payment
   * POST /api/v1/customer/payments/retry
   */
  async retryPayment(
    payload: RetryPaymentPayload,
    options?: { autoRedirect?: boolean; idempotencyKey?: string }
  ): Promise<RetryPaymentResponse> {
    const key = options?.idempotencyKey || generateIdempotencyKey();

    const res = await apiClient.post<RetryPaymentResponse>(
      "/api/v1/customer/payments/retry",
      {
        transactionId: payload.transactionId,
      },
      {
        headers: {
          "Idempotency-Key": key,
        },
      }
    );

    if (options?.autoRedirect !== false && res.checkout) {
      submitPayUHostedForm(res.checkout);
    }

    return res;
  },

  /**
   * Cancel an abandoned ONLINE top-up and release the pending slot.
   * POST /api/v1/customer/payments/cancel
   *
   * The server re-verifies the real state with PayU first, so a payment that
   * actually succeeded is never discarded.
   */
  async cancelPayment(
    payload: CancelPaymentPayload
  ): Promise<CancelPaymentResponse> {
    return apiClient.post<CancelPaymentResponse>(
      "/api/v1/customer/payments/cancel",
      {
        transactionId: payload.transactionId,
      }
    );
  },

  /**
   * 6.4 List Customer Payments
   * GET /api/v1/customer/payments
   */
  async listPayments(params?: ListPaymentsParams): Promise<ListPaymentsResponse> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      if (params.status) queryParams.status = params.status;
      if (params.purpose) queryParams.purpose = params.purpose;
      if (params.paymentMethod) queryParams.paymentMethod = params.paymentMethod;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;
      if (params.page !== undefined) queryParams.page = params.page;
      if (params.limit !== undefined) queryParams.limit = params.limit;
    }

    const res = await apiClient.get<any>("/api/v1/customer/payments", {
      params: queryParams,
    });

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
   * 6.5 Get Payment by ID
   * GET /api/v1/customer/payments/:id
   */
  async getPayment(id: string): Promise<PaymentRecord> {
    const res = await apiClient.get<any>(`/api/v1/customer/payments/${id}`);
    if (res && res.payment) {
      return res.payment;
    }
    return res as PaymentRecord;
  },
};
