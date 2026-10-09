"use client";

import React, { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { PaymentRecord, VerifyPaymentResponse } from "@/features/payments";
import {
  CustomerWallet,
  WalletTransaction,
  WalletCreditRequest,
} from "@/features/wallet";
import {
  FiCheckCircle,
  FiClock,
  FiInfo,
  FiPlusCircle,
  FiRefreshCw,
  FiShield,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiAlertCircle,
  FiCreditCard,
  FiDollarSign,
} from "react-icons/fi";
import { LuWallet } from "react-icons/lu";

export interface WalletTabProps {
  wallet?: CustomerWallet | null;
  balance: number;
  walletLoading: boolean;
  walletRecharging: boolean;
  walletSuccessMsg: string | null;
  walletPaymentError?: {
    message: string;
    transactionId?: string;
    canRetry?: boolean;
  } | null;
  walletPaymentStatus?: VerifyPaymentResponse | null;
  livePayments?: PaymentRecord[];
  walletTransactions?: WalletTransaction[];
  creditRequests?: WalletCreditRequest[];
  onRecharge: (amount: number, method?: "ONLINE" | "CASH") => void;
  onRetryPayment?: (transactionId: string) => Promise<void>;
  userId?: string;
}

interface LocalTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  title: string;
  description: string;
  date: string;
}

