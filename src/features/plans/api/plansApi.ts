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

/**
 * The server's order cut-off policy. Read from the API rather than restated
 * here so the customer-facing message can never contradict the backend rule.
 */
export interface OrderCutoffPolicy {
  /** 24h "HH:MM" in `timezone`. */
  time: string;
  /** Human-readable form, e.g. "11:00 PM". */
  timeLabel: string;
  /** IANA zone the cut-off is evaluated in. */
  timezone: string;
  /** Days until delivery when ordering before the cut-off. */
  leadDaysBeforeCutoff: number;
  /** Days until delivery when ordering at or after it. */
  leadDaysAfterCutoff: number;
}

/** Whether the customer's wallet funding has been confirmed. */
export interface FundingSummary {
  status: "CONFIRMED" | "PENDING_APPROVAL" | "NOT_FUNDED";
  walletBalancePaise: number;
  hasCompletedCredit: boolean;
  pendingCreditCount: number;
  pendingCreditPaise: number;
}

/** The customer's current plan, with its separate funding/approval/scheduling states. */
export interface CustomerSubscriptionSummary {
  selectionId: string;
  planType: string;
  /** PENDING_APPROVAL | PENDING_PAYMENT | CONFIRMED | ACTIVE | PAUSED */
  status: string;
  /** PER_DELIVERY = charged per delivered order; PREPAID_LEGACY = paid upfront. */
  billingModel: "PER_DELIVERY" | "PREPAID_LEGACY" | string;
  frequency: string | null;
  quantityMode: string | null;
  quantity: number | null;
  quantityA: number | null;
  quantityB: number | null;
  /** Null until an admin approves the plan and picks the first delivery date. */
  startDate: string | null;
  endDate: string | null;
  purchasedAt: string;
  funding: FundingSummary;
  approvalStatus: "PENDING" | "APPROVED";
  approvedAt: string | null;
  schedulingStatus: "NOT_SCHEDULED" | "SCHEDULED";
  expectedTotalPaise: number;
  sellingPricePerLitrePaise: number;
  deliveries: {
    total: number;
    delivered: number;
    upcoming: number;
    skipped: number;
    cancelled: number;
  };
  chargedPaise: number;
  outstandingPaise: number;
}

export interface PlansOverviewResponse {
  /** The customer's current or pending plan. Absent on older server builds. */
  subscription?: CustomerSubscriptionSummary | null;
  plans: PlanOverviewItem[];
  /** Absent on older server builds; treat as "unavailable", never guess. */
  orderCutoff?: OrderCutoffPolicy;
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
  /**
   * PENDING_APPROVAL for a per-delivery plan: purchased, nothing charged, and
   * waiting for admin approval. The other two are from the prepaid model.
   */
  status: "PENDING_APPROVAL" | "CONFIRMED" | "PENDING_PAYMENT";
  paymentMethod: "WALLET" | "CASH";
  /** What was debited at purchase. 0 for a per-delivery plan. */
  paidAmountPaise: number;
  cashCollectionId?: string;
  billingModel?: "PER_DELIVERY" | "PREPAID_LEGACY";
  /** The plan's quoted total, for display only; it is not charged upfront. */
  expectedTotalPaise?: number;
  funding?: FundingSummary;
  error?: string;
  message?: string;
  currentBalancePaise?: number;
  requiredPaise?: number;
  shortfallPaise?: number;
}

// ─── IN-MEMORY CACHE & REQUEST DEDUPLICATION ─────────────────────────────────

const PLANS_CACHE_TTL_MS = 60 * 1000; // 60 seconds
const CONFIG_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes for static config

let cachedOverview: { data: PlansOverviewResponse; expiresAt: number } | null = null;
let overviewPromise: Promise<PlansOverviewResponse> | null = null;

let cachedMonthlyConfig: { data: MonthlyConfigResponse; expiresAt: number } | null = null;
let monthlyConfigPromise: Promise<MonthlyConfigResponse> | null = null;

let cachedBuyOnceElig: { data: BuyOnceEligibilityResponse; expiresAt: number } | null = null;
let buyOnceEligPromise: Promise<BuyOnceEligibilityResponse> | null = null;

let cachedTrialElig: { data: TrialEligibilityResponse; expiresAt: number } | null = null;
let trialEligPromise: Promise<TrialEligibilityResponse> | null = null;

