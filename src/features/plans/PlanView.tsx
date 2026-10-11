"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Receipt,
  Pause,
  Play,
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
} from "lucide-react";
import { MonthlyUpgradeModal } from "./components/MonthlyUpgradeModal";
import { SubscriptionStatusCard } from "./components/SubscriptionStatusCard";
import { UpcomingDeliveriesList } from "./components/UpcomingDeliveriesList";
import { CustomerHeader } from "@/components/pf/layout/CustomerHeader";
import { PfBadge, PfButton, PfCard, PfSectionTitle, PfSkeleton } from "@/components/pf";
import { manageDeliveryApi } from "@/features/delivery/api/manageDeliveryApi";
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deliveryData, setDeliveryData] = useState<ManageDeliveryResponse | null>(null);
  const [plansOverview, setPlansOverview] = useState<PlanOverviewItem[]>([]);
  const [orderCutoff, setOrderCutoff] = useState<OrderCutoffPolicy | null>(null);
  const [subscription, setSubscription] = useState<CustomerSubscriptionSummary | null>(null);
  const [changeRequests, setChangeRequests] = useState<DeliveryRequestItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Upgrade to Monthly Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [monthlyConfig, setMonthlyConfig] = useState<any>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [manageRes, overviewRes, monthlyRes, requestsRes] = await Promise.allSettled([
        manageDeliveryApi.getManageDelivery(),
        plansApi.getPlansOverview(),
        plansApi.getMonthlyConfig(),
        manageDeliveryApi.getRequests(),
      ]);

      if (manageRes.status === "fulfilled" && manageRes.value?.activePlan) {
        setDeliveryData(manageRes.value);
      } else {
        setDeliveryData(null);
      }

      if (overviewRes.status === "fulfilled" && overviewRes.value?.plans) {
        setPlansOverview(overviewRes.value.plans);
        setOrderCutoff(overviewRes.value.orderCutoff ?? null);
        setSubscription(overviewRes.value.subscription ?? null);
      } else {
        setPlansOverview([]);
        setOrderCutoff(null);
        setSubscription(null);
      }

      if (monthlyRes.status === "fulfilled" && monthlyRes.value) {
        setMonthlyConfig(monthlyRes.value);
      }

      // Pending requests drive the "requested, awaiting approval" affordances
      // so a submitted change is never mistaken for an applied one.
      setChangeRequests(
        requestsRes.status === "fulfilled" ? requestsRes.value?.data ?? [] : []
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load plan details";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activePlan: ActivePlanView | undefined = deliveryData?.activePlan;
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
  const hasPendingPauseOrResume = pendingRequests.some(
    (r) => r.type === "PAUSE" || r.type === "RESUME"
  );
  // Most recent decided request, so a rejection and its admin note stay
  // visible to the customer rather than vanishing silently.
  const lastDecidedRequest = changeRequests.find(
    (r) => r.status === "REJECTED" || r.status === "APPROVED"
  );

  // Server Invariants:
  // 1. If Buy Once used -> Trial blocked: "BUY_ONCE_ALREADY_USED"
  // 2. If Trial used -> Buy Once blocked: "TRIAL_ALREADY_USED"
  // 3. SEVEN_DAY_TRIAL is one-time only: "TRIAL_ALREADY_USED"
  // 4. BUY_ONCE is single sample: "MAX_USES_REACHED"
  const isTrialBlockedByBuyOnce =
    trialItem?.blockedReason === "BUY_ONCE_ALREADY_USED" ||
    activePlan?.planType === "BUY_ONCE";

  const isBuyOnceBlockedByTrial =
    buyOnceItem?.blockedReason === "TRIAL_ALREADY_USED" ||
    activePlan?.planType === "SEVEN_DAY_TRIAL" ||
    activePlan?.planType === "TRIAL";

  const isTrialUsed =
    trialItem?.blockedReason === "TRIAL_ALREADY_USED" || trialItem?.used === true;

  const isBuyOnceLimitReached =
    buyOnceItem?.blockedReason === "MAX_USES_REACHED" ||
    (!buyOnceItem?.available && activePlan?.planType !== "BUY_ONCE");

  /**
   * Submits a pause or resume REQUEST for admin review.
   *
   * Both are approval-gated server-side, so the plan keeps running until an
   * admin decides. Two bugs fixed here: resuming used to call the *pause*
   * endpoint (which skipped every remaining delivery), and both branches
   * claimed success as though the change had already taken effect.
   */
  const handleTogglePause = async () => {
    if (!activePlan || activePlan.planType !== "MONTHLY") return;
    const isPaused = activePlan.status === "PAUSED";
    setUpdating(true);
    setError(null);
    try {
      const res = isPaused
        ? await manageDeliveryApi.resumeDelivery()
        : await manageDeliveryApi.pauseDelivery({});
      // Prefer the server's own wording; it is the authority on what happened.
      setActionSuccess(
        res?.message ||
          (isPaused
            ? "Resume request submitted. Your plan stays paused until an admin approves it."
            : "Pause request submitted. Deliveries continue as normal until an admin approves it.")
      );
      await loadData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit the request";
      setError(msg);
    } finally {
      setUpdating(false);
      setTimeout(() => setActionSuccess(null), 6000);
    }
  };

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
                        activePlan.status === "CONFIRMED" || activePlan.status === "ACTIVE"
                          ? "success"
                          : activePlan.status === "PAUSED"
                          ? "warning"
                          : "neutral"
                      }
                    >
                      {activePlan.status === "PAUSED" ? "Paused" : "Active"}
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
                      (activePlan.quantityLitres || 1) + "L Daily (30L / mo)"}
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
                        subscription
                          ? formatCurrency(
                              (subscription.billingModel === "PER_DELIVERY"
                                ? subscription.chargedPaise
                                : subscription.expectedTotalPaise) / 100
                            )
                          : "—"
                      }
                      sub={
                        subscription?.billingModel === "PER_DELIVERY"
                          ? "Charged per delivered order"
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
                        {/* Labelled as a request: both actions go to admin
                            review and change nothing until approved. Disabled
                            while a decision is outstanding so the customer
                            cannot queue contradictory requests. */}
                        <PfButton
                          onClick={handleTogglePause}
                          loading={updating}
                          disabled={updating || hasPendingPauseOrResume}
                          variant={activePlan.status === "PAUSED" ? "primary" : "secondary"}
                        >
                          {activePlan.status === "PAUSED" ? (
                            <>
                              <Play size={15} strokeWidth={2} />
                              {hasPendingPauseOrResume
                                ? "Resume Requested"
                                : "Request Resume"}
                            </>
                          ) : (
                            <>
                              <Pause size={15} strokeWidth={2} />
                              {hasPendingPauseOrResume
                                ? "Pause Requested"
                                : "Request Pause"}
                            </>
                          )}
                        </PfButton>
                        <PfButton onClick={openUpgradeModal} variant="secondary">
                          <Sliders size={15} strokeWidth={2} />
                          Modify Subscription
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
                    : isTrialBlockedByBuyOnce || isTrialUsed
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
                    ) : null}
                  </div>

                  <h3 className="text-[20px] font-bold text-[var(--pf-text)] leading-snug">
                    7-Day Trial Plan
                  </h3>
                  <div className="mt-2 text-[22px] font-black text-[var(--pf-brown)]">
                    ₹525
                    <span className="text-xs font-normal text-[var(--pf-text-muted)] ml-1">
                      / 7 days (₹75/L)
                    </span>
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
                    ₹2,250
                    <span className="text-xs font-normal text-[var(--pf-text-muted)] ml-1">
                      / mo (₹75/L)
                    </span>
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
                    : isBuyOnceBlockedByTrial || isBuyOnceLimitReached
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
                      <PfBadge tone="neutral">Unavailable</PfBadge>
                    ) : isBuyOnceLimitReached ? (
                      <PfBadge tone="neutral">Limit Reached</PfBadge>
                    ) : null}
                  </div>

                  <h3 className="text-[20px] font-bold text-[var(--pf-text)] leading-snug">
                    Buy Once (1 Litre)
                  </h3>
                  <div className="mt-2 text-[22px] font-black text-[var(--pf-brown)]">
                    ₹80
                    <span className="text-xs font-normal text-[var(--pf-text-muted)] ml-1">
                      / sample
                    </span>
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
