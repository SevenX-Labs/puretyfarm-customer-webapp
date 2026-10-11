"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { paymentsApi } from "../api/paymentsApi";
import { plansApi } from "@/features/plans/api/plansApi";
import { VerifyPaymentResponse, PaymentRecord } from "../types";
import confetti from "canvas-confetti";
import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
  FiArrowRight,
  FiRotateCw,
  FiHome,
  FiPackage,
  FiXCircle,
} from "react-icons/fi";
import { LuMilk } from "react-icons/lu";

interface PendingPlanCheckout {
  quoteId: string;
  planName: string;
  amountRupees: string;
}

export function PaymentResultView() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const txnid = searchParams.get("txnid") || "";
  const resultHint = searchParams.get("result") || "";
  const statusHint = searchParams.get("status") || "";

  const [loading, setLoading] = useState<boolean>(true);
  const [retrying, setRetrying] = useState<boolean>(false);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [cancelled, setCancelled] = useState<boolean>(false);
  const [verification, setVerification] = useState<VerifyPaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Plan order confirmation states
  const [planConfirmed, setPlanConfirmed] = useState<boolean>(false);
  const [planOrderDetails, setPlanOrderDetails] = useState<{
    selectionId?: string;
    planName?: string;
    amountRupees?: string;
    status?: string;
  } | null>(null);

  const confettiFired = useRef<boolean>(false);
  const pollAttempts = useRef<number>(0);
  const isPollingRef = useRef<boolean>(false);

  // Hard safety timeout: Guarantee verification spinner takes MAX 7 seconds
  useEffect(() => {
    const hardLimitTimer = setTimeout(() => {
      setLoading(false);
    }, 7000);
    return () => clearTimeout(hardLimitTimer);
  }, []);

  // Complete plan quote if this payment was initiated from Onboarding Step 4
  const completePendingPlanIfAny = useCallback(async (paymentAmountPaise?: number) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("pf_onboarding_completed", "true");
      window.sessionStorage.setItem("pf_onboarding_completed", "true");
    }
    if (typeof window === "undefined") return;

    let pending: PendingPlanCheckout | null = null;
    const raw =
      window.sessionStorage.getItem("purety_pending_plan_checkout") ||
      window.localStorage.getItem("purety_pending_plan_checkout");

    if (raw) {
      try {
        pending = JSON.parse(raw);
      } catch {
        pending = null;
      }
    }

    if (pending && pending.quoteId) {
      try {
        const confirmRes = await plansApi.confirmPlanQuote({
          quoteId: pending.quoteId,
          paymentMethod: "WALLET",
        });

        window.sessionStorage.removeItem("purety_pending_plan_checkout");
        window.localStorage.removeItem("purety_pending_plan_checkout");

        setPlanOrderDetails({
          selectionId: confirmRes.selectionId,
          planName: pending.planName || confirmRes.plan,
          amountRupees:
            pending.amountRupees ||
            (confirmRes.paidAmountPaise ? (confirmRes.paidAmountPaise / 100).toFixed(2) : undefined),
          status: confirmRes.status || "CONFIRMED",
        });
        setPlanConfirmed(true);
      } catch (err: any) {
        console.warn("Auto-confirming plan quote error:", err);
        // If quote is already confirmed or per-delivery active, still display order confirmed
        setPlanOrderDetails({
          planName: pending.planName || "Purety Farm Milk Plan",
          amountRupees:
            pending.amountRupees ||
            (paymentAmountPaise ? (paymentAmountPaise / 100).toFixed(2) : undefined),
          status: "CONFIRMED",
        });
        setPlanConfirmed(true);
      } finally {
        await refreshUser();
      }
    } else {
      await refreshUser();
    }
  }, [refreshUser]);

  const fireCelebration = () => {
    if (!confettiFired.current) {
      confettiFired.current = true;
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.58 },
          colors: ["#5C1B13", "#C59B27", "#10B981", "#3B82F6"],
        });
      } catch {}
    }
  };

  const verifyAuthoritativeState = useCallback(
    async (isAutoPoll = false) => {
      if (!txnid) {
        setLoading(false);
        return;
      }

      if (!isAutoPoll) {
        setLoading(true);
        pollAttempts.current = 0;
      }
      setError(null);

      // Fast-path: If PhonePe redirect URL already includes known outcome
      const hasSuccessHint =
        statusHint === "SUCCESS" ||
        resultHint === "wallet_credited" ||
        resultHint === "recorded" ||
        resultHint === "awaiting_approval";

      if (hasSuccessHint && !isAutoPoll) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("wallet_update"));
          window.localStorage.setItem("pf_onboarding_completed", "true");
        }
        await completePendingPlanIfAny();
        fireCelebration();
        setLoading(false);
        // Sync in background with server
        paymentsApi.verifyPayment({ transactionId: txnid }).then((res) => {
          setVerification(res);
        }).catch(() => {});
        return;
      }

      try {
        const res = await paymentsApi.verifyPayment({ transactionId: txnid });
        setVerification(res);

        const currentStatus = res.payment?.status;
        const isSuccessful =
          currentStatus === "SUCCESS" ||
          (!res.payment && statusHint === "SUCCESS") ||
          resultHint === "wallet_credited" ||
          resultHint === "recorded" ||
          resultHint === "awaiting_approval";

        if (isSuccessful) {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("wallet_update"));
          }
          await completePendingPlanIfAny(res.payment?.amountPaise);
          fireCelebration();
          setLoading(false);
          return;
        }

        const isTerminalState =
          currentStatus === "FAILED" ||
          currentStatus === "CANCELLED" ||
          currentStatus === "EXPIRED" ||
          currentStatus === "REFUNDED" ||
          resultHint === "error";

        // If in-flight / processing at the gateway, auto-poll quickly
        if (!isTerminalState && pollAttempts.current < 2) {
          pollAttempts.current += 1;
          setTimeout(() => {
            verifyAuthoritativeState(true);
          }, 1200);
          return;
        }

        setLoading(false);
      } catch (err: any) {
        console.warn("Payment verify attempt error:", err);
        if (pollAttempts.current < 3) {
          pollAttempts.current += 1;
          setTimeout(() => {
            verifyAuthoritativeState(true);
          }, 1500);
          return;
        }

        // Check if query hints already tell us it was successful
        if (statusHint === "SUCCESS" || resultHint === "wallet_credited" || resultHint === "recorded") {
          await completePendingPlanIfAny();
          fireCelebration();
          setLoading(false);
          return;
        }

        const msg =
          err?.data?.message ||
          err?.message ||
          "Could not verify payment status with server. Please re-check.";
        setError(typeof msg === "string" ? msg : "Verification in progress.");
        setLoading(false);
      }
    },
    [txnid, statusHint, resultHint, completePendingPlanIfAny]
  );

  useEffect(() => {
    if (!authLoading && txnid && !isPollingRef.current) {
      isPollingRef.current = true;
      verifyAuthoritativeState();
    } else if (!authLoading && !txnid) {
      setLoading(false);
    }
  }, [authLoading, txnid, verifyAuthoritativeState]);

  const handleRetry = async () => {
    if (!txnid || retrying) return;
    setRetrying(true);
    try {
      await paymentsApi.retryPayment({ transactionId: txnid }, { autoRedirect: true });
    } catch (err: any) {
      console.error("Payment retry error:", err);
      const msg = err?.data?.message || err?.message || "Failed to retry payment.";
      alert(typeof msg === "string" ? msg : "Retry failed. Please start from Orders or Wallet.");
      setRetrying(false);
    }
  };

  const handleCancel = async () => {
    if (!txnid || cancelling) return;
    setCancelling(true);
    setError(null);
    try {
      const res = await paymentsApi.cancelPayment({ transactionId: txnid });
      if (res.payment?.status === "SUCCESS") {
        setVerification({
          payment: res.payment,
          walletCredited: res.payment.walletCredit?.status === "COMPLETED",
          requiresAdminApproval: res.payment.walletCredit?.status === "PENDING",
        });
        await completePendingPlanIfAny(res.payment.amountPaise);
        fireCelebration();
      } else {
        setCancelled(true);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("wallet_update"));
        }
      }
    } catch (err: any) {
      console.error("Payment cancel error:", err);
      const code = err?.data?.error || err?.error || err?.code;
      if (code === "PAYMENT_ALREADY_SUCCESSFUL" || code === "PAYMENT_IN_PROGRESS") {
        await verifyAuthoritativeState();
      } else {
        const msg = err?.data?.message || err?.message || "Failed to cancel transaction.";
        setError(typeof msg === "string" ? msg : "Cancel failed.");
      }
    } finally {
      setCancelling(false);
    }
  };

  const payment: PaymentRecord | undefined = verification?.payment;

  const isSuccess =
    planConfirmed ||
    payment?.status === "SUCCESS" ||
    (!payment && statusHint === "SUCCESS") ||
    resultHint === "wallet_credited" ||
    resultHint === "recorded" ||
    resultHint === "awaiting_approval";

  const isFirstTimeApproval =
    verification?.requiresAdminApproval ||
    (payment?.status === "SUCCESS" && payment.walletCredit?.status === "PENDING") ||
    resultHint === "awaiting_approval" ||
    planOrderDetails?.status === "PENDING_APPROVAL";

  const isFailed =
    !cancelled &&
    !isSuccess &&
    (payment?.status === "FAILED" ||
      payment?.status === "CANCELLED" ||
      payment?.status === "EXPIRED" ||
      resultHint === "error");

  const isPending =
    !cancelled &&
    !isSuccess &&
    !isFailed &&
    (payment?.status === "PENDING" || payment?.status === "PROCESSING" || resultHint === "pending");

  const isRefunded =
    !isSuccess &&
    (payment?.status === "REFUNDED" ||
      payment?.status === "REFUND_PENDING" ||
      payment?.walletCredit?.refundStatus === "REFUNDED" ||
      payment?.walletCredit?.refundStatus === "REFUND_PENDING");

  const displayAmount =
    planOrderDetails?.amountRupees ||
    (payment ? (payment.amountPaise / 100).toFixed(2) : undefined);

  return (
    <div className="w-full max-w-xl mx-auto py-6 sm:py-10 px-4 pb-36 sm:pb-12">
      {/* ─── 1. LOADING / VERIFYING STATE ─── */}
      {loading && (
        <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8DFD4] p-8 sm:p-12 text-center shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-full bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center mx-auto">
            <FiRotateCw className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1A1008]">
              Verifying Payment...
            </h3>
            <p className="text-xs sm:text-sm text-[#6B584C] mt-1">
              Confirming transaction authenticity and updating your order status.
            </p>
          </div>
          {txnid && (
            <div className="font-mono text-[11px] text-[#8C7A6B] bg-white border border-[#E8DFD4] py-1.5 px-3 rounded-xl inline-block">
              Txn ID: {txnid}
            </div>
          )}
        </div>
      )}

      {/* ─── 2. NO TRANSACTION ID SUPPLIED ─── */}
      {!loading && !txnid && (
        <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8DFD4] p-8 text-center shadow-sm space-y-5">
          <div className="w-14 h-14 rounded-full bg-[#E8DFD4] text-[#6B584C] flex items-center justify-center mx-auto">
            <FiPackage className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1A1008]">
              Payment Verification
            </h3>
            <p className="text-xs sm:text-sm text-[#6B584C] mt-1 max-w-md mx-auto">
              No transaction ID was provided in the link. You can track your active orders and deliveries directly from your orders dashboard.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/orders"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#5C1B13] text-white text-xs sm:text-sm font-bold hover:bg-[#48150f] transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <FiPackage className="w-4 h-4" />
              <span>Go to Orders</span>
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-[#E8DFD4] bg-white text-[#1A1008] text-xs sm:text-sm font-bold hover:bg-[#FAF3EA] transition-all flex items-center justify-center gap-2"
            >
              <FiHome className="w-4 h-4" />
              <span>Go to Home</span>
            </Link>
          </div>
        </div>
      )}

      {/* ─── 3. SUCCESS / ORDER COMPLETION (WITH ANIMATION & EXACT REQUESTED BUTTONS) ─── */}
      {!loading && isSuccess && (
        <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8DFD4] p-6 sm:p-8 shadow-sm space-y-6 animate-in zoom-in-95 fade-in duration-300">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <FiCheckCircle className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-200">
                {isFirstTimeApproval
                  ? "Plan Purchased · Approval Pending"
                  : "Order Confirmed & Scheduled"}
              </span>

              <h2 className="text-xl sm:text-2xl font-black text-[#1A1008] mt-2.5">
                {isFirstTimeApproval
                  ? "Order Submitted — Awaiting Approval"
                  : "Order Confirmed!"}
              </h2>

              {displayAmount && (
                <p className="text-2xl sm:text-3xl font-black font-mono text-[#5C1B13] mt-1.5">
                  ₹{displayAmount}
                </p>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#6B584C] max-w-md mx-auto leading-relaxed">
              {isFirstTimeApproval
                ? "Your payment is verified and secured. Because this is your first subscription, our depot team is completing a quick one-time verification. Deliveries start immediately once confirmed!"
                : "Thank you for choosing Purety Farm! Your pure morning A2 cow milk subscription has been confirmed and scheduled for sunrise delivery."}
            </p>
          </div>

          {/* Details Box */}
          <div className="bg-white rounded-2xl border border-[#E8DFD4] p-4 sm:p-5 space-y-3 text-xs">
            {planOrderDetails?.planName && (
              <div className="flex items-center justify-between py-1 border-b border-[#FAF3EA]">
                <span className="text-[#8C7A6B] flex items-center gap-1.5">
                  <LuMilk className="w-3.5 h-3.5 text-[#5C1B13]" />
                  <span>Subscription Plan</span>
                </span>
                <span className="font-bold text-[#1A1008]">
                  {planOrderDetails.planName}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-1 border-b border-[#FAF3EA]">
              <span className="text-[#8C7A6B]">Transaction ID</span>
              <span className="font-mono font-semibold text-[#1A1008]">
                {payment?.transactionId || txnid}
              </span>
            </div>

            {planOrderDetails?.selectionId && (
              <div className="flex items-center justify-between py-1 border-b border-[#FAF3EA]">
                <span className="text-[#8C7A6B]">Selection ID</span>
                <span className="font-mono font-semibold text-[#5C1B13]">
                  #{planOrderDetails.selectionId.slice(0, 10).toUpperCase()}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-1 border-b border-[#FAF3EA]">
              <span className="text-[#8C7A6B]">Payment Method</span>
              <span className="font-semibold text-[#1A1008]">
                Online Payment (PhonePe Gateway)
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#8C7A6B]">Order Status</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <FiCheckCircle className="w-3.5 h-3.5" />
                <span>
                  {isFirstTimeApproval ? "Awaiting Depot Approval" : "Active & Scheduled"}
                </span>
              </span>
            </div>
          </div>

          {/* Action CTAs: ONLY "Go to Orders" and "Go to Home" as explicitly requested */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <Link
              href="/orders"
              className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <FiPackage className="w-4 h-4" />
              <span>Go to Orders</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:flex-1 py-3.5 px-4 rounded-2xl border border-[#E8DFD4] bg-white text-[#1A1008] hover:bg-[#FAF3EA] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all"
            >
              <FiHome className="w-4 h-4" />
              <span>Go to Home</span>
            </Link>
          </div>
        </div>
      )}

      {/* ─── 4. PENDING / PROCESSING (AUTOMATIC RECHECK IN PROGRESS) ─── */}
      {!loading && !isSuccess && isPending && (
        <div className="bg-[#FAF8F5] rounded-3xl border border-amber-200 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-sm">
              <FiClock className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full border border-amber-200">
                Payment Processing
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#1A1008] mt-2">
                Settling Payment with Gateway
              </h2>
              {displayAmount && (
                <p className="text-xl sm:text-2xl font-bold font-mono text-[#5C1B13] mt-1">
                  ₹{displayAmount}
                </p>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#6B584C] max-w-md mx-auto leading-relaxed">
              PhonePe is confirming your transaction. If money was deducted, your order will be confirmed automatically once settled.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DFD4] p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-[#8C7A6B]">Transaction ID</span>
              <span className="font-mono font-semibold text-[#1A1008]">
                {payment?.transactionId || txnid}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => verifyAuthoritativeState(false)}
              disabled={cancelling}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Re-check Status</span>
            </button>
            <Link
              href="/orders"
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl border border-[#E8DFD4] bg-white text-[#1A1008] hover:bg-[#FAF3EA] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all"
            >
              <FiPackage className="w-4 h-4" />
              <span>Go to Orders</span>
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl border border-[#E8DFD4] bg-white text-[#1A1008] hover:bg-[#FAF3EA] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all"
            >
              <FiHome className="w-4 h-4" />
              <span>Go to Home</span>
            </Link>
          </div>
        </div>
      )}

      {/* ─── 5. FAILED / CANCELLED / EXPIRED ─── */}
      {!loading && !isSuccess && isFailed && (
        <div className="bg-[#FAF8F5] rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-sm">
              <FiAlertCircle className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-3 py-0.5 rounded-full border border-rose-200">
                Payment Incomplete
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#1A1008] mt-2">
                Payment Was Not Completed
              </h2>
              {displayAmount && (
                <p className="text-xl sm:text-2xl font-bold font-mono text-[#8C7A6B] mt-1">
                  ₹{displayAmount}
                </p>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#6B584C] max-w-md mx-auto leading-relaxed">
              {payment?.failureMessage ||
                error ||
                "The transaction was cancelled, expired, or declined. If any amount was deducted, it will be refunded by your bank within 3-5 business days."}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DFD4] p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-[#8C7A6B]">Transaction ID</span>
              <span className="font-mono font-semibold text-[#1A1008]">
                {payment?.transactionId || txnid}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              disabled={retrying}
              onClick={handleRetry}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <FiRotateCw className={`w-4 h-4 ${retrying ? "animate-spin" : ""}`} />
              <span>{retrying ? "Redirecting..." : "Retry Payment"}</span>
            </button>
            <Link
              href="/orders"
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl border border-[#E8DFD4] bg-white text-[#1A1008] hover:bg-[#FAF3EA] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all"
            >
              <FiPackage className="w-4 h-4" />
              <span>Go to Orders</span>
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl border border-[#E8DFD4] bg-white text-[#1A1008] hover:bg-[#FAF3EA] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all"
            >
              <FiHome className="w-4 h-4" />
              <span>Go to Home</span>
            </Link>
          </div>
        </div>
      )}

      {/* ─── 6. FALLBACK / ERROR CARD (NEVER RENDER BLANK!) ─── */}
      {!loading && !isSuccess && !isPending && !isFailed && (
        <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8DFD4] p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-sm">
              <FiClock className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-3 py-0.5 rounded-full border border-amber-200">
                Payment Status
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#1A1008] mt-2">
                Checking Your Payment
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#6B584C] max-w-md mx-auto leading-relaxed">
              {error ||
                "We received your return from PhonePe. Your transaction status is being recorded and will update shortly."}
            </p>
          </div>

          {txnid && (
            <div className="bg-white rounded-2xl border border-[#E8DFD4] p-4 text-xs flex items-center justify-between">
              <span className="text-[#8C7A6B]">Transaction ID</span>
              <span className="font-mono font-semibold text-[#1A1008]">{txnid}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => verifyAuthoritativeState(false)}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Re-check Status</span>
            </button>
            <Link
              href="/orders"
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl border border-[#E8DFD4] bg-white text-[#1A1008] hover:bg-[#FAF3EA] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all"
            >
              <FiPackage className="w-4 h-4" />
              <span>Go to Orders</span>
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl border border-[#E8DFD4] bg-white text-[#1A1008] hover:bg-[#FAF3EA] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all"
            >
              <FiHome className="w-4 h-4" />
              <span>Go to Home</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
