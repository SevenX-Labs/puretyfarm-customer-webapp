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
import { CustomerHeader } from "@/components/pf/layout/CustomerHeader";
import { PfBadge, PfButton, PfCard, PfSectionTitle, PfSkeleton } from "@/components/pf";
import { manageDeliveryApi } from "@/features/delivery/api/manageDeliveryApi";
import {
  ManageDeliveryResponse,
  ActivePlanView,
  UpcomingDeliveryView,
} from "@/features/delivery/types";
import { plansApi, PlanOverviewItem, PlanQuote } from "@/features/plans/api/plansApi";
import { formatDeliveryDate } from "@/features/dashboard/utils";

function formatTimeSlot(time?: string | null): string {
  if (!time) return "";
  const [hStr, mStr] = time.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  if (isNaN(h)) return time;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function formatDeliveryWindow(start?: string | null, end?: string | null): string {
  const formattedStart = formatTimeSlot(start || "06:00");
  const formattedEnd = formatTimeSlot(end || "11:00");
  if (formattedStart && formattedEnd) {
    return `${formattedStart} – ${formattedEnd}`;
  }
  return "6:00 AM – 11:00 AM";
}

export function PlanView() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deliveryData, setDeliveryData] = useState<ManageDeliveryResponse | null>(null);
  const [plansOverview, setPlansOverview] = useState<PlanOverviewItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Upgrade to Monthly Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [modalFrequency, setModalFrequency] = useState<"DAILY" | "ALTERNATE_DAYS">("DAILY");
  const [modalPaymentMethod, setModalPaymentMethod] = useState<"WALLET" | "CASH">("WALLET");
  const [modalQuote, setModalQuote] = useState<PlanQuote | null>(null);
  const [modalQuoteLoading, setModalQuoteLoading] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [manageRes, overviewRes] = await Promise.allSettled([
        manageDeliveryApi.getManageDelivery(),
        plansApi.getPlansOverview(),
      ]);

      if (manageRes.status === "fulfilled" && manageRes.value?.activePlan) {
        setDeliveryData(manageRes.value);
      } else {
        setDeliveryData(null);
      }

      if (overviewRes.status === "fulfilled" && overviewRes.value?.plans) {
        setPlansOverview(overviewRes.value.plans);
      } else {
        setPlansOverview([]);
      }
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
  const deliveryStartTime =
    activePlan?.deliveryStartTime ||
    currentPlanConfig?.deliveryStartTime ||
    "06:00";
  const deliveryEndTime =
    activePlan?.deliveryEndTime ||
    currentPlanConfig?.deliveryEndTime ||
    "11:00";
  const activeDeliveryWindow = formatDeliveryWindow(deliveryStartTime, deliveryEndTime);

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

  // Pause / Resume handler for Monthly plan
  const handleTogglePause = async () => {
    if (!activePlan || activePlan.planType !== "MONTHLY") return;
    setUpdating(true);
    setError(null);
    try {
      if (activePlan.status === "PAUSED") {
        await manageDeliveryApi.pauseDelivery({});
        setActionSuccess("Subscription resumed successfully!");
      } else {
        const start = new Date();
        start.setDate(start.getDate() + 7);
        await manageDeliveryApi.pauseDelivery({
          resumeDate: start.toISOString().split("T")[0],
        });
        setActionSuccess("Deliveries paused for 7 days.");
      }
      await loadData(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update plan status";
      setError(msg);
    } finally {
      setUpdating(false);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  // Fetch Monthly Quote when upgrade modal opens or params change
  const fetchMonthlyQuote = async (
    qty: number,
    freq: "DAILY" | "ALTERNATE_DAYS"
  ) => {
    setModalQuoteLoading(true);
    setModalError(null);
    try {
      const quote = await plansApi.createMonthlyQuote({
        frequency: freq,
        quantityMode: "FIXED",
        quantity: qty,
      });
      setModalQuote(quote);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not fetch quote from server";
      setModalError(msg);
    } finally {
      setModalQuoteLoading(false);
    }
  };

  const openUpgradeModal = () => {
    setShowUpgradeModal(true);
    setModalError(null);
    setModalSuccess(null);
    fetchMonthlyQuote(modalQuantity, modalFrequency);
  };

  const handleConfirmUpgrade = async () => {
    if (!modalQuote) return;
    setModalSubmitting(true);
    setModalError(null);
    try {
      const res = await plansApi.confirmPlanQuote({
        quoteId: modalQuote.quoteId,
        paymentMethod: modalPaymentMethod,
      });

      if (res.status === "CONFIRMED" || res.selectionId) {
        setModalSuccess("Successfully upgraded to Monthly Subscription!");
        setTimeout(() => {
          setShowUpgradeModal(false);
          loadData(true);
        }, 1200);
      } else {
        setModalError(res.message || "Failed to confirm plan. Please check wallet balance or choose cash.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to confirm upgrade";
      setModalError(msg);
    } finally {
      setModalSubmitting(false);
    }
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
                      label="Price Paid"
                      value={
                        activePlan.planType === "BUY_ONCE"
                          ? "₹80.00"
                          : activePlan.planType === "SEVEN_DAY_TRIAL" || activePlan.planType === "TRIAL"
                          ? "₹525.00"
                          : "₹2,250.00"
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
                          onClick={handleTogglePause}
                          loading={updating}
                          variant={activePlan.status === "PAUSED" ? "primary" : "secondary"}
                        >
                          {activePlan.status === "PAUSED" ? (
                            <>
                              <Play size={15} strokeWidth={2} />
                              Resume
                            </>
                          ) : (
                            <>
                              <Pause size={15} strokeWidth={2} />
                              Pause
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
                      <span>Doorstep delivery ({activeDeliveryWindow})</span>
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
                    Select a plan below to start your sunrise milk deliveries ({activeDeliveryWindow}).
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
                        Morning drop ({formatDeliveryWindow(trialItem?.deliveryStartTime, trialItem?.deliveryEndTime)})
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
                        Daily delivery ({formatDeliveryWindow(monthlyItem?.deliveryStartTime, monthlyItem?.deliveryEndTime)})
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
                        Morning drop ({formatDeliveryWindow(buyOnceItem?.deliveryStartTime, buyOnceItem?.deliveryEndTime)})
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

      {/* Upgrade to Monthly Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[var(--pf-border)] shadow-2xl p-4.5 sm:p-7 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--pf-border)]">
              <div>
                <h3 className="text-lg font-bold text-[#1A1008] flex items-center gap-2">
                  <Sparkles size={18} className="text-[#5C1B13]" />
                  Upgrade to Monthly Plan
                </h3>
                <p className="text-xs text-[#8C7A6B] mt-0.5">
                  Configure your daily morning milk deliveries ({activeDeliveryWindow})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {modalSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span className="font-semibold">{modalSuccess}</span>
              </div>
            )}

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Daily Litres Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1A1008] block">
                Daily Quantity:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => {
                      setModalQuantity(qty);
                      fetchMonthlyQuote(qty, modalFrequency);
                    }}
                    className={
                      "py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer " +
                      (modalQuantity === qty
                        ? "bg-[#5C1B13] text-white border-[#5C1B13] shadow-sm"
                        : "bg-white text-[#1A1008] border-[#E8DFD4] hover:border-[#5C1B13]/40")
                    }
                  >
                    {qty} Litre{qty > 1 ? "s" : ""} / morning
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1A1008] block">
                Delivery Schedule:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { val: "DAILY" as const, label: "Daily (Every Morning)" },
                  { val: "ALTERNATE_DAYS" as const, label: "Alternate Days" },
                ].map((freq) => (
                  <button
                    key={freq.val}
                    type="button"
                    onClick={() => {
                      setModalFrequency(freq.val);
                      fetchMonthlyQuote(modalQuantity, freq.val);
                    }}
                    className={
                      "py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer " +
                      (modalFrequency === freq.val
                        ? "bg-[#5C1B13] text-white border-[#5C1B13] shadow-sm"
                        : "bg-white text-[#1A1008] border-[#E8DFD4] hover:border-[#5C1B13]/40")
                    }
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Server Quote Breakdown */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD4] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#8C7A6B]">
                <span className="font-semibold">Live Server Quote:</span>
                {modalQuoteLoading && <RefreshCw size={12} className="animate-spin text-[#5C1B13]" />}
              </div>

              {modalQuote ? (
                <>
                  <div className="flex justify-between items-center text-[#6B584C]">
                    <span>Monthly Deliveries:</span>
                    <span className="font-mono font-bold text-[#1A1008]">
                      {modalQuote.deliveryOccurrences} mornings ({modalQuote.totalLitres} Litres)
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[#6B584C]">
                    <span>Rate per Litre:</span>
                    <span className="font-mono font-bold text-[#1A1008]">
                      ₹{(modalQuote.sellingPricePerLitre / 100).toFixed(0)} / L
                    </span>
                  </div>
                  {modalQuote.discountAmount > 0 && (
                    <div className="flex justify-between items-center text-emerald-700 font-semibold">
                      <span>Monthly Discount:</span>
                      <span className="font-mono">
                        - ₹{(modalQuote.discountAmount / 100).toFixed(0)}
                      </span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-[#E8DFD4] flex justify-between items-baseline">
                    <span className="font-bold text-[#1A1008]">Total Plan Amount:</span>
                    <span className="text-lg font-black font-mono text-[#5C1B13]">
                      ₹{(modalQuote.totalSellingAmount / 100).toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="py-2 text-center text-[#8C7A6B]">
                  Calculating live server quote...
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1A1008] block">
                Payment Method:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setModalPaymentMethod("WALLET")}
                  className={
                    "py-2.5 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer " +
                    (modalPaymentMethod === "WALLET"
                      ? "bg-[#5C1B13] text-white border-[#5C1B13] shadow-sm"
                      : "bg-white text-[#1A1008] border-[#E8DFD4] hover:border-[#5C1B13]/40")
                  }
                >
                  <CreditCard size={14} />
                  <span>Prepaid Wallet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalPaymentMethod("CASH")}
                  className={
                    "py-2.5 px-3 rounded-2xl text-xs font-bold border flex items-center justify-center gap-2 transition-all cursor-pointer " +
                    (modalPaymentMethod === "CASH"
                      ? "bg-[#5C1B13] text-white border-[#5C1B13] shadow-sm"
                      : "bg-white text-[#1A1008] border-[#E8DFD4] hover:border-[#5C1B13]/40")
                  }
                >
                  <DollarSign size={14} />
                  <span>Doorstep Cash</span>
                </button>
              </div>
            </div>

            {/* Confirm CTA */}
            <button
              type="button"
              disabled={modalSubmitting || modalQuoteLoading || !modalQuote}
              onClick={handleConfirmUpgrade}
              className="w-full py-3 rounded-2xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm disabled:opacity-50"
            >
              {modalSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Activating Monthly Plan...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>Confirm & Activate Monthly Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
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
    <div className="space-y-10">
      <PfCard padding="lg">
        <PfSkeleton height={14} width={100} />
        <PfSkeleton className="mt-3" height={36} width="50%" />
        <PfSkeleton className="mt-2" height={16} width="35%" />
        <div className="mt-6 grid sm:grid-cols-3 gap-5 pt-6 border-t border-[var(--pf-border)]">
          <PfSkeleton height={40} />
          <PfSkeleton height={40} />
          <PfSkeleton height={40} />
        </div>
      </PfCard>
      <div className="grid md:grid-cols-3 gap-5">
        <PfCard padding="md"><PfSkeleton height={180} /></PfCard>
        <PfCard padding="md"><PfSkeleton height={180} /></PfCard>
        <PfCard padding="md"><PfSkeleton height={180} /></PfCard>
      </div>
    </div>
  );
}
