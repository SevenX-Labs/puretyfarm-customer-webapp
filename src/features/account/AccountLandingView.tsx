"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  Calendar,
  Shield,
  MapPin,
  Settings,
  Lock,
  Wallet,
  Package,
  Milk,
  ChevronRight,
  Clock,
  CheckCircle2,
  Receipt,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CustomerHeader } from "@/components/pf/layout/CustomerHeader";
import { PfBadge, PfButton, PfCard, PfSectionTitle } from "@/components/pf";
import { accountApi } from "@/features/account/api/accountApi";
import type { Subscription, Order } from "@/types/models";
import {
  formatDeliveryDate,
  orderItemsSummary,
  orderTotalRupees,
  statusLabel,
  statusTone,
} from "@/features/dashboard/utils";

function initials(name?: string, mobile?: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }
  if (mobile) return mobile.slice(-2);
  return "PF";
}

const SHORTCUTS = [
  { label: "Delivery info", sub: "Addresses & preferences", href: "/account-settings?tab=addresses", icon: MapPin },
  { label: "Preferences", sub: "Notifications & timing", href: "/account-settings?tab=preferences", icon: Settings },
  { label: "Security", sub: "Password & deletion", href: "/account-settings?tab=security", icon: Lock },
  { label: "Wallet", sub: "Balance & payments", href: "/wallet", icon: Wallet },
  { label: "Order history", sub: "All past orders", href: "/orders", icon: Package },
  { label: "Milk plan", sub: "Change or pause", href: "/plan", icon: Milk },
];

