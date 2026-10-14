import Link from "next/link";
import { ArrowRight, Milk } from "lucide-react";
import { PfBadge } from "@/components/pf";
import {
  formatDeliveryDate,
  formatDeliveryWindow,
  orderItemsSummary,
  statusLabel,
  statusTone,
} from "../utils";
import { DeliveryTimeline } from "./DeliveryTimeline";
import type { Order } from "@/types/models";

export function NextDeliveryCard({ order }: { order: Order }) {
  const isDelivered =
    order.status === "DELIVERED" ||
    order.status === "COMPLETED" ||
    order.status?.toLowerCase()?.includes("deliver");

  const { label: dayLabel } = formatDeliveryDate(order.deliveryDate);
  const windowText = formatDeliveryWindow(
    order.deliveryStartTime,
    order.deliveryEndTime
  );
  const { name, qty, unit } = orderItemsSummary(order);

  return (
    <article className="relative overflow-hidden bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-[22px] shadow-[var(--pf-shadow-card)]">
      <div className="grid lg:grid-cols-[1fr_minmax(220px,280px)] gap-6 p-5 sm:p-7 md:p-8">
        {/* Left */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--pf-text-muted)]">
              {isDelivered ? "Delivery Status" : "Next Delivery"}
            </span>
            <PfBadge tone={statusTone(order.status)} dot>
              {statusLabel(order.status)}
            </PfBadge>
          </div>

          <h2 className="text-[26px] sm:text-[32px] md:text-[36px] font-bold leading-[1.05] tracking-tight text-[var(--pf-text)]">
            {isDelivered ? "Delivered Successfully 🎉" : dayLabel}
          </h2>
          <p className="mt-1 text-[16px] sm:text-[18px] font-semibold text-[var(--pf-text-secondary)]">
            {isDelivered
              ? "Fresh A2 milk delivered to your doorstep"
              : (windowText ?? "Delivery window not available")}
          </p>

          <div className="mt-5 flex items-baseline justify-between gap-4 pt-5 border-t border-[var(--pf-border)]">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
                Product
              </div>
              <div className="mt-1 text-[16px] font-bold text-[var(--pf-text)]">
                {name}
              </div>
              <div className="text-[13px] text-[var(--pf-text-secondary)]">
                Daily delivery
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
                Quantity
              </div>
              <div className="mt-1 text-[16px] font-bold text-[var(--pf-text)]">
                {qty} {unit}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Link
              href={`/orders/${order.id}`}
              className="pf-focus-ring inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--pf-brown)] hover:text-[var(--pf-brown-hover)]"
            >
              View Delivery
              <ArrowRight size={15} strokeWidth={2} />
            </Link>
          </div>
        </div>

        {/* Right — Live Delivery Details */}
        <div className="lg:border-l lg:border-[var(--pf-border)] lg:pl-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--pf-yellow-soft)] flex items-center justify-center">
                <Milk size={16} strokeWidth={2} className="text-[var(--pf-brown)]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--pf-text-muted)]">
                Delivery Window
              </span>
            </div>

            <div className="bg-[var(--pf-bg)]/80 rounded-2xl p-4 border border-[var(--pf-border)] space-y-3">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--pf-text-muted)]">Expected Slot</span>
                <span className="font-semibold text-[var(--pf-text)]">{windowText ?? "6:00 AM – 11:00 AM"}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--pf-text-muted)]">Dispatch Type</span>
                <span className="font-semibold text-[var(--pf-text)]">Farm Fresh Chilled</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--pf-text-muted)]">Packaging</span>
                <span className="font-semibold text-[var(--pf-text)]">Sterilized Glass Bottle</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--pf-border)] flex items-center justify-between text-[12px] text-[var(--pf-text-secondary)]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Route Scheduled
            </span>
            <span className="font-mono font-medium text-[11px] text-[var(--pf-text-muted)]">
              #{order.orderNumber || order.id?.slice(-8) || ""}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
