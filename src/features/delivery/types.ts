export type DeliveryFrequency =
  | "DAILY"
  | "ALTERNATE_DAYS"
  | "WEEKDAYS_ONLY"
  | "WEEKENDS_ONLY"
  | "CUSTOM_DAYS";

export type QuantityMode = "FIXED" | "ALTERNATING";

export type PlanType = "TRIAL" | "MONTHLY" | "BUY_ONCE";

export interface ActivePlanView {
  selectionId: string;
  planType: string;
  status: string;
  /** PER_DELIVERY = charged per delivered order; PREPAID_LEGACY = paid upfront. */
  billingModel?: string;
  frequency: string | null;
  quantityMode: string | null;
  quantityLitres?: number | null;
  quantityA?: number | null;
  quantityB?: number | null;
  startDate: string | null;
  endDate: string | null;
  deliveryStartTime?: string | null;
  deliveryEndTime?: string | null;
}

export interface UpcomingDeliveryView {
  date: string;
  occurrence: number;
  quantityLitres: number;
  status: string;
  canSkip: boolean;
  canModify: boolean;
  orderId?: string | null;
  orderNumber?: string | null;
  /** What this delivery is expected to cost, in paise. */
  expectedAmountPaise?: number | null;
  settlementStatus?: string | null;
}

export interface ManageDeliveryResponse {
  activePlan: ActivePlanView;
  upcomingDeliveries: UpcomingDeliveryView[];
}

export interface SkipDeliveryPayload {
  deliveryDate: string; // YYYY-MM-DD
}

export interface PauseDeliveryPayload {
  resumeDate?: string; // YYYY-MM-DD
}

export interface ChangeQuantityPayload {
  quantityLitres: number;
  /**
   * Scheduled date (YYYY-MM-DD) of the one delivery to change. Omit to request
   * the new quantity for every future delivery.
   */
  deliveryDate?: string;
}

export interface ChangeFrequencyPayload {
  frequency: DeliveryFrequency;
}

export interface ChangePlanPayload {
  planType: PlanType;
}

export interface ChangeSchedulePayload {
  frequency: DeliveryFrequency;
  quantityMode: QuantityMode;
  quantity?: number;
  quantityA?: number;
  quantityB?: number;
}

export interface DeliveryRequestItem {
  id: string;
  type: string;
  status: string;
  requestedChanges: any;
  reason?: string;
  adminNote?: string;
  createdAt: string;
  reviewedAt?: string;
  currentConfiguration?: Record<string, any>;
  requestedConfiguration?: Record<string, any>;
  /** Set when the request targets one delivery's order. */
  orderId?: string | null;
  /** Order total before and after the change, in paise. */
  currentAmountPaise?: number | null;
  requestedAmountPaise?: number | null;
  message?: string;
}
