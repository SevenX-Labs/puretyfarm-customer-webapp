"use client";

import Link from "next/link";
import { ArrowRight, Milk, UserPlus, MapPin, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { PfButton, PfCard, PfSectionTitle } from "@/components/pf";
import { CustomerHeader } from "@/components/pf/layout/CustomerHeader";
import { useDashboardData } from "./useDashboardData";
import { findNextDelivery } from "./utils";
import { NextDeliveryCard } from "./components/NextDeliveryCard";
import { MilkPlanCard } from "./components/MilkPlanCard";
import { QuickActions } from "./components/QuickActions";
import { RecentOrders } from "./components/RecentOrders";
import { DashboardSkeleton } from "./components/DashboardSkeleton";

export function DashboardView() {
  const { user } = useAuth();
  const { orders, subscription, defaultAddress, loading, error } =
    useDashboardData();

  const nextDelivery = findNextDelivery(orders);
  const hasPlan = subscription && subscription.status !== "cancelled";
  const needsSetup =
    user?.onboardingStep && user.onboardingStep !== "complete";

  const locality =
    defaultAddress?.locality || defaultAddress?.city || "Raipur";

  return (
    <>
      <CustomerHeader location={locality} />

      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <ErrorBlock message={error} />
      ) : needsSetup ? (
        <SetupPrompt step={user?.onboardingStep} />
      ) : !nextDelivery && !hasPlan ? (
        <StarterBlock />
      ) : (
        <div className="space-y-10">
          <section className="grid lg:grid-cols-[2fr_1fr] gap-5">
            <div>
              {nextDelivery ? (
                <NextDeliveryCard order={nextDelivery} />
              ) : (
                <NoUpcomingDelivery hasPlan={!!hasPlan} />
              )}
            </div>
            <div>
              <MilkPlanCard subscription={subscription} />
            </div>
          </section>

          <section>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--pf-text-muted)] mb-3">
              Quick Actions
            </h2>
            <QuickActions />
          </section>

          <section>
            <PfSectionTitle
              title="Recent Orders"
              action={
                <Link
                  href="/orders"
                  className="pf-focus-ring inline-flex items-center gap-1 text-[13px] font-semibold text-[var(--pf-brown)]"
                >
                  View all
                  <ArrowRight size={14} strokeWidth={2} />
                </Link>
              }
            />
            <RecentOrders orders={orders} />
          </section>
        </div>
      )}
    </>
  );
}

function NoUpcomingDelivery({ hasPlan }: { hasPlan: boolean }) {
  return (
    <PfCard padding="lg">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-[var(--pf-yellow-soft)] flex items-center justify-center shrink-0">
          <Milk size={20} strokeWidth={1.75} className="text-[var(--pf-brown)]" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
            Next Delivery
          </div>
          <h2 className="mt-1 text-[22px] font-bold text-[var(--pf-text)] leading-[1.2]">
            {hasPlan ? "No upcoming delivery" : "Nothing on the way — yet"}
          </h2>
          <p className="mt-1.5 text-[14px] text-[var(--pf-text-secondary)]">
            {hasPlan
              ? "Your plan is active. We'll show your next morning delivery here as soon as it's scheduled."
              : "Pick a milk plan and we'll deliver farm-fresh A2 milk to your doorstep."}
          </p>
          <div className="mt-5">
            <PfButton href="/plan">
              {hasPlan ? "Manage Plan" : "Explore Milk Plans"}
            </PfButton>
          </div>
        </div>
      </div>
    </PfCard>
  );
}

function StarterBlock() {
  return (
    <PfCard padding="lg" elevated>
      <div className="text-center max-w-xl mx-auto py-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--pf-yellow-soft)] flex items-center justify-center">
          <Milk size={24} strokeWidth={1.75} className="text-[var(--pf-brown)]" />
        </div>
        <h2 className="mt-5 text-[26px] sm:text-[30px] font-bold text-[var(--pf-text)] leading-[1.15] tracking-tight">
          Start your PuretyFarm journey
        </h2>
        <p className="mt-2 text-[15px] text-[var(--pf-text-secondary)] leading-relaxed">
          Choose a fresh A2 Gir cow milk plan and we&apos;ll deliver it straight from
          the farm to your doorstep each morning.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <PfButton href="/plan">Explore Milk Plans</PfButton>
          <PfButton href="/plan" variant="secondary">
            View Plans
          </PfButton>
        </div>
      </div>
    </PfCard>
  );
}

function SetupPrompt({ step }: { step?: string }) {
  const steps = [
    {
      key: "profile_pending",
      label: "Complete your profile",
      icon: UserPlus,
    },
    {
      key: "location_pending",
      label: "Set your delivery location",
      icon: MapPin,
    },
    {
      key: "plan_pending",
      label: "Choose your milk plan",
      icon: Milk,
    },
  ];

  const activeIndex = Math.max(
    0,
    steps.findIndex((s) => s.key === step)
  );

  return (
    <PfCard padding="lg" elevated>
      <h2 className="text-[22px] sm:text-[26px] font-bold text-[var(--pf-text)] leading-[1.2] tracking-tight">
        Finish setting up PuretyFarm
      </h2>
      <p className="mt-1.5 text-[14px] text-[var(--pf-text-secondary)]">
        A couple more steps before your fresh milk starts arriving each morning.
      </p>

      <ol className="mt-6 space-y-3">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const done = i < activeIndex;
          const isActive = i === activeIndex;
          return (
            <li
              key={s.key}
              className={`flex items-center gap-3 p-4 rounded-[14px] border ${
                isActive
                  ? "border-[var(--pf-brown)] bg-[var(--pf-surface-soft)]"
                  : "border-[var(--pf-border)] bg-[var(--pf-surface)]"
              }`}
            >
              <span
                className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${
                  done
                    ? "bg-[var(--pf-success-bg)] text-[var(--pf-success)]"
                    : isActive
                      ? "bg-[var(--pf-yellow-soft)] text-[var(--pf-brown)]"
                      : "bg-[var(--pf-surface-soft)] text-[var(--pf-text-muted)]"
                }`}
              >
                {done ? (
                  <CheckCircle2 size={18} strokeWidth={1.75} />
                ) : (
                  <Icon size={18} strokeWidth={1.75} />
                )}
              </span>
              <div className="flex-1 text-[14px] font-semibold text-[var(--pf-text)]">
                {s.label}
              </div>
              {isActive && (
                <PfButton href="/onboarding" size="sm">
                  Continue
                </PfButton>
              )}
            </li>
          );
        })}
      </ol>
    </PfCard>
  );
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <PfCard padding="lg">
      <h2 className="text-[20px] font-bold text-[var(--pf-text)]">
        Something went wrong
      </h2>
      <p className="mt-1.5 text-[14px] text-[var(--pf-text-secondary)]">
        {message || "We couldn't load your dashboard right now."}
      </p>
      <div className="mt-5">
        <PfButton onClick={() => window.location.reload()}>Try again</PfButton>
      </div>
    </PfCard>
  );
}
