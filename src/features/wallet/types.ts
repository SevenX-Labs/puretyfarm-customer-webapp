export interface CustomerWallet {
  balancePaise: number;
  currency: string;
  autoCreditEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type WalletTransactionType = "CREDIT" | "DEBIT";

export type WalletTransactionReferenceType =
  | "CREDIT_REQUEST"
  | "ORDER"
  | "PLAN_SELECTION"
  | "CASH_COLLECTION"
  | "ADMIN_ADJUSTMENT"
  | string;

export interface WalletTransaction {
  id: string;
  type: WalletTransactionType;
  amountPaise: number;
  balanceAfterPaise?: number;
  referenceType?: WalletTransactionReferenceType;
  referenceId?: string;
  description?: string;
  createdAt: string;
  /** The order a delivery charge paid for; null for other transactions. */
  order?: {
    id: string;
    orderNumber: string;
    /** Scheduled delivery date (YYYY-MM-DD). */
    scheduledDate: string | null;
    deliveredAt: string | null;
  } | null;
}

/** Customer-facing name for what a wallet transaction was for. */
export function walletReferenceLabel(referenceType?: string): string {
  switch (referenceType) {
    case "ORDER":
      return "Delivery charge";
    case "CREDIT_REQUEST":
      return "Wallet top-up";
    case "CASH_COLLECTION":
      return "Cash top-up";
    case "ADMIN_ADJUSTMENT":
      return "Admin adjustment";
    case "PLAN_SELECTION":
      return "Plan payment";
    default:
      return referenceType || "Transaction";
  }
}

export type WalletCreditRequestStatus =
  | "PENDING"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED";

export type WalletRefundStatus =
  | "NOT_REQUIRED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "REFUND_FAILED";

export interface WalletCreditRequest {
  id: string;
  amountPaise: number;
  status: WalletCreditRequestStatus;
  autoApproved: boolean;
  adminNote?: string;
  refundStatus?: WalletRefundStatus;
  completedAt?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface CreateCreditRequestPayload {
  amount: number; // in integer paise
}

export interface CreateCreditRequestResponse {
  id: string;
  amountPaise: number;
  status: "PENDING" | "COMPLETED";
  autoApproved: boolean;
  message: string;
  createdAt: string;
  replayed?: boolean;
}

export interface ListTransactionsParams {
  type?: WalletTransactionType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ListTransactionsResponse {
  data: WalletTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListCreditRequestsParams {
  status?: WalletCreditRequestStatus;
  page?: number;
  limit?: number;
}

export interface ListCreditRequestsResponse {
  data: WalletCreditRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
