import { apiClient } from "@/lib/api/client";
import { generateIdempotencyKey } from "@/features/payments/api/paymentsApi";
import {
  CustomerWallet,
  CreateCreditRequestPayload,
  CreateCreditRequestResponse,
  ListTransactionsParams,
  ListTransactionsResponse,
  ListCreditRequestsParams,
  ListCreditRequestsResponse,
} from "../types";

const WALLET_CACHE_TTL_MS = 15 * 1000;
let cachedWallet: { data: CustomerWallet; expiresAt: number } | null = null;
let inFlightWalletPromise: Promise<CustomerWallet> | null = null;

export const walletApi = {
  clearCache(): void {
    cachedWallet = null;
    inFlightWalletPromise = null;
  },

  /**
   * 7.1 Get Customer Wallet Balance and Status
   * GET /api/v1/customer/wallet
   */
  async getWallet(forceRefresh = false): Promise<CustomerWallet> {
    const now = Date.now();
    if (!forceRefresh && cachedWallet && cachedWallet.expiresAt > now) {
      return cachedWallet.data;
    }
    if (!forceRefresh && inFlightWalletPromise) {
      return inFlightWalletPromise;
    }

    inFlightWalletPromise = apiClient
      .get<any>("/api/v1/customer/wallet")
      .then((res) => {
        const wallet = (res && res.wallet ? res.wallet : res) as CustomerWallet;
        cachedWallet = { data: wallet, expiresAt: Date.now() + WALLET_CACHE_TTL_MS };
        return wallet;
      })
      .finally(() => {
        inFlightWalletPromise = null;
      });

    return inFlightWalletPromise;
  },

  /**
   * 7.2 Submit Unverified Credit Request (Legacy / Direct)
   * POST /api/v1/customer/wallet/credit-request
   */
  async createCreditRequest(
    payload: CreateCreditRequestPayload,
    idempotencyKey?: string
  ): Promise<CreateCreditRequestResponse> {
    const key = idempotencyKey || generateIdempotencyKey();

    return apiClient.post<CreateCreditRequestResponse>(
      "/api/v1/customer/wallet/credit-request",
      {
        amount: Math.round(payload.amount),
      },
      {
        headers: {
          "Idempotency-Key": key,
        },
      }
    );
  },

  /**
   * 7.3 Get Customer Wallet Immutable Ledger / Transactions
   * GET /api/v1/customer/wallet/transactions
   */
  async getTransactions(
    params?: ListTransactionsParams
  ): Promise<ListTransactionsResponse> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      if (params.type) queryParams.type = params.type;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;
      if (params.page !== undefined) queryParams.page = params.page;
      if (params.limit !== undefined) queryParams.limit = params.limit;
    }

    const res = await apiClient.get<any>("/api/v1/customer/wallet/transactions", {
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
   * 7.4 Get Customer Credit Requests (Pending, Completed, Rejected)
   * GET /api/v1/customer/wallet/credit-requests
   */
  async getCreditRequests(
    params?: ListCreditRequestsParams
  ): Promise<ListCreditRequestsResponse> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params) {
      if (params.status) queryParams.status = params.status;
      if (params.page !== undefined) queryParams.page = params.page;
      if (params.limit !== undefined) queryParams.limit = params.limit;
    }

    const res = await apiClient.get<any>("/api/v1/customer/wallet/credit-requests", {
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
};
