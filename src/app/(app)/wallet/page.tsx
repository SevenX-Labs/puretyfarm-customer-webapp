"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  walletApi,
  CustomerWallet,
  WalletTransaction,
  WalletCreditRequest,
  WalletTransactionType,
  WalletCreditRequestStatus,
} from "@/features/wallet";
import { paymentsApi, PaymentRecord } from "@/features/payments";
import { CustomerHeader } from "@/components/pf/layout/CustomerHeader";
import { Button } from "@/components/ui/Button";
import {
  FiShield,
  FiCheckCircle,
  FiClock,
  FiPlusCircle,
  FiCreditCard,
  FiDollarSign,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiAlertCircle,
  FiRefreshCw,
  FiSend,
  FiList,
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
  FiCheck,
  FiXCircle,
  FiHelpCircle,
} from "react-icons/fi";
import { LuWallet } from "react-icons/lu";

type TopupMethod = "ONLINE" | "CASH" | "DIRECT_REQUEST";

function WalletContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  // ─── WALLET DATA STATES ───
  const [wallet, setWallet] = useState<CustomerWallet | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [walletLoading, setWalletLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // ─── TOP-UP FORM STATES ───
  const [rechargeMethod, setRechargeMethod] = useState<TopupMethod>("ONLINE");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(1000);
  const [customAmount, setCustomAmount] = useState<string>("1000");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // ─── STATUS & ERROR BANNERS ───
  const [successBanner, setSuccessBanner] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [errorBanner, setErrorBanner] = useState<{
    message: string;
    transactionId?: string;
  } | null>(null);

  // ─── TABS & LEDGER STATES ───
  const [activeTab, setActiveTab] = useState<"TRANSACTIONS" | "REQUESTS">("TRANSACTIONS");

  // Transactions Ledger State (7.3)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [txTypeFilter, setTxTypeFilter] = useState<"ALL" | "CREDIT" | "DEBIT">("ALL");
  const [txPage, setTxPage] = useState<number>(1);
  const [txPagination, setTxPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [txLoading, setTxLoading] = useState<boolean>(false);

  // Credit Requests History State (7.4)
  const [creditRequests, setCreditRequests] = useState<WalletCreditRequest[]>([]);
  const [reqStatusFilter, setReqStatusFilter] = useState<
    "ALL" | WalletCreditRequestStatus
  >("ALL");
  const [reqPage, setReqPage] = useState<number>(1);
  const [reqPagination, setReqPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [reqLoading, setReqLoading] = useState<boolean>(false);

  // Live Payments (for retryable PayU failures)
  const [livePayments, setLivePayments] = useState<PaymentRecord[]>([]);

  // ══════════════════════════════════════════════════════════════════
  //  FETCHERS
  // ══════════════════════════════════════════════════════════════════

  // 7.1 GET /api/v1/customer/wallet
  const fetchWallet = useCallback(async () => {
    if (!user) return;
    try {
      const res = await walletApi.getWallet();
      if (res && typeof res.balancePaise === "number") {
        setWallet(res);
        setBalance(res.balancePaise / 100);
      }
    } catch (err) {
      console.warn("Error fetching wallet balance:", err);
    } finally {
      setWalletLoading(false);
    }
  }, [user]);

  // 7.3 GET /api/v1/customer/wallet/transactions
  const fetchTransactions = useCallback(
    async (page = txPage, type = txTypeFilter) => {
      if (!user) return;
      setTxLoading(true);
      try {
        const res = await walletApi.getTransactions({
          page,
          limit: 10,
          type: type === "ALL" ? undefined : (type as WalletTransactionType),
        });
        setTransactions(res.data || []);
        if (res.pagination) {
          setTxPagination(res.pagination);
        }
      } catch (err) {
        console.warn("Error fetching ledger transactions:", err);
      } finally {
        setTxLoading(false);
      }
    },
    [user, txPage, txTypeFilter]
  );

  // 7.4 GET /api/v1/customer/wallet/credit-requests
  const fetchCreditRequests = useCallback(
    async (page = reqPage, status = reqStatusFilter) => {
      if (!user) return;
      setReqLoading(true);
      try {
        const res = await walletApi.getCreditRequests({
          page,
          limit: 10,
          status: status === "ALL" ? undefined : status,
        });
        setCreditRequests(res.data || []);
        if (res.pagination) {
          setReqPagination(res.pagination);
        }
      } catch (err) {
        console.warn("Error fetching credit requests:", err);
      } finally {
        setReqLoading(false);
      }
    },
    [user, reqPage, reqStatusFilter]
  );

  // Refresh all wallet modules
  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchWallet(),
      fetchTransactions(txPage, txTypeFilter),
      fetchCreditRequests(reqPage, reqStatusFilter),
    ]);
    setIsRefreshing(false);
  }, [fetchWallet, fetchTransactions, fetchCreditRequests, txPage, txTypeFilter, reqPage, reqStatusFilter]);

  // ══════════════════════════════════════════════════════════════════
  //  LIFECYCLE & PAYU RETURN HANDLING
  // ══════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth?redirect=/wallet");
      return;
    }
    if (user) {
      fetchWallet();
      fetchTransactions(1, txTypeFilter);
      fetchCreditRequests(1, reqStatusFilter);

      const handleWalletUpdate = () => {
        fetchWallet();
        fetchTransactions(1, txTypeFilter);
        fetchCreditRequests(1, reqStatusFilter);
      };

      window.addEventListener("wallet_update", handleWalletUpdate);
      return () => {
        window.removeEventListener("wallet_update", handleWalletUpdate);
      };
    }
  }, [user, loading, router, fetchWallet, fetchTransactions, fetchCreditRequests, txTypeFilter, reqStatusFilter]);

  // Handle PayU return txnid & result parameter
  useEffect(() => {
    const txnid = searchParams.get("txnid");
    const resultHint = searchParams.get("result");

    if (resultHint === "error") {
      setErrorBanner({
        message: "PayU reported a payment failure. Please retry below.",
      });
    }

    if (txnid && user) {
      paymentsApi
        .verifyPayment({ transactionId: txnid })
        .then((res) => {
          if (res.payment.status === "SUCCESS") {
            const amtRupees = (res.payment.amountPaise / 100).toFixed(2);
            // Spec §10.5: First credit shows payment success + credit pending approval
            if (
              res.requiresAdminApproval ||
              res.payment.walletCredit?.status === "PENDING"
            ) {
              setSuccessBanner({
                title: "Payment Received · Approval Pending",
                message: `₹${amtRupees} reached PayU successfully. As this is your first wallet credit, our depot admin is reviewing it. Your balance will update automatically upon confirmation.`,
              });
            } else {
              setSuccessBanner({
                title: "Wallet Credited Successfully",
                message: `₹${amtRupees} has been verified and added to your prepaid balance. Ready for sunrise deliveries!`,
              });
            }
            refreshAll();
            window.dispatchEvent(new Event("wallet_update"));
          } else if (
            res.payment.status === "FAILED" ||
            res.payment.status === "CANCELLED" ||
            res.payment.status === "EXPIRED"
          ) {
            setErrorBanner({
              message: `Payment of ₹${(res.payment.amountPaise / 100).toFixed(0)} was ${res.payment.status.toLowerCase()}. No money was deducted.`,
              transactionId: txnid,
            });
          }
        })
        .catch((err) => {
          console.warn("Payment verification error:", err);
        });
    }
  }, [searchParams, user, refreshAll]);

  // Load live payments for retry assistance
  useEffect(() => {
    if (!user) return;
    paymentsApi
      .listPayments({ limit: 10 })
      .then((res) => {
        if (res && Array.isArray(res.data)) {
          setLivePayments(res.data);
        }
      })
      .catch(() => {});
  }, [user]);

  // ══════════════════════════════════════════════════════════════════
  //  TOP-UP HANDLERS
  // ══════════════════════════════════════════════════════════════════

  const handlePresetSelect = (amount: number) => {
    setSelectedPreset(amount);
    setCustomAmount(amount.toString());
  };

  const handleCustomAmountChange = (val: string) => {
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && [500, 1000, 2500, 5000].includes(num)) {
      setSelectedPreset(num);
    } else {
      setSelectedPreset(null);
    }
  };

  const handleSubmitTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isProcessing) return;

    const parsedRupees = parseFloat(customAmount);
    if (isNaN(parsedRupees) || parsedRupees <= 0) {
      setErrorBanner({ message: "Please enter a valid recharge amount." });
      return;
    }

    const amountPaise = Math.round(parsedRupees * 100);

    // Spec min/max check: default 100 paise (₹1) to 1,000,000 paise (₹10,000)
    if (amountPaise < 100) {
      setErrorBanner({ message: "Minimum wallet top-up is ₹1 (100 paise)." });
      return;
    }
    if (amountPaise > 1000000) {
      setErrorBanner({ message: "Maximum single top-up allowed is ₹10,000." });
      return;
    }

    setIsProcessing(true);
    setErrorBanner(null);
    setSuccessBanner(null);

    try {
      if (rechargeMethod === "ONLINE") {
        // Online PayU Flow (docs/customer/payments.md)
        const res = await paymentsApi.initiateOnlineTopup(amountPaise, {
          autoRedirect: true,
        });
        if (res.checkout) {
          // PayU form auto-submits; waiting for browser redirect
          return;
        }
      } else if (rechargeMethod === "CASH") {
        // Doorstep Cash Collection Flow
        const res = await paymentsApi.requestCashTopup(amountPaise);
        setSuccessBanner({
          title: "Cash Collection Requested",
          message:
            res.message ||
            `Doorstep cash collection of ₹${parsedRupees.toFixed(2)} recorded. Our partner will collect it during delivery, and the admin will credit your wallet upon deposit.`,
        });
        refreshAll();
      } else if (rechargeMethod === "DIRECT_REQUEST") {
        // 7.2 POST /api/v1/customer/wallet/credit-request (Legacy / Unverified Direct Path)
        const res = await walletApi.createCreditRequest({
          amount: amountPaise,
        });

        if (res.status === "COMPLETED") {
          setSuccessBanner({
            title: "Wallet Credited Successfully",
            message: res.message || `₹${parsedRupees.toFixed(2)} auto-credited to your wallet balance.`,
          });
        } else {
          setSuccessBanner({
            title: "Credit Request Submitted",
            message:
              res.message ||
              `Credit request for ₹${parsedRupees.toFixed(2)} submitted for admin review.`,
          });
        }
        refreshAll();
        setActiveTab("REQUESTS");
      }
    } catch (err: any) {
      console.error("Top-up submission error:", err);
      const code = err?.data?.error || err?.error;
      const msg = err?.data?.message || err?.message || "Failed to process top-up.";

      if (code === "WALLET_PENDING_REQUEST_EXISTS" || msg.includes("already pending")) {
        setErrorBanner({
          message:
            "A credit request is already pending approval for your wallet. Please wait for depot review before creating a new one.",
        });
      } else if (code === "INVALID_CREDIT_AMOUNT") {
        setErrorBanner({
          message: "The top-up amount is outside the allowed bounds. Please enter between ₹1 and ₹10,000.",
        });
      } else {
        setErrorBanner({
          message: typeof msg === "string" ? msg : "Top-up failed. Please try again.",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryPayment = async (transactionId: string) => {
    setIsProcessing(true);
    try {
      await paymentsApi.retryPayment({ transactionId }, { autoRedirect: true });
    } catch (err: any) {
      console.error("Payment retry failed:", err);
      setErrorBanner({ message: err?.message || "Failed to retry PayU payment." });
    } finally {
      setIsProcessing(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════
  //  PENDING / REFUND ALERTS
  // ══════════════════════════════════════════════════════════════════

  const pendingRequest = creditRequests.find((cr) => cr.status === "PENDING");
  const rejectedRefundRequest = creditRequests.find(
    (cr) => cr.status === "REJECTED" && cr.refundStatus && cr.refundStatus !== "NOT_REQUIRED"
  );

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#5C1B13] border-t-transparent animate-spin" />
      </div>
    );
  }

  const isAutoCredit = wallet?.autoCreditEnabled ?? false;

  return (
    <>
      <CustomerHeader
        title="Wallet"
        subtitle="Manage your prepaid balance, online top-ups, and immutable accounting ledger."
      />

      <div className="space-y-6 max-w-5xl">
        {/* ─── ALERT BANNERS ─── */}

        {/* Pending Request Alert */}
        {pendingRequest && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
            <FiClock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-bold">
                  Top-up Pending Approval: ₹{(pendingRequest.amountPaise / 100).toFixed(2)}
                </p>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900 font-bold">
                  {pendingRequest.id}
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {pendingRequest.autoApproved === false
                  ? "Awaiting depot admin approval. Once approved, the funds will be credited to your balance automatically."
                  : "Awaiting physical cash collection confirmation by delivery partner."}
              </p>
            </div>
          </div>
        )}

        {/* Refund Status Alert */}
        {rejectedRefundRequest && (
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
            <FiShield className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-bold">
                  Refund Status:{" "}
                  {rejectedRefundRequest.refundStatus === "REFUND_PENDING"
                    ? "PayU Refund Initiated"
                    : rejectedRefundRequest.refundStatus === "REFUNDED"
                    ? "Refund Settled to Source"
                    : "Refund Action Required"}{" "}
                  (₹{(rejectedRefundRequest.amountPaise / 100).toFixed(2)})
                </p>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-200/60 text-purple-900 font-bold">
                  {rejectedRefundRequest.refundStatus}
                </span>
              </div>
              <p className="text-xs text-purple-800 mt-1">
                {rejectedRefundRequest.adminNote && (
                  <span className="font-semibold block mb-0.5">
                    Depot Note: {rejectedRefundRequest.adminNote}
                  </span>
                )}
                {rejectedRefundRequest.refundStatus === "REFUND_PENDING" &&
                  "PayU is processing the credit back to your original payment method (3–7 business days)."}
                {rejectedRefundRequest.refundStatus === "REFUNDED" &&
                  "Funds have been successfully refunded to your original payment source."}
              </p>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {successBanner && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
            <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">{successBanner.title}</p>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                {successBanner.message}
              </p>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-emerald-700 hover:text-emerald-900 p-1 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Banner with Optional Retry */}
        {errorBanner && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{errorBanner.message}</p>
                <p className="text-xs text-rose-800 mt-0.5">
                  No funds were deducted from your wallet balance.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {errorBanner.transactionId && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleRetryPayment(errorBanner.transactionId!)}
                  className="rounded-xl px-3 py-1.5 text-xs font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <FiRefreshCw className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
                  <span>Retry PayU</span>
                </button>
              )}
              <button
                onClick={() => setErrorBanner(null)}
                className="text-rose-700 hover:text-rose-900 px-2 py-1 text-xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ─── 1. WALLET BALANCE HERO CARD ─── */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#5C1B13] via-[#48150f] to-[#2E0B07] text-white p-6 sm:p-8 shadow-xl shadow-[#5C1B13]/15 border border-[#8C2C20]/30">
          <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-amber-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-amber-300">
                  <LuWallet className="w-5 h-5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-200/90">
                  PuretyFarm Prepaid Balance
                </span>

                <button
                  onClick={refreshAll}
                  disabled={isRefreshing}
                  title="Sync with server"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all ml-1 cursor-pointer disabled:opacity-50"
                >
                  <FiRefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white drop-shadow-xs">
                  {walletLoading ? "₹---.--" : `₹${balance.toFixed(2)}`}
                </span>
                <span className="text-xs text-white/70 font-mono">
                  {walletLoading
                    ? "syncing..."
                    : `(${(balance * 100).toLocaleString("en-IN")} paise)`}
                </span>
              </div>

              {/* Auto-credit Status Indicator (Spec §3) */}
              <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
                {isAutoCredit ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold backdrop-blur-xs">
                    <FiCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Instant Auto-Credit Active</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 font-semibold backdrop-blur-xs">
                    <FiClock className="w-3.5 h-3.5 text-amber-300" />
                    <span>First Top-Up Review Mode</span>
                  </span>
                )}
                <span className="text-white/60 text-[11px]">
                  {isAutoCredit
                    ? "Verified online credits deposit immediately."
                    : "First credit verified by admin; subsequent credits are instant."}
                </span>
              </div>
            </div>

            {/* Account Details & Sunrise Deduction Info */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-xs space-y-1 sm:min-w-56">
                <span className="text-[10px] uppercase font-bold text-amber-200/80 tracking-wider block">
                  Subscriber Details
                </span>
                <p className="font-bold text-white text-sm">{user.name || "Customer"}</p>
                <p className="font-mono text-white/80">{user.phone}</p>
              </div>

              <div className="bg-black/20 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-[11px] text-white/80 flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Auto-deducts daily for cold-chain dawn delivery.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 2. TOP-UP WALLET HUB ─── */}
        <div className="bg-white rounded-3xl border border-[#E8DFD4] p-6 sm:p-7 shadow-2xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1A1008] flex items-center gap-2">
                <FiPlusCircle className="w-5 h-5 text-[#5C1B13]" />
                <span>Top-up Wallet</span>
              </h3>
              <p className="text-xs text-[#6B584C] mt-0.5">
                Recharge prepaid credit for effortless sunrise milk orders with zero interruptions.
              </p>
            </div>

            {/* Top-up Method Switcher */}
            <div className="inline-flex flex-wrap rounded-2xl bg-[#FAF3EA] p-1 border border-[#E8DFD4] gap-1 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setRechargeMethod("ONLINE")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  rechargeMethod === "ONLINE"
                    ? "bg-[#5C1B13] text-white shadow-xs"
                    : "text-[#6B584C] hover:text-[#1A1008]"
                }`}
              >
                <FiCreditCard className="w-3.5 h-3.5" />
                <span>PayU Online</span>
              </button>

              <button
                type="button"
                onClick={() => setRechargeMethod("CASH")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  rechargeMethod === "CASH"
                    ? "bg-[#5C1B13] text-white shadow-xs"
                    : "text-[#6B584C] hover:text-[#1A1008]"
                }`}
              >
                <FiDollarSign className="w-3.5 h-3.5" />
                <span>Doorstep Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setRechargeMethod("DIRECT_REQUEST")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  rechargeMethod === "DIRECT_REQUEST"
                    ? "bg-[#5C1B13] text-white shadow-xs"
                    : "text-[#6B584C] hover:text-[#1A1008]"
                }`}
              >
                <FiSend className="w-3.5 h-3.5" />
                <span>Credit Request</span>
              </button>
            </div>
          </div>

          {/* Method Explainer Hint */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD4]/80 text-xs text-[#6B584C] flex items-center gap-2.5">
            <FiInfo className="w-4 h-4 text-[#5C1B13] shrink-0" />
            <span>
              {rechargeMethod === "ONLINE" &&
                "Instant gateway via PayU (UPI, Cards, NetBanking). Fully encrypted."}
              {rechargeMethod === "CASH" &&
                "Delivery agent collects cash at your doorstep. Admin credits wallet after verification."}
              {rechargeMethod === "DIRECT_REQUEST" &&
                "Submits a direct unverified credit request (UUID Idempotent) for manual depot review."}
            </span>
          </div>

          {/* Preset Recharge Amount Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { amount: 500, label: "Starter", desc: "6 Bottles" },
              { amount: 1000, label: "Popular", desc: "12 Bottles + 5% Bonus" },
              { amount: 2500, label: "Monthly", desc: "Full Month + 10% Extra" },
              { amount: 5000, label: "Family", desc: "60L Pack + Free Butter" },
            ].map((preset) => {
              const isSelected = selectedPreset === preset.amount;
              return (
                <button
                  key={preset.amount}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handlePresetSelect(preset.amount)}
                  className={`p-4 rounded-2xl border transition-all text-left cursor-pointer group disabled:opacity-50 relative ${
                    isSelected
                      ? "border-[#5C1B13] bg-[#FAF3EA] ring-2 ring-[#5C1B13]/10"
                      : "border-[#E8DFD4] bg-[#FAF8F5]/60 hover:bg-[#FAF3EA] hover:border-[#D5C7B8]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base sm:text-lg font-extrabold font-mono text-[#1A1008] group-hover:text-[#5C1B13]">
                      ₹{preset.amount}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isSelected
                          ? "bg-[#5C1B13] text-white border-[#5C1B13]"
                          : "bg-white text-[#5C1B13] border-[#E8DFD4]"
                      }`}
                    >
                      {preset.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B584C] font-medium leading-tight">
                    {preset.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Custom Amount Form */}
          <form onSubmit={handleSubmitTopup} className="space-y-4 pt-1">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6B584C]">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  step="1"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  placeholder="Enter custom amount (₹1 – ₹10,000)"
                  className="w-full pl-8 pr-28 py-3 rounded-2xl border border-[#D5C7B8] focus:border-[#5C1B13] focus:ring-2 focus:ring-[#5C1B13]/15 bg-white text-sm font-semibold text-[#1A1008] placeholder:text-[#8C7A6B]/60 focus:outline-none transition-all"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-mono font-medium text-[#8C7A6B]">
                  {customAmount && !isNaN(parseFloat(customAmount))
                    ? `${Math.round(parseFloat(customAmount) * 100).toLocaleString("en-IN")} paise`
                    : "0 paise"}
                </span>
              </div>

              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={
                  isProcessing ||
                  !customAmount ||
                  parseFloat(customAmount) < 1 ||
                  parseFloat(customAmount) > 10000
                }
                className="rounded-2xl px-6 py-3 text-xs sm:text-sm font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
              >
                {isProcessing ? (
                  <>
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {rechargeMethod === "ONLINE" && <FiCreditCard className="w-4 h-4" />}
                    {rechargeMethod === "CASH" && <FiDollarSign className="w-4 h-4" />}
                    {rechargeMethod === "DIRECT_REQUEST" && <FiSend className="w-4 h-4" />}
                    <span>
                      {rechargeMethod === "ONLINE"
                        ? `Top-up ₹${customAmount || 0} via PayU`
                        : rechargeMethod === "CASH"
                        ? `Request Cash ₹${customAmount || 0}`
                        : `Submit Credit Request (₹${customAmount || 0})`}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* ─── 3. TABBED ACTIVITY & LEDGER SECTION ─── */}
        <div className="bg-white rounded-3xl border border-[#E8DFD4] p-5 sm:p-7 shadow-2xs space-y-5">
          {/* Section Heading & Tab Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E8DFD4] gap-3">
            <div>
              <h4 className="text-base font-serif font-bold text-[#1A1008] flex items-center gap-2">
                <FiList className="w-4 h-4 text-[#5C1B13]" />
                <span>Wallet Passbook & Credit History</span>
              </h4>
              <p className="text-xs text-[#8C7A6B] mt-0.5">
                Every debit and credit is an immutable ledger record stored in integer paise.
              </p>
            </div>

            <div className="inline-flex rounded-xl bg-[#FAF3EA] p-1 border border-[#E8DFD4] shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("TRANSACTIONS")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "TRANSACTIONS"
                    ? "bg-[#5C1B13] text-white shadow-xs"
                    : "text-[#6B584C] hover:text-[#1A1008]"
                }`}
              >
                Transactions Ledger ({txPagination.total})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("REQUESTS")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "REQUESTS"
                    ? "bg-[#5C1B13] text-white shadow-xs"
                    : "text-[#6B584C] hover:text-[#1A1008]"
                }`}
              >
                Credit Requests ({reqPagination.total})
              </button>
            </div>
          </div>

          {/* ─── TAB 1: IMMUTABLE TRANSACTIONS LEDGER (7.3) ─── */}
          {activeTab === "TRANSACTIONS" && (
            <div className="space-y-4">
              {/* Type Filter Pills */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[#8C7A6B] font-medium mr-1">Filter:</span>
                  {(["ALL", "CREDIT", "DEBIT"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setTxTypeFilter(type);
                        setTxPage(1);
                        fetchTransactions(1, type);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        txTypeFilter === type
                          ? "bg-[#5C1B13] text-white"
                          : "bg-[#FAF8F5] text-[#6B584C] hover:bg-[#FAF3EA] border border-[#E8DFD4]"
                      }`}
                    >
                      {type === "ALL" ? "All" : type === "CREDIT" ? "Credits (+)" : "Debits (-)"}
                    </button>
                  ))}
                </div>

                <span className="text-[11px] text-[#8C7A6B] font-mono">
                  Showing {transactions.length} of {txPagination.total}
                </span>
              </div>

              {/* Transactions List */}
              {txLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-[#8C7A6B]">
                  <FiRefreshCw className="w-5 h-5 animate-spin text-[#5C1B13]" />
                  <span>Loading ledger rows...</span>
                </div>
              ) : transactions.length > 0 ? (
                <div className="divide-y divide-[#E8DFD4]/70 border border-[#E8DFD4] rounded-2xl overflow-hidden bg-white">
                  {transactions.map((tx) => {
                    const isCredit = tx.type === "CREDIT";
                    return (
                      <div
                        key={tx.id}
                        className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5]/50 transition-colors"
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <span
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isCredit
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : "bg-[#FAF3EA] text-[#5C1B13] border border-[#E8DFD4]"
                            }`}
                          >
                            {isCredit ? (
                              <FiArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <FiArrowUpRight className="w-4 h-4" />
                            )}
                          </span>

                          <div className="space-y-0.5">
                            <p className="font-bold text-[#1A1008] text-xs sm:text-sm">
                              {tx.description || (isCredit ? "Wallet Top-up" : "Dawn Order Payment")}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#8C7A6B]">
                              <span className="font-mono">{tx.id}</span>
                              <span>•</span>
                              <span>
                                {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {tx.referenceType && (
                                <span className="px-1.5 py-0.5 rounded-md bg-[#FAF3EA] text-[#5C1B13] font-bold text-[10px]">
                                  {tx.referenceType}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Amount & Running Balance Snapshot */}
                        <div className="text-left sm:text-right shrink-0 pl-12 sm:pl-0">
                          <p
                            className={`font-mono font-extrabold text-sm sm:text-base ${
                              isCredit ? "text-emerald-700" : "text-[#5C1B13]"
                            }`}
                          >
                            {isCredit
                              ? `+₹${(tx.amountPaise / 100).toFixed(2)}`
                              : `-₹${(tx.amountPaise / 100).toFixed(2)}`}
                          </p>
                          {typeof tx.balanceAfterPaise === "number" && (
                            <p className="text-[11px] text-[#8C7A6B] font-mono mt-0.5">
                              Balance after: ₹{(tx.balanceAfterPaise / 100).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-[#8C7A6B] border border-dashed border-[#E8DFD4] rounded-2xl">
                  No ledger transactions recorded yet.
                </div>
              )}

              {/* Pagination Controls */}
              {txPagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    disabled={txPage <= 1 || txLoading}
                    onClick={() => {
                      const next = txPage - 1;
                      setTxPage(next);
                      fetchTransactions(next, txTypeFilter);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-[#E8DFD4] text-xs font-semibold text-[#6B584C] hover:bg-[#FAF3EA] disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  >
                    <FiChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <span className="text-xs text-[#8C7A6B] font-medium">
                    Page {txPage} of {txPagination.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={txPage >= txPagination.totalPages || txLoading}
                    onClick={() => {
                      const next = txPage + 1;
                      setTxPage(next);
                      fetchTransactions(next, txTypeFilter);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-[#E8DFD4] text-xs font-semibold text-[#6B584C] hover:bg-[#FAF3EA] disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  >
                    <span>Next</span>
                    <FiChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 2: CREDIT REQUESTS HISTORY (7.4) ─── */}
          {activeTab === "REQUESTS" && (
            <div className="space-y-4">
              {/* Status Filter Pills */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[#8C7A6B] font-medium mr-1">Status:</span>
                  {(["ALL", "PENDING", "COMPLETED", "REJECTED", "CANCELLED"] as const).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setReqStatusFilter(st);
                          setReqPage(1);
                          fetchCreditRequests(1, st);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          reqStatusFilter === st
                            ? "bg-[#5C1B13] text-white"
                            : "bg-[#FAF8F5] text-[#6B584C] hover:bg-[#FAF3EA] border border-[#E8DFD4]"
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>

                <span className="text-[11px] text-[#8C7A6B] font-mono">
                  Showing {creditRequests.length} of {reqPagination.total}
                </span>
              </div>

              {/* Credit Requests List */}
              {reqLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-[#8C7A6B]">
                  <FiRefreshCw className="w-5 h-5 animate-spin text-[#5C1B13]" />
                  <span>Loading credit requests...</span>
                </div>
              ) : creditRequests.length > 0 ? (
                <div className="divide-y divide-[#E8DFD4]/70 border border-[#E8DFD4] rounded-2xl overflow-hidden bg-white">
                  {creditRequests.map((req) => {
                    const statusTone =
                      req.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : req.status === "PENDING"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : req.status === "REJECTED"
                        ? "bg-rose-50 text-rose-800 border-rose-200"
                        : "bg-gray-100 text-gray-700 border-gray-200";

                    return (
                      <div
                        key={req.id}
                        className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5]/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1A1008] text-xs sm:text-sm">
                              Credit Request: ₹{(req.amountPaise / 100).toFixed(2)}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusTone}`}
                            >
                              {req.status}
                            </span>
                            {req.autoApproved && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Auto-Credited
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#8C7A6B]">
                            <span className="font-mono">{req.id}</span>
                            <span>•</span>
                            <span>
                              Requested:{" "}
                              {new Date(req.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {req.completedAt && (
                              <>
                                <span>•</span>
                                <span>
                                  Credited:{" "}
                                  {new Date(req.completedAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Rejection & Refund Details (Spec §7.4) */}
                          {req.status === "REJECTED" && (
                            <div className="mt-1.5 p-2 rounded-lg bg-rose-50/70 border border-rose-200/60 text-xs text-rose-900 space-y-0.5">
                              {req.adminNote && (
                                <p>
                                  <strong className="font-semibold">Reason:</strong>{" "}
                                  {req.adminNote}
                                </p>
                              )}
                              {req.refundStatus && req.refundStatus !== "NOT_REQUIRED" && (
                                <p className="text-[11px]">
                                  <strong className="font-semibold">Refund Status:</strong>{" "}
                                  {req.refundStatus}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <span className="font-mono font-bold text-sm text-[#1A1008]">
                            ₹{(req.amountPaise / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-[#8C7A6B] border border-dashed border-[#E8DFD4] rounded-2xl">
                  No credit requests found.
                </div>
              )}

              {/* Pagination Controls */}
              {reqPagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    disabled={reqPage <= 1 || reqLoading}
                    onClick={() => {
                      const next = reqPage - 1;
                      setReqPage(next);
                      fetchCreditRequests(next, reqStatusFilter);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-[#E8DFD4] text-xs font-semibold text-[#6B584C] hover:bg-[#FAF3EA] disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  >
                    <FiChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <span className="text-xs text-[#8C7A6B] font-medium">
                    Page {reqPage} of {reqPagination.totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={reqPage >= reqPagination.totalPages || reqLoading}
                    onClick={() => {
                      const next = reqPage + 1;
                      setReqPage(next);
                      fetchCreditRequests(next, reqStatusFilter);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-[#E8DFD4] text-xs font-semibold text-[#6B584C] hover:bg-[#FAF3EA] disabled:opacity-40 cursor-pointer flex items-center gap-1"
                  >
                    <span>Next</span>
                    <FiChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── 4. PURETYFARM GUARANTEES & REFUND POLICY ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Refund Policy Card */}
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8DFD4] p-5 sm:p-6 shadow-2xs space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-[#1A1008] flex items-center gap-2">
              <FiShield className="w-4 h-4 text-[#5C1B13]" />
              <span>100% Refundable to Source</span>
            </h4>
            <p className="text-xs text-[#6B584C] leading-relaxed">
              Unused wallet balances are never trapped. You can request a full or partial refund back to your original payment method (PayU) anytime. Processing typically completes in 3–7 business days depending on your issuing bank.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() =>
                  alert(
                    "Refund request noted. Our Raipur finance desk will reach out to process your unused balance back to source."
                  )
                }
                className="text-xs font-bold text-[#5C1B13] hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <span>Request Refund to Bank Account</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Ledger Invariants & Audit Card */}
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8DFD4] p-5 sm:p-6 shadow-2xs space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-[#1A1008] flex items-center gap-2">
              <FiCheckCircle className="w-4 h-4 text-emerald-700" />
              <span>Immutable Ledger & Negative Balance Protection</span>
            </h4>
            <p className="text-xs text-[#6B584C] leading-relaxed">
              Wallet records are cryptographically verified and immutable. A database CHECK constraint prevents negative balances, and idempotency guarantees that network retries never double-charge.
            </p>
            <div className="text-[11px] font-mono text-[#8C7A6B] pt-1">
              Raipur Farm Depot • 4°C Cold-Chain Certified
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function WalletPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#5C1B13] border-t-transparent animate-spin" />
        </div>
      }
    >
      <WalletContent />
    </Suspense>
  );
}
