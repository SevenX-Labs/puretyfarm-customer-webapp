"use client";

import Link from "next/link";
import { PfBadge, PfCard } from "@/components/pf";
import type { UpcomingDeliveryView } from "@/features/delivery/types";
import { formatCurrency } from "@/lib/utils/formatters";
import { CalendarClock, AlertCircle, CalendarX } from "lucide-react";

const VISIBLE_ROWS = 10;

function statusTone(status: string): "success" | "warning" | "neutral" {
  if (status === "DELIVERED") return "success";
  if (status === "SKIPPED") return "warning";
  return "neutral";
}

/**
 * The plan's upcoming deliveries, one row per day: scheduled date, order
 * number, quantity, skip/reschedule reason and what that delivery is expected to cost.
 */
export function UpcomingDeliveriesList({
  deliveries,
  chargedPerDelivery,
}: {
  deliveries: UpcomingDeliveryView[];
  chargedPerDelivery: boolean;
}) {
  if (deliveries.length === 0) return null;
  const visible = deliveries.slice(0, VISIBLE_ROWS);
  const hidden = deliveries.length - visible.length;

  return (
    <PfCard padding="lg">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[16px] font-bold text-[var(--pf-text)]">Upcoming deliveries</h3>
        <Link
          href="/orders"
          className="text-[13px] font-semibold text-[var(--pf-brown)] underline hover:no-underline"
        >
          View all orders
        </Link>
      </div>
      {chargedPerDelivery && (
        <p className="mt-1 text-[12.5px] text-[var(--pf-text-secondary)]">
          Each delivery is charged to your wallet separately, on the day it is delivered.
        </p>
      )}

      <ul className="mt-4 divide-y divide-[var(--pf-border)]">
        {visible.map((d) => {
          const isSkipped = d.status === "SKIPPED";
          const isRescheduled = Boolean(d.rescheduledFrom);

          return (
            <li
              key={d.date}
              className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14px] font-semibold text-[var(--pf-text)]">{d.date}</span>
                  {isRescheduled && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                      <CalendarClock size={11} className="shrink-0" />
                      Rescheduled
                    </span>
                  )}
                  {isSkipped && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <CalendarX size={11} className="shrink-0" />
                      {d.actionBy === "ADMIN" ? "Skipped by Admin" : "Skipped"}
                    </span>
                  )}
                </div>

                <div className="text-[12px] text-[var(--pf-text-muted)] mt-0.5">
                  {d.orderNumber ? `Order #${d.orderNumber}` : "Order not created yet"} ·{" "}
                  {d.quantityLitres}L
                </div>

                {/* Rescheduled Notice */}
                {isRescheduled && (
                  <div className="mt-1.5 text-[12px] text-sky-950 bg-sky-50/80 border border-sky-200 rounded-lg p-2">
                    <div className="font-medium">
                      Originally scheduled for <strong>{d.rescheduledFrom}</strong> · Moved to this date
                    </div>
                    {d.adminNote && (
                      <div className="mt-0.5 text-[11.5px] text-sky-800">
                        Reason: &ldquo;{d.adminNote}&rdquo;
                      </div>
                    )}
                  </div>
                )}

                {/* Skipped Notice */}
                {isSkipped && (
                  <div className="mt-1.5 text-[12px] text-amber-950 bg-amber-50/80 border border-amber-200 rounded-lg p-2">
                    <div className="font-medium">
                      {d.actionBy === "ADMIN"
                        ? "This delivery was skipped by Purety Farm Admin."
                        : d.actionBy === "CUSTOMER"
                        ? "You skipped this delivery."
                        : "This delivery was skipped."}
                    </div>
                    {d.adminNote && (
                      <div className="mt-0.5 text-[11.5px] text-amber-800">
                        Reason: &ldquo;{d.adminNote}&rdquo;
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0 pt-0.5">
                {d.expectedAmountPaise != null && !isSkipped && (
                  <span className="text-[14px] font-bold text-[var(--pf-text)]">
                    {formatCurrency(d.expectedAmountPaise / 100)}
                  </span>
                )}
                <PfBadge tone={statusTone(d.status)} dot>
                  {d.status === "SCHEDULED"
                    ? (isRescheduled ? "Rescheduled" : "Scheduled")
                    : isSkipped
                    ? "Skipped"
                    : "Delivered"}
                </PfBadge>
              </div>
            </li>
          );
        })}
      </ul>
      {hidden > 0 && (
        <p className="mt-3 text-[12.5px] text-[var(--pf-text-muted)]">
          and {hidden} more scheduled {hidden === 1 ? "delivery" : "deliveries"}.
        </p>
      )}
    </PfCard>
  );
}
