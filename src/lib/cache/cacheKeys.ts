/**
 * Centralized cache key constants for customer resources.
 * String values are IDENTICAL to existing ad-hoc strings in the codebase.
 */
export const CACHE_KEYS = {
  WALLET_SUMMARY: "wallet:summary",
  WALLET_TX_PREFIX: "wallet:tx:",
  WALLET_PAYMENTS_PREFIX: "wallet:payments:",
  WALLET_REQUESTS_PREFIX: "wallet:requests:",
  SUBSCRIPTION: "subscription",
  ORDERS: "orders",
  DASHBOARD: "dashboard",
  ORDERS_VIEW: "orders_view",
  PLAN_VIEW: "plan_view_data",
} as const;

export type CacheResource =
  | "wallet"
  | "orders"
  | "plan"
  | "dashboard"
  | (string & {});
