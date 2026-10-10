"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Package, Search } from "lucide-react";
import { CustomerHeader } from "@/components/pf/layout/CustomerHeader";
import { PfBadge, PfButton, PfCard, PfEmptyState, PfSkeleton } from "@/components/pf";
import { accountApi } from "@/features/account/api/accountApi";
import type { Order } from "@/types/models";
import {
  formatDeliveryDate,
  normaliseStatus,
  orderItemsSummary,
  orderTotalRupees,
  statusLabel,
  statusTone,
} from "@/features/dashboard/utils";

type Filter = "all" | "upcoming" | "delivered" | "cancelled";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export function OrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await accountApi.getOrders();
        if (!cancelled) setOrders(res.orders || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (filter !== "all") {
      list = list.filter((o) => {
        const n = normaliseStatus(o.status);
        // A completed order is a finished one: it belongs with Delivered, and
        // must never show under Upcoming.
        if (filter === "delivered") return n === "delivered" || n === "completed";
        if (filter === "cancelled") return n === "cancelled" || n === "failed";
        if (filter === "upcoming")
          return (
            n !== "delivered" &&
            n !== "completed" &&
            n !== "cancelled" &&
            n !== "failed"
          );
        return true;
      });
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          (o.orderNumber || o.id).toString().toLowerCase().includes(q) ||
          o.items?.some((i) =>
            (i.productNameSnapshot || i.name || "").toLowerCase().includes(q)
          )
      );
    }
    return list;
  }, [orders, filter, query]);

  return (
    <>
      <CustomerHeader
        title="My Orders"
        subtitle="View and manage your PuretyFarm deliveries."
      />

      <section className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div className="flex items-center gap-1 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-full p-1 overflow-x-auto max-w-full scrollbar-none">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`pf-focus-ring h-9 px-4 rounded-full text-[13px] font-semibold transition-colors ${
                filter === f.key
                  ? "bg-[var(--pf-brown)] text-white"
                  : "text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-auto sm:flex-1 min-w-[200px] max-w-sm">
          <Search
            size={16}
            strokeWidth={1.75}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders"
            className="pf-focus-ring w-full h-10 pl-10 pr-3 rounded-full bg-[var(--pf-surface)] border border-[var(--pf-border)] text-[13px] placeholder:text-[var(--pf-text-muted)]"
          />
        </div>
      </section>

      {loading ? (
        <OrdersSkeleton />
      ) : filtered.length === 0 ? (
        <PfCard padding="none">
          <PfEmptyState
            icon={<Package size={22} strokeWidth={1.75} />}
            title={
              orders.length === 0 ? "No orders yet" : "No matching orders"
            }
            description={
              orders.length === 0
                ? "Your PuretyFarm deliveries will appear here once you place your first order."
                : "Try changing filters or clearing the search."
            }
            action={
              orders.length === 0 ? (
                <PfButton href="/plan">Explore Milk Plans</PfButton>
              ) : (
                <PfButton
                  variant="secondary"
                  onClick={() => {
                    setFilter("all");
                    setQuery("");
                  }}
                >
                  Clear filters
                </PfButton>
              )
            }
          />
        </PfCard>
      ) : (
        <OrdersList orders={filtered} />
      )}
    </>
  );
}

function OrdersList({ orders }: { orders: Order[] }) {
  return (
    <>
      <div className="hidden md:block bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-[20px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left">
              <TH>Order</TH>
              <TH>Date</TH>
              <TH>Items</TH>
              <TH className="text-right">Amount</TH>
              <TH>Status</TH>
              <TH>
                <span className="sr-only">Action</span>
              </TH>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const { name, qty, unit } = orderItemsSummary(o);
              // Never fall back to createdAt: the day an order was placed is
              // not the day it arrives. A null date reads "Not scheduled".
              const d = formatDeliveryDate(o.deliveryDate);
              return (
                <tr
                  key={o.id}
                  className="border-t border-[var(--pf-border)] hover:bg-[var(--pf-surface-soft)]"
                >
                  <TD className="font-semibold text-[var(--pf-text)]">
                    #{(o.orderNumber || o.id).toString().slice(0, 10).toUpperCase()}
                  </TD>
                  <TD>
                    <div className="font-medium text-[var(--pf-text)]">{d.label}</div>
                    {d.date && (
                      <div className="text-[12px] text-[var(--pf-text-muted)]">
                        {d.date.toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    )}
                  </TD>
                  <TD>
                    {name} × {qty} {unit}
                  </TD>
                  <TD className="text-right font-semibold text-[var(--pf-text)]">
                    {orderTotalRupees(o)}
                  </TD>
                  <TD>
                    <PfBadge tone={statusTone(o.status)} dot>
                      {statusLabel(o.status)}
                    </PfBadge>
                  </TD>
                  <TD className="text-right">
                    <Link
                      href={`/orders/${o.id}`}
                      className="pf-focus-ring inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--pf-brown)]"
                    >
                      Details
                      <ArrowRight size={14} strokeWidth={2} />
                    </Link>
                  </TD>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="md:hidden space-y-3">
        {orders.map((o) => {
          const { name, qty, unit } = orderItemsSummary(o);
          const d = formatDeliveryDate(o.deliveryDate);
          return (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="block bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-[16px] p-4 pf-focus-ring"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-[var(--pf-text)]">
                      #{(o.orderNumber || o.id).toString().slice(0, 10).toUpperCase()}
                    </div>
                    <div className="text-[12px] text-[var(--pf-text-muted)]">
                      {d.label}
                    </div>
                  </div>
                  <PfBadge tone={statusTone(o.status)} dot>
                    {statusLabel(o.status)}
                  </PfBadge>
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <div className="text-[14px] text-[var(--pf-text)] truncate">
                    {name} × {qty} {unit}
                  </div>
                  <div className="text-[14px] font-bold text-[var(--pf-text)]">
                    {orderTotalRupees(o)}
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function OrdersSkeleton() {
  return (
    <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-[20px] p-5 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <PfSkeleton key={i} height={56} />
      ))}
    </div>
  );
}

function TH({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={`px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)] ${className}`}
    >
      {children}
    </th>
  );
}

function TD({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-5 py-4 text-[14px] text-[var(--pf-text-secondary)] ${className}`}>
      {children}
    </td>
  );
}
