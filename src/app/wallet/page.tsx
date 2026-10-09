"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { paymentsApi, PaymentRecord } from "@/features/payments";
import {
  walletApi,
  CustomerWallet,
  WalletTransaction,
  WalletCreditRequest,
} from "@/features/wallet";
import {
  FiArrowLeft,
  FiPlusCircle,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiCreditCard,
  FiDollarSign,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";
import { LuWallet } from "react-icons/lu";

function WalletContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const [wallet, setWallet] = useState<CustomerWallet | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "CASH">("ONLINE");
  const [rechargeSuccess, setRechargeSuccess] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<{
    message: string;
    transactionId?: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [livePayments, setLivePayments] = useState<PaymentRecord[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [creditRequests, setCreditRequests] = useState<WalletCreditRequest[]>([]);

  // Fetch Wallet & Ledger from Server API — backend is the single source of
  // truth. Per customer wallet spec §10 rule 4, never read balancePaise from
  // our own cache after a payment attempt.
  const fetchWalletData = useCallback(async () => {
    if (!user) return;
    try {
      const [walletRes, txRes, crRes] = await Promise.all([
        walletApi.getWallet().catch(() => null),
        walletApi.getTransactions({ limit: 15 }).catch(() => null),
        walletApi.getCreditRequests({ limit: 5 }).catch(() => null),
      ]);

      if (walletRes && walletRes.balancePaise !== undefined) {
        setWallet(walletRes);
        setBalance(walletRes.balancePaise / 100);
      }

      if (txRes && Array.isArray(txRes.data)) {
        setWalletTransactions(txRes.data);
      }

      if (crRes && Array.isArray(crRes.data)) {
        setCreditRequests(crRes.data);
      }
    } catch (err) {
      console.warn("Wallet fetch error:", err);
    }
  }, [user]);

  // Load wallet balance from storage & sync
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth?redirect=/wallet");
      return;
    }

    if (user) {
      fetchWalletData();

      // Listen for wallet_update events (e.g. after a PayU return in another
      // tab) and re-fetch from the backend. No localStorage balance cache.
      const onUpdate = () => fetchWalletData();
      window.addEventListener("wallet_update", onUpdate);
      return () => {
        window.removeEventListener("wallet_update", onUpdate);
      };
    }
  }, [user, loading, router, fetchWalletData]);

  // Check URL params for txnid verification from PayU
  useEffect(() => {
    const txnid = searchParams.get("txnid");
    if (txnid && user) {
      // If a pending onboarding plan quote is waiting, resume onboarding so
      // the plan can be auto-confirmed from the newly-topped-up wallet.
      try {
        const raw = window.localStorage.getItem("pf_onboarding_pending_quote");
        if (raw) {
          const parsed = JSON.parse(raw);
          const expiresAt = parsed?.quote?.expiresAt
            ? new Date(parsed.quote.expiresAt).getTime()
            : 0;
          if (expiresAt > Date.now()) {
            router.replace(`/onboarding?step=5&txnid=${encodeURIComponent(txnid)}`);
            return;
          }
          window.localStorage.removeItem("pf_onboarding_pending_quote");
        }
      } catch {}
      paymentsApi
        .verifyPayment({ transactionId: txnid })
        .then((res) => {
          if (res.payment.status === "SUCCESS") {
            const amt = (res.payment.amountPaise / 100).toFixed(0);
            // Spec §10.5: show the two events separately on first credit.
            if (
              res.requiresAdminApproval ||
              res.payment.walletCredit?.status === "PENDING"
            ) {
              setRechargeSuccess(
                `Payment Successful — ₹${amt} reached PayU. Wallet Credit Awaiting Approval: the admin will approve shortly and your balance will update automatically.`
              );
            } else {
              setRechargeSuccess(
                `Payment Successful — ₹${amt} verified. Wallet credited.`
              );
            }
            fetchWalletData();
            window.dispatchEvent(new Event("wallet_update"));
          } else if (
            res.payment.status === "FAILED" ||
            res.payment.status === "CANCELLED" ||
            res.payment.status === "EXPIRED"
          ) {
            setPaymentError({
              message: `Payment of ₹${(res.payment.amountPaise / 100).toFixed(0)} was ${res.payment.status.toLowerCase()}.`,
              transactionId: txnid,
            });
          }
        })
        .catch((err) => {
          console.warn("Wallet verify error:", err);
        });
    }
  }, [searchParams, user, fetchWalletData]);

  // Load live payments history
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
  }, [user, rechargeSuccess]);

  const handleRecharge = async (
    amount: number,
    method: "ONLINE" | "CASH" = paymentMethod
  ) => {
    if (amount <= 0 || !user) return;
    setIsProcessing(true);
    setPaymentError(null);
    setRechargeSuccess(null);

    const amountPaise = Math.round(amount * 100);

    try {
      if (method === "ONLINE") {
        const res = await paymentsApi.initiateOnlineTopup(amountPaise, {
          autoRedirect: true,
        });
        if (res.checkout) {
          // Submitted to PayU
          return;
        }
      } else {
        const res = await paymentsApi.requestCashTopup(amountPaise);
        setRechargeSuccess(
          res.message ||
            `Cash collection of ₹${amount} requested. Your wallet will be credited after admin confirmation.`
        );
        fetchWalletData();
      }
    } catch (err: unknown) {
      // Backend-only: never fabricate a successful top-up locally. A failed
      // call must surface as an error with no balance change.
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Could not start the top-up. Please try again.";
      setPaymentError({ message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = async (transactionId: string) => {
    setIsProcessing(true);
    try {
      await paymentsApi.retryPayment({ transactionId }, { autoRedirect: true });
    } catch (err: any) {
      console.error("Payment retry failed:", err);
      alert(err?.message || "Failed to retry payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#5C1B13] border-t-transparent animate-spin" />
      </div>
    );
  }

  const pendingCreditRequest = creditRequests.find((cr) => cr.status === "PENDING");
  const refundRequest = creditRequests.find(
    (cr) => cr.status === "REJECTED" && cr.refundStatus && cr.refundStatus !== "NOT_REQUIRED"
  );

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col justify-between selection:bg-[#5C1B13]/10 selection:text-[#5C1B13]">
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-30 bg-[#FFFDF7]/90 backdrop-blur-md border-b border-[#E8DFD4] py-3.5 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/account?tab=wallet"
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#5C1B13] hover:underline"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back to Account</span>
          </Link>
          <BrandLogo />
          <div className="w-16" />
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6 flex-1">
        {/* Pending credit request notice */}
        {pendingCreditRequest && (
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
            <FiClock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                Top-up Request Pending (₹{(pendingCreditRequest.amountPaise / 100).toFixed(0)})
              </p>
              <p className="text-xs text-sky-800 mt-0.5">
                Your top-up has been received and is being verified by our depot team.
              </p>
            </div>
          </div>
        )}

        {/* Refund Status notice */}
        {refundRequest && (
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
            <FiShield className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                Refund Status: {refundRequest.refundStatus === "REFUND_PENDING" ? "Processing Refund" : "Refund Settled"} (₹{(refundRequest.amountPaise / 100).toFixed(0)})
              </p>
              <p className="text-xs text-purple-800 mt-0.5">
                {refundRequest.refundStatus === "REFUND_PENDING"
                  ? "Refund requested to your original source account via PayU."
                  : "Refund confirmed and processed to your source account."}
              </p>
            </div>
          </div>
        )}

        {/* Success message banner */}
        {rechargeSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
            <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{rechargeSuccess}</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Your prepaid balance is updated and ready for next morning&apos;s delivery.
              </p>
            </div>
          </div>
        )}

        {/* Payment Error / Retry banner */}
        {paymentError && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{paymentError.message}</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  No money was deducted. You can retry with PayU or choose another method.
                </p>
              </div>
            </div>
            {paymentError.transactionId && (
              <Button
                variant="primary"
                size="sm"
                disabled={isProcessing}
                onClick={() => handleRetry(paymentError.transactionId!)}
                className="rounded-xl px-4 py-2 text-xs font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white shrink-0 flex items-center gap-1.5 shadow-xs"
              >
                <FiRefreshCw className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
                <span>Retry Top-up</span>
              </Button>
            )}
          </div>
        )}

        {/* ─── WALLET BALANCE CARD ─── */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#5C1B13] via-[#48150f] to-[#2E0B07] text-white p-6 sm:p-8 shadow-xl shadow-[#5C1B13]/10">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-amber-200">
                  <LuWallet className="w-4 h-4" />
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-white/80">
                  Purety Prepaid Balance
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-bold font-mono">
                  ₹{balance.toFixed(2)}
                </span>
                <span className="text-xs text-white/70">Available for dawn milk orders</span>
              </div>
              <p className="text-xs text-white/70 mt-2 flex items-center gap-1.5">
                <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Auto-deducts daily for cold-chain delivery at sunrise.</span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/15 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider block">
                Linked Subscriber
              </span>
              <p className="font-bold text-white">{user.name || "Customer"}</p>
              <p className="font-mono text-white/80">{user.phone}</p>
            </div>
          </div>
        </div>

        {/* ─── QUICK RECHARGE GRID ─── */}
        <div className="bg-white rounded-3xl border border-[#E8DFD4] p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1A1008] flex items-center gap-2">
                <FiPlusCircle className="w-4 h-4 text-[#5C1B13]" />
                Top-up Wallet
              </h3>
              <p className="text-xs text-[#6B584C]">
                Recharge wallet for seamless daily milk deliveries with zero checkout interruptions.
              </p>
            </div>

            {/* Payment Method Selector */}
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
                <span>Online PayU</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { amount: 500, label: "Starter", bonus: "6 Bottles" },
              { amount: 1000, label: "Recommended", bonus: "12 Bottles + 5% Bonus" },
              { amount: 2500, label: "Monthly Pack", bonus: "Full Month + 10% Extra" },
            ].map((plan) => (
              <button
                key={plan.amount}
                type="button"
                disabled={isProcessing}
                onClick={() => handleRecharge(plan.amount, paymentMethod)}
                className="p-4 rounded-2xl border border-[#E8DFD4] hover:border-[#5C1B13] bg-[#FAF8F5]/60 hover:bg-[#FAF3EA] transition-all text-left cursor-pointer group disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg font-bold font-mono text-[#1A1008] group-hover:text-[#5C1B13]">
                    ₹{plan.amount}
                  </span>
                  <span className="text-[10px] font-bold text-[#5C1B13] bg-white px-2 py-0.5 rounded-full border border-[#E8DFD4]">
                    {plan.label}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B584C] font-medium">{plan.bonus}</p>
              </button>
            ))}
          </div>

          {/* Custom amount form */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#6B584C]">
                ₹
              </span>
              <input
                type="number"
                min="50"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Custom Amount (min ₹50)"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#D5C7B8] focus:border-[#5C1B13] focus:ring-2 focus:ring-[#5C1B13]/10 bg-white text-sm font-semibold focus:outline-none"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              disabled={isProcessing || !customAmount || parseFloat(customAmount) < 50}
              onClick={() => handleRecharge(parseFloat(customAmount), paymentMethod)}
              className="w-full sm:w-auto rounded-xl px-5 py-2.5 text-xs font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white cursor-pointer"
            >
              {isProcessing
                ? "Processing..."
                : paymentMethod === "ONLINE"
                ? "Top-up via PayU"
                : "Request Cash Top-up"}
            </Button>
          </div>
        </div>

        {/* ─── TRANSACTION LEDGER & POLICY ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Recent Activity */}
          <div className="bg-white rounded-3xl border border-[#E8DFD4] p-5 sm:p-6 shadow-2xs space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-[#1A1008] flex items-center gap-2">
              <FiClock className="w-4 h-4 text-[#5C1B13]" />
              Recent Wallet Activity
            </h4>
            <div className="divide-y divide-[#E8DFD4]/70 text-xs max-h-56 overflow-y-auto">
              {walletTransactions.length > 0 ? (
                walletTransactions.map((tx) => (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          tx.type === "CREDIT"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-[#FAF3EA] text-[#5C1B13]"
                        }`}
                      >
                        {tx.type === "CREDIT" ? (
                          <FiArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <FiArrowUpRight className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <div>
                        <p className="font-bold text-[#1A1008]">
                          {tx.description || (tx.type === "CREDIT" ? "Wallet Credit" : "Order Payment")}
                        </p>
                        <p className="text-[10px] text-[#8C7A6B]">
                          {tx.referenceType || "LEDGER"} •{" "}
                          {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        tx.type === "CREDIT" ? "text-emerald-700" : "text-[#5C1B13]"
                      }`}
                    >
                      {tx.type === "CREDIT"
                        ? `+₹${(tx.amountPaise / 100).toFixed(2)}`
                        : `-₹${(tx.amountPaise / 100).toFixed(2)}`}
                    </span>
                  </div>
                ))
              ) : livePayments.length > 0 ? (
                livePayments.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          p.status === "SUCCESS"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        <FiArrowDownLeft className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <p className="font-bold text-[#1A1008]">
                          {p.paymentMethod === "ONLINE" ? "PayU Top-Up" : "Cash Top-Up"}
                        </p>
                        <p className="text-[10px] text-[#8C7A6B]">
                          {p.status} •{" "}
                          {new Date(p.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        p.status === "SUCCESS" ? "text-emerald-700" : "text-[#5C1B13]"
                      }`}
                    >
                      +₹{(p.amountPaise / 100).toFixed(2)}
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

          {/* Refund to Source Policy Card */}
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8DFD4] p-5 sm:p-6 shadow-2xs space-y-2.5">
            <h4 className="text-xs sm:text-sm font-bold text-[#1A1008] flex items-center gap-2">
              <FiShield className="w-4 h-4 text-[#5C1B13]" />
              100% Refundable to Source
            </h4>
            <p className="text-xs text-[#6B584C] leading-relaxed">
              Unused wallet credits can be refunded back to your original payment method via PayU anytime. Processing takes 3–7 business days depending on your bank.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  alert(
                    "Refund request received. Our Raipur account team will process the balance to source."
                  )
                }
                className="text-xs font-bold text-[#5C1B13] hover:underline cursor-pointer inline-flex items-center gap-1"
              >
                <span>Request Refund to Source</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="py-4 text-center border-t border-[#E8DFD4] text-xs text-[#6B584C] bg-white/80 mt-auto">
        <span>© {new Date().getFullYear()} PuretyFarm Raipur • Safe & Encrypted Wallet System</span>
      </footer>
    </div>
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
