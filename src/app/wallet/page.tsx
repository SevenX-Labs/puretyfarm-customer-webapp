"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import {
  FiArrowLeft,
  FiPlusCircle,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiCreditCard,
  FiArrowDownLeft,
  FiArrowUpRight,
} from "react-icons/fi";
import { LuWallet } from "react-icons/lu";

export default function WalletPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [balance, setBalance] = useState<number>(0);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [rechargeSuccess, setRechargeSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Load wallet balance from storage
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth?redirect=/wallet");
      return;
    }

    if (user) {
      try {
        const saved = localStorage.getItem(`pf_wallet_${user.id}`);
        if (saved) {
          setBalance(parseFloat(saved) || 0);
        } else {
          setBalance(255); // Welcome starter promotional balance
        }
      } catch {
        setBalance(255);
      }
    }
  }, [user, loading, router]);

  const handleRecharge = (amount: number) => {
    if (amount <= 0) return;
    setIsProcessing(true);
    setTimeout(() => {
      const next = balance + amount;
      setBalance(next);
      if (user) {
        try {
          localStorage.setItem(`pf_wallet_${user.id}`, next.toString());
        } catch {
          // Ignore
        }
      }
      setIsProcessing(false);
      setCustomAmount("");
      setRechargeSuccess(`Successfully added ₹${amount} to your PuretyFarm wallet!`);
      setTimeout(() => setRechargeSuccess(null), 3500);
    }, 600);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="text-center p-8 rounded-3xl bg-white/80 border border-[#E8DFD4] shadow-sm max-w-xs w-full mx-4">
          <div className="w-9 h-9 rounded-full border-3 border-[#5C1B13] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#1A1008] font-bold">Opening your wallet...</p>
          <p className="text-xs text-[#6B584C] mt-1">Checking secure credentials</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col selection:bg-[#5C1B13]/15 selection:text-[#5C1B13]">
      {/* ─── HEADER BAR ─── */}
      <header className="w-full py-3.5 px-4 sm:px-8 border-b border-[#E8DFD4]/80 bg-[#FFFDF7]/90 backdrop-blur-md sticky top-0 z-40 shadow-2xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-xl hover:bg-black/5 text-[#3A241C] transition-colors"
              aria-label="Back to home"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <BrandLogo size="sm" priority />
            <span className="hidden sm:inline-block h-4 w-px bg-[#E8DFD4]" />
            <span className="hidden sm:inline-block text-xs font-semibold text-[#5C1B13]">
              Purety Wallet
            </span>
          </div>

          <Link
            href="/account"
            className="text-xs font-semibold text-[#5C1B13] hover:underline flex items-center gap-1"
          >
            <span>My Account</span>
          </Link>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Success toast */}
        {rechargeSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-semibold text-emerald-900 flex items-center gap-2.5 shadow-2xs">
            <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{rechargeSuccess}</span>
          </div>
        )}

        {/* ─── WALLET BALANCE HERO CARD ─── */}
        <div className="rounded-3xl bg-gradient-to-br from-[#5C1B13] to-[#3B110C] text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <LuWallet className="w-4 h-4" />
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-white/80">
                  Purety Prepaid Balance
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-bold font-mono">₹{balance.toFixed(2)}</span>
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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1A1008] flex items-center gap-2">
                <FiPlusCircle className="w-4 h-4 text-[#5C1B13]" />
                Top-up Wallet
              </h3>
              <p className="text-xs text-[#6B584C]">
                Recharge wallet for seamless daily milk deliveries with zero checkout interruptions.
              </p>
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
                onClick={() => handleRecharge(plan.amount)}
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
                placeholder="Custom Amount"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#D5C7B8] focus:border-[#5C1B13] focus:ring-2 focus:ring-[#5C1B13]/10 bg-white text-sm font-semibold focus:outline-none"
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              disabled={isProcessing || !customAmount || parseFloat(customAmount) <= 0}
              onClick={() => handleRecharge(parseFloat(customAmount))}
              className="w-full sm:w-auto rounded-xl px-5 py-2.5 text-xs font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white cursor-pointer"
            >
              {isProcessing ? "Processing..." : "Add to Wallet"}
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
            <div className="divide-y divide-[#E8DFD4]/70 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FiArrowDownLeft className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <p className="font-bold text-[#1A1008]">Promotional Starter Credit</p>
                    <p className="text-[10px] text-[#8C7A6B]">Account creation bonus</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-700">+₹255.00</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FAF3EA] text-[#5C1B13] flex items-center justify-center">
                    <FiArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <p className="font-bold text-[#1A1008]">Morning Delivery Deduction</p>
                    <p className="text-[10px] text-[#8C7A6B]">1L Pure A2 Glass Bottle</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-[#5C1B13]">-₹85.00</span>
              </div>
            </div>
          </div>

          {/* Refund to Source Policy Card */}
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8DFD4] p-5 sm:p-6 shadow-2xs space-y-2.5">
            <h4 className="text-xs sm:text-sm font-bold text-[#1A1008] flex items-center gap-2">
              <FiShield className="w-4 h-4 text-[#5C1B13]" />
              100% Refundable to Source
            </h4>
            <p className="text-xs text-[#6B584C] leading-relaxed">
              Unused wallet credits can be refunded back to your original payment method anytime. Processing takes 3–7 business days depending on your bank.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => alert("Refund request received. Our Raipur account team will process the balance to source.")}
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
