"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { paymentsApi } from "../api/paymentsApi";
import { VerifyPaymentResponse, PaymentRecord } from "../types";
import confetti from "canvas-confetti";
import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
  FiArrowRight,
  FiShield,
  FiRotateCw,
  FiHome,
} from "react-icons/fi";
import { LuWallet } from "react-icons/lu";

export function PaymentResultView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const txnid = searchParams.get("txnid") || "";
  const resultHint = searchParams.get("result") || "";
  const statusHint = searchParams.get("status") || "";

  const [loading, setLoading] = useState<boolean>(true);
  const [retrying, setRetrying] = useState<boolean>(false);
  const [verification, setVerification] = useState<VerifyPaymentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const confettiFired = useRef<boolean>(false);

  const verifyAuthoritativeState = useCallback(async () => {
    if (!txnid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await paymentsApi.verifyPayment({ transactionId: txnid });
      setVerification(res);

      if (res.payment.status === "SUCCESS") {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("wallet_update"));
        }

        // Fire celebratory confetti for immediate credit
        if (res.walletCredited || res.payment.walletCredit?.status === "COMPLETED") {
          if (!confettiFired.current) {
            confettiFired.current = true;
            try {
              confetti({
                particleCount: 75,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#5C1B13", "#C59B27", "#3B82F6", "#10B981"],
              });
            } catch {}
          }
        }
      }
    } catch (err: any) {
      console.warn("Payment verify error:", err);
      const msg =
        err?.data?.message ||
        err?.message ||
        "Could not verify payment status with server.";
      setError(typeof msg === "string" ? msg : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }, [txnid]);

  useEffect(() => {
    if (!authLoading && user && txnid) {
      verifyAuthoritativeState();
    } else if (!authLoading && !txnid) {
      setLoading(false);
    }
  }, [authLoading, user, txnid, verifyAuthoritativeState]);

  const handleRetry = async () => {
    if (!txnid || retrying) return;
    setRetrying(true);
    try {
      await paymentsApi.retryPayment({ transactionId: txnid }, { autoRedirect: true });
    } catch (err: any) {
      console.error("Payment retry error:", err);
      const msg = err?.data?.message || err?.message || "Failed to retry payment.";
      alert(typeof msg === "string" ? msg : "Retry failed. Please start a new top-up from Wallet.");
      setRetrying(false);
    }
  };

  const payment: PaymentRecord | undefined = verification?.payment;
  const isSuccess = payment?.status === "SUCCESS" || (!payment && statusHint === "SUCCESS");
  const isFailed =
    payment?.status === "FAILED" ||
    payment?.status === "CANCELLED" ||
    payment?.status === "EXPIRED" ||
    resultHint === "error";
  const isRefunded =
    payment?.status === "REFUNDED" ||
    payment?.status === "REFUND_PENDING" ||
    payment?.walletCredit?.refundStatus === "REFUNDED" ||
    payment?.walletCredit?.refundStatus === "REFUND_PENDING";

  const isFirstTimeApproval =
    verification?.requiresAdminApproval ||
    (payment?.status === "SUCCESS" && payment.walletCredit?.status === "PENDING") ||
    resultHint === "awaiting_approval";

  const isWalletCredited =
    verification?.walletCredited ||
    (payment?.status === "SUCCESS" && payment.walletCredit?.status === "COMPLETED") ||
    resultHint === "wallet_credited";

  const displayAmount = payment
    ? (payment.amountPaise / 100).toFixed(2)
    : undefined;

  return (
    <div className="w-full max-w-xl mx-auto py-6 sm:py-10 px-4">
      {/* ─── LOADING STATE ─── */}
      {loading && (
        <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8DFD4] p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#5C1B13]/10 text-[#5C1B13] flex items-center justify-center mx-auto">
            <FiRotateCw className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1A1008]">
              Verifying Payment...
            </h3>
            <p className="text-xs sm:text-sm text-[#6B584C] mt-1">
              Confirming transaction authenticity and updating your wallet ledger.
            </p>
          </div>
          {txnid && (
            <div className="font-mono text-[11px] text-[#8C7A6B] bg-white border border-[#E8DFD4] py-1.5 px-3 rounded-xl inline-block">
              Txn ID: {txnid}
            </div>
          )}
        </div>
      )}

      {/* ─── NO TRANSACTION ID ─── */}
      {!loading && !txnid && (
        <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8DFD4] p-8 text-center shadow-xs space-y-5">
          <div className="w-14 h-14 rounded-full bg-[#E8DFD4] text-[#6B584C] flex items-center justify-center mx-auto">
            <LuWallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1A1008]">
              Payment Status Checker
            </h3>
            <p className="text-xs sm:text-sm text-[#6B584C] mt-1 max-w-md mx-auto">
              No transaction ID was provided in the return link. You can check your wallet balance and recent activity directly in your wallet dashboard.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/wallet"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#5C1B13] text-white text-xs sm:text-sm font-bold hover:bg-[#48150f] transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <LuWallet className="w-4 h-4" />
              <span>Go to Wallet</span>
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-[#E8DFD4] bg-white text-[#1A1008] text-xs sm:text-sm font-bold hover:bg-[#FAF3EA] transition-all flex items-center justify-center gap-2"
            >
              <FiHome className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      )}

      {/* ─── SUCCESS: INSTANT WALLET CREDITED ─── */}
      {!loading && isSuccess && isWalletCredited && (
        <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8DFD4] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs animate-in zoom-in-75 duration-300">
              <FiCheckCircle className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Payment Verified & Credited
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#1A1008] mt-2">
                Wallet Credited Successfully!
              </h2>
              {displayAmount && (
                <p className="text-2xl sm:text-3xl font-black font-mono text-[#5C1B13] mt-1">
                  ₹{displayAmount}
                </p>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#6B584C] max-w-md mx-auto leading-relaxed">
              Your payment has been verified and automatically added to your PuretyFarm wallet ledger. Ready for sunrise deliveries!
            </p>
          </div>

          {/* Details Box */}
          <div className="bg-white rounded-2xl border border-[#E8DFD4] p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-[#FAF3EA]">
              <span className="text-[#8C7A6B]">Transaction ID</span>
              <span className="font-mono font-semibold text-[#1A1008]">
                {payment?.transactionId || txnid}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#FAF3EA]">
              <span className="text-[#8C7A6B]">Payment Method</span>
              <span className="font-semibold text-[#1A1008]">
                Online Payment (UPI / Cards / NetBanking)
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#FAF3EA]">
              <span className="text-[#8C7A6B]">Wallet Status</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <FiCheckCircle className="w-3.5 h-3.5" />
                <span>Auto-Credited</span>
              </span>
            </div>
            {payment?.completedAt && (
              <div className="flex items-center justify-between py-1">
                <span className="text-[#8C7A6B]">Timestamp</span>
                <span className="text-[#6B584C]">
                  {new Date(payment.completedAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/wallet"
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <LuWallet className="w-4 h-4" />
              <span>View Wallet Balance</span>
            </Link>
            <Link
              href="/plan"
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl border border-[#E8DFD4] bg-white text-[#1A1008] hover:bg-[#FAF3EA] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all"
            >
              <span>Manage Milk Plan</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ─── SUCCESS: FIRST TIME APPROVAL PENDING (TWO-EVENTS RULE) ─── */}
      {!loading && isSuccess && isFirstTimeApproval && (
        <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8DFD4] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs animate-in zoom-in-75 duration-300">
              <FiClock className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                Payment Successful · Approval Pending
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#1A1008] mt-2">
                Payment Received Successfully!
              </h2>
              {displayAmount && (
                <p className="text-2xl sm:text-3xl font-black font-mono text-[#5C1B13] mt-1">
                  ₹{displayAmount}
                </p>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#6B584C] max-w-md mx-auto leading-relaxed">
              Your payment was received and securely verified. Because this is your <strong>first wallet top-up</strong>, our Raipur depot administrator is completing a quick one-time account verification.
            </p>
          </div>

          {/* 3-Step Lifecycle Visualizer */}
          <div className="bg-white rounded-2xl border border-[#E8DFD4] p-4 sm:p-5 space-y-3.5">
            <h4 className="text-xs font-bold text-[#1A1008] flex items-center gap-2">
              <FiShield className="w-4 h-4 text-[#5C1B13]" />
              <span>Two-Event Credit Process</span>
            </h4>

            <div className="space-y-3 text-xs">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <FiCheckCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-[#1A1008]">
                    1. Money Received & Verified (Done)
                  </p>
                  <p className="text-[11px] text-[#8C7A6B]">
                    Cryptographic verification confirmed by payment gateway.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <FiClock className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div>
                  <p className="font-bold text-amber-900">
                    2. First-Time Admin Approval (In Progress)
                  </p>
                  <p className="text-[11px] text-[#8C7A6B]">
                    Depot review underway. Your wallet balance will update automatically upon approval.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#FAF3EA] text-[#8C7A6B] flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold">3</span>
                </div>
                <div>
                  <p className="font-semibold text-[#8C7A6B]">
                    3. Auto-Credit Enabled for Future Top-ups
                  </p>
                  <p className="text-[11px] text-[#8C7A6B]">
                    Every subsequent top-up will credit your wallet instantly without review.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Details Box */}
          <div className="bg-white rounded-2xl border border-[#E8DFD4] p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-[#8C7A6B]">Transaction ID</span>
              <span className="font-mono font-semibold text-[#1A1008]">
                {payment?.transactionId || txnid}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[#8C7A6B]">Credit Request</span>
              <span className="font-bold text-amber-800">
                PENDING APPROVAL
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={verifyAuthoritativeState}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Check Approval Status</span>
            </button>
            <Link
              href="/wallet"
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl border border-[#E8DFD4] bg-white text-[#1A1008] hover:bg-[#FAF3EA] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all"
            >
              <LuWallet className="w-4 h-4" />
              <span>Track in Wallet</span>
            </Link>
          </div>
        </div>
      )}

      {/* ─── FAILED / CANCELLED / EXPIRED ─── */}
      {!loading && isFailed && (
        <div className="bg-[#FAF8F5] rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-xs">
              <FiAlertCircle className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                Payment {payment?.status || "Incomplete"}
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
                "The payment transaction was cancelled, expired, or failed. No funds were debited from your bank account."}
            </p>
          </div>

          {/* Details Box */}
          <div className="bg-white rounded-2xl border border-[#E8DFD4] p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-[#8C7A6B]">Transaction ID</span>
              <span className="font-mono font-semibold text-[#1A1008]">
                {payment?.transactionId || txnid}
              </span>
            </div>
            {payment?.failureCode && (
              <div className="flex items-center justify-between py-1">
                <span className="text-[#8C7A6B]">Error Code</span>
                <span className="font-mono text-rose-700 font-semibold">
                  {payment.failureCode}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between py-1">
              <span className="text-[#8C7A6B]">Action Recommended</span>
              <span className="font-semibold text-[#1A1008]">
                Retry Top-up or Pay Cash
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              disabled={retrying}
              onClick={handleRetry}
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <FiRotateCw className={`w-4 h-4 ${retrying ? "animate-spin" : ""}`} />
              <span>{retrying ? "Redirecting to Payment Gateway..." : "Retry Payment"}</span>
            </button>
            <Link
              href="/wallet"
              className="w-full sm:flex-1 py-3 px-4 rounded-2xl border border-[#E8DFD4] bg-white text-[#1A1008] hover:bg-[#FAF3EA] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all"
            >
              <LuWallet className="w-4 h-4" />
              <span>Back to Wallet</span>
            </Link>
          </div>
        </div>
      )}

      {/* ─── REFUND STATUS ─── */}
      {!loading && isRefunded && (
        <div className="bg-[#FAF8F5] rounded-3xl border border-sky-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mx-auto shadow-xs">
              <FiShield className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200">
                {payment?.status === "REFUNDED" ? "Refund Complete" : "Refund in Progress"}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#1A1008] mt-2">
                {payment?.status === "REFUNDED"
                  ? "Amount Refunded to Source"
                  : "Refund Initiated to Source"}
              </h2>
              {displayAmount && (
                <p className="text-2xl sm:text-3xl font-black font-mono text-sky-900 mt-1">
                  ₹{displayAmount}
                </p>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#6B584C] max-w-md mx-auto leading-relaxed">
              When a credit request is rejected or cancelled, settled online funds are automatically returned back to the original payment method.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DFD4] p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between py-1">
              <span className="text-[#8C7A6B]">Transaction ID</span>
              <span className="font-mono font-semibold text-[#1A1008]">
                {payment?.transactionId || txnid}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[#8C7A6B]">Refund Status</span>
              <span className="font-bold text-sky-800">
                {payment?.walletCredit?.refundStatus || payment?.status}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Link
              href="/wallet"
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <LuWallet className="w-4 h-4" />
              <span>Return to Wallet</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
