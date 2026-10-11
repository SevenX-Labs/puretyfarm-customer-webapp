"use client";

import Link from "next/link";
import { PfBadge, PfCard } from "@/components/pf";
import type { UpcomingDeliveryView } from "@/features/delivery/types";
import { formatCurrency } from "@/lib/utils/formatters";

const VISIBLE_ROWS = 10;

function statusTone(status: string): "success" | "warning" | "neutral" {
  if (status === "DELIVERED") return "success";
  if (status === "SKIPPED") return "warning";
  return "neutral";
}

/**
 * The plan's upcoming deliveries, one row per day: scheduled date, order
 * number, quantity and what that delivery is expected to cost. Every value is
 * the server's; an amount is shown only when the delivery has an order.
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
        {visible.map((d) => (
          <li
            key={d.date}
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5"
          >
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-[var(--pf-text)]">{d.date}</div>
              <div className="text-[12px] text-[var(--pf-text-muted)]">
                {d.orderNumber ? `Order #${d.orderNumber}` : "Order not created yet"} ·{" "}
                {d.quantityLitres}L
              </div>
            </div>
            <div className="flex items-center gap-3">
              {d.expectedAmountPaise != null && d.status !== "SKIPPED" && (
                <span className="text-[14px] font-bold text-[var(--pf-text)]">
                  {formatCurrency(d.expectedAmountPaise / 100)}
                </span>
              )}
              <PfBadge tone={statusTone(d.status)} dot>
                {d.status === "SCHEDULED"
                  ? "Scheduled"
                  : d.status === "SKIPPED"
                  ? "Skipped"
                  : "Delivered"}
              </PfBadge>
            </div>
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <p className="mt-3 text-[12.5px] text-[var(--pf-text-muted)]">
          and {hidden} more scheduled {hidden === 1 ? "delivery" : "deliveries"}.
        </p>
      )}
    </PfCard>
  );
}
