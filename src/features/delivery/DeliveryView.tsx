"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Pencil,
  Truck,
  CalendarDays,
  CheckCircle2,
  Phone,
} from "lucide-react";
import { CustomerHeader } from "@/components/pf/layout/CustomerHeader";
import { PfBadge, PfButton, PfCard, PfSectionTitle, PfSkeleton } from "@/components/pf";
import { accountApi } from "@/features/account/api/accountApi";
import type { Address, Order } from "@/types/models";
import {
  findNextDelivery,
  formatDeliveryDate,
  formatDeliveryWindow,
  orderItemsSummary,
  statusLabel,
  statusTone,
} from "@/features/dashboard/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function DeliveryView() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [addrRes, ordRes] = await Promise.all([
          accountApi
            .getAddresses()
            .catch(() => ({ success: false, addresses: [] as Address[] })),
          accountApi
            .getOrders()
            .catch(() => ({ success: false, orders: [] as Order[] })),
        ]);
        if (cancelled) return;
        setAddresses((addrRes as any).addresses || []);
        setOrders(ordRes.orders || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const defaultAddress =
    addresses.find((a) => a.isDefault) || addresses[0] || null;
  const nextDelivery = findNextDelivery(orders);
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <>
      <CustomerHeader
        title="Delivery"
        subtitle="Your doorstep schedule and address for daily A2 milk."
      />

      {loading ? (
        <DeliverySkeleton />
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div className="space-y-6">
            {nextDelivery ? (
              <PfCard padding="lg" elevated>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
                      Next Delivery
                    </div>
                    <h2 className="mt-2 text-[32px] font-bold text-[var(--pf-text)] leading-[1.05]">
                      {formatDeliveryDate(nextDelivery.deliveryDate).label}
                    </h2>
                    <div className="mt-1 text-[16px] text-[var(--pf-text-secondary)] font-semibold">
                      {formatDeliveryWindow(
                        nextDelivery.deliveryStartTime,
                        nextDelivery.deliveryEndTime
                      )}
                    </div>
                  </div>
                  <PfBadge tone={statusTone(nextDelivery.status)} dot>
                    {statusLabel(nextDelivery.status)}
                  </PfBadge>
                </div>
                <div className="mt-5 pt-5 border-t border-[var(--pf-border)] flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-[14px] text-[var(--pf-text-secondary)]">
                    {(() => {
                      const { name, qty, unit } = orderItemsSummary(nextDelivery);
                      return (
                        <>
                          <span className="font-semibold text-[var(--pf-text)]">
                            {name}
                          </span>{" "}
                          · {qty} {unit}
                        </>
                      );
                    })()}
                  </div>
                  <Link
                    href={`/orders/${nextDelivery.id}`}
                    className="pf-focus-ring inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--pf-brown)]"
                  >
                    View details
                  </Link>
                </div>
              </PfCard>
            ) : (
              <PfCard padding="lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--pf-yellow-soft)] flex items-center justify-center shrink-0">
                    <Truck size={22} strokeWidth={1.75} className="text-[var(--pf-brown)]" />
                  </div>
                  <div>
                    <h2 className="text-[22px] font-bold text-[var(--pf-text)]">
                      No upcoming delivery
                    </h2>
                    <p className="mt-1 text-[14px] text-[var(--pf-text-secondary)]">
                      Start a plan and we&apos;ll schedule your first morning delivery.
                    </p>
                    <div className="mt-5">
                      <PfButton href="/plan">Choose a plan</PfButton>
                    </div>
                  </div>
                </div>
              </PfCard>
            )}

            <section>
              <PfSectionTitle title="Weekly schedule" />
              <PfCard padding="md">
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  {WEEKDAYS.map((d, i) => {
                    const active = i === todayIdx;
                    return (
                      <div
                        key={d}
                        className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-[12px] ${
                          active ? "bg-[var(--pf-yellow-soft)]" : ""
                        }`}
                      >
                        <span
                          className={`text-[11px] font-bold uppercase tracking-[0.06em] ${
                            active ? "text-[var(--pf-text)]" : "text-[var(--pf-text-muted)]"
                          }`}
                        >
                          {d}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            active ? "bg-[var(--pf-brown)]" : "bg-[var(--pf-brown)]/50"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-[12.5px] text-[var(--pf-text-secondary)] text-center">
                  Daily morning delivery, 7:00 – 9:00 AM. WhatsApp us to skip or pause.
                </p>
              </PfCard>
            </section>

            <section>
              <PfSectionTitle title="Delivery preferences" />
              <PfCard padding="md">
                <ul className="divide-y divide-[var(--pf-border)]">
                  <PrefRow
                    icon={<Clock size={16} strokeWidth={1.75} />}
                    label="Delivery window"
                    value="7:00 – 9:00 AM"
                  />
                  <PrefRow
                    icon={<CalendarDays size={16} strokeWidth={1.75} />}
                    label="Frequency"
                    value="Daily"
                  />
                  <PrefRow
                    icon={<CheckCircle2 size={16} strokeWidth={1.75} />}
                    label="Packaging"
                    value="Reusable glass bottle"
                  />
                </ul>
                <div className="mt-4">
                  <PfButton href="/account-settings?tab=preferences" variant="secondary" size="sm">
                    Edit preferences
                  </PfButton>
                </div>
              </PfCard>
            </section>
          </div>

          <aside className="space-y-6">
            <PfCard padding="md">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <MapPin size={16} strokeWidth={1.75} className="text-[var(--pf-brown)]" />
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
                    Delivery Address
                  </h3>
                </div>
                <Link
                  href="/account-settings?tab=addresses"
                  aria-label="Edit addresses"
                  className="pf-focus-ring w-8 h-8 rounded-full flex items-center justify-center text-[var(--pf-text-secondary)] hover:text-[var(--pf-brown)] hover:bg-[var(--pf-surface-soft)]"
                >
                  <Pencil size={14} strokeWidth={1.75} />
                </Link>
              </div>
              {defaultAddress ? (
                <AddressBody address={defaultAddress} />
              ) : (
                <div>
                  <p className="text-[13px] text-[var(--pf-text-secondary)]">
                    You haven&apos;t added a delivery address yet.
                  </p>
                  <div className="mt-4">
                    <PfButton href="/account-settings?tab=addresses" size="sm">
                      Add address
                    </PfButton>
                  </div>
                </div>
              )}
            </PfCard>

            <PfCard padding="md">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)] mb-3">
                Service Area
              </h3>
              <p className="text-[13px] text-[var(--pf-text-secondary)] leading-relaxed">
                We currently serve Raipur — Shankar Nagar, VIP Road, Pandri, Civil Lines & nearby
                localities. Delivery runs daily 7:00 – 9:00 AM.
              </p>
              <Link
                href="/service-area"
                className="pf-focus-ring mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--pf-brown)]"
              >
                See full map
              </Link>
            </PfCard>

            <PfCard padding="md">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-[var(--pf-surface-soft)] flex items-center justify-center shrink-0">
                  <Phone size={16} strokeWidth={1.75} className="text-[var(--pf-brown)]" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[var(--pf-text)]">
                    Need help?
                  </h3>
                  <p className="mt-1 text-[12.5px] text-[var(--pf-text-secondary)]">
                    Reach us on WhatsApp for pause, skip, or any delivery question.
                  </p>
                </div>
              </div>
            </PfCard>
          </aside>
        </div>
      )}
    </>
  );
}

function AddressBody({ address }: { address: Address }) {
  return (
    <div className="text-[13px] text-[var(--pf-text)] leading-relaxed">
      <div className="flex items-center gap-2">
        <div className="font-semibold">{address.fullName}</div>
        {address.addressType && (
          <PfBadge tone="neutral">{address.addressType}</PfBadge>
        )}
      </div>
      <div className="mt-1.5 text-[var(--pf-text-secondary)]">
        {[
          address.street,
          address.locality,
          address.landmark && `Near ${address.landmark}`,
          address.city,
          address.pincode,
        ]
          .filter(Boolean)
          .join(", ")}
      </div>
      {address.phone && (
        <div className="mt-2 text-[var(--pf-text-secondary)]">{address.phone}</div>
      )}
    </div>
  );
}

function PrefRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[var(--pf-brown)]">{icon}</span>
        <span className="text-[13px] text-[var(--pf-text-secondary)]">{label}</span>
      </div>
      <span className="text-[13px] font-semibold text-[var(--pf-text)]">{value}</span>
    </li>
  );
}

function DeliverySkeleton() {
  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <div className="space-y-6">
        <PfCard padding="lg">
          <PfSkeleton height={14} width={120} />
          <PfSkeleton className="mt-4" height={36} width="50%" />
          <PfSkeleton className="mt-2" height={18} width="30%" />
        </PfCard>
        <PfCard padding="md">
          <PfSkeleton height={80} />
        </PfCard>
      </div>
      <aside className="space-y-6">
        <PfCard padding="md">
          <PfSkeleton height={14} width={120} />
          <PfSkeleton className="mt-3" height={80} />
        </PfCard>
      </aside>
    </div>
  );
}
