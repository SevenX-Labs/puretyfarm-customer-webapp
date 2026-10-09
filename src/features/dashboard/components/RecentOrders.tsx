import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { PfBadge, PfEmptyState, PfButton } from "@/components/pf";
import type { Order } from "@/types/models";
import {
  formatDeliveryDate,
  orderItemsSummary,
  orderTotalRupees,
  statusLabel,
  statusTone,
} from "../utils";

export function RecentOrders({ orders }: { orders: Order[] }) {
  const recent = orders.slice(0, 5);

  if (!recent.length) {
    return (
      <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-[20px]">
        <PfEmptyState
          icon={<Package size={22} strokeWidth={1.75} />}
          title="No orders yet"
          description="Your PuretyFarm deliveries will appear here once you place your first order."
          action={<PfButton href="/products">Explore Products</PfButton>}
        />
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
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
                <span className="sr-only">View</span>
              </TH>
            </tr>
          </thead>
          <tbody>
            {recent.map((o) => {
              const { name, qty, unit } = orderItemsSummary(o);
              const d = formatDeliveryDate(o.deliveryDate || o.createdAt);
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
                      className="pf-focus-ring inline-flex items-center text-[13px] font-semibold text-[var(--pf-brown)]"
                      aria-label={`View order ${o.orderNumber || o.id}`}
                    >
                      <ArrowRight size={16} strokeWidth={2} />
                    </Link>
                  </TD>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="md:hidden space-y-3">
        {recent.map((o) => {
          const { name, qty, unit } = orderItemsSummary(o);
          const d = formatDeliveryDate(o.deliveryDate || o.createdAt);
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
                    <div className="text-[12px] text-[var(--pf-text-muted)]">{d.label}</div>
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
  return <td className={`px-5 py-4 text-[14px] text-[var(--pf-text-secondary)] ${className}`}>{children}</td>;
}
