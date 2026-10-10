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
  User as UserIcon,
  X,
  Save,
  Check,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CustomerHeader } from "@/components/pf/layout/CustomerHeader";
import { PfBadge, PfButton, PfCard, PfSectionTitle } from "@/components/pf";
import { AvatarUpload } from "@/components/ui/AvatarUpload";
import { EmailVerificationModal } from "@/components/pf";
import { accountApi } from "@/features/account/api/accountApi";
import type { Subscription, Order } from "@/types/models";
import {
  formatDeliveryDate,
  formatDeliveryWindow,
  orderItemsSummary,
  orderTotalRupees,
  statusLabel,
  statusTone,
} from "@/features/dashboard/utils";

function initials(name?: string, mobile?: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\\s+/);
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

const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
];

export function AccountLandingView() {
  const { user, logout, refreshUser } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(true);

  // Inline Profile Edit State (right on this page)
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editGender, setEditGender] = useState("female");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showEmailVerifyModal, setShowEmailVerifyModal] = useState(false);

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

  const startEditing = () => {
    if (!user) return;
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditAvatar(user.avatarUrl || "");
    setEditDob(user.dob ? user.dob.split("T")[0] : "");
    setEditGender(user.gender ? user.gender.toLowerCase() : "female");
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await accountApi.updateProfile({
        name: editName.trim(),
        email: editEmail.trim() || undefined,
        avatarUrl: editAvatar || undefined,
        gender: editGender,
        dob: editDob || undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to update profile.");
      } else {
        await refreshUser().catch(() => {});
        setSuccessMsg("Profile updated successfully!");
        setTimeout(() => {
          setIsEditing(false);
          setSuccessMsg(null);
        }, 900);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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

  // The subscription card used to assert "Tomorrow (6:00 AM – 8:00 AM)"
  // regardless of what was actually scheduled. Both halves now come from the
  // server's active plan: the next upcoming delivery date and the plan's saved
  // delivery window. Either may be absent, and each says so on its own.
  const nextDeliveryLabel = formatDeliveryDate(subscription?.nextDeliveryDate).label;
  const nextDeliveryWindow = formatDeliveryWindow(
    subscription?.deliveryStartTime,
    subscription?.deliveryEndTime
  );
  const isEmailVerified = Boolean(user.emailVerified && editEmail.trim() === user.email);

  return (
    <>
      <CustomerHeader title="Account" subtitle="Manage your profile, delivery, and preferences." />

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          {/* Profile Card — VIEW MODE or INLINE EDIT MODE */}
          <PfCard padding="lg">
            {!isEditing ? (
              /* ─── VIEW MODE ─── */
              <div>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--pf-brown)] text-white flex items-center justify-center text-[22px] font-bold overflow-hidden shadow-xs">
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
                    variant="secondary"
                    size="sm"
                    onClick={startEditing}
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
              </div>
            ) : (
              /* ─── INLINE EDIT MODE (on this page only) ─── */
              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[var(--pf-border)]">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--pf-text)]">Update Profile</h3>
                    <p className="text-xs text-[var(--pf-text-secondary)] mt-0.5">
                      Edit your details directly on your account page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--pf-text-muted)] hover:bg-[var(--pf-surface-soft)] transition-colors cursor-pointer disabled:opacity-50"
                    title="Cancel"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Status Messages */}
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs font-medium flex items-center gap-2 border border-red-200">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2 border border-emerald-200">
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* 1. Avatar Photo Uploader */}
                <div className="p-4 rounded-2xl bg-[var(--pf-surface-soft)] border border-[var(--pf-border)]">
                  <span className="text-[11px] font-bold text-[var(--pf-text-muted)] uppercase tracking-wider block mb-2">
                    Profile Picture
                  </span>
                  <AvatarUpload
                    initialUrl={editAvatar}
                    name={editName || user.name}
                    onUploaded={(url) => setEditAvatar(url)}
                    onError={(msg) => setErrorMsg(msg)}
                  />
                </div>

                {/* 2. Full Legal Name */}
                <div>
                  <label htmlFor="inline-edit-name" className="block text-xs font-semibold text-[var(--pf-text)] mb-1.5">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--pf-text-muted)]">
                      <UserIcon size={16} />
                    </div>
                    <input
                      id="inline-edit-name"
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => {
                        setEditName(e.target.value);
                        setErrorMsg(null);
                      }}
                      placeholder="e.g. SevenX Labs"
                      disabled={saving}
                      className="w-full rounded-xl border border-[var(--pf-border)] bg-white py-2.5 pl-10 pr-3.5 text-sm font-semibold text-[var(--pf-text)] placeholder-[var(--pf-text-muted)] focus:border-[#6F2115] focus:outline-none focus:ring-1 focus:ring-[#6F2115] disabled:bg-[#FAF8F5] transition-colors"
                    />
                  </div>
                </div>

                {/* 3. Mobile Number (Locked) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[var(--pf-text)]">
                      Mobile Number
                    </label>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock size={10} /> Verified &amp; Locked
                    </span>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--pf-text-muted)]">
                      <Phone size={16} />
                    </div>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={user.mobile || user.phone || "—"}
                      className="w-full rounded-xl border border-[var(--pf-border)] bg-[#FAF8F5] py-2.5 pl-10 pr-3.5 text-sm font-mono font-bold text-[var(--pf-text-secondary)] cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--pf-text-muted)]">
                    Phone is linked to OTP login and cannot be changed.
                  </p>
                </div>

                {/* 4. Email Address */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="inline-edit-email" className="text-xs font-semibold text-[var(--pf-text)]">
                      Email Address
                    </label>
                    {isEmailVerified ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check size={10} /> Verified
                      </span>
                    ) : editEmail.trim() ? (
                      <button
                        type="button"
                        onClick={() => setShowEmailVerifyModal(true)}
                        className="text-[11px] font-bold text-[#6F2115] hover:underline cursor-pointer"
                      >
                        Verify Email
                      </button>
                    ) : null}
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--pf-text-muted)]">
                      <Mail size={16} />
                    </div>
                    <input
                      id="inline-edit-email"
                      type="email"
                      value={editEmail}
                      onChange={(e) => {
                        setEditEmail(e.target.value);
                        setErrorMsg(null);
                      }}
                      placeholder="e.g. contact@sevenxlabs.com"
                      disabled={saving}
                      className="w-full rounded-xl border border-[var(--pf-border)] bg-white py-2.5 pl-10 pr-3.5 text-sm font-semibold text-[var(--pf-text)] placeholder-[var(--pf-text-muted)] focus:border-[#6F2115] focus:outline-none focus:ring-1 focus:ring-[#6F2115] disabled:bg-[#FAF8F5] transition-colors"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--pf-text-muted)]">
                    Required for online payment receipts and delivery invoices.
                  </p>
                </div>

                {/* 5. Date of Birth & Gender Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="inline-edit-dob" className="block text-xs font-semibold text-[var(--pf-text)] mb-1.5">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--pf-text-muted)]">
                        <Calendar size={16} />
                      </div>
                      <input
                        id="inline-edit-dob"
                        type="date"
                        value={editDob}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setEditDob(e.target.value)}
                        disabled={saving}
                        className="w-full rounded-xl border border-[var(--pf-border)] bg-white py-2.5 pl-10 pr-3.5 text-sm font-semibold text-[var(--pf-text)] focus:border-[#6F2115] focus:outline-none focus:ring-1 focus:ring-[#6F2115] disabled:bg-[#FAF8F5] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Gender Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--pf-text)] mb-1.5">
                      Gender
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {GENDER_OPTIONS.map((opt) => {
                        const isSelected = editGender === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            disabled={saving}
                            onClick={() => setEditGender(opt.value)}
                            className={`py-2.5 px-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer disabled:opacity-50 ${
                              isSelected
                                ? "border-[#6F2115] bg-[#FAF1E2] text-[#6F2115] shadow-xs"
                                : "border-[var(--pf-border)] bg-white text-[var(--pf-text)] hover:bg-[#FAF6F0]"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-3 border-t border-[var(--pf-border)]">
                  <PfButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="flex-1 min-h-[44px] cursor-pointer"
                  >
                    Cancel
                  </PfButton>
                  <PfButton
                    type="submit"
                    size="sm"
                    disabled={saving}
                    className="flex-[1.5] min-h-[44px] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </PfButton>
                </div>
              </form>
            )}
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

            {loadingPlan ? (
              <PfCard padding="md">
                <div className="flex items-center gap-3 py-4 px-2 text-xs font-semibold text-[var(--pf-text-secondary)]">
                  <div className="w-4 h-4 rounded-full border-2 border-[var(--pf-brown)] border-t-transparent animate-spin" />
                  <span>Loading live milk plan & schedule...</span>
                </div>
              </PfCard>
            ) : subscription ? (
              <PfCard padding="md">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--pf-text)]">
                        {subscription.planName || "Daily A2 Desi Gir Cow Milk"}
                      </span>
                      <PfBadge tone={subscription.status === "active" ? "success" : "neutral"} dot>
                        {subscription.status === "active" ? "Active delivery" : "Paused"}
                      </PfBadge>
                    </div>
                    <p className="text-xs text-[var(--pf-text-secondary)] mt-1">
                      Quantity: <strong>{subscription.dailyQuantity || "1 Litre / day"}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-lg font-bold text-[var(--pf-text)]">
                      ₹{subscription.price || 2250}
                    </div>
                    <div className="text-[11px] text-[var(--pf-text-muted)]">per month</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--pf-border)] grid sm:grid-cols-2 gap-2 text-xs text-[var(--pf-text-secondary)]">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-amber-600 shrink-0" />
                    <span>
                      Next delivery:{" "}
                      <strong>
                        {nextDeliveryLabel}
                        {nextDeliveryWindow ? ` (${nextDeliveryWindow})` : ""}
                      </strong>
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
                      Delivery:{" "}
                      {formatDeliveryDate(latestOrder.deliveryDate).label}
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

      {/* Embedded Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showEmailVerifyModal}
        onClose={() => setShowEmailVerifyModal(false)}
        initialEmail={editEmail}
        title="Verify Your Email Address"
        description="We will send a 6-digit verification code to confirm your email address."
        onSuccess={(verified) => {
          setEditEmail(verified);
          setShowEmailVerifyModal(false);
          refreshUser().catch(() => {});
        }}
      />
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
