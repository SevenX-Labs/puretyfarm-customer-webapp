import { apiClient } from "@/lib/api/client";
import { generateIdempotencyKey } from "@/features/payments/api/paymentsApi";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import {
  CustomerWallet,
  CreateCreditRequestPayload,
  CreateCreditRequestResponse,
  ListTransactionsParams,
  ListTransactionsResponse,
  ListCreditRequestsParams,
  ListCreditRequestsResponse,
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

const WALLET_CACHE_TTL_MS = 15 * 1000;
const cachedWalletMap = new Map<string, { data: CustomerWallet; expiresAt: number }>();
const inFlightWalletMap = new Map<string, { id: number; promise: Promise<CustomerWallet> }>();
let nextWalletRequestId = 0;

export const walletApi = {
  clearCache(): void {
    cachedWalletMap.clear();
    inFlightWalletMap.clear();
  },

  /**
   * 7.1 Get Customer Wallet Balance and Status
   * GET /api/v1/customer/wallet
   */
  async getWallet(forceRefresh = false): Promise<CustomerWallet> {
    const accountId = getAccountIdentity();
    const now = Date.now();
    const cached = cachedWalletMap.get(accountId);
    if (!forceRefresh && cached && cached.expiresAt > now) {
      return cached.data;
    }
    const inFlightEntry = inFlightWalletMap.get(accountId);
    if (!forceRefresh && inFlightEntry) {
      return inFlightEntry.promise;
    }

    const requestId = ++nextWalletRequestId;
    const promise = apiClient
      .get<any>("/api/v1/customer/wallet")
      .then((res) => {
        const wallet = (res && res.wallet ? res.wallet : res) as CustomerWallet;
        const currentEntry = inFlightWalletMap.get(accountId);
        if (currentEntry?.id === requestId) {
          cachedWalletMap.set(accountId, {
            data: wallet,
            expiresAt: Date.now() + WALLET_CACHE_TTL_MS,
          });
        }
        return wallet;
      })
      .finally(() => {
        const currentEntry = inFlightWalletMap.get(accountId);
        if (currentEntry?.id === requestId) {
          inFlightWalletMap.delete(accountId);
        }
      });

    inFlightWalletMap.set(accountId, { id: requestId, promise });
    return promise;
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
