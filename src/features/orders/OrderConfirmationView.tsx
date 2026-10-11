"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Milk,
  Receipt,
  Sparkles,
  Banknote,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { CustomerHeader } from "@/components/pf/layout/CustomerHeader";
import { PfBadge, PfCard } from "@/components/pf";

type ConfirmStatus = "PENDING_APPROVAL" | "CONFIRMED" | "PENDING_PAYMENT" | string;

export function OrderConfirmationView() {
  const searchParams = useSearchParams();

  // Everything shown here comes straight from the backend `/plans/confirm`
  // response, forwarded via the URL by the onboarding hook. No localStorage
  // reads, no fabrication.
  const selectionId = searchParams.get("selectionId") || "";
  const planName = searchParams.get("plan") || "Purety Farm Milk Plan";
  const amountRupees = searchParams.get("amount") || "0.00";
  const method = (searchParams.get("method") || "WALLET").toUpperCase();
  const status: ConfirmStatus = (searchParams.get("status") || "PENDING_APPROVAL").toUpperCase();
  const cashCollectionId = searchParams.get("cashCollectionId") || "";

  const isCash = method === "CASH";
  const isConfirmed = status === "CONFIRMED";
  const isPendingPayment = status === "PENDING_PAYMENT";
  // Per-delivery plan: purchased, nothing charged, awaiting funding + approval.
  const isPendingApproval = status === "PENDING_APPROVAL";

  const headerBadge = isConfirmed
    ? isCash
      ? "Order Confirmed"
      : "Payment Successful"
    : isPendingApproval
      ? "Order Pending Approval"
      : isPendingPayment
        ? "Awaiting Cash Collection"
        : "Submitted";

  const headerTitle = isConfirmed
    ? "Plan Activated!"
    : isPendingApproval
      ? "Plan Purchased — Awaiting Approval"
      : isPendingPayment
        ? "Cash Collection Pending"
        : "Order Submitted";

  const headerCopy = isConfirmed
    ? "Thank you for choosing Purety Farm. Your deliveries are scheduled — track the first drop in My Orders."
    : isPendingApproval
      ? isCash
        ? "Nothing has been deducted. Add cash to your wallet from the Wallet page; once it is confirmed, our team approves your plan and sets your first delivery date. Each delivery is then charged to your wallet only when it is delivered."
        : "Nothing has been deducted from your wallet. Once your wallet funding is confirmed, our team approves your plan and sets your first delivery date. Each delivery is then charged to your wallet only when it is delivered."
      : isPendingPayment
        ? "Our delivery partner will collect the cash on your doorstep. Deliveries start as soon as the admin confirms the collection."
        : "Your request has been submitted. Please check My Orders for the latest status.";

  return (
    <>
      <CustomerHeader
        title={isConfirmed ? "Order Confirmed" : "Order Submitted"}
        subtitle={
          isConfirmed
            ? "Your farm-fresh A2 milk delivery is scheduled."
            : isPendingApproval
              ? "Your plan starts once it is approved and scheduled."
              : "Your plan will activate once payment is confirmed."
        }
      />

      <div className="mx-auto max-w-3xl space-y-5">
        {/* Hero */}
        <div
          className={`relative overflow-hidden rounded-[24px] border p-6 text-center sm:p-8 ${
            isConfirmed
              ? "border-[#cce3cf] bg-gradient-to-b from-[#f0f8f0] to-[#e4f3e5]"
              : "border-amber-200 bg-gradient-to-b from-amber-50 to-amber-100/60"
          }`}
        >
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg ${
              isConfirmed
                ? "bg-emerald-600 shadow-emerald-600/30"
                : "bg-amber-600 shadow-amber-600/30"
            }`}
          >
            {isConfirmed ? (
              <CheckCircle2 className="h-9 w-9 stroke-[2.2]" />
            ) : (
              <Clock className="h-9 w-9 stroke-[2.2]" />
            )}
          </div>

          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              isConfirmed
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{headerBadge}</span>
          </div>

          <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-[#1a1008]">
            {headerTitle}
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm text-[#4a3b32] sm:text-[15px]">
            {headerCopy}
          </p>

          {selectionId && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-semibold text-[#1a1008] backdrop-blur-sm">
              <span className="text-[#715e50]">Selection ID:</span>
              <span className="font-mono font-bold text-[#5C1B13]">
                #{selectionId.slice(0, 10).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Plan + Payment summary */}
        <div className="grid gap-4 sm:grid-cols-2">
          <PfCard padding="md" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[var(--pf-border)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5C1B13]/10 text-[#5C1B13]">
                    <Milk className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--pf-text-muted)]">
                      Selected Plan
                    </h3>
                    <p className="font-bold text-[var(--pf-text)] text-sm sm:text-[15px]">
                      {planName}
                    </p>
                  </div>
                </div>
                <PfBadge tone={isConfirmed ? "brand" : "warning"}>
                  {isConfirmed ? "Active" : "Pending"}
                </PfBadge>
              </div>

              <div className="mt-3.5 space-y-2 text-xs">
                <div className="flex justify-between text-[#715e50]">
                  <span>Payment Method</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#24130f]">
                    {isCash ? (
                      <>
                        <Banknote className="h-3.5 w-3.5 text-amber-600" />
                        <span>{isPendingApproval ? "Cash Wallet Top-up" : "Cash on Delivery"}</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{isPendingApproval ? "Wallet (per delivery)" : "Wallet Payment"}</span>
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-[#715e50]">
                  <span>Payment Status</span>
                  <span className="font-semibold text-[#24130f]">
                    {isConfirmed
                      ? isCash
                        ? "Collected (confirmed)"
                        : "Paid from wallet"
                      : isPendingApproval
                        ? "Charged per delivery — nothing deducted yet"
                        : "Awaiting cash collection"}
                  </span>
                </div>
                {cashCollectionId && (
                  <div className="flex justify-between text-[#715e50]">
                    <span>Cash Collection</span>
                    <span className="font-mono text-[11px] font-semibold text-[#24130f]">
                      #{cashCollectionId.slice(0, 10).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--pf-border)] pt-3 text-sm">
              <span className="font-semibold text-[var(--pf-text)]">
                {isPendingApproval ? "Plan Total (charged per delivery)" : "Total Amount"}
              </span>
              <span className="font-serif text-lg font-bold text-[#5C1B13]">
                ₹{Number(amountRupees).toFixed(2)}
              </span>
            </div>
          </PfCard>

          {/* Delivery schedule — honest about what we do and don't know */}
          <PfCard padding="md" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[var(--pf-border)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--pf-text-muted)]">
                      Delivery Schedule
                    </h3>
                    <p className="font-bold text-[var(--pf-text)] text-sm sm:text-[15px]">
                      {isConfirmed ? "Starts shortly" : "Starts after confirmation"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 space-y-2 text-xs text-[#715e50]">
                {isConfirmed ? (
                  <p>
                    Your scheduled deliveries will appear in{" "}
                    <Link
                      href="/orders"
                      className="font-semibold text-[#5C1B13] underline"
                    >
                      My Orders
                    </Link>{" "}
                    once the backend materialises them. Window times, dates and
                    partner details are set from the delivery schedule.
                  </p>
                ) : (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-[11.5px] text-amber-900">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>
                      Deliveries are created only after the admin confirms
                      receipt of the cash collection. Please keep{" "}
                      <strong>₹{Number(amountRupees).toFixed(2)}</strong> ready
                      for the collection visit.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </PfCard>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between pt-2">
          <Link
            href="/orders"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#5C1B13] px-6 text-sm font-bold text-white shadow-md shadow-[#5C1B13]/20 hover:bg-[#48150f] transition-all cursor-pointer"
          >
            <Receipt className="h-4 w-4" />
            <span>View My Orders</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/account"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--pf-border)] bg-white px-5 text-sm font-bold text-[#24130f] hover:bg-[var(--pf-surface-soft)] transition-all cursor-pointer sm:flex-initial"
            >
              <span>Account</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
