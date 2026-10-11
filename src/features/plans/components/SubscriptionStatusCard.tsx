"use client";

import Link from "next/link";
import { Info, Wallet } from "lucide-react";
import { PfBadge, PfCard } from "@/components/pf";
import type { CustomerSubscriptionSummary } from "@/features/plans/api/plansApi";
import { formatCurrency } from "@/lib/utils/formatters";

/** Paise to a rupee string, via the app's existing currency formatter. */
const rupees = (paise: number) => formatCurrency(paise / 100);

const PLAN_LABEL: Record<string, string> = {
  BUY_ONCE: "Buy Once",
  SEVEN_DAY_TRIAL: "7-Day Trial Plan",
  MONTHLY: "Monthly Subscription",
};

const FREQUENCY_LABEL: Record<string, string> = {
  DAILY: "Daily",
  ALTERNATE_DAYS: "Alternate days",
};

type Tone = "success" | "warning" | "neutral";

function StatusRow({
  step,
  label,
  value,
  tone,
  detail,
}: {
  step: string;
  label: string;
  value: string;
  tone: Tone;
  detail?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-[var(--pf-border)] last:border-b-0">
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
          {step} · {label}
        </div>
        {detail && (
          <div className="mt-0.5 text-[12.5px] text-[var(--pf-text-secondary)]">{detail}</div>
        )}
      </div>
      <PfBadge tone={tone} dot>
        {value}
      </PfBadge>
    </div>
  );
}

/**
 * The customer's plan with its separate states: wallet funding, admin approval,
 * scheduling, and what has been delivered and charged so far. Everything shown
 * comes from the server; nothing here is a price or status invented client-side.
 */
export function SubscriptionStatusCard({
  subscription,
}: {
  subscription: CustomerSubscriptionSummary;
}) {
  const s = subscription;
  const isPerDelivery = s.billingModel === "PER_DELIVERY";
  const awaitingApproval = s.approvalStatus === "PENDING";
  const funding = s.funding;

  const fundingValue =
    funding.status === "CONFIRMED"
      ? "Confirmed"
      : funding.status === "PENDING_APPROVAL"
      ? "Pending approval"
      : "Not added yet";
  const fundingDetail =
    funding.status === "CONFIRMED"
      ? `Wallet balance ${rupees(funding.walletBalancePaise)}`
      : funding.status === "PENDING_APPROVAL"
      ? `Top-up of ${rupees(funding.pendingCreditPaise)} is waiting for confirmation`
      : "Add money to your wallet so your plan can be approved";

  const quantityText =
    s.quantityMode === "ALTERNATING"
      ? `${s.quantityA ?? "—"}L / ${s.quantityB ?? "—"}L alternating`
      : `${s.quantity ?? "—"}L per delivery`;

  return (
    <PfCard padding="lg" elevated>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
          {awaitingApproval ? "PLAN PURCHASED" : "PLAN STATUS"}
        </span>
        <PfBadge tone={awaitingApproval ? "warning" : s.status === "PAUSED" ? "warning" : "success"}>
          {awaitingApproval
            ? "Order pending — awaiting approval"
            : s.status === "PAUSED"
            ? "Paused"
            : "Active"}
        </PfBadge>
      </div>

      <h2 className="text-[22px] sm:text-[26px] font-bold text-[var(--pf-text)] leading-[1.15]">
        {PLAN_LABEL[s.planType] ?? s.planType}
      </h2>
      <p className="mt-1 text-[14px] text-[var(--pf-text-secondary)] font-semibold">
        {quantityText}
        {s.frequency ? ` · ${FREQUENCY_LABEL[s.frequency] ?? s.frequency}` : ""}
        {` · ${rupees(s.sellingPricePerLitrePaise)} per litre`}
      </p>

      <div className="mt-5 rounded-[12px] border border-[var(--pf-border)] bg-[var(--pf-surface-soft)] px-4">
        {isPerDelivery && (
          <StatusRow
            step="Step 1"
            label="Wallet funding"
            value={fundingValue}
            tone={funding.status === "CONFIRMED" ? "success" : "warning"}
            detail={fundingDetail}
          />
        )}
        <StatusRow
          step={isPerDelivery ? "Step 2" : "Step 1"}
          label="Plan approval"
          value={awaitingApproval ? "Pending" : "Approved"}
          tone={awaitingApproval ? "warning" : "success"}
          detail={
            awaitingApproval
              ? "Our team reviews your plan once your wallet funding is confirmed"
              : undefined
          }
        />
        <StatusRow
          step={isPerDelivery ? "Step 3" : "Step 2"}
          label="Delivery schedule"
          value={s.schedulingStatus === "SCHEDULED" ? "Scheduled" : "Not scheduled yet"}
          tone={s.schedulingStatus === "SCHEDULED" ? "success" : "neutral"}
          detail={
            s.startDate
              ? `${s.startDate} to ${s.endDate ?? "—"}`
              : "Your first delivery date is set when the plan is approved"
          }
        />
      </div>

      {s.schedulingStatus === "SCHEDULED" && (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ["Delivered", s.deliveries.delivered],
            ["Upcoming", s.deliveries.upcoming],
            ["Skipped", s.deliveries.skipped],
            ["Cancelled", s.deliveries.cancelled],
          ].map(([label, count]) => (
            <div
              key={label}
              className="rounded-[12px] border border-[var(--pf-border)] px-3 py-2.5"
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
                {label}
              </div>
              <div className="mt-0.5 text-[18px] font-bold text-[var(--pf-text)]">{count}</div>
            </div>
          ))}
        </div>
      )}

      {isPerDelivery && (
        <div className="mt-5 flex items-start gap-2.5 rounded-[12px] border border-[var(--pf-border)] bg-[var(--pf-surface-soft)] p-3 text-[12.5px] text-[var(--pf-text-secondary)]">
          <Info size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-[var(--pf-text)]">
              You are charged per delivered order, not for the whole plan.
            </p>
            <p className="mt-0.5">
              Nothing is deducted when you buy the plan. Each delivery is deducted from your
              wallet only when it is marked delivered.
              {s.schedulingStatus === "SCHEDULED" &&
                ` Charged so far: ${rupees(s.chargedPaise)}.`}
            </p>
            {s.outstandingPaise > 0 && (
              <p className="mt-1 font-semibold text-rose-700">
                {rupees(s.outstandingPaise)} is unpaid for delivered orders. Please
                add money to your wallet.
              </p>
            )}
          </div>
        </div>
      )}

      {isPerDelivery && (funding.status !== "CONFIRMED" || s.outstandingPaise > 0) && (
        <Link
          href="/wallet"
          className="mt-4 inline-flex items-center gap-2 text-[13px] font-bold text-[var(--pf-text)] underline hover:no-underline"
        >
          <Wallet size={15} />
          Add money to wallet
        </Link>
      )}
    </PfCard>
  );
}
