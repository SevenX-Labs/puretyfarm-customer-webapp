"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Receipt } from "lucide-react";
import { CustomerHeader } from "@/components/pf/layout/CustomerHeader";
import { PfBadge, PfButton, PfCard, PfSkeleton } from "@/components/pf";
import { accountApi } from "@/features/account/api/accountApi";
import type { Order } from "@/types/models";
import {
  formatDeliveryDate,
  formatDeliveryWindow,
  paiseToRupeesText,
  statusLabel,
  statusTone,
} from "@/features/dashboard/utils";
import { DeliveryTimeline } from "@/features/dashboard/components/DeliveryTimeline";

export function OrderDetailView({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await accountApi.getOrder(orderId);
        if (!cancelled) {
          if ((res as any).order) setOrder((res as any).order);
          else setOrder(res as any);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Could not load order.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <>
      <div className="mb-5">
        <Link
          href="/orders"
          className="pf-focus-ring inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)]"
        >
          <ArrowLeft size={14} strokeWidth={2} /> Back to orders
        </Link>
      </div>

      {loading ? (
        <OrderSkeleton />
      ) : error || !order ? (
        <PfCard padding="lg">
          <h2 className="text-[20px] font-bold text-[var(--pf-text)]">
            Order not found
          </h2>
          <p className="mt-1.5 text-[14px] text-[var(--pf-text-secondary)]">
            {error || "We couldn't find this order."}
          </p>
          <div className="mt-5">
            <PfButton href="/orders">Back to orders</PfButton>
          </div>
        </PfCard>
      ) : (
        <OrderBody order={order} />
      )}
    </>
  );
}

function OrderBody({ order }: { order: Order }) {
  const d = formatDeliveryDate(order.deliveryDate);
  const win = formatDeliveryWindow(
    order.deliveryStartTime,
    order.deliveryEndTime
  );
  const addr = order.addressSnapshot || order.deliveryAddress;

  // Only render monetary rows the backend actually sent — no "—" placeholders
  // or hardcoded values. Total is the only line we always show (it must exist
  // for a confirmed order).
  const subtotal =
    order.subtotalPaise != null ? paiseToRupeesText(order.subtotalPaise) : null;
  const delivery =
    order.deliveryFeePaise != null
      ? paiseToRupeesText(order.deliveryFeePaise)
      : null;
  const total = paiseToRupeesText(order.totalPaise, order.totalAmount);
  const discount =
    order.discountPaise && order.discountPaise > 0
      ? paiseToRupeesText(order.discountPaise)
      : null;
  const hasItems = Array.isArray(order.items) && order.items.length > 0;

  return (
    <>
      <CustomerHeader
        title={`Order #${(order.orderNumber || order.id).toString().slice(0, 10).toUpperCase()}`}
        subtitle={`Placed ${new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`}
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <PfCard padding="lg">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
                  Delivery
                </div>
                <h2 className="mt-1 text-[26px] font-bold text-[var(--pf-text)] leading-[1.15]">
                  {d.label}
                </h2>
                {win && (
                  <div className="mt-1 text-[14px] text-[var(--pf-text-secondary)] font-semibold">
                    {win}
                  </div>
                )}
              </div>
              <PfBadge tone={statusTone(order.status)} dot>
                {statusLabel(order.status)}
              </PfBadge>
            </div>
            <div className="mt-6 pt-6 border-t border-[var(--pf-border)]">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)] mb-4">
                Progress
              </h3>
              <DeliveryTimeline status={order.status} />
            </div>
          </PfCard>

          {hasItems && (
            <PfCard padding="lg">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)] mb-4">
                Items
              </h3>
              <ul className="divide-y divide-[var(--pf-border)]">
                {order.items!.map((item, i) => {
                  const label =
                    item.productNameSnapshot || item.name || "";
                  const qty =
                    item.quantity != null ? String(item.quantity) : "";
                  const unitLabel = item.unit || "";
                  const price = paiseToRupeesText(item.totalPaise, item.price);
                  return (
                    <li
                      key={item.id || i}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div>
                        {label && (
                          <div className="text-[14px] font-semibold text-[var(--pf-text)]">
                            {label}
                          </div>
                        )}
                        {(qty || unitLabel) && (
                          <div className="text-[12px] text-[var(--pf-text-muted)]">
                            {qty} {unitLabel}
                          </div>
                        )}
                      </div>
                      <div className="text-[14px] font-semibold text-[var(--pf-text)]">
                        {price}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </PfCard>
          )}
        </div>

        <aside className="space-y-6">
          {addr && (
            <PfCard padding="md">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} strokeWidth={1.75} className="text-[var(--pf-brown)]" />
                <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
                  Delivery Address
                </h3>
              </div>
              <div className="text-[13px] text-[var(--pf-text)] leading-relaxed">
                {addr.fullName && (
                  <div className="font-semibold">{addr.fullName}</div>
                )}
                <div className="text-[var(--pf-text-secondary)]">
                  {[
                    addr.houseNumber,
                    addr.buildingName,
                    addr.streetName || addr.street,
                    addr.locality,
                    addr.landmark && `Near ${addr.landmark}`,
                    addr.city,
                    addr.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </div>
                {(addr.phone || addr.mobile) && (
                  <div className="mt-2 text-[var(--pf-text-secondary)]">
                    {addr.phone || addr.mobile}
                  </div>
                )}
              </div>
            </PfCard>
          )}

          <PfCard padding="md">
            <div className="flex items-center gap-2 mb-3">
              <Receipt size={16} strokeWidth={1.75} className="text-[var(--pf-brown)]" />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
                Payment
              </h3>
            </div>
            <dl className="space-y-2 text-[13px]">
              {subtotal && <Row dt="Subtotal" dd={subtotal} />}
              {discount && <Row dt="Discount" dd={`– ${discount}`} />}
              {delivery && <Row dt="Delivery" dd={delivery} />}
              <div className="pt-2 mt-2 border-t border-[var(--pf-border)]">
                <Row dt="Total" dd={total} strong />
              </div>
              {order.paymentStatus && (
                <div className="pt-2">
                  <PfBadge
                    tone={
                      String(order.paymentStatus).toUpperCase() === "PAID"
                        ? "success"
                        : "warning"
                    }
                    dot
                  >
                    {String(order.paymentStatus)}
                  </PfBadge>
                </div>
              )}
            </dl>
          </PfCard>
        </aside>
      </div>
    </>
  );
}

function Row({
  dt,
  dd,
  strong,
}: {
  dt: string;
  dd: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[var(--pf-text-muted)]">{dt}</dt>
      <dd
        className={
          strong
            ? "text-[16px] font-bold text-[var(--pf-text)]"
            : "font-semibold text-[var(--pf-text)]"
        }
      >
        {dd}
      </dd>
    </div>
  );
}

function OrderSkeleton() {
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-6">
        <PfCard padding="lg">
          <PfSkeleton height={14} width={100} />
          <PfSkeleton className="mt-3" height={32} width="50%" />
          <PfSkeleton className="mt-2" height={16} width="30%" />
          <PfSkeleton className="mt-6" height={120} />
        </PfCard>
      </div>
      <aside className="space-y-6">
        <PfCard padding="md">
          <PfSkeleton height={14} width={120} />
          <PfSkeleton className="mt-3" height={48} />
        </PfCard>
      </aside>
    </div>
  );
}
