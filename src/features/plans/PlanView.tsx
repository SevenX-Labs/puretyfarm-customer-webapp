"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Receipt,
  Sparkles,
  Sliders,
  CalendarDays,
  Clock,
  AlertCircle,
  RefreshCw,
  Check,
  X,
  Milk,
  CreditCard,
  DollarSign,
  Info,
  SkipForward,
  PauseCircle,
  CalendarRange,
} from "lucide-react";
import { MonthlyUpgradeModal } from "./components/MonthlyUpgradeModal";
import { SubscriptionStatusCard } from "./components/SubscriptionStatusCard";
import { UpcomingDeliveriesList } from "./components/UpcomingDeliveriesList";
import { CustomerHeader } from "@/components/pf/layout/CustomerHeader";
import { useRealtimeSync } from "@/lib/useRealtimeSync";
import { useAuth } from "@/context/AuthContext";
import { getScopedKey, getCacheData, setCacheData, isCacheStale } from "@/lib/cache/swrCache";
import { PfBadge, PfButton, PfCard, PfSectionTitle, PfSkeleton } from "@/components/pf";
import { manageDeliveryApi } from "@/features/delivery/api/manageDeliveryApi";
import { accountApi } from "@/features/account/api/accountApi";
import { ordersApi } from "@/features/orders/api/ordersApi";
import type { CustomerOrder } from "@/features/orders/types";
import type { Subscription } from "@/types/models";
import {
  ManageDeliveryResponse,
  ActivePlanView,
  UpcomingDeliveryView,
  DeliveryRequestItem,
} from "@/features/delivery/types";
import {
  plansApi,
  PlanOverviewItem,
  PlanQuote,
  OrderCutoffPolicy,
  CustomerSubscriptionSummary,
} from "@/features/plans/api/plansApi";
import { formatCurrency } from "@/lib/utils/formatters";
import {
  formatDeliveryDate,
  formatDeliveryWindowOrLabel as formatDeliveryWindow,
} from "@/features/dashboard/utils";

