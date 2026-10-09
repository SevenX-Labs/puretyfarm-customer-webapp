import { apiClient } from "@/lib/api/client";

export interface PlanOverviewItem {
  type: "BUY_ONCE" | "SEVEN_DAY_TRIAL" | "MONTHLY";
  available: boolean;
  usageCount?: number;
  remainingUses?: number;
  used?: boolean;
  blockedReason?: string;
  deliveryStartTime?: string | null;
  deliveryEndTime?: string | null;
}

export interface PlansOverviewResponse {
  plans: PlanOverviewItem[];
}

export interface BuyOnceEligibilityResponse {
  eligible: boolean;
  usageCount?: number;
  remainingUses?: number;
  maxUses?: number;
  maxQuantityLitres?: number;
  blockedReason?: string;
}

export interface TrialEligibilityResponse {
  eligible: boolean;
  used?: boolean;
  trialDurationDays?: number;
  maxQuantityLitres?: number;
  blockedReason?: string;
}

export interface MonthlyConfigResponse {
  available: boolean;
  frequencies: ("DAILY" | "ALTERNATE_DAYS")[];
  quantityModes: ("FIXED" | "ALTERNATING")[];
  quantityMin: number;
  quantityMax: number;
  actualPricePerLitre: number; // in paise
  sellingPricePerLitre: number; // in paise
}

export interface PlanQuote {
  quoteId: string;
  plan: "BUY_ONCE" | "SEVEN_DAY_TRIAL" | "MONTHLY";
  quantity?: number;
  quantityA?: number;
  quantityB?: number;
  frequency?: "DAILY" | "ALTERNATE_DAYS";
  quantityMode?: "FIXED" | "ALTERNATING";
  durationDays?: number;
  deliveryOccurrences: number;
  actualPricePerLitre: number; // in paise
  sellingPricePerLitre: number; // in paise
  totalLitres: number;
  totalActualAmount: number; // in paise
  totalSellingAmount: number; // in paise
  discountAmount: number; // in paise
  expiresAt: string;
}

export interface ConfirmPlanPayload {
  quoteId: string;
  paymentMethod: "WALLET" | "CASH";
}

export interface ConfirmPlanResponse {
  selectionId: string;
  quoteId: string;
  plan: string;
  status: "CONFIRMED" | "PENDING_PAYMENT";
  paymentMethod: "WALLET" | "CASH";
  paidAmountPaise: number;
  cashCollectionId?: string;
  error?: string;
  message?: string;
  currentBalancePaise?: number;
  requiredPaise?: number;
  shortfallPaise?: number;
}

export const plansApi = {
  /**
   * 2.1 Get Plans Overview
   * GET /api/v1/customer/plans
   */
  async getPlansOverview(): Promise<PlansOverviewResponse> {
    return apiClient.get<PlansOverviewResponse>("/api/v1/customer/plans");
  },

  /**
   * 2.2 Get Buy Once Eligibility
   * GET /api/v1/customer/plans/buy-once/eligibility
   */
  async getBuyOnceEligibility(): Promise<BuyOnceEligibilityResponse> {
    return apiClient.get<BuyOnceEligibilityResponse>(
      "/api/v1/customer/plans/buy-once/eligibility"
    );
  },

  /**
   * 2.3 Create Buy Once Quote
   * POST /api/v1/customer/plans/buy-once/quote
   */
  async createBuyOnceQuote(quantityLitres: number = 1): Promise<PlanQuote> {
    return apiClient.post<PlanQuote>("/api/v1/customer/plans/buy-once/quote", {
      quantityLitres,
    });
  },

  /**
   * 2.4 Get 7-Day Trial Eligibility
   * GET /api/v1/customer/plans/trial/eligibility
   */
  async getTrialEligibility(): Promise<TrialEligibilityResponse> {
    return apiClient.get<TrialEligibilityResponse>(
      "/api/v1/customer/plans/trial/eligibility"
    );
  },

  /**
   * 2.5 Create 7-Day Trial Quote
   * POST /api/v1/customer/plans/trial/quote
   */
  async createTrialQuote(quantityLitres: number = 1): Promise<PlanQuote> {
    return apiClient.post<PlanQuote>("/api/v1/customer/plans/trial/quote", {
      quantityLitres,
    });
  },

  /**
   * 2.6 Get Monthly Plan Configuration Info
   * GET /api/v1/customer/plans/monthly
   */
  async getMonthlyConfig(): Promise<MonthlyConfigResponse> {
    return apiClient.get<MonthlyConfigResponse>("/api/v1/customer/plans/monthly");
  },

  /**
   * 2.7 Create Monthly Plan Quote
   * POST /api/v1/customer/plans/monthly/quote
   */
  async createMonthlyQuote(payload: {
    frequency: "DAILY" | "ALTERNATE_DAYS";
    quantityMode: "FIXED" | "ALTERNATING";
    quantity?: number;
    quantityA?: number;
    quantityB?: number;
  }): Promise<PlanQuote> {
    return apiClient.post<PlanQuote>(
      "/api/v1/customer/plans/monthly/quote",
      payload
    );
  },

  /**
   * 2.8 Confirm Plan Quote (with Payment)
   * POST /api/v1/customer/plans/confirm
   */
  async confirmPlanQuote(payload: ConfirmPlanPayload): Promise<ConfirmPlanResponse> {
    return apiClient.post<ConfirmPlanResponse>(
      "/api/v1/customer/plans/confirm",
      payload
    );
  },
};
