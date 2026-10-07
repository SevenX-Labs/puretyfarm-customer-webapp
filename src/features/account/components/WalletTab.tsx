"use client";

import React, { useState, useEffect } from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { User } from "@/types/models";
import {
  FiPlusCircle,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiArrowDownLeft,
  FiArrowUpRight,
  FiRefreshCw,
  FiLock,
  FiInfo,
} from "react-icons/fi";
import { LuWallet } from "react-icons/lu";

export interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  title: string;
  description: string;
  date: string;
}

export interface WalletTabProps {
  user: User;
  walletBalance: number;
  walletLoading: boolean;
  walletRecharging: boolean;
  walletSuccessMsg: string | null;
  onRecharge: (amount: number) => void;
}

export function WalletTab({
  user,
  walletBalance,
  walletLoading,
  walletRecharging,
  walletSuccessMsg,
  onRecharge,
}: WalletTabProps) {
  const [customAmount, setCustomAmount] = useState<string>("");
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  // Load transactions for this user from localStorage
  useEffect(() => {
    try {
      const txKey = `pf_wallet_tx_${user.id}`;
      const saved = localStorage.getItem(txKey);
      if (saved) {
        setTransactions(JSON.parse(saved));
      } else {
        const defaultTxs: WalletTransaction[] = [
          {
            id: "tx-welcome",
            type: "credit",
            amount: 255,
            title: "Promotional Starter Credit",
            description: "Account creation bonus for fresh milk trial",
            date: "Account Opened",
          },
        ];
        setTransactions(defaultTxs);
        localStorage.setItem(txKey, JSON.stringify(defaultTxs));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [user.id]);

  // Sync transactions whenever walletSuccessMsg changes
  useEffect(() => {
    try {
      const txKey = `pf_wallet_tx_${user.id}`;
      const saved = localStorage.getItem(txKey);
      if (saved) {
        setTransactions(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, [walletSuccessMsg, user.id]);

  const handleCustomRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customAmount);
    if (val && val >= 50) {
      onRecharge(val);
      setCustomAmount("");
    }
  };

  const rechargePacks = [
    {
      amount: 500,
      label: "STARTER",
      benefit: "6 Morning Deliveries",
      isPopular: false,
    },
    {
      amount: 1000,
      label: "RECOMMENDED",
      benefit: "12 Days + 5% Bonus Credit",
      isPopular: true,
    },
    {
      amount: 2500,
      label: "MONTHLY PACK",
      benefit: "Full Month + 10% Extra Credit",
      isPopular: false,
    },
  ];

  return (
    <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* ─── SECTION TITLE ─── */}
      <div className="pb-4 border-b border-[#E8DFD4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1008] flex items-center gap-2">
            <LuWallet className="w-6 h-6 text-[#5C1B13]" />
            <span>PuretyFarm Prepaid Wallet</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#6B584C] mt-0.5">
            Instant automatic doorstep deliveries without everyday checkout hassle across Raipur.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3EA] border border-[#E8DFD4] text-[#5C1B13] text-xs font-semibold self-start sm:self-auto shadow-2xs">
          <FiShield className="w-3.5 h-3.5 text-[#5C1B13]" />
          <span>100% Refundable to Source</span>
        </div>
      </div>

      {/* ─── SUCCESS TOAST / NOTIFICATION ─── */}
      {walletSuccessMsg && (
        <m.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-semibold text-emerald-900 flex items-center gap-2.5 shadow-2xs"
        >
          <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{walletSuccessMsg}</span>
        </m.div>
      )}

      {/* ─── WALLET BALANCE HERO CARD ─── */}
      <div className="rounded-3xl bg-gradient-to-br from-[#5C1B13] via-[#48150F] to-[#2B0A06] text-white p-6 sm:p-7 shadow-[0_12px_36px_rgba(92,27,19,0.22)] relative overflow-hidden">
        {/* Decorative blur accent */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                <LuWallet className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                Available Wallet Balance
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              {walletLoading ? (
                <div className="h-10 w-32 bg-white/10 animate-pulse rounded-lg" />
              ) : (
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                  ₹{walletBalance.toFixed(2)}
                </span>
              )}
              <span className="text-xs text-white/70 font-medium">Ready for dawn milk dispatch</span>
            </div>

            <p className="text-xs text-white/75 mt-2.5 flex items-center gap-1.5">
              <FiCheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Auto-deducts daily for 4°C cold-chain morning milk deliveries.</span>
            </p>
          </div>

          {/* Linked Account info badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-xs space-y-1 w-full sm:w-auto shrink-0">
            <span className="text-[10px] uppercase font-bold text-white/70 tracking-wider block">
              Linked Customer Account
            </span>
            <p className="font-bold text-white text-sm">{user.name || "Customer"}</p>
            <p className="font-mono text-white/80 text-xs">{user.phone}</p>
            <div className="pt-1 flex items-center gap-1 text-[10px] text-emerald-300 font-medium">
              <FiLock className="w-3 h-3" />
              <span>Encrypted Wallet Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── QUICK TOP-UP RECHARGE SECTION ─── */}
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8DFD4] p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#E8DFD4]/70">
          <div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#1A1008] flex items-center gap-2">
              <FiPlusCircle className="w-4 h-4 text-[#5C1B13]" />
              <span>Recharge / Top-Up Wallet</span>
            </h3>
            <p className="text-xs text-[#6B584C] mt-0.5">
              Add prepaid credit for uninterrupted daily doorstep deliveries with zero payment failures.
            </p>
          </div>
        </div>

        {/* 3 Quick recharge preset cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {rechargePacks.map((pack) => (
            <button
              key={pack.amount}
              type="button"
              disabled={walletRecharging}
              onClick={() => onRecharge(pack.amount)}
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
              <p className="text-xs text-[#6B584C] font-medium leading-snug">{pack.benefit}</p>
              <div className="mt-3 pt-2 border-t border-[#E8DFD4]/60 flex items-center justify-between text-[11px] font-bold text-[#5C1B13]">
                <span>Tap to Recharge</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Custom recharge form */}
        <form onSubmit={handleCustomRechargeSubmit} className="pt-2 flex flex-col sm:flex-row items-center gap-3">
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
            disabled={walletRecharging || !customAmount || parseFloat(customAmount) < 50}
            className="w-full sm:w-auto rounded-xl px-6 py-2.5 text-xs font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white cursor-pointer transition-all shadow-2xs"
          >
            {walletRecharging ? (
              <span className="flex items-center gap-2">
                <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </span>
            ) : (
              <span>Add Custom Amount</span>
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
              <span>Recent Wallet Activity</span>
            </h4>
            <span className="text-[10px] text-[#8C7A6B] font-mono">Live Sync</span>
          </div>

          <div className="divide-y divide-[#E8DFD4]/70 max-h-56 overflow-y-auto scrollbar-thin pr-1">
            {transactions.length === 0 ? (
              <p className="text-xs text-[#8C7A6B] py-4 text-center">No transactions recorded yet.</p>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        tx.type === "credit"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-[#FAF3EA] text-[#5C1B13]"
                      }`}
                    >
                      {tx.type === "credit" ? (
                        <FiArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <FiArrowUpRight className="w-4 h-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-[#1A1008] truncate">{tx.title}</p>
                      <p className="text-[10px] text-[#8C7A6B] truncate">{tx.description} • {tx.date}</p>
                    </div>
                  </div>

                  <span
                    className={`font-mono font-bold shrink-0 ${
                      tx.type === "credit" ? "text-emerald-700" : "text-[#5C1B13]"
                    }`}
                  >
                    {tx.type === "credit" ? `+₹${tx.amount.toFixed(2)}` : `-₹${tx.amount.toFixed(2)}`}
                  </span>
                </div>
              ))
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
                  <strong className="text-[#1A1008]">Never-Expiring Balance:</strong> Your prepaid wallet credit never expires and carries forward every month.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[#1A1008]">Vacation Flexibility:</strong> Pause daily delivery before 10:00 PM without fee. No money is deducted during paused days.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[#1A1008]">Direct Bank Refund:</strong> Unused wallet balance can be returned back to source bank account in 3–7 business days upon request.
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