export function WalletTab({
  wallet,
  balance,
  walletLoading,
  walletRecharging,
  walletSuccessMsg,
  walletPaymentError,
  walletPaymentStatus,
  livePayments = [],
  walletTransactions = [],
  creditRequests = [],
  onRecharge,
  onRetryPayment,
  userId = "default",
}: WalletTabProps) {
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "CASH">("ONLINE");

  const rechargePacks = [
    {
      amount: 500,
      label: "Starter",
      benefit: "Around 6 Litres fresh A2 milk deliveries",
      isPopular: false,
    },
    {
      amount: 1000,
      label: "Recommended",
      benefit: "12 Litres pure milk + Dawn auto-dispatch",
      isPopular: true,
    },
    {
      amount: 2500,
      label: "Monthly Pack",
      benefit: "Full Month supply (30L) + priority cold chain",
      isPopular: false,
    },
  ];

  const handleCustomRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customAmount);
    if (!isNaN(parsed) && parsed >= 50) {
      onRecharge(parsed, paymentMethod);
      setCustomAmount("");
    }
  };

  const pendingCreditRequest = creditRequests.find((cr) => cr.status === "PENDING");
  const refundRequest = creditRequests.find(
    (cr) => cr.status === "REJECTED" && cr.refundStatus && cr.refundStatus !== "NOT_REQUIRED"
  );

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* ─── HEADER ROW ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8DFD4]">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1008]">
            Purety Farm Prepaid Wallet
          </h2>
          <p className="text-xs sm:text-sm text-[#6B584C] mt-0.5">
            Automatic sunrise billing for Raipur A2 Desi Cow milk subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {wallet?.autoCreditEnabled ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Instant Auto-Credit Active</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF3EA] text-[#5C1B13] border border-[#E8DFD4]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5C1B13]" />
              <span>Standard Verified Wallet</span>
            </span>
          )}
        </div>
      </div>

      {/* ─── PENDING CREDIT REQUEST BANNER ─── */}
      {pendingCreditRequest && (
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
          <FiClock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">
              Top-up Request Pending (₹{(pendingCreditRequest.amountPaise / 100).toFixed(0)})
            </p>
            <p className="text-xs text-sky-800 mt-0.5">
              Your top-up has been received and is being verified by our depot team. Your wallet balance will be updated automatically upon approval.
            </p>
          </div>
        </div>
      )}

      {/* ─── REFUND STATUS BANNER ─── */}
      {refundRequest && (
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
          <FiShield className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">
              Refund Status: {refundRequest.refundStatus === "REFUND_PENDING" ? "Processing Refund" : "Refund Completed"} (₹{(refundRequest.amountPaise / 100).toFixed(0)})
            </p>
            <p className="text-xs text-purple-800 mt-0.5">
              {refundRequest.refundStatus === "REFUND_PENDING"
                ? "Our automated system is processing your refund back to your original payment method."
                : "The refund has been confirmed and settled back to your source account."}
            </p>
          </div>
        </div>
      )}

      {/* ─── SUCCESS / NOTIFICATION BANNER ─── */}
      <AnimatePresence>
        {walletSuccessMsg && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-3 shadow-2xs"
          >
            <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{walletSuccessMsg}</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Your PuretyFarm prepaid balance is updated and ready for next morning&apos;s delivery.
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* ─── PAYMENT ERROR / RETRY BANNER ─── */}
      <AnimatePresence>
        {walletPaymentError && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
          >
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{walletPaymentError.message}</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  No money was deducted from your wallet. You can retry with PayU or choose another method.
                </p>
              </div>
            </div>
            {walletPaymentError.transactionId && onRetryPayment && (
              <Button
                variant="primary"
                size="sm"
                disabled={walletRecharging}
                onClick={() => onRetryPayment(walletPaymentError.transactionId!)}
                className="rounded-xl px-4 py-2 text-xs font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white shrink-0 shadow-xs flex items-center gap-1.5"
              >
                <FiRefreshCw className={`w-3.5 h-3.5 ${walletRecharging ? "animate-spin" : ""}`} />
                <span>Retry Top-up</span>
              </Button>
            )}
          </m.div>
        )}
      </AnimatePresence>

      {/* ─── WALLET BALANCE HERO CARD ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#5C1B13] via-[#48150f] to-[#2E0B07] text-white p-6 sm:p-8 shadow-xl shadow-[#5C1B13]/10">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-amber-200">
                <LuWallet className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                Available Purety Prepaid Balance
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              {walletLoading ? (
                <div className="h-10 w-32 bg-white/20 rounded-xl animate-pulse" />
              ) : (
                <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight">
                  ₹{balance.toFixed(2)}
                </span>
              )}
              <span className="text-xs text-white/70">INR</span>
            </div>

            <p className="text-xs text-white/75 flex items-center gap-1.5">
              <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Auto-settles daily dawn bottle drop off with zero checkout steps.</span>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 max-w-xs space-y-1.5 text-xs self-start sm:self-auto">
            <span className="text-[10px] uppercase font-bold text-amber-200 tracking-wider block">
              100% Secure & Refundable
            </span>
            <p className="text-white/90 leading-relaxed">
              Top-up via PayU Hosted Checkout or physical cash collection at depot.
            </p>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* ─── TOP-UP PAYMENT METHODS & PACKS ─── */}
      <div className="bg-white rounded-3xl border border-[#E8DFD4] p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DFD4]">
          <div>
            <h3 className="text-base font-serif font-bold text-[#1A1008] flex items-center gap-2">
              <FiPlusCircle className="w-4 h-4 text-[#5C1B13]" />
              <span>Top-Up Purety Prepaid Wallet</span>
            </h3>
            <p className="text-xs text-[#6B584C] mt-0.5">
              Select instant online checkout (UPI/Cards/NetBanking) or request depot cash collection.
            </p>
          </div>

          {/* Payment Method Selector Toggle */}
          <div className="inline-flex rounded-xl bg-[#FAF3EA] p-1 border border-[#E8DFD4] shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setPaymentMethod("ONLINE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                paymentMethod === "ONLINE"
                  ? "bg-[#5C1B13] text-white shadow-xs"
                  : "text-[#6B584C] hover:text-[#1A1008]"
              }`}
            >
              <FiCreditCard className="w-3.5 h-3.5" />
              <span>Online PayU (Instant)</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("CASH")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                paymentMethod === "CASH"
                  ? "bg-[#5C1B13] text-white shadow-xs"
                  : "text-[#6B584C] hover:text-[#1A1008]"
              }`}
            >
              <FiDollarSign className="w-3.5 h-3.5" />
              <span>Cash Collection</span>
            </button>
          </div>
        </div>

        {/* 3 Quick recharge preset cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {rechargePacks.map((pack) => (
            <button
              key={pack.amount}
              type="button"
              disabled={walletRecharging}
              onClick={() => onRecharge(pack.amount, paymentMethod)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer group disabled:opacity-50 relative ${
                pack.isPopular
                  ? "bg-white border-[#5C1B13] ring-1 ring-[#5C1B13] shadow-md shadow-[#5C1B13]/6"
                  : "bg-white border-[#E8DFD4] hover:border-[#5C1B13]/60 hover:bg-[#FFFDF9]"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xl font-extrabold font-mono text-[#1A1008] group-hover:text-[#5C1B13]">
                  ₹{pack.amount}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    pack.isPopular
                      ? "bg-[#5C1B13] text-white"
                      : "bg-[#FAF3EA] text-[#5C1B13] border border-[#E8DFD4]"
                  }`}
                >
                  {pack.label}
                </span>
              </div>
              <p className="text-xs text-[#6B584C] font-medium leading-snug">
                {pack.benefit}
              </p>
              <div className="mt-3 pt-2 border-t border-[#E8DFD4]/60 flex items-center justify-between text-[11px] font-bold text-[#5C1B13]">
                <span>
                  {paymentMethod === "ONLINE" ? "Pay via PayU" : "Request Cash Pickup"}
                </span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Custom recharge form */}
        <form
          onSubmit={handleCustomRechargeSubmit}
          className="pt-2 flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative w-full sm:w-72">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6B584C]">
              ₹
            </span>
            <input
              type="number"
              min="50"
              max="15000"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter Custom Amount (min ₹50)"
              className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#D5C7B8] focus:border-[#5C1B13] focus:ring-2 focus:ring-[#5C1B13]/10 bg-white text-sm font-semibold text-[#1A1008] focus:outline-none"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={
              walletRecharging || !customAmount || parseFloat(customAmount) < 50
            }
            className="w-full sm:w-auto rounded-xl px-6 py-2.5 text-xs font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white cursor-pointer transition-all shadow-2xs"
          >
            {walletRecharging ? (
              <span className="flex items-center gap-2">
                <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </span>
            ) : (
              <span>
                {paymentMethod === "ONLINE" ? "Top-up via PayU" : "Request Cash Top-up"}
              </span>
            )}
          </Button>
        </form>
      </div>

      {/* ─── TRANSACTION PASSBOOK & POLICY ROW ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Transactions Passbook */}
        <div className="bg-white rounded-3xl border border-[#E8DFD4] p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD4]">
            <h4 className="text-sm font-serif font-bold text-[#1A1008] flex items-center gap-2">
              <FiClock className="w-4 h-4 text-[#5C1B13]" />
              <span>Immutable Ledger & Activity</span>
            </h4>
            <span className="text-[10px] text-[#8C7A6B] font-mono">Real-time Ledger</span>
          </div>

          <div className="divide-y divide-[#E8DFD4]/70 max-h-60 overflow-y-auto scrollbar-thin pr-1">
            {/* Server Ledger Transactions if available */}
            {walletTransactions.length > 0 ? (
              walletTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        tx.type === "CREDIT"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-[#FAF3EA] text-[#5C1B13]"
                      }`}
                    >
                      {tx.type === "CREDIT" ? (
                        <FiArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <FiArrowUpRight className="w-4 h-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-[#1A1008] truncate">
                        {tx.description ||
                          (tx.type === "CREDIT" ? "Wallet Credit" : "Order Payment")}
                      </p>
                      <p className="text-[10px] text-[#8C7A6B] truncate">
                        {tx.referenceType || "LEDGER"} •{" "}
                        {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono font-bold block ${
                        tx.type === "CREDIT" ? "text-emerald-700" : "text-[#5C1B13]"
                      }`}
                    >
                      {tx.type === "CREDIT"
                        ? `+₹${(tx.amountPaise / 100).toFixed(2)}`
                        : `-₹${(tx.amountPaise / 100).toFixed(2)}`}
                    </span>
                    {typeof tx.balanceAfterPaise === "number" && (
                      <span className="text-[10px] text-[#8C7A6B] font-mono block">
                        Bal: ₹{(tx.balanceAfterPaise / 100).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : livePayments.length > 0 ? (
              livePayments.map((pay) => (
                <div
                  key={pay.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        pay.status === "SUCCESS"
                          ? "bg-emerald-50 text-emerald-700"
                          : pay.status === "REFUNDED"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {pay.status === "SUCCESS" ? (
                        <FiArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <FiRefreshCw className="w-4 h-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-[#1A1008] truncate">
                        {pay.paymentMethod === "ONLINE" ? "PayU Top-Up" : "Cash Top-Up"} (
                        {pay.transactionId})
                      </p>
                      <p className="text-[10px] text-[#8C7A6B] truncate">
                        {pay.status} •{" "}
                        {new Date(pay.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`font-mono font-bold shrink-0 ${
                      pay.status === "SUCCESS"
                        ? "text-emerald-700"
                        : pay.status === "REFUNDED"
                        ? "text-purple-700"
                        : "text-[#5C1B13]"
                    }`}
                  >
                    +₹{(pay.amountPaise / 100).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-[#8C7A6B]">
                No wallet activity yet.
              </div>
            )}
          </div>
        </div>

        {/* PuretyFarm Guarantee & Vacation Policy Note */}
        <div className="bg-white rounded-3xl border border-[#E8DFD4] p-5 shadow-2xs space-y-3.5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-serif font-bold text-[#1A1008] flex items-center gap-2 pb-2 border-b border-[#E8DFD4]">
              <FiShield className="w-4 h-4 text-[#5C1B13]" />
              <span>Wallet Guarantee & Refund Policy</span>
            </h4>

            <div className="space-y-2.5 pt-1 text-xs text-[#6B584C]">
              <div className="flex items-start gap-2">
                <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[#1A1008]">Never-Expiring Balance:</strong>{" "}
                  Your prepaid wallet credit never expires and carries forward every month.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[#1A1008]">Vacation Flexibility:</strong>{" "}
                  Pause daily delivery before 10:00 PM without fee. No money is deducted during paused days.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[#1A1008]">Direct Bank Refund:</strong>{" "}
                  Unused wallet balance can be refunded back to source via PayU in 3–7 business days upon request.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#FAF3EA] border border-[#E8DFD4] text-[11px] text-[#5C1B13] flex items-center gap-2">
            <FiInfo className="w-4 h-4 shrink-0 text-[#5C1B13]" />
            <span>Raipur 4°C cold-chain verified. Auto-deduction occurs only on delivery days.</span>
          </div>
        </div>
      </div>
    </m.div>
  );
}