// Quotes Cache: Map of compositeKey -> { quote: PlanQuote; expiresAt: number }
const cachedQuotes = new Map<string, { quote: PlanQuote; expiresAt: number }>();
const inFlightQuotes = new Map<string, Promise<PlanQuote>>();

function isQuoteFresh(quote: PlanQuote, expiresAtTimestamp: number): boolean {
  if (!quote || !quote.quoteId) return false;
  // Quote must have at least 30 seconds of life remaining
  return expiresAtTimestamp > Date.now() + 30000;
}

export const plansApi = {
  /**
   * Clear in-memory plan and quote caches (e.g. after purchasing or on user switch)
   */
  clearCache(): void {
    cachedOverview = null;
    overviewPromise = null;
    cachedMonthlyConfig = null;
    monthlyConfigPromise = null;
    cachedBuyOnceElig = null;
    buyOnceEligPromise = null;
    cachedTrialElig = null;
    trialEligPromise = null;
    cachedQuotes.clear();
    inFlightQuotes.clear();
  },

  /**
   * 2.1 Get Plans Overview
   * GET /api/v1/customer/plans
   */
  async getPlansOverview(forceRefresh = false): Promise<PlansOverviewResponse> {
    const now = Date.now();
    if (!forceRefresh && cachedOverview && cachedOverview.expiresAt > now) {
      return cachedOverview.data;
    }
    if (!forceRefresh && overviewPromise) {
      return overviewPromise;
    }

    overviewPromise = apiClient
      .get<PlansOverviewResponse>("/api/v1/customer/plans")
      .then((res) => {
        cachedOverview = { data: res, expiresAt: Date.now() + PLANS_CACHE_TTL_MS };
        return res;
      })
      .finally(() => {
        overviewPromise = null;
      });

    return overviewPromise;
  },

  /**
   * 2.2 Get Buy Once Eligibility
   * GET /api/v1/customer/plans/buy-once/eligibility
   */
  async getBuyOnceEligibility(forceRefresh = false): Promise<BuyOnceEligibilityResponse> {
    const now = Date.now();
    if (!forceRefresh && cachedBuyOnceElig && cachedBuyOnceElig.expiresAt > now) {
      return cachedBuyOnceElig.data;
    }
    if (!forceRefresh && buyOnceEligPromise) {
      return buyOnceEligPromise;
    }

    buyOnceEligPromise = apiClient
      .get<BuyOnceEligibilityResponse>("/api/v1/customer/plans/buy-once/eligibility")
      .then((res) => {
        cachedBuyOnceElig = { data: res, expiresAt: Date.now() + PLANS_CACHE_TTL_MS };
        return res;
      })
      .finally(() => {
        buyOnceEligPromise = null;
      });

    return buyOnceEligPromise;
  },

  /**
   * 2.3 Create Buy Once Quote
   * POST /api/v1/customer/plans/buy-once/quote
   */
  async createBuyOnceQuote(quantityLitres: number = 1, forceRefresh = false): Promise<PlanQuote> {
    const cacheKey = `buyonce:${quantityLitres}`;
    const cached = cachedQuotes.get(cacheKey);
    if (!forceRefresh && cached && isQuoteFresh(cached.quote, cached.expiresAt)) {
      return cached.quote;
    }

    const inFlight = inFlightQuotes.get(cacheKey);
    if (!forceRefresh && inFlight) {
      return inFlight;
    }

    const promise = apiClient
      .post<PlanQuote>("/api/v1/customer/plans/buy-once/quote", { quantityLitres })
      .then((quote) => {
        const expiresAtMs = quote.expiresAt ? new Date(quote.expiresAt).getTime() : Date.now() + 15 * 60 * 1000;
        cachedQuotes.set(cacheKey, { quote, expiresAt: expiresAtMs });
        return quote;
      })
      .finally(() => {
        inFlightQuotes.delete(cacheKey);
      });

    inFlightQuotes.set(cacheKey, promise);
    return promise;
  },

  /**
   * 2.4 Get 7-Day Trial Eligibility
   * GET /api/v1/customer/plans/trial/eligibility
   */
  async getTrialEligibility(forceRefresh = false): Promise<TrialEligibilityResponse> {
    const now = Date.now();
    if (!forceRefresh && cachedTrialElig && cachedTrialElig.expiresAt > now) {
      return cachedTrialElig.data;
    }
    if (!forceRefresh && trialEligPromise) {
      return trialEligPromise;
    }

    trialEligPromise = apiClient
      .get<TrialEligibilityResponse>("/api/v1/customer/plans/trial/eligibility")
      .then((res) => {
        cachedTrialElig = { data: res, expiresAt: Date.now() + PLANS_CACHE_TTL_MS };
        return res;
      })
      .finally(() => {
        trialEligPromise = null;
      });

    return trialEligPromise;
  },

  /**
   * 2.5 Create 7-Day Trial Quote
   * POST /api/v1/customer/plans/trial/quote
   */
  async createTrialQuote(quantityLitres: number = 1, forceRefresh = false): Promise<PlanQuote> {
    const cacheKey = `trial:${quantityLitres}`;
    const cached = cachedQuotes.get(cacheKey);
    if (!forceRefresh && cached && isQuoteFresh(cached.quote, cached.expiresAt)) {
      return cached.quote;
    }

    const inFlight = inFlightQuotes.get(cacheKey);
    if (!forceRefresh && inFlight) {
      return inFlight;
    }

    const promise = apiClient
      .post<PlanQuote>("/api/v1/customer/plans/trial/quote", { quantityLitres })
      .then((quote) => {
        const expiresAtMs = quote.expiresAt ? new Date(quote.expiresAt).getTime() : Date.now() + 15 * 60 * 1000;
        cachedQuotes.set(cacheKey, { quote, expiresAt: expiresAtMs });
        return quote;
      })
      .finally(() => {
        inFlightQuotes.delete(cacheKey);
      });

    inFlightQuotes.set(cacheKey, promise);
    return promise;
  },

  /**
   * 2.6 Get Monthly Plan Configuration Info
   * GET /api/v1/customer/plans/monthly
   */
  async getMonthlyConfig(forceRefresh = false): Promise<MonthlyConfigResponse> {
    const now = Date.now();
    if (!forceRefresh && cachedMonthlyConfig && cachedMonthlyConfig.expiresAt > now) {
      return cachedMonthlyConfig.data;
    }
    if (!forceRefresh && monthlyConfigPromise) {
      return monthlyConfigPromise;
    }

    monthlyConfigPromise = apiClient
      .get<MonthlyConfigResponse>("/api/v1/customer/plans/monthly")
      .then((res) => {
        cachedMonthlyConfig = { data: res, expiresAt: Date.now() + CONFIG_CACHE_TTL_MS };
        return res;
      })
      .finally(() => {
        monthlyConfigPromise = null;
      });

    return monthlyConfigPromise;
  },

  /**
   * 2.7 Create Monthly Plan Quote
   * POST /api/v1/customer/plans/monthly/quote
   */
  async createMonthlyQuote(
    payload: {
      frequency: "DAILY" | "ALTERNATE_DAYS";
      quantityMode: "FIXED" | "ALTERNATING";
      quantity?: number;
      quantityA?: number;
      quantityB?: number;
    },
    forceRefresh = false
  ): Promise<PlanQuote> {
    const cacheKey = `monthly:${payload.frequency}:${payload.quantityMode}:${payload.quantity || ""}:${payload.quantityA || ""}:${payload.quantityB || ""}`;
    const cached = cachedQuotes.get(cacheKey);
    if (!forceRefresh && cached && isQuoteFresh(cached.quote, cached.expiresAt)) {
      return cached.quote;
    }

    const inFlight = inFlightQuotes.get(cacheKey);
    if (!forceRefresh && inFlight) {
      return inFlight;
    }

    const promise = apiClient
      .post<PlanQuote>("/api/v1/customer/plans/monthly/quote", payload)
      .then((quote) => {
        const expiresAtMs = quote.expiresAt ? new Date(quote.expiresAt).getTime() : Date.now() + 15 * 60 * 1000;
        cachedQuotes.set(cacheKey, { quote, expiresAt: expiresAtMs });
        return quote;
      })
      .finally(() => {
        inFlightQuotes.delete(cacheKey);
      });

    inFlightQuotes.set(cacheKey, promise);
    return promise;
  },

  /**
   * 2.8 Confirm Plan Quote (with Payment)
   * POST /api/v1/customer/plans/confirm
   */
  async confirmPlanQuote(payload: ConfirmPlanPayload): Promise<ConfirmPlanResponse> {
    const res = await apiClient.post<ConfirmPlanResponse>(
      "/api/v1/customer/plans/confirm",
      payload
    );
    // After confirming plan quote, invalidate cached quotes and overview to reflect new subscription
    cachedQuotes.clear();
    cachedOverview = null;
    return res;
  },
};
