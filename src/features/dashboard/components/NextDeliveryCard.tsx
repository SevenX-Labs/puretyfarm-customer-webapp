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
  const { label: dayLabel } = formatDeliveryDate(order.deliveryDate);
  const windowText = formatDeliveryWindow(
    order.deliveryStartTime,
    order.deliveryEndTime
  );
  const { name, qty, unit } = orderItemsSummary(order);

  return (
    <article className="relative overflow-hidden bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-[22px] shadow-[var(--pf-shadow-card)]">
      <div className="grid lg:grid-cols-[1fr_minmax(220px,280px)] gap-6 p-7 sm:p-8">
        {/* Left */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--pf-text-muted)]">
              Next Delivery
            </span>
            <PfBadge tone={statusTone(order.status)} dot>
              {statusLabel(order.status)}
            </PfBadge>
          </div>

          <h2 className="text-[32px] sm:text-[36px] font-bold leading-[1.05] tracking-tight text-[var(--pf-text)]">
            {dayLabel}
          </h2>
          <p className="mt-1 text-[16px] sm:text-[18px] font-semibold text-[var(--pf-text-secondary)]">
            {windowText}
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

        {/* Right — timeline */}
        <div className="lg:border-l lg:border-[var(--pf-border)] lg:pl-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[var(--pf-yellow-soft)] flex items-center justify-center">
              <Milk size={18} strokeWidth={1.75} className="text-[var(--pf-brown)]" />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
              Status
            </div>
          </div>
          <DeliveryTimeline status={order.status} />
        </div>
      </div>
    </article>
  );
}
