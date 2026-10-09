export type PaymentStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUND_PENDING"
  | "REFUNDED";

export type PaymentMethod = "ONLINE" | "CASH";

export type PaymentPurpose = "ORDER" | "WALLET_TOPUP";

export type WalletCreditStatus = "PENDING" | "COMPLETED" | "REJECTED" | "CANCELLED";

export type RefundStatus =
  | "NOT_REQUIRED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "REFUND_FAILED";

export interface PayUCheckoutFields {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  hash: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  [key: string]: string | undefined;
}

export interface PayUCheckout {
  endpoint: string;
  method: string;
  fields: PayUCheckoutFields;
}

export interface WalletCreditInfo {
  id: string;
  status: WalletCreditStatus;
  amountPaise: number;
  autoApproved?: boolean;
  completedAt?: string | null;
  refundStatus?: RefundStatus;
}

export interface PaymentRecord {
  id: string;
  transactionId: string;
  providerPaymentId?: string | null;
  provider?: "PAYU" | string;
  purpose?: PaymentPurpose;
  paymentMethod: PaymentMethod;
  amountPaise: number;
  currency?: string;
  status: PaymentStatus;
  failureCode?: string | null;
  failureMessage?: string | null;
  walletCreditRequestId?: string | null;
  orderId?: string | null;
  expiresAt?: string;
  completedAt?: string | null;
  refundedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  walletCredit?: WalletCreditInfo;
}

export interface CashCollectionRecord {
  id: string;
  amountPaise: number;
  status: "PENDING" | "COLLECTED" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
}

export interface CreatePaymentPayload {
  amount: number; // in paise
  paymentMethod: PaymentMethod;
}

export interface CreatePaymentOnlineResponse {
  payment: PaymentRecord;
  walletCreditRequestId: string;
  checkout: PayUCheckout;
  message: string;
  replayed?: boolean;
}

export interface CreatePaymentCashResponse {
  cashCollection: CashCollectionRecord;
  walletCreditRequestId: string;
  message: string;
  replayed?: boolean;
}

export type CreatePaymentResponse =
  | CreatePaymentOnlineResponse
  | CreatePaymentCashResponse;

export interface VerifyPaymentPayload {
  transactionId: string;
}

export interface VerifyPaymentResponse {
  payment: PaymentRecord;
  walletCredited: boolean;
  requiresAdminApproval: boolean;
  message?: string;
}

export interface RetryPaymentPayload {
  transactionId: string;
}

export interface RetryPaymentResponse extends CreatePaymentOnlineResponse {}

export interface ListPaymentsParams {
  status?: PaymentStatus;
  purpose?: PaymentPurpose;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ListPaymentsResponse {
  data: PaymentRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
