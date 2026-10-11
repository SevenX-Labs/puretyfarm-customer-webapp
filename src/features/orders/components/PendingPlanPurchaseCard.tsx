"use client";

import React from "react";
import Link from "next/link";
import { Clock, Wallet, Calendar, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { PfBadge, PfCard } from "@/components/pf";
import { formatCurrency } from "@/lib/utils/formatters";
import type { PendingPlanPurchase } from "../types";

const rupees = (paise?: number | null) =>
  paise == null ? "—" : formatCurrency(paise / 100);

const PLAN_LABELS: Record<string, string> = {
  BUY_ONCE: "Buy Once (1 Litre Sample)",
  SEVEN_DAY_TRIAL: "7-Day Trial Plan",
  TRIAL: "7-Day Trial Plan",
  MONTHLY: "Monthly Subscription",
};

const FREQUENCY_LABELS: Record<string, string> = {
  DAILY: "Daily",
  ALTERNATE_DAYS: "Alternate Days",
};

export function PendingPlanPurchaseCard({
  purchase,
}: {
  purchase: PendingPlanPurchase;
}) {
  const funding = purchase.funding;
  const isFundingConfirmed = funding.status === "CONFIRMED";
  const isFundingPending = funding.status === "PENDING_APPROVAL";

  const fundingLabel = isFundingConfirmed
    ? "Confirmed"
    : isFundingPending
    ? "Pending admin approval"
    : "Not added yet";

  const fundingDetail = isFundingConfirmed
    ? `Wallet balance ${rupees(funding.walletBalancePaise)}`
    : isFundingPending
    ? `Top-up of ${rupees(funding.pendingCreditPaise)} is awaiting admin confirmation`
    : "Add money to your wallet so your plan can be approved";

  const planName = PLAN_LABELS[purchase.planType] || purchase.planType;
  const frequencyName = purchase.frequency ? FREQUENCY_LABELS[purchase.frequency] || purchase.frequency : "";

  const quantityText =
    purchase.quantityMode === "ALTERNATING"
      ? `${purchase.quantityA ?? "—"}L / ${purchase.quantityB ?? "—"}L alternating`
      : `${purchase.quantity ?? 1}L per delivery`;

  return (
    <div className="mb-6 rounded-[24px] border border-amber-200 bg-gradient-to-b from-amber-50/80 to-amber-100/40 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
            <Clock className="h-5 w-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-amber-800">
              PENDING ENROLLMENT
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[var(--pf-text)] leading-tight">
              Order pending — awaiting admin approval
            </h3>
          </div>
        </div>
        <PfBadge tone="warning" dot>
          Awaiting Approval
        </PfBadge>
      </div>

      <div className="rounded-2xl border border-amber-200/80 bg-white/90 p-4 space-y-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--pf-border)] pb-3">
          <div>
            <div className="text-sm font-bold text-[var(--pf-text)]">{planName}</div>
            <div className="text-xs text-[var(--pf-text-secondary)] font-medium mt-0.5">
              {quantityText} {frequencyName ? `· ${frequencyName}` : ""}
              {purchase.unitPricePaise ? ` · ${rupees(purchase.unitPricePaise)}/L` : ""}
            </div>
          </div>
          <div className="text-right">
            <span className="font-mono text-xs font-bold text-[var(--pf-brown)] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
              #{purchase.selectionId.slice(0, 8).toUpperCase()}
            </span>
          </div>
        </div>

        {/* 3 distinct lifecycle steps */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-start justify-between gap-3 py-1">
            <div>
              <div className="font-bold text-[var(--pf-text)] flex items-center gap-1.5">
                <Wallet className="h-3.5 w-3.5 text-amber-700" />
                <span>Step 1 · Wallet funding</span>
              </div>
              <div className="text-[11.5px] text-[var(--pf-text-secondary)] mt-0.5">
                {fundingDetail}
              </div>
            </div>
            <PfBadge tone={isFundingConfirmed ? "success" : "warning"} dot>
              {fundingLabel}
            </PfBadge>
          </div>

          <div className="flex items-start justify-between gap-3 py-1 border-t border-[var(--pf-border)] pt-2.5">
            <div>
              <div className="font-bold text-[var(--pf-text)] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-700" />
                <span>Step 2 · Plan approval</span>
              </div>
              <div className="text-[11.5px] text-[var(--pf-text-secondary)] mt-0.5">
                Our team reviews and approves your plan once wallet funding is confirmed
              </div>
            </div>
            <PfBadge tone="warning" dot>
              Pending
            </PfBadge>
          </div>

          <div className="flex items-start justify-between gap-3 py-1 border-t border-[var(--pf-border)] pt-2.5">
            <div>
              <div className="font-bold text-[var(--pf-text)] flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                <span>Step 3 · Delivery schedule</span>
              </div>
              <div className="text-[11.5px] text-[var(--pf-text-secondary)] mt-0.5">
                Your first delivery date is selected when the plan is approved
              </div>
            </div>
            <PfBadge tone="neutral">
              Not scheduled yet
            </PfBadge>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--pf-text-secondary)]">
        <p className="leading-relaxed text-[12px]">
          <strong>Charged per delivery:</strong> Nothing has been deducted. Your daily delivery orders will be generated once your plan is approved, and each order will be debited from your wallet only when delivered.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          {!isFundingConfirmed && (
            <Link
              href="/wallet"
              className="inline-flex items-center gap-1 font-bold text-amber-900 underline hover:no-underline"
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>Add money</span>
            </Link>
          )}
          <Link
            href="/plan"
            className="inline-flex items-center gap-1 font-bold text-[var(--pf-brown)] hover:text-[#48150f]"
          >
            <span>View in My Plan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
