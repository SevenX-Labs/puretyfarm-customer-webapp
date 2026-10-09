import Link from "next/link";
import { ArrowRight, Milk } from "lucide-react";
import type { Subscription } from "@/types/models";
import { formatDeliveryDate, paiseToRupeesText } from "../utils";

export function MilkPlanCard({ subscription }: { subscription: Subscription | null }) {
  const noPlan = !subscription || subscription.status === "cancelled";

  if (noPlan) {
    return (
      <aside className="h-full bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-[22px] p-7 flex flex-col shadow-[var(--pf-shadow-sm)]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--pf-text-muted)]">
            Your Milk Plan
          </span>
        </div>
        <h3 className="mt-3 text-[22px] font-bold text-[var(--pf-text)] leading-[1.2]">
          Choose a plan
        </h3>
        <p className="mt-1.5 text-[14px] text-[var(--pf-text-secondary)] leading-relaxed">
          Fresh A2 Gir cow milk, delivered every morning. Daily, alternate — your call.
        </p>
        <div className="mt-auto pt-6">
          <Link
            href="/plan"
            className="pf-focus-ring inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--pf-brown)]"
          >
            Explore Plans
            <ArrowRight size={15} strokeWidth={2} />
          </Link>
        </div>
      </aside>
    );
  }

  const nextDel = formatDeliveryDate(subscription.nextDeliveryDate);
  const priceText =
    subscription.price != null
      ? paiseToRupeesText(null, subscription.price)
      : "—";

  const paused = subscription.status === "paused";

  return (
    <aside className="h-full bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-[22px] p-7 flex flex-col shadow-[var(--pf-shadow-sm)]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--pf-text-muted)]">
          Your Milk Plan
        </span>
        {paused && (
          <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--pf-warning)] bg-[var(--pf-warning-bg)] px-2 py-0.5 rounded-full">
            Paused
          </span>
        )}
      </div>

      <div className="mt-3 flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-[var(--pf-yellow-soft)] flex items-center justify-center shrink-0">
          <Milk size={20} strokeWidth={1.75} className="text-[var(--pf-brown)]" />
        </div>
        <div className="min-w-0">
          <h3 className="text-[20px] font-bold text-[var(--pf-text)] leading-[1.2] truncate">
            A2 Cow Milk
          </h3>
          <div className="text-[13px] text-[var(--pf-text-secondary)]">
            {subscription.dailyQuantity}
          </div>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-[var(--pf-border)] space-y-2.5">
        <Row label="Price" value={`${priceText} / month`} />
        <Row label="Next delivery" value={nextDel.label} />
      </div>

      <div className="mt-auto pt-6">
        <Link
          href="/plan"
          className="pf-focus-ring inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--pf-brown)]"
        >
          Manage Plan
          <ArrowRight size={15} strokeWidth={2} />
        </Link>
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-[13px]">
      <span className="text-[var(--pf-text-muted)]">{label}</span>
      <span className="font-semibold text-[var(--pf-text)] text-right">{value}</span>
    </div>
  );
}
