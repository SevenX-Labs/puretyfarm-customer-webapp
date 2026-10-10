import { normaliseStatus, type NormalisedStatus } from "../utils";
import type { OrderStatus } from "@/types/models";

const STEPS: { key: NormalisedStatus; label: string }[] = [
  { key: "confirmed", label: "Order Confirmed" },
  { key: "processing", label: "Milk Prepared" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

export function DeliveryTimeline({ status }: { status: OrderStatus }) {
  const current = normaliseStatus(status);
  // "completed" sits past "delivered" so a closed-out order shows the whole
  // timeline done rather than falling off the end of the list.
  const order: NormalisedStatus[] = [
    "pending",
    "confirmed",
    "processing",
    "out_for_delivery",
    "delivered",
    "completed",
  ];
  const currentIndex = order.indexOf(current);

  return (
    <ol className="relative">
      {STEPS.map((step, idx) => {
        const stepIdx = order.indexOf(step.key);
        const done = stepIdx <= currentIndex;
        const isCurrent = stepIdx === currentIndex;
        const last = idx === STEPS.length - 1;
        return (
          <li key={step.key} className="relative flex items-start gap-3 pb-5 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className={`absolute left-[9px] top-[22px] bottom-0 w-px ${
                  done ? "bg-[var(--pf-brown)]" : "bg-[var(--pf-border)]"
                }`}
              />
            )}
            <span
              aria-hidden
              className={`relative mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                isCurrent
                  ? "bg-[var(--pf-yellow)] ring-4 ring-[var(--pf-yellow-soft)]"
                  : done
                    ? "bg-[var(--pf-brown)]"
                    : "bg-[var(--pf-beige)]"
              }`}
            >
              {done && !isCurrent && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
              {isCurrent && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--pf-dark)]" />
              )}
            </span>
            <div className="pt-0.5">
              <div
                className={`text-[13px] font-semibold ${
                  done ? "text-[var(--pf-text)]" : "text-[var(--pf-text-muted)]"
                }`}
              >
                {step.label}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