export function PlanView() {
  const { user } = useAuth();
  const userId = user?.id || "anon";
  const cacheKey = getScopedKey(userId, "plan_view_data");

  const cachedData = typeof window !== "undefined" ? getCacheData<any>(cacheKey) : undefined;
  const [loading, setLoading] = useState(() => !cachedData);
  const [refreshing, setRefreshing] = useState(false);
  const [deliveryData, setDeliveryData] = useState<ManageDeliveryResponse | null>(() => cachedData?.deliveryData ?? null);
  const [plansOverview, setPlansOverview] = useState<PlanOverviewItem[]>(() => cachedData?.plansOverview ?? []);
  const [orderCutoff, setOrderCutoff] = useState<OrderCutoffPolicy | null>(() => cachedData?.orderCutoff ?? null);
  const [subscription, setSubscription] = useState<CustomerSubscriptionSummary | null>(() => cachedData?.subscription ?? null);
  const [fallbackSub, setFallbackSub] = useState<Subscription | null>(() => cachedData?.fallbackSub ?? null);
  const [userOrders, setUserOrders] = useState<CustomerOrder[]>(() => cachedData?.userOrders ?? []);
  const [changeRequests, setChangeRequests] = useState<DeliveryRequestItem[]>(() => cachedData?.changeRequests ?? []);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Upgrade to Monthly Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Manage Subscription Modals State (Quantity, Frequency, Skip, Pause)
  const [manageModal, setManageModal] = useState<"QUANTITY" | "FREQUENCY" | "SKIP" | "PAUSE" | null>(null);
  const [manageLoading, setManageLoading] = useState(false);
  const [manageError, setManageError] = useState<string | null>(null);
  const [manageSuccess, setManageSuccess] = useState<string | null>(null);

  // Manage Modal Form State
  const [quantityScope, setQuantityScope] = useState<"SPECIFIC_DATE" | "COMPLETE_PLAN">("SPECIFIC_DATE");
  const [selectedTargetDate, setSelectedTargetDate] = useState<string>("");
  const [manageQuantity, setManageQuantity] = useState<number>(1);
  const [manageFrequency, setManageFrequency] = useState<string>("DAILY");
  const [manageCustomMode, setManageCustomMode] = useState<boolean>(false);
  const [manageQtyA, setManageQtyA] = useState<number>(1);
  const [manageQtyB, setManageQtyB] = useState<number>(2);
  const [manageSkipDate, setManageSkipDate] = useState<string>("");
  const [managePauseResumeDate, setManagePauseResumeDate] = useState<string>("");

  const [monthlyConfig, setMonthlyConfig] = useState<any>(() => cachedData?.monthlyConfig ?? null);
  const [trialQuote, setTrialQuote] = useState<PlanQuote | null>(() => cachedData?.trialQuote ?? null);
  const [buyOnceQuote, setBuyOnceQuote] = useState<PlanQuote | null>(() => cachedData?.buyOnceQuote ?? null);


  // Handlers for Plan Management Actions
  const handlePlanQuantityChange = async () => {
    setManageLoading(true);
    setManageError(null);
    try {
      if (quantityScope === "SPECIFIC_DATE" && !selectedTargetDate) {
        setManageError("Please select a delivery date to update quantity.");
        setManageLoading(false);
        return;
      }
      await manageDeliveryApi.changeQuantity({
        quantityLitres: manageQuantity,
        ...(quantityScope === "SPECIFIC_DATE" ? { deliveryDate: selectedTargetDate } : {}),
      });
      setManageSuccess(
        quantityScope === "SPECIFIC_DATE"
          ? `Quantity change request (${manageQuantity}L) for ${selectedTargetDate} submitted for admin approval.`
          : `Plan-wide quantity change request (${manageQuantity}L daily) submitted for admin approval.`
      );
      await loadData(true);
      setTimeout(() => setManageModal(null), 2000);
    } catch (err: any) {
      setManageError(err?.message || "Failed to submit quantity change request.");
    } finally {
      setManageLoading(false);
    }
  };

  const handlePlanFrequencyChange = async () => {
    setManageLoading(true);
    setManageError(null);
    try {
      if (manageFrequency === "DAILY" && manageCustomMode) {
        await manageDeliveryApi.changeSchedule({
          frequency: manageFrequency as any,
          quantityMode: "ALTERNATING" as any,
          quantityA: manageQtyA,
          quantityB: manageQtyB,
        });
        setManageSuccess(`Custom frequency updated: Day 1 (${manageQtyA}L), Day 2 (${manageQtyB}L) • ${manageFrequency}`);
      } else {
        await manageDeliveryApi.changeFrequency({
          frequency: manageFrequency as any,
        });
        setManageSuccess(`Delivery frequency updated to ${manageFrequency.replace("_", " ")}.`);
      }
      await loadData(true);
      setTimeout(() => setManageModal(null), 2000);
    } catch (err: any) {
      setManageError(err?.message || "Failed to update frequency.");
    } finally {
      setManageLoading(false);
    }
  };

  const handlePlanSkipDelivery = async () => {
    if (!manageSkipDate) {
      setManageError("Please select a delivery date to skip.");
      return;
    }
    setManageLoading(true);
    setManageError(null);
    try {
      await manageDeliveryApi.skipDelivery({ deliveryDate: manageSkipDate });
      setManageSuccess(`Delivery for ${manageSkipDate} has been skipped.`);
      await loadData(true);
      setTimeout(() => setManageModal(null), 1800);
    } catch (err: any) {
      setManageError(err?.message || "Failed to skip delivery.");
    } finally {
      setManageLoading(false);
    }
  };

  const handlePlanVacationPause = async () => {
    setManageLoading(true);
    setManageError(null);
    try {
      await manageDeliveryApi.pauseDelivery({
        resumeDate: managePauseResumeDate || undefined,
      });
      setManageSuccess(
        managePauseResumeDate
          ? `Deliveries paused until ${managePauseResumeDate}. Auto-resumes on sunrise dispatch.`
          : "Deliveries paused indefinitely. Resume anytime from your plan."
      );
      await loadData(true);
      setTimeout(() => setManageModal(null), 2000);
    } catch (err: any) {
      setManageError(err?.message || "Failed to pause deliveries.");
    } finally {
      setManageLoading(false);
    }
  };

  const loadData = useCallback(async (isRefresh = false) => {
    const hasData = Boolean(cachedData || deliveryData || subscription || plansOverview.length > 0);
    if (isRefresh || hasData) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [manageRes, overviewRes, monthlyRes, requestsRes, subRes, ordersRes, trialQuoteRes, buyOnceQuoteRes] = await Promise.allSettled([
        manageDeliveryApi.getManageDelivery(),
        plansApi.getPlansOverview(),
        plansApi.getMonthlyConfig(),
        manageDeliveryApi.getRequests(),
        accountApi.getSubscription(),
        ordersApi.listOrders({ limit: 20 }),
        plansApi.createTrialQuote(1),
        plansApi.createBuyOnceQuote(1),
      ]);

      if (manageRes.status === "fulfilled" && manageRes.value?.activePlan) {
        setDeliveryData(manageRes.value);
      } else if (!isRefresh) {
        setDeliveryData(null);
      }

      if (overviewRes.status === "fulfilled" && overviewRes.value?.plans) {
        setPlansOverview(overviewRes.value.plans);
        setOrderCutoff(overviewRes.value.orderCutoff ?? null);
        if (overviewRes.value.subscription) {
          setSubscription(overviewRes.value.subscription);
        }
      }

      if (subRes.status === "fulfilled" && subRes.value?.subscription) {
        setFallbackSub(subRes.value.subscription);
      }

      if (ordersRes.status === "fulfilled" && ordersRes.value?.data) {
        setUserOrders(ordersRes.value.data);
      }

      let newMonthlyConfig = monthlyConfig;
      if (monthlyRes.status === "fulfilled" && monthlyRes.value) {
        newMonthlyConfig = monthlyRes.value;
        setMonthlyConfig(newMonthlyConfig);
      }

      let newTrialQuote = trialQuote;
      if (trialQuoteRes.status === "fulfilled" && trialQuoteRes.value) {
        newTrialQuote = trialQuoteRes.value;
        setTrialQuote(newTrialQuote);
      }

      let newBuyOnceQuote = buyOnceQuote;
      if (buyOnceQuoteRes.status === "fulfilled" && buyOnceQuoteRes.value) {
        newBuyOnceQuote = buyOnceQuoteRes.value;
        setBuyOnceQuote(newBuyOnceQuote);
      }

      const newChangeRequests = requestsRes.status === "fulfilled" ? requestsRes.value?.data ?? [] : changeRequests;
      setChangeRequests(newChangeRequests);

      // Persist to user-scoped SWR cache so navigation back shows immediately without flash
      setCacheData(cacheKey, {
        deliveryData: manageRes.status === "fulfilled" ? manageRes.value : deliveryData,
        plansOverview: overviewRes.status === "fulfilled" ? overviewRes.value?.plans : plansOverview,
        orderCutoff: overviewRes.status === "fulfilled" ? (overviewRes.value?.orderCutoff ?? null) : orderCutoff,
        subscription: overviewRes.status === "fulfilled" ? (overviewRes.value?.subscription ?? null) : subscription,
        fallbackSub: subRes.status === "fulfilled" ? subRes.value?.subscription : fallbackSub,
        userOrders: ordersRes.status === "fulfilled" ? ordersRes.value?.data : userOrders,
        changeRequests: newChangeRequests,
        monthlyConfig: newMonthlyConfig,
        trialQuote: newTrialQuote,
        buyOnceQuote: newBuyOnceQuote,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load plan details";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cacheKey, cachedData, deliveryData, subscription, plansOverview, orderCutoff, fallbackSub, userOrders, changeRequests, monthlyConfig, trialQuote, buyOnceQuote]);

  useEffect(() => {
    const isStale = isCacheStale(cacheKey, 60000);
    if (!cachedData || isStale) {
      void loadData(Boolean(cachedData));
    } else {
      setLoading(false);
    }
  }, [cacheKey]);

  // Real-time sync: when admin approves plan or edits plan configs/cutoffs,
  // updates automatically reflect on customer view without manual refresh.
  // High-frequency live data sync: sync active plans, pauses/resumes, and server configs in real-time
  useRealtimeSync(() => {
    loadData(true);
  }, { intervalMs: 30000, events: ["plan.updated", "orders.updated", "plans.catalog.updated"] });

  const activePlan: ActivePlanView | undefined =
    deliveryData?.activePlan ||
    (subscription
      ? {
          selectionId: subscription.selectionId,
          planType: subscription.planType,
          status: subscription.status,
          billingModel: subscription.billingModel,
          frequency: subscription.frequency,
          quantityMode: subscription.quantityMode,
          quantityLitres: subscription.quantity,
          quantityA: subscription.quantityA,
          quantityB: subscription.quantityB,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          deliveryStartTime: null,
          deliveryEndTime: null,
        }
      : fallbackSub
      ? {
          selectionId: fallbackSub.id,
          planType:
            fallbackSub.planId === "single"
              ? "BUY_ONCE"
              : fallbackSub.planId === "trial"
              ? "SEVEN_DAY_TRIAL"
              : "MONTHLY",
          status: fallbackSub.status === "active" ? "ACTIVE" : "PAUSED",
          frequency: "DAILY",
          quantityMode: "FIXED",
          quantityLitres: 1,
          startDate: fallbackSub.startedAt,
          endDate: null,
          deliveryStartTime: fallbackSub.deliveryStartTime,
          deliveryEndTime: fallbackSub.deliveryEndTime,
        }
      : undefined);
  const nextDelivery: UpcomingDeliveryView | undefined = deliveryData?.upcomingDeliveries?.[0];

  // Find eligibility & availability from server overview
  const trialItem = plansOverview.find(
    (p) => p.type === "SEVEN_DAY_TRIAL" || (p.type as string) === "TRIAL"
  );
  const buyOnceItem = plansOverview.find((p) => p.type === "BUY_ONCE");
  const monthlyItem = plansOverview.find((p) => p.type === "MONTHLY");

  // Admin-configured delivery time window from PlanConfig (e.g. 06:00 - 11:00)
  const currentPlanConfig = plansOverview.find(
    (p) => p.type === activePlan?.planType
  );
  // The active plan's own saved window wins; otherwise the plan type's current
  // configuration. If neither is set the window is genuinely unknown, and
  // formatDeliveryWindow renders that rather than inventing a morning slot.
  const deliveryStartTime =
    activePlan?.deliveryStartTime ?? currentPlanConfig?.deliveryStartTime ?? null;
  const deliveryEndTime =
    activePlan?.deliveryEndTime ?? currentPlanConfig?.deliveryEndTime ?? null;
  const activeDeliveryWindow = formatDeliveryWindow(
    deliveryStartTime,
    deliveryEndTime,
    "Not set yet"
  );
  const activeDeliveryWindowKnown = Boolean(deliveryStartTime && deliveryEndTime);

  const pendingRequests = changeRequests.filter((r) => r.status === "PENDING");
  // Most recent decided request, so a rejection and its admin note stay
  // visible to the customer rather than vanishing silently.
  const lastDecidedRequest = changeRequests.find(
    (r) => r.status === "REJECTED" || r.status === "APPROVED"
  );

  // Server Invariants & Introductory Rules:
  // 1. BUY_ONCE and SEVEN_DAY_TRIAL are strictly mutually exclusive introductory offers.
  //    If a customer uses/orders either one, the other is permanently disabled.
  // 2. Both introductory offers can only be used 1 time maximum.
  const hasUsedBuyOnce = Boolean(
    activePlan?.planType === "BUY_ONCE" ||
    subscription?.planType === "BUY_ONCE" ||
    fallbackSub?.planId === "single" ||
    fallbackSub?.planName?.toLowerCase().includes("sample") ||
    fallbackSub?.planName?.toLowerCase().includes("buy once") ||
    trialItem?.blockedReason === "BUY_ONCE_ALREADY_USED" ||
    (buyOnceItem?.usageCount !== undefined && buyOnceItem.usageCount > 0) ||
    (buyOnceItem?.remainingUses !== undefined && buyOnceItem.remainingUses <= 0) ||
    userOrders.some((o) => o.planType === "BUY_ONCE")
  );

  // Dynamic Plan Rates from Server Quotes / Configs (matching Admin PlanConfig)
  const trialRate = trialQuote?.sellingPricePerLitre
    ? Math.round(trialQuote.sellingPricePerLitre / 100)
    : 95;
  const trialTotal = trialQuote?.totalSellingAmount
    ? Math.round(trialQuote.totalSellingAmount / 100)
    : trialRate * 7;

  const monthlyRate = monthlyConfig?.sellingPricePerLitre
    ? Math.round(monthlyConfig.sellingPricePerLitre / 100)
    : 90;
  const monthlyTotal = monthlyRate * 30;

  const buyOncePrice = buyOnceQuote?.totalSellingAmount
    ? Math.round(buyOnceQuote.totalSellingAmount / 100)
    : buyOnceQuote?.sellingPricePerLitre
    ? Math.round(buyOnceQuote.sellingPricePerLitre / 100)
    : 100;

  const hasUsedTrial = Boolean(
    activePlan?.planType === "SEVEN_DAY_TRIAL" ||
    activePlan?.planType === "TRIAL" ||
    subscription?.planType === "SEVEN_DAY_TRIAL" ||
    subscription?.planType === "TRIAL" ||
    fallbackSub?.planId === "trial" ||
    fallbackSub?.planName?.toLowerCase().includes("trial") ||
    buyOnceItem?.blockedReason === "TRIAL_ALREADY_USED" ||
    trialItem?.used === true ||
    trialItem?.blockedReason === "TRIAL_ALREADY_USED" ||
    userOrders.some((o) => o.planType === "SEVEN_DAY_TRIAL")
  );

  const isTrialBlockedByBuyOnce = hasUsedBuyOnce;
  const isBuyOnceBlockedByTrial = hasUsedTrial;
  const isTrialUsed = hasUsedTrial;

  const isBuyOnceLimitReached =
    hasUsedBuyOnce ||
    buyOnceItem?.blockedReason === "MAX_USES_REACHED" ||
    (buyOnceItem?.remainingUses !== undefined && buyOnceItem.remainingUses <= 0);

  const isTrialAvailable = Boolean(
    trialItem?.available !== false &&
    !isTrialBlockedByBuyOnce &&
    !isTrialUsed &&
    trialItem?.blockedReason !== "PLAN_NOT_CONFIGURED"
  );

  const isBuyOnceAvailable = Boolean(
    buyOnceItem?.available !== false &&
    !isBuyOnceBlockedByTrial &&
    !isBuyOnceLimitReached &&
    buyOnceItem?.blockedReason !== "PLAN_NOT_CONFIGURED"
  );



  const openUpgradeModal = () => {
    setShowUpgradeModal(true);
  };

  return (
    <>
      <CustomerHeader
        title="My Milk Plan"
        subtitle="Manage your daily A2 milk subscription and schedule."
      />

      <div className="flex justify-end mb-4">
        <button
          onClick={() => loadData(true)}
          disabled={refreshing || loading}
          aria-label="Refresh plan details"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--pf-border)] bg-[var(--pf-card-bg)] hover:bg-[var(--pf-cream)] text-xs font-semibold text-[var(--pf-text-secondary)] transition-colors cursor-pointer"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin text-[var(--pf-brown)]" : ""} />
          <span>{refreshing ? "Syncing..." : "Sync with server"}</span>
        </button>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-start justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-rose-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to sync plan with server</p>
              <p className="text-rose-700 text-xs mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={() => loadData(true)}
            className="text-xs font-bold text-rose-800 underline hover:no-underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-3 shadow-sm">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {loading ? (
        <PlanSkeleton />
      ) : (
        <div className="space-y-10">
          {/* Plan status: funding, approval, scheduling and per-delivery charges */}
          {subscription && <SubscriptionStatusCard subscription={subscription} />}

          {deliveryData && (
            <UpcomingDeliveriesList
              deliveries={deliveryData.upcomingDeliveries ?? []}
              chargedPerDelivery={
                (activePlan?.billingModel ?? subscription?.billingModel) === "PER_DELIVERY"
              }
            />
          )}

          {/* Active Plan Hero Card */}
          {activePlan ? (
            <PfCard padding="lg" elevated>
              <div className="grid lg:grid-cols-[1fr_320px] gap-8">
                <div>
                  {/* Top Status Badges */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
                      CURRENT PLAN
                    </span>
                    <PfBadge
                      tone={
                        activePlan.status === "PENDING_APPROVAL" || activePlan.status === "PENDING_PAYMENT"
                          ? "warning"
                          : activePlan.status === "CONFIRMED" || activePlan.status === "ACTIVE"
                          ? "success"
                          : activePlan.status === "PAUSED"
                          ? "warning"
                          : "neutral"
                      }
                    >
                      {activePlan.status === "PENDING_APPROVAL" || activePlan.status === "PENDING_PAYMENT"
                        ? "Pending Approval"
                        : activePlan.status === "PAUSED"
                        ? "Paused"
                        : "Active"}
                    </PfBadge>
                  </div>

                  {/* Title & Subtitle */}
                  <h2 className="text-[28px] sm:text-[32px] font-bold text-[var(--pf-text)] leading-[1.1]">
                    {activePlan.planType === "BUY_ONCE" && "Buy Once (1 Litre Sample)"}
                    {(activePlan.planType === "SEVEN_DAY_TRIAL" || activePlan.planType === "TRIAL") &&
                      "7-Day Trial Plan"}
                    {activePlan.planType === "MONTHLY" && "Monthly Subscription"}
                  </h2>

                  <p className="mt-1.5 text-[15px] sm:text-[16px] text-[var(--pf-text-secondary)] font-semibold">
                    {activePlan.planType === "BUY_ONCE" &&
                      (activePlan.quantityLitres || 1) + "L Single Sample Delivery"}
                    {(activePlan.planType === "SEVEN_DAY_TRIAL" || activePlan.planType === "TRIAL") &&
                      (activePlan.quantityLitres || 1) + "L Daily (7-Day Trial)"}
                    {activePlan.planType === "MONTHLY" &&
                      (activePlan.quantityMode === "ALTERNATING" || (activePlan.quantityA != null && activePlan.quantityB != null)
                        ? `Day 1: ${activePlan.quantityA ?? 1}L, Day 2: ${activePlan.quantityB ?? 2}L (${activePlan.frequency === "ALTERNATE_DAYS" ? "Alternate Days" : "Daily"})`
                        : `${activePlan.quantityLitres || 1}L ${activePlan.frequency === "ALTERNATE_DAYS" ? "Alternate Days" : "Daily"} (30L / mo)`)}
                  </p>

                  {/* Stats Grid: Price, Next Delivery & Admin Delivery Window */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 pt-6 border-t border-[var(--pf-border)]">
                    <Stat
                      label={
                        subscription?.billingModel === "PER_DELIVERY"
                          ? "Charged So Far"
                          : "Plan Price"
                      }
                      value={
                        subscription?.expectedTotalPaise != null
                          ? formatCurrency(
                              (subscription.billingModel === "PER_DELIVERY"
                                ? subscription.chargedPaise
                                : subscription.expectedTotalPaise) / 100
                            )
                          : fallbackSub?.price != null
                          ? `₹${fallbackSub.price}`
                          : "—"
                      }
                      sub={
                        subscription?.billingModel === "PER_DELIVERY"
                          ? "Charged per delivered order"
                          : activePlan?.planType === "BUY_ONCE"
                          ? "One-time sample"
                          : activePlan?.planType === "SEVEN_DAY_TRIAL" || activePlan?.planType === "TRIAL"
                          ? "7-Day Trial"
                          : undefined
                      }
                    />
                    <Stat
                      label="Next Delivery"
                      value={
                        nextDelivery?.date
                          ? formatDeliveryDate(nextDelivery.date).label
                          : activePlan.planType === "BUY_ONCE"
                          ? "Today"
                          : "Scheduled"
                      }
                    />
                    <Stat
                      label="Delivery Window"
                      value={activeDeliveryWindow}
                      sub="Set by Farm Admin"
                    />
                  </div>

                  {pendingRequests.length > 0 && (
                    <div className="mt-4 rounded-[12px] border border-[var(--pf-border)] bg-[var(--pf-surface-soft)] p-3">
                      <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
                        Awaiting admin approval
                      </div>
                      <ul className="mt-2 space-y-1">
                        {pendingRequests.map((r) => (
                          <li
                            key={r.id}
                            className="flex items-center gap-2 text-[12.5px] text-[var(--pf-text-secondary)]"
                          >
                            <PfBadge tone="warning" dot>
                              Pending
                            </PfBadge>
                            <span>{r.type.replace(/_/g, " ").toLowerCase()}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-[11.5px] text-[var(--pf-text-muted)]">
                        Your current plan stays exactly as it is until an admin
                        approves the request.
                      </p>
                    </div>
                  )}

                  {lastDecidedRequest?.status === "REJECTED" && (
                    <div className="mt-3 rounded-[12px] border border-[var(--pf-border)] bg-[var(--pf-error-bg)] p-3">
                      <div className="flex items-center gap-2">
                        <PfBadge tone="error" dot>
                          Rejected
                        </PfBadge>
                        <span className="text-[12.5px] font-semibold text-[var(--pf-text)]">
                          {lastDecidedRequest.type.replace(/_/g, " ").toLowerCase()}
                        </span>
                      </div>
                      {lastDecidedRequest.adminNote && (
                        <p className="mt-1.5 text-[12.5px] text-[var(--pf-text-secondary)]">
                          {lastDecidedRequest.adminNote}
                        </p>
                      )}
                    </div>
                  )}

                  {orderCutoff && (
                    <p className="mt-4 text-[12px] text-[var(--pf-text-secondary)]">
                      <Clock size={12} className="mr-1 inline align-[-1px]" />
                      Order before {orderCutoff.timeLabel} (
                      {orderCutoff.timezone}) and your delivery is scheduled{" "}
                      {orderCutoff.leadDaysBeforeCutoff === 1
                        ? "for the next day"
                        : `${orderCutoff.leadDaysBeforeCutoff} days later`}
                      . After that it moves to{" "}
                      {orderCutoff.leadDaysAfterCutoff === 2
                        ? "the day after next"
                        : `${orderCutoff.leadDaysAfterCutoff} days later`}
                      .
                    </p>
                  )}

                  {/* Contextual Action Buttons */}
                  <div className="mt-6 flex items-center gap-3 flex-wrap">
                    {activePlan.planType === "BUY_ONCE" ? (
                      <>
                        <PfButton href="/orders" variant="secondary">
                          <Receipt size={15} strokeWidth={2} />
                          View Order Receipt
                        </PfButton>
                        <PfButton onClick={openUpgradeModal} variant="primary">
                          <Sparkles size={15} strokeWidth={2} />
                          Upgrade to Monthly Plan
                        </PfButton>
                      </>
                    ) : activePlan.planType === "SEVEN_DAY_TRIAL" || activePlan.planType === "TRIAL" ? (
                      <>
                        <PfButton href="/orders" variant="secondary">
                          <Receipt size={15} strokeWidth={2} />
                          View Orders
                        </PfButton>
                        <PfButton onClick={openUpgradeModal} variant="primary">
                          <Sparkles size={15} strokeWidth={2} />
                          Upgrade to Monthly Plan
                        </PfButton>
                      </>
                    ) : (
                      <>

                        <PfButton
                          onClick={() => {
                            if (activePlan.quantityLitres) setManageQuantity(activePlan.quantityLitres);
                            setManageModal("QUANTITY");
                            setManageError(null);
                            setManageSuccess(null);
                          }}
                          variant="secondary"
                        >
                          <Sliders size={15} strokeWidth={2} />
                          Manage Plan
                        </PfButton>
                        <PfButton onClick={openUpgradeModal} variant="secondary">
                          <Sparkles size={15} strokeWidth={2} />
                          Upgrade Plan
                        </PfButton>
                      </>
                    )}
                  </div>
                </div>

                {/* What Included Snapshot */}
                <div className="lg:border-l lg:border-[var(--pf-border)] lg:pl-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CalendarDays size={16} strokeWidth={1.75} className="text-[var(--pf-brown)]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
                      What&apos;s included
                    </span>
                  </div>
                  <ul className="space-y-2.5 text-[13px] text-[var(--pf-text-secondary)]">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} strokeWidth={2} className="text-[var(--pf-brown)] mt-0.5 shrink-0" />
                      <span>Pure A2 Gir cow fresh raw milk</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} strokeWidth={2} className="text-[var(--pf-brown)] mt-0.5 shrink-0" />
                      <span>Sanitized reusable glass bottle</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock size={14} strokeWidth={2} className="text-[var(--pf-brown)] mt-0.5 shrink-0" />
                      <span>
                        Doorstep delivery
                        {activeDeliveryWindowKnown ? ` (${activeDeliveryWindow})` : ""}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={14} strokeWidth={2} className="text-[var(--pf-brown)] mt-0.5 shrink-0" />
                      <span>
                        {activePlan.planType === "BUY_ONCE"
                          ? "Single trial sample • Zero commitment"
                          : activePlan.planType === "SEVEN_DAY_TRIAL" || activePlan.planType === "TRIAL"
                          ? "7 consecutive mornings • One-time intro price"
                          : "Flexible pause, skip & vacation mode"}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </PfCard>

          
          ) : (
            <PfCard padding="lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--pf-yellow-soft)] flex items-center justify-center shrink-0">
                  <Milk size={22} strokeWidth={1.75} className="text-[var(--pf-brown)]" />
                </div>
                <div>
                  <h2 className="text-[22px] font-bold text-[var(--pf-text)]">
                    No active plan
                  </h2>
                  <p className="mt-1 text-[14px] text-[var(--pf-text-secondary)]">
                    Select a plan below to start your milk deliveries.{" "}
                    {activeDeliveryWindowKnown
                      ? `Delivery window: ${activeDeliveryWindow}.`
                      : ""}
                  </p>
                </div>
              </div>
            </PfCard>
          )}

          {/* Manage Monthly Subscription Grid (Quantity, Frequency, Skip, Pause) */}
          {activePlan && activePlan.planType === "MONTHLY" && (
            <div className="bg-white rounded-3xl border border-[#E8DFD4] p-6 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#E8DFD4]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-[#FAF3EA] text-[#5C1B13]">
                      <CalendarRange className="w-4 h-4" />
                    </span>
                    <h3 className="text-base font-bold text-[#1A1008]">
                      Manage Monthly Subscription
                    </h3>
                  </div>
                  <p className="text-xs text-[#6B584C] mt-1">
                    Skip a scheduled delivery date or set vacation pause.
                  </p>
                </div>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <button
                  type="button"
                  onClick={() => {
                    const upcoming = deliveryData?.upcomingDeliveries?.[0];
                    if (upcoming?.date) setManageSkipDate(upcoming.date);
                    setManageModal("SKIP");
                    setManageError(null);
                    setManageSuccess(null);
                  }}
                  className="p-3.5 rounded-2xl border border-[#E8DFD4] hover:border-[#5C1B13] bg-[#FAF8F5]/60 hover:bg-[#FAF3EA] text-left cursor-pointer transition-all group"
                >
                  <div className="w-7 h-7 rounded-xl bg-white border border-[#E8DFD4] flex items-center justify-center text-[#5C1B13] mb-2 group-hover:scale-105 transition-transform">
                    <SkipForward size={14} />
                  </div>
                  <p className="text-xs font-bold text-[#1A1008]">Skip Delivery</p>
                  <p className="text-[11px] text-[#6B584C] mt-0.5">
                    Skip a specific scheduled date
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setManageModal("PAUSE");
                    setManageError(null);
                    setManageSuccess(null);
                  }}
                  className="p-3.5 rounded-2xl border border-[#E8DFD4] hover:border-[#5C1B13] bg-[#FAF8F5]/60 hover:bg-[#FAF3EA] text-left cursor-pointer transition-all group"
                >
                  <div className="w-7 h-7 rounded-xl bg-white border border-[#E8DFD4] flex items-center justify-center text-[#5C1B13] mb-2 group-hover:scale-105 transition-transform">
                    <PauseCircle size={14} />
                  </div>
                  <p className="text-xs font-bold text-[#1A1008]">Vacation Pause</p>
                  <p className="text-[11px] text-[#6B584C] mt-0.5">
                    Pause with auto-resume date
                  </p>
                </button>
              </div>
            </div>
          )}


          {/* Change Plan / Available Plans Section */}
          <section>
            <PfSectionTitle
              title="Change plan"
              description="All plans include free morning delivery, glass bottles, and WhatsApp updates."
            />

            <div className="grid md:grid-cols-3 gap-5">
              {/* 1. 7-Day Trial Plan */}
              <div
                className={
                  "relative rounded-3xl p-6 transition-all border flex flex-col justify-between " +
                  (activePlan?.planType === "SEVEN_DAY_TRIAL" || activePlan?.planType === "TRIAL"
                    ? "bg-[#FCF9F2] border-[var(--pf-brown)] shadow-md"
                    : !isTrialAvailable
                    ? "bg-[#F7F4EE]/60 border-[var(--pf-border)] opacity-80"
                    : "bg-[var(--pf-card-bg)] border-[var(--pf-border)] hover:border-[var(--pf-brown)]/40 hover:shadow-md")
                }
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
                      ONE-TIME OFFER
                    </span>
                    {activePlan?.planType === "SEVEN_DAY_TRIAL" || activePlan?.planType === "TRIAL" ? (
                      <PfBadge tone="brand">Current</PfBadge>
                    ) : isTrialBlockedByBuyOnce ? (
                      <PfBadge tone="warning">Intro Availed</PfBadge>
                    ) : isTrialUsed ? (
                      <PfBadge tone="neutral">Already Used</PfBadge>
                    ) : !isTrialAvailable ? (
                      <PfBadge tone="neutral">Unavailable</PfBadge>
                    ) : null}
                  </div>

                  <h3 className="text-[20px] font-bold text-[var(--pf-text)] leading-snug">
                    7-Day Trial Plan
                  </h3>
                  <div className="mt-2 text-[22px] font-black text-[var(--pf-brown)]">
                    {loading && !trialQuote && !cachedData ? (
                      <span className="inline-block w-36 h-6 rounded bg-[#E2D5C7] animate-pulse align-middle" />
                    ) : (
                      <>
                        ₹{trialTotal.toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-[var(--pf-text-muted)] ml-1">
                          / 7 days (₹{trialRate}/L)
                        </span>
                      </>
                    )}
                  </div>

                  <p className="mt-2 text-[13px] text-[var(--pf-text-secondary)]">
                    1L fresh milk every morning for 7 consecutive days.
                  </p>

                  <ul className="mt-4 space-y-2 text-[12px] text-[var(--pf-text-secondary)]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[var(--pf-brown)] shrink-0" />
                      <span>100% Pure A2 Gir Cow Milk</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[var(--pf-brown)] shrink-0" />
                      <span>Sanitized glass bottles</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock size={13} className="text-[var(--pf-brown)] shrink-0" />
                      <span>
                        Delivery window:{" "}
                        {formatDeliveryWindow(
                          trialItem?.deliveryStartTime,
                          trialItem?.deliveryEndTime,
                          "not set yet"
                        )}
                      </span>
                    </li>
                  </ul>

                  {/* Server Invariant Notice if Blocked */}
                  {isTrialBlockedByBuyOnce && (
                    <div className="mt-4 p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                      <Info size={14} className="text-amber-700 shrink-0 mt-0.5" />
                      <span>
                        <strong>Introductory Offer Rule:</strong> You have already availed the Buy Once sample bottle. 7-Day Trial cannot be combined with Buy Once.
                      </span>
                    </div>
                  )}

                  {isTrialUsed && !isTrialBlockedByBuyOnce && (
                    <div className="mt-4 p-3 rounded-2xl bg-stone-100 border border-stone-200 text-stone-700 text-[11px] flex items-start gap-2">
                      <Info size={14} className="text-stone-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>1-Time Limit:</strong> You have already completed your 7-Day Trial.
                      </span>
                    </div>
                  )}

                  {!isTrialAvailable && !isTrialBlockedByBuyOnce && !isTrialUsed && (
                    <div className="mt-4 p-3 rounded-2xl bg-stone-100 border border-stone-200 text-stone-700 text-[11px] flex items-start gap-2">
                      <Info size={14} className="text-stone-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Currently Unavailable:</strong> 7-Day Trial is currently not available for selection.
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  {activePlan?.planType === "SEVEN_DAY_TRIAL" || activePlan?.planType === "TRIAL" ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-2xl bg-[var(--pf-yellow-soft)] text-[var(--pf-brown)] font-bold text-xs cursor-default"
                    >
                      Current Active Plan
                    </button>
                  ) : isTrialBlockedByBuyOnce ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-2xl bg-stone-100 text-stone-400 font-medium text-xs cursor-not-allowed border border-stone-200"
                    >
                      Unavailable (Sample Availed)
                    </button>
                  ) : isTrialUsed ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-2xl bg-stone-100 text-stone-400 font-medium text-xs cursor-not-allowed border border-stone-200"
                    >
                      Already Availed
                    </button>
                  ) : !isTrialAvailable ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-2xl bg-stone-100 text-stone-400 font-medium text-xs cursor-not-allowed border border-stone-200"
                    >
                      Currently Unavailable
                    </button>
                  ) : (
                    <PfButton href="/onboarding/plan" variant="secondary" className="w-full justify-center">
                      Select 7-Day Trial
                    </PfButton>
                  )}
                </div>
              </div>

              {/* 2. Monthly Subscription */}
              <div
                className={
                  "relative rounded-3xl p-6 transition-all border flex flex-col justify-between " +
                  (activePlan?.planType === "MONTHLY"
                    ? "bg-[#FCF9F2] border-[var(--pf-brown)] shadow-md"
                    : "bg-[var(--pf-card-bg)] border-[var(--pf-brown)] shadow-sm hover:shadow-md")
                }
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-brown)]">
                      {activePlan?.planType === "MONTHLY"
                        ? "CURRENT PLAN"
                        : activePlan?.planType === "BUY_ONCE" ||
                          activePlan?.planType === "SEVEN_DAY_TRIAL" ||
                          activePlan?.planType === "TRIAL"
                        ? "RECOMMENDED UPGRADE"
                        : "MOST POPULAR"}
                    </span>
                    {activePlan?.planType === "MONTHLY" ? (
                      <PfBadge tone="brand">Current</PfBadge>
                    ) : (
                      <PfBadge tone="brand">Recommended</PfBadge>
                    )}
                  </div>

                  <h3 className="text-[20px] font-bold text-[var(--pf-text)] leading-snug">
                    Monthly Subscription
                  </h3>
                  <div className="mt-2 text-[22px] font-black text-[var(--pf-brown)]">
                    {loading && !monthlyConfig && !cachedData ? (
                      <span className="inline-block w-36 h-6 rounded bg-[#E2D5C7] animate-pulse align-middle" />
                    ) : (
                      <>
                        ₹{monthlyTotal.toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-[var(--pf-text-muted)] ml-1">
                          / mo (₹{monthlyRate}/L)
                        </span>
                      </>
                    )}
                  </div>

                  <p className="mt-2 text-[13px] text-[var(--pf-text-secondary)]">
                    1L daily fresh morning delivery with complete flexibility.
                  </p>

                  <ul className="mt-4 space-y-2 text-[12px] text-[var(--pf-text-secondary)]">
                    <li className="flex items-center gap-2">
                      <Clock size={13} className="text-[var(--pf-brown)] shrink-0" />
                      <span>
                        Daily delivery —{" "}
                        {formatDeliveryWindow(
                          monthlyItem?.deliveryStartTime,
                          monthlyItem?.deliveryEndTime,
                          "window not set yet"
                        )}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[var(--pf-brown)] shrink-0" />
                      <span>Flexible pause / vacation mode anytime</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[var(--pf-brown)] shrink-0" />
                      <span>Sealed reusable glass bottles</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[var(--pf-brown)] shrink-0" />
                      <span>WhatsApp delivery alerts & instant support</span>
                    </li>
                  </ul>

                  {(activePlan?.planType === "BUY_ONCE" ||
                    activePlan?.planType === "SEVEN_DAY_TRIAL" ||
                    activePlan?.planType === "TRIAL") && (
                    <div className="mt-4 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-[11px] flex items-start gap-2">
                      <Sparkles size={14} className="text-emerald-700 shrink-0 mt-0.5" />
                      <span>
                        <strong>Direct Upgrade:</strong> Seamlessly upgrade your daily milk delivery to our monthly plan with doorstep cold-chain service.
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  {activePlan?.planType === "MONTHLY" ? (
                    <PfButton onClick={openUpgradeModal} variant="secondary" className="w-full justify-center">
                      Modify Subscription
                    </PfButton>
                  ) : (
                    <PfButton onClick={openUpgradeModal} variant="primary" className="w-full justify-center">
                      <Sparkles size={14} />
                      Upgrade to Monthly
                    </PfButton>
                  )}
                </div>
              </div>

              {/* 3. Buy Once (1 Litre) */}
              <div
                className={
                  "relative rounded-3xl p-6 transition-all border flex flex-col justify-between " +
                  (activePlan?.planType === "BUY_ONCE"
                    ? "bg-[#FCF9F2] border-[var(--pf-brown)] shadow-md"
                    : !isBuyOnceAvailable
                    ? "bg-[#F7F4EE]/60 border-[var(--pf-border)] opacity-80"
                    : "bg-[var(--pf-card-bg)] border-[var(--pf-border)] hover:border-[var(--pf-brown)]/40 hover:shadow-md")
                }
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
                      SAMPLE BOTTLE
                    </span>
                    {activePlan?.planType === "BUY_ONCE" ? (
                      <PfBadge tone="brand">Current Active</PfBadge>
                    ) : isBuyOnceBlockedByTrial ? (
                      <PfBadge tone="warning">Intro Availed</PfBadge>
                    ) : isBuyOnceLimitReached ? (
                      <PfBadge tone="neutral">Already Used</PfBadge>
                    ) : !isBuyOnceAvailable ? (
                      <PfBadge tone="neutral">Unavailable</PfBadge>
                    ) : null}
                  </div>

                  <h3 className="text-[20px] font-bold text-[var(--pf-text)] leading-snug">
                    Buy Once (1 Litre)
                  </h3>
                  <div className="mt-2 text-[22px] font-black text-[var(--pf-brown)]">
                    {loading && !buyOnceQuote && !cachedData ? (
                      <span className="inline-block w-24 h-6 rounded bg-[#E2D5C7] animate-pulse align-middle" />
                    ) : (
                      <>
                        ₹{buyOncePrice.toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-[var(--pf-text-muted)] ml-1">
                          / sample
                        </span>
                      </>
                    )}
                  </div>

                  <p className="mt-2 text-[13px] text-[var(--pf-text-secondary)]">
                    Single bottle sample to test farm freshness with zero commitment.
                  </p>

                  <ul className="mt-4 space-y-2 text-[12px] text-[var(--pf-text-secondary)]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[var(--pf-brown)] shrink-0" />
                      <span>Single 1L farm sample bottle</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock size={13} className="text-[var(--pf-brown)] shrink-0" />
                      <span>
                        Delivery window:{" "}
                        {formatDeliveryWindow(
                          buyOnceItem?.deliveryStartTime,
                          buyOnceItem?.deliveryEndTime,
                          "not set yet"
                        )}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={13} className="text-[var(--pf-brown)] shrink-0" />
                      <span>Zero recurring commitments</span>
                    </li>
                  </ul>

                  {/* Server Invariant Notice */}
                  {activePlan?.planType === "BUY_ONCE" && (
                    <div className="mt-4 p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                      <Info size={14} className="text-amber-700 shrink-0 mt-0.5" />
                      <span>
                        <strong>Active Order:</strong> Your Buy Once sample is confirmed. You can upgrade to Monthly subscription above at any time.
                      </span>
                    </div>
                  )}

                  {isBuyOnceBlockedByTrial && (
                    <div className="mt-4 p-3 rounded-2xl bg-stone-100 border border-stone-200 text-stone-700 text-[11px] flex items-start gap-2">
                      <Info size={14} className="text-stone-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Introductory Rule:</strong> You have already availed the 7-Day Trial. Buy Once sample cannot be combined with Trial.
                      </span>
                    </div>
                  )}

                  {isBuyOnceLimitReached && activePlan?.planType !== "BUY_ONCE" && !isBuyOnceBlockedByTrial && (
                    <div className="mt-4 p-3 rounded-2xl bg-stone-100 border border-stone-200 text-stone-700 text-[11px] flex items-start gap-2">
                      <Info size={14} className="text-stone-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Sample Limit:</strong> Buy Once sample bottle has already been availed (1-time limit).
                      </span>
                    </div>
                  )}

                  {!isBuyOnceAvailable && !isBuyOnceBlockedByTrial && !isBuyOnceLimitReached && activePlan?.planType !== "BUY_ONCE" && (
                    <div className="mt-4 p-3 rounded-2xl bg-stone-100 border border-stone-200 text-stone-700 text-[11px] flex items-start gap-2">
                      <Info size={14} className="text-stone-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Currently Unavailable:</strong> Sample bottle is currently not available for selection.
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  {activePlan?.planType === "BUY_ONCE" ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-2xl bg-[var(--pf-yellow-soft)] text-[var(--pf-brown)] font-bold text-xs cursor-default"
                    >
                      Current Active Plan
                    </button>
                  ) : isBuyOnceBlockedByTrial ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-2xl bg-stone-100 text-stone-400 font-medium text-xs cursor-not-allowed border border-stone-200"
                    >
                      Unavailable (Trial Availed)
                    </button>
                  ) : isBuyOnceLimitReached ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-2xl bg-stone-100 text-stone-400 font-medium text-xs cursor-not-allowed border border-stone-200"
                    >
                      Limit Reached (1/1)
                    </button>
                  ) : !isBuyOnceAvailable ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-2xl bg-stone-100 text-stone-400 font-medium text-xs cursor-not-allowed border border-stone-200"
                    >
                      Currently Unavailable
                    </button>
                  ) : (
                    <PfButton href="/onboarding/plan" variant="secondary" className="w-full justify-center">
                      Order Sample Bottle
                    </PfButton>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Upgrade / Customize Monthly Plan Modal */}
      
      {/* ══════════════════════════════════════════════════════════════════
          MANAGE SUBSCRIPTION MODALS (QUANTITY, FREQUENCY, SKIP, PAUSE)
         ══════════════════════════════════════════════════════════════════ */}
      {manageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl border border-[#E8DFD4] shadow-2xl max-w-md w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setManageModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#FAF3EA] text-[#8C7A6B] cursor-pointer"
            >
              <X size={16} />
            </button>

            <div>
              <h3 className="text-base font-bold text-[#1A1008]">
                {manageModal === "QUANTITY" && "Change Delivery Quantity"}
                {manageModal === "FREQUENCY" && "Change Delivery Frequency & Pattern"}
                {manageModal === "SKIP" && "Skip Upcoming Delivery"}
                {manageModal === "PAUSE" && "Vacation Pause Deliveries"}
              </h3>
              <p className="text-xs text-[#6B584C] mt-0.5">
                {manageModal === "QUANTITY" && "Choose whether to update a specific delivery date or your complete plan."}
                {manageModal === "FREQUENCY" && "Customize your morning delivery cadence and alternating quantities."}
                {manageModal === "SKIP" && "Select an upcoming morning date to skip."}
                {manageModal === "PAUSE" && "Freeze morning deliveries while away; auto-resumes on selected date."}
              </p>
            </div>

            {/* Messages */}
            {manageSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{manageSuccess}</span>
              </div>
            )}
            {manageError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{manageError}</span>
              </div>
            )}

            {/* Modal Body: QUANTITY with 2 Options */}
            {manageModal === "QUANTITY" && (
              <div className="space-y-4">
                {/* 2 Options Toggle */}
                <div className="p-1 rounded-xl bg-[#FAF8F5] border border-[#E8DFD4] flex gap-1">
                  <button
                    type="button"
                    onClick={() => setQuantityScope("SPECIFIC_DATE")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      quantityScope === "SPECIFIC_DATE"
                        ? "bg-[#5C1B13] text-white shadow-xs"
                        : "text-[#6B584C] hover:text-[#1A1008]"
                    }`}
                  >
                    1. Specific Date
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantityScope("COMPLETE_PLAN")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      quantityScope === "COMPLETE_PLAN"
                        ? "bg-[#5C1B13] text-white shadow-xs"
                        : "text-[#6B584C] hover:text-[#1A1008]"
                    }`}
                  >
                    2. Complete Plan
                  </button>
                </div>

                {/* Specific Date Picker */}
                {quantityScope === "SPECIFIC_DATE" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1A1008] block">
                      Choose Delivery Date (Within Plan):
                    </label>
                    {deliveryData?.upcomingDeliveries && deliveryData.upcomingDeliveries.length > 0 ? (
                      <select
                        value={selectedTargetDate}
                        onChange={(e) => setSelectedTargetDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#D5C7B8] focus:border-[#5C1B13] text-xs font-semibold focus:outline-none bg-white"
                      >
                        <option value="">Select an upcoming delivery date</option>
                        {deliveryData.upcomingDeliveries.map((del, idx) => (
                          <option key={del.date || idx} value={del.date}>
                            {del.date} ({del.quantityLitres}L scheduled)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="date"
                        value={selectedTargetDate}
                        min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                        onChange={(e) => setSelectedTargetDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#D5C7B8] focus:border-[#5C1B13] text-xs font-semibold focus:outline-none"
                      />
                    )}
                  </div>
                )}

                {/* Quantity Chips */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1A1008] block">
                    {quantityScope === "SPECIFIC_DATE"
                      ? "Select Litres for this Delivery:"
                      : "Select Standing Daily Litres (All Future Deliveries):"}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setManageQuantity(qty)}
                        className={`py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                          manageQuantity === qty
                            ? "bg-[#5C1B13] text-white border-[#5C1B13] shadow-xs"
                            : "bg-[#FAF8F5] text-[#1A1008] border-[#E8DFD4] hover:bg-[#FAF3EA]"
                        }`}
                      >
                        {qty} Litre{qty > 1 ? "s" : ""}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Calculation Info Box */}
                <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD4] space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-[#6B584C]">
                    <span>Rate per Litre:</span>
                    <span className="font-mono font-bold text-[#1A1008]">₹90.00</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-[#E8DFD4]">
                    <span className="font-bold text-[#1A1008]">
                      {quantityScope === "SPECIFIC_DATE" ? "Delivery Total:" : "Daily Delivery Cost:"}
                    </span>
                    <span className="font-mono font-bold text-[#5C1B13] text-sm">
                      ₹{(manageQuantity * 90).toFixed(2)}
                      {quantityScope === "COMPLETE_PLAN" ? " / day" : ""}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8C7A6B]">
                    {quantityScope === "SPECIFIC_DATE"
                      ? "Applies to that specific morning delivery after admin approval."
                      : "Reconfigures all future upcoming deliveries in your monthly subscription."}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={manageLoading}
                  onClick={handlePlanQuantityChange}
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs font-bold cursor-pointer transition-all shadow-xs disabled:opacity-50"
                >
                  {manageLoading ? "Submitting Request..." : "Request Quantity Change"}
                </button>
              </div>
            )}

            {/* Modal Body: FREQUENCY with Custom Day 1 / Day 2 Pattern */}
            {manageModal === "FREQUENCY" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1A1008] block">Choose Recurrence:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setManageFrequency("DAILY")}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        manageFrequency === "DAILY"
                          ? "bg-[#FAF3EA] border-[#5C1B13] text-[#1A1008]"
                          : "bg-white border-[#E8DFD4] text-[#6B584C] hover:bg-[#FAF8F5]"
                      }`}
                    >
                      <p className="text-xs font-bold">Daily</p>
                      <p className="text-[10px] text-[#8C7A6B]">Every morning</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setManageFrequency("ALTERNATE_DAYS");
                        setManageCustomMode(false);
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        manageFrequency === "ALTERNATE_DAYS"
                          ? "bg-[#FAF3EA] border-[#5C1B13] text-[#1A1008]"
                          : "bg-white border-[#E8DFD4] text-[#6B584C] hover:bg-[#FAF8F5]"
                      }`}
                    >
                      <p className="text-xs font-bold">Alternate Days</p>
                      <p className="text-[10px] text-[#8C7A6B]">Every other morning</p>
                    </button>
                  </div>
                </div>

                {/* Custom Alternating Quantities Toggle (Daily only) */}
                {manageFrequency === "DAILY" && (
                <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD4] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#1A1008]">Custom Alternating Litres</p>
                      <p className="text-[10px] text-[#6B584C]">Different litres on Day 1 vs Day 2</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={manageCustomMode}
                      onChange={(e) => setManageCustomMode(e.target.checked)}
                      className="w-4 h-4 accent-[#5C1B13] cursor-pointer"
                    />
                  </div>

                  {manageCustomMode && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E8DFD4]">
                      <div>
                        <label className="text-[11px] font-bold text-[#1A1008] block mb-1">Day 1 Litres:</label>
                        <select
                          value={manageQtyA}
                          onChange={(e) => setManageQtyA(Number(e.target.value))}
                          className="w-full p-2 rounded-xl border border-[#D5C7B8] text-xs font-bold bg-white"
                        >
                          {[1, 2, 3, 4].map((q) => (
                            <option key={q} value={q}>{q} Litre{q > 1 ? "s" : ""}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#1A1008] block mb-1">Day 2 Litres:</label>
                        <select
                          value={manageQtyB}
                          onChange={(e) => setManageQtyB(Number(e.target.value))}
                          className="w-full p-2 rounded-xl border border-[#D5C7B8] text-xs font-bold bg-white"
                        >
                          {[1, 2, 3, 4].map((q) => (
                            <option key={q} value={q}>{q} Litre{q > 1 ? "s" : ""}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
                )}

                <button
                  type="button"
                  disabled={manageLoading}
                  onClick={handlePlanFrequencyChange}
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs font-bold cursor-pointer transition-all shadow-xs disabled:opacity-50"
                >
                  {manageLoading ? "Updating Schedule..." : "Confirm Schedule & Pattern"}
                </button>
              </div>
            )}

            {/* Modal Body: SKIP DELIVERY */}
            {manageModal === "SKIP" && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#1A1008] block">
                  Select Scheduled Morning Delivery to Skip:
                </label>
                {deliveryData?.upcomingDeliveries && deliveryData.upcomingDeliveries.length > 0 ? (
                  <select
                    value={manageSkipDate}
                    onChange={(e) => setManageSkipDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B8] focus:border-[#5C1B13] text-xs font-semibold focus:outline-none bg-white"
                  >
                    <option value="">Choose an upcoming date</option>
                    {deliveryData.upcomingDeliveries.map((del, idx) => (
                      <option key={del.date || idx} value={del.date}>
                        {del.date} ({del.quantityLitres}L)
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="date"
                    value={manageSkipDate}
                    min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                    onChange={(e) => setManageSkipDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#D5C7B8] focus:border-[#5C1B13] text-xs font-semibold focus:outline-none"
                  />
                )}
                <p className="text-[11px] text-[#6B584C]">
                  Skipping will cancel sunrise dispatch for that date. Your wallet will not be charged.
                </p>

                <button
                  type="button"
                  disabled={manageLoading || !manageSkipDate}
                  onClick={handlePlanSkipDelivery}
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs font-bold cursor-pointer transition-all shadow-xs disabled:opacity-50"
                >
                  {manageLoading ? "Skipping..." : "Confirm Skip Delivery"}
                </button>
              </div>
            )}

            {/* Modal Body: VACATION PAUSE */}
            {manageModal === "PAUSE" && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#1A1008] block">
                  Resume Delivery Date (Optional):
                </label>
                <input
                  type="date"
                  value={managePauseResumeDate}
                  min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                  onChange={(e) => setManagePauseResumeDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C7B8] focus:border-[#5C1B13] text-xs font-semibold focus:outline-none"
                />
                <p className="text-[11px] text-[#8C7A6B]">
                  Leave empty if you wish to pause indefinitely until you unpause manually from this page.
                </p>

                <button
                  type="button"
                  disabled={manageLoading}
                  onClick={handlePlanVacationPause}
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs font-bold cursor-pointer transition-all shadow-xs disabled:opacity-50"
                >
                  {manageLoading ? "Pausing Deliveries..." : "Confirm Vacation Pause"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

<MonthlyUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={() => loadData(true)}
        isMonthlyActive={activePlan?.planType === "MONTHLY"}
        deliveryStartTime={monthlyItem?.deliveryStartTime ?? deliveryStartTime}
        deliveryEndTime={monthlyItem?.deliveryEndTime ?? deliveryEndTime}
        orderCutoff={orderCutoff}
      />
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
        {label}
      </div>
      <div className="mt-1 text-[18px] sm:text-[20px] font-bold text-[var(--pf-text)] leading-tight">
        {value}
      </div>
      {sub && (
        <div className="text-[11px] text-[var(--pf-text-muted)] font-medium mt-0.5">
          {sub}
        </div>
      )}
    </div>
  );
}

function PlanSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Loading banner with brand spinner */}
      <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-[var(--pf-surface)] border border-[var(--pf-border)] text-xs sm:text-sm font-semibold text-[var(--pf-text-secondary)] shadow-sm">
        <div className="w-5 h-5 rounded-full border-2 border-[var(--pf-brown)] border-t-transparent animate-spin" />
        <span>Fetching your live milk plan & subscription schedule from server...</span>
      </div>

      {/* Main Active Plan Skeleton Hero Card */}
      <PfCard padding="lg" elevated>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-24 h-4 rounded-full bg-[var(--pf-surface-soft)] animate-pulse" />
            <div className="w-16 h-4 rounded-full bg-[var(--pf-surface-soft)] animate-pulse" />
          </div>
          <div className="w-3/5 h-8 rounded-xl bg-[var(--pf-surface-soft)] animate-pulse" />
          <div className="w-2/5 h-4 rounded-lg bg-[var(--pf-surface-soft)] animate-pulse" />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[var(--pf-border)]">
            <div className="space-y-2">
              <div className="w-20 h-3 rounded bg-[var(--pf-surface-soft)] animate-pulse" />
              <div className="w-28 h-6 rounded bg-[var(--pf-surface-soft)] animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="w-24 h-3 rounded bg-[var(--pf-surface-soft)] animate-pulse" />
              <div className="w-32 h-6 rounded bg-[var(--pf-surface-soft)] animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="w-28 h-3 rounded bg-[var(--pf-surface-soft)] animate-pulse" />
              <div className="w-36 h-6 rounded bg-[var(--pf-surface-soft)] animate-pulse" />
            </div>
          </div>
        </div>
      </PfCard>

      {/* 3 Change Plan Cards Skeleton */}
      <div className="space-y-4">
        <div className="w-36 h-6 rounded-lg bg-[var(--pf-surface-soft)] animate-pulse" />
        <div className="grid md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-3xl p-6 bg-[var(--pf-surface)] border border-[var(--pf-border)] space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="w-24 h-4 rounded-full bg-[var(--pf-surface-soft)] animate-pulse" />
                <div className="w-12 h-4 rounded-full bg-[var(--pf-surface-soft)] animate-pulse" />
              </div>
              <div className="w-3/4 h-6 rounded-lg bg-[var(--pf-surface-soft)] animate-pulse" />
              <div className="w-1/2 h-7 rounded-lg bg-[var(--pf-surface-soft)] animate-pulse" />
              <div className="space-y-2 pt-2">
                <div className="w-full h-3.5 rounded bg-[var(--pf-surface-soft)] animate-pulse" />
                <div className="w-5/6 h-3.5 rounded bg-[var(--pf-surface-soft)] animate-pulse" />
                <div className="w-4/5 h-3.5 rounded bg-[var(--pf-surface-soft)] animate-pulse" />
              </div>
              <div className="w-full h-10 rounded-2xl bg-[var(--pf-surface-soft)] animate-pulse mt-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
