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
  frequency: string | null;
  quantityMode: string | null;
  quantityLitres?: number | null;
  quantityA?: number | null;
  quantityB?: number | null;
  startDate: string | null;
  endDate: string | null;
}

export interface UpcomingDeliveryView {
  date: string;
  occurrence: number;
  quantityLitres: number;
  status: string;
  canSkip: boolean;
  canModify: boolean;
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
}