export function AccountLandingView() {
  const { user, logout } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [subRes, ordRes] = await Promise.all([
          accountApi.getSubscription().catch(() => ({ success: false, subscription: null })),
          accountApi.getOrders().catch(() => ({ success: false, orders: [] as Order[] })),
        ]);
        if (cancelled) return;
        setSubscription(subRes?.subscription || null);
        setOrders(ordRes?.orders || []);
      } finally {
        if (!cancelled) setLoadingPlan(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!user) {
    return (
      <div className="space-y-6">
        <CustomerHeader title="Account" subtitle="Manage your profile, delivery, and preferences." />
        <div className="grid lg:grid-cols-[1fr_360px] gap-6 animate-pulse">
          <div className="space-y-6">
            <div className="h-44 rounded-3xl bg-[#FAF8F5] border border-[#E8DFD4]" />
            <div className="h-32 rounded-3xl bg-[#FAF8F5] border border-[#E8DFD4]" />
            <div className="h-32 rounded-3xl bg-[#FAF8F5] border border-[#E8DFD4]" />
          </div>
          <div className="space-y-6">
            <div className="h-40 rounded-3xl bg-[#FAF8F5] border border-[#E8DFD4]" />
          </div>
        </div>
      </div>
    );
  }

  const latestOrder = orders.length > 0 ? orders[0] : null;

  return (
    <>
      <CustomerHeader title="Account" subtitle="Manage your profile, delivery, and preferences." />

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          {/* Profile Card */}
          <PfCard padding="lg">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-[var(--pf-brown)] text-white flex items-center justify-center text-[22px] font-bold overflow-hidden">
                  {user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    initials(user.name, user.mobile)
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-[22px] sm:text-[24px] font-bold text-[var(--pf-text)] leading-tight truncate">
                  {user.name || "Customer"}
                </h2>
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <PfBadge tone="brand">PuretyFarm Customer</PfBadge>
                  {user.emailVerified && (
                    <PfBadge tone="success" dot>
                      Email verified
                    </PfBadge>
                  )}
                </div>
              </div>
              <PfButton
                href="/account-settings?tab=profile&edit=true"
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto mt-2 sm:mt-0 cursor-pointer"
              >
                Edit profile
              </PfButton>
            </div>

            <dl className="mt-6 pt-6 border-t border-[var(--pf-border)] grid sm:grid-cols-2 gap-x-6 gap-y-4">
              <InfoRow icon={<Phone size={15} strokeWidth={1.75} />} label="Mobile" value={user.mobile || "—"} />
              <InfoRow icon={<Mail size={15} strokeWidth={1.75} />} label="Email" value={user.email || "Not added"} />
              {user.dob && (
                <InfoRow
                  icon={<Calendar size={15} strokeWidth={1.75} />}
                  label="Date of birth"
                  value={new Date(user.dob).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                />
              )}
              {user.gender && (
                <InfoRow
                  icon={<Shield size={15} strokeWidth={1.75} />}
                  label="Gender"
                  value={user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                />
              )}
            </dl>
          </PfCard>

          {/* Active Milk Plan & Usage Card */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <PfSectionTitle title="Milk Plan & Usage" />
              <Link
                href="/plan"
                className="text-[12px] font-bold text-[var(--pf-brown)] hover:underline inline-flex items-center gap-1"
              >
                Manage plan <ArrowRight size={13} />
              </Link>
            </div>

            {subscription ? (
              <PfCard padding="md" className="border-l-4 border-l-[var(--pf-brown)]">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--pf-yellow-soft)] flex items-center justify-center text-[var(--pf-brown)] shrink-0">
                      <Milk size={20} strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[15px] text-[var(--pf-text)]">
                          {subscription.planName || "Active Milk Subscription"}
                        </h3>
                        <PfBadge tone={subscription.status === "active" ? "success" : "warning"} dot>
                          {subscription.status === "active" ? "Active" : "Paused"}
                        </PfBadge>
                      </div>
                      <p className="text-[12px] text-[var(--pf-text-secondary)] mt-0.5">
                        {subscription.dailyQuantity || "1 Litre Daily"} · Pure A2 Cow Milk
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-serif text-lg font-bold text-[var(--pf-brown)]">
                      ₹{subscription.price}
                    </span>
                    <span className="text-[11px] text-[var(--pf-text-muted)] block">
                      Plan billing
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--pf-border)] grid sm:grid-cols-2 gap-3 text-xs text-[var(--pf-text-secondary)]">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-amber-600 shrink-0" />
                    <span>
                      Next delivery: <strong>Tomorrow (6:00 AM – 8:00 AM)</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-emerald-600 shrink-0" />
                    <span>Silent doorstep glass bottle drop</span>
                  </div>
                </div>
              </PfCard>
            ) : (
              <PfCard padding="md">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--pf-surface-soft)] flex items-center justify-center text-[var(--pf-text-muted)]">
                      <Milk size={20} strokeWidth={1.75} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[var(--pf-text)]">No active subscription plan</h4>
                      <p className="text-xs text-[var(--pf-text-secondary)] mt-0.5">
                        Select a milk plan to start receiving fresh daily morning deliveries.
                      </p>
                    </div>
                  </div>
                  <PfButton href="/plan" size="sm">Choose Plan</PfButton>
                </div>
              </PfCard>
            )}
          </section>

          {/* Recent Order Summary Card */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <PfSectionTitle title="Latest Order" />
              <Link
                href="/orders"
                className="text-[12px] font-bold text-[var(--pf-brown)] hover:underline inline-flex items-center gap-1"
              >
                View all orders ({orders.length}) <ArrowRight size={13} />
              </Link>
            </div>

            {latestOrder ? (
              <PfCard padding="md">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[var(--pf-brown)]">
                        #{(latestOrder.orderNumber || latestOrder.id).toString().slice(0, 10).toUpperCase()}
                      </span>
                      <PfBadge tone={statusTone(latestOrder.status)} dot>
                        {statusLabel(latestOrder.status)}
                      </PfBadge>
                    </div>
                    <p className="text-sm font-semibold text-[var(--pf-text)] mt-1.5">
                      {orderItemsSummary(latestOrder).name} × {orderItemsSummary(latestOrder).qty} {orderItemsSummary(latestOrder).unit}
                    </p>
                    <p className="text-xs text-[var(--pf-text-muted)] mt-0.5">
                      Delivery: {formatDeliveryDate(latestOrder.deliveryDate || latestOrder.createdAt).label}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="font-serif text-base font-bold text-[var(--pf-text)]">
                      {orderTotalRupees(latestOrder)}
                    </div>
                    <Link
                      href={`/orders/${latestOrder.id}`}
                      className="mt-1 text-xs font-semibold text-[var(--pf-brown)] hover:underline inline-flex items-center gap-1"
                    >
                      Details <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </PfCard>
            ) : (
              <PfCard padding="md">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--pf-surface-soft)] flex items-center justify-center text-[var(--pf-text-muted)]">
                      <Receipt size={20} strokeWidth={1.75} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[var(--pf-text)]">No orders placed yet</h4>
                      <p className="text-xs text-[var(--pf-text-secondary)] mt-0.5">
                        Your placed orders and delivery invoices will appear here.
                      </p>
                    </div>
                  </div>
                  <PfButton href="/plan" variant="secondary" size="sm">Explore Plans</PfButton>
                </div>
              </PfCard>
            )}
          </section>

          {/* Shortcuts Grid */}
          <section>
            <PfSectionTitle title="Shortcuts" />
            <div className="grid sm:grid-cols-2 gap-3">
              {SHORTCUTS.map(({ label, sub, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group pf-focus-ring flex items-center gap-3 p-4 rounded-[14px] bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-border-strong)] transition-colors"
                >
                  <span className="w-10 h-10 rounded-[10px] bg-[var(--pf-surface-soft)] flex items-center justify-center shrink-0 group-hover:bg-[var(--pf-yellow-soft)] transition-colors">
                    <Icon size={18} strokeWidth={1.75} className="text-[var(--pf-brown)]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-bold text-[var(--pf-text)] leading-tight">
                      {label}
                    </div>
                    <div className="text-[12px] text-[var(--pf-text-muted)] truncate">{sub}</div>
                  </div>
                  <ChevronRight size={16} strokeWidth={1.75} className="text-[var(--pf-text-muted)]" />
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <PfCard padding="md">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
              Session
            </h3>
            <p className="mt-2 text-[13px] text-[var(--pf-text-secondary)] leading-relaxed">
              Signed in with mobile {user.mobile || "—"}.
            </p>
            <div className="mt-4">
              <PfButton variant="secondary" fullWidth onClick={() => logout()}>
                Sign out
              </PfButton>
            </div>
          </PfCard>

          <PfCard padding="md">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
              Need a hand?
            </h3>
            <p className="mt-2 text-[13px] text-[var(--pf-text-secondary)] leading-relaxed">
              Our team is on WhatsApp for pause, skip, or any delivery question.
            </p>
            <div className="mt-4">
              <PfButton href="/faq" variant="tertiary" size="sm">
                Help & FAQ
              </PfButton>
            </div>
          </PfCard>
        </aside>
      </div>
    </>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-8 h-8 rounded-[9px] bg-[var(--pf-surface-soft)] flex items-center justify-center text-[var(--pf-brown)] shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
          {label}
        </div>
        <div className="mt-0.5 text-[14px] font-semibold text-[var(--pf-text)] truncate">
          {value}
        </div>
      </div>
    </div>
  );
}
