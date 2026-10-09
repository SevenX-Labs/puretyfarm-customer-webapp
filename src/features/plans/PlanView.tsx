"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Pause,
  Play,
  SkipForward,
  X,
  CheckCircle2,
  Milk,
} from "lucide-react";
import { CustomerHeader } from "@/components/pf/layout/CustomerHeader";
import { PfBadge, PfButton, PfCard, PfSectionTitle, PfSkeleton } from "@/components/pf";
import { accountApi } from "@/features/account/api/accountApi";
import type { Subscription } from "@/types/models";
import { PLANS } from "./constants";
import {
  formatDeliveryDate,
  paiseToRupeesText,
} from "@/features/dashboard/utils";

export function PlanView() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null
  );

  async function load() {
    setLoading(true);
    try {
      const res = await accountApi.getSubscription();
      setSubscription(res.subscription || null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle() {
    if (!subscription) return;
    setUpdating(true);
    setMessage(null);
    try {
      const next = subscription.status === "paused" ? "active" : "paused";
      const res = await accountApi.updateSubscriptionStatus(next);
      if (res.subscription) setSubscription(res.subscription);
      setMessage({
        tone: "success",
        text: next === "paused" ? "Plan paused." : "Plan resumed.",
      });
    } catch (e: any) {
      setMessage({ tone: "error", text: e?.message || "Could not update plan." });
    } finally {
      setUpdating(false);
    }
  }

  async function activate(planId: "trial" | "monthly" | "single") {
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return;
    setUpdating(true);
    setMessage(null);
    try {
      const res = await accountApi.createSubscription({
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        dailyQuantity: plan.quantity,
      });
      if (res.subscription) setSubscription(res.subscription);
      setMessage({ tone: "success", text: "Plan activated." });
    } catch (e: any) {
      setMessage({ tone: "error", text: e?.message || "Could not activate plan." });
    } finally {
      setUpdating(false);
    }
  }

  return (
    <>
      <CustomerHeader
        title="My Milk Plan"
        subtitle="Manage your daily A2 milk subscription."
      />

      {loading ? (
        <PlanSkeleton />
      ) : (
        <div className="space-y-10">
          {subscription && subscription.status !== "cancelled" ? (
            <CurrentPlanCard
              subscription={subscription}
              onToggle={toggle}
              updating={updating}
            />
          ) : (
            <PfCard padding="lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--pf-yellow-soft)] flex items-center justify-center shrink-0">
                  <Milk size={22} strokeWidth={1.75} className="text-[var(--pf-brown)]" />
                </div>
                <div>
                  <h2 className="text-[22px] font-bold text-[var(--pf-text)]">
                    No active plan
                  </h2>
                  <p className="mt-1 text-[14px] text-[var(--pf-text-secondary)]">
                    Choose a plan below to start your morning milk deliveries.
                  </p>
                </div>
              </div>
            </PfCard>
          )}

          {message && (
            <div
              className={`rounded-[14px] px-4 py-3 text-[13px] font-semibold border ${
                message.tone === "success"
                  ? "bg-[var(--pf-success-bg)] text-[var(--pf-success)] border-[color:var(--pf-success)]/20"
                  : "bg-[var(--pf-error-bg)] text-[var(--pf-error)] border-[color:var(--pf-error)]/20"
              }`}
            >
              {message.text}
            </div>
          )}

          <section>
            <PfSectionTitle
              title={subscription?.status === "active" ? "Change plan" : "Available plans"}
              description="All plans include free morning delivery, glass bottles, and WhatsApp updates."
            />
            <div className="grid md:grid-cols-3 gap-4">
              {PLANS.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  active={subscription?.planId === plan.id && subscription?.status !== "cancelled"}
                  onSelect={() => activate(plan.id)}
                  disabled={updating}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function CurrentPlanCard({
  subscription,
  onToggle,
  updating,
}: {
  subscription: Subscription;
  onToggle: () => void;
  updating: boolean;
}) {
  const paused = subscription.status === "paused";
  const next = formatDeliveryDate(subscription.nextDeliveryDate);
  const planDef = PLANS.find((p) => p.id === subscription.planId);
  const priceText = paiseToRupeesText(null, subscription.price);

  return (
    <PfCard padding="lg" elevated>
      <div className="grid lg:grid-cols-[1fr_minmax(220px,280px)] gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--pf-text-muted)]">
              Current Plan
            </span>
            <PfBadge tone={paused ? "warning" : "success"} dot>
              {paused ? "Paused" : "Active"}
            </PfBadge>
          </div>
          <h2 className="text-[32px] font-bold text-[var(--pf-text)] leading-[1.1]">
            {subscription.planName || planDef?.name || "A2 Cow Milk"}
          </h2>
          <p className="mt-1 text-[16px] text-[var(--pf-text-secondary)] font-semibold">
            {subscription.dailyQuantity}
          </p>

          <div className="mt-6 grid sm:grid-cols-2 gap-5 pt-6 border-t border-[var(--pf-border)]">
            <Stat label="Price" value={`${priceText}`} />
            <Stat label="Next delivery" value={next.label} />
          </div>

          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <PfButton
              onClick={onToggle}
              loading={updating}
              variant={paused ? "primary" : "secondary"}
            >
              {paused ? (
                <>
                  <Play size={15} strokeWidth={2} />
                  Resume
                </>
              ) : (
                <>
                  <Pause size={15} strokeWidth={2} />
                  Pause
                </>
              )}
            </PfButton>
            <PfButton href="/delivery" variant="secondary">
              <SkipForward size={15} strokeWidth={2} />
              Skip a day
            </PfButton>
            <Link
              href="/account-settings?tab=subscription"
              className="pf-focus-ring inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--pf-text-secondary)] hover:text-[var(--pf-error)] ml-auto"
            >
              <X size={14} strokeWidth={2} />
              Cancel plan
            </Link>
          </div>
        </div>

        <div className="lg:border-l lg:border-[var(--pf-border)] lg:pl-6">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={16} strokeWidth={1.75} className="text-[var(--pf-brown)]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
              What&apos;s included
            </span>
          </div>
          <ul className="space-y-2.5">
            {(planDef?.features || []).slice(0, 4).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-[var(--pf-text-secondary)]">
                <CheckCircle2 size={14} strokeWidth={2} className="text-[var(--pf-brown)] mt-0.5 shrink-0" />
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PfCard>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
        {label}
      </div>
      <div className="mt-1 text-[18px] font-bold text-[var(--pf-text)]">{value}</div>
    </div>
  );
}

function PlanCard({
  plan,
  active,
  onSelect,
  disabled,
}: {
  plan: (typeof PLANS)[number];
  active: boolean;
  onSelect: () => void;
  disabled: boolean;
}) {
  return (
    <article
      className={`relative flex flex-col h-full rounded-[20px] p-6 border transition-colors ${
        active
          ? "border-[var(--pf-brown)] bg-[var(--pf-surface)] shadow-[var(--pf-shadow-card)]"
          : "border-[var(--pf-border)] bg-[var(--pf-surface)] hover:border-[var(--pf-border-strong)]"
      }`}
    >
      {active && (
        <span className="absolute -top-2.5 left-6 inline-flex items-center gap-1 bg-[var(--pf-yellow)] text-[var(--pf-dark)] text-[10px] font-bold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full">
          <CheckCircle2 size={11} strokeWidth={2.5} />
          Current
        </span>
      )}
      <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
        {plan.badge}
      </div>
      <h3 className="mt-2 text-[20px] font-bold text-[var(--pf-text)] leading-[1.2]">
        {plan.name}
      </h3>
      <p className="mt-1 text-[13px] text-[var(--pf-text-secondary)] leading-relaxed">
        {plan.description}
      </p>

      <div className="mt-5 pt-5 border-t border-[var(--pf-border)]">
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] font-bold text-[var(--pf-text)] leading-none">
            ₹{plan.price.toLocaleString("en-IN")}
          </span>
          <span className="text-[12px] text-[var(--pf-text-muted)] font-semibold">
            {plan.periodLabel}
          </span>
        </div>
        <div className="mt-1 text-[12px] text-[var(--pf-text-muted)]">
          {plan.rateText}
        </div>
      </div>

      <ul className="mt-5 space-y-2 flex-1">
        {plan.features.slice(0, 4).map((f, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[12.5px] text-[var(--pf-text-secondary)] leading-snug"
          >
            <CheckCircle2 size={13} strokeWidth={2} className="text-[var(--pf-brown)] mt-0.5 shrink-0" />
            <span>{f.text}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <PfButton
          fullWidth
          disabled={disabled || active}
          onClick={onSelect}
          variant={active ? "secondary" : "primary"}
        >
          {active ? "Current plan" : plan.ctaText}
        </PfButton>
      </div>
    </article>
  );
}

function PlanSkeleton() {
  return (
    <div className="space-y-10">
      <PfCard padding="lg">
        <PfSkeleton height={14} width={120} />
        <PfSkeleton className="mt-4" height={32} width="50%" />
        <PfSkeleton className="mt-3" height={20} width="30%" />
        <PfSkeleton className="mt-6" height={48} />
      </PfCard>
      <div className="grid md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PfSkeleton key={i} height={360} />
        ))}
      </div>
    </div>
  );
}
