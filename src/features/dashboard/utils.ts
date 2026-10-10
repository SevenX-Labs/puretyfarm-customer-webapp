import type { Order, OrderStatus } from "@/types/models";

export function paiseToRupeesText(paise?: number | null, fallbackRupees?: number | null) {
  const value =
    paise != null
      ? paise / 100
      : fallbackRupees != null
        ? fallbackRupees
        : null;
  if (value == null) return "—";
  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

export function orderTotalRupees(order: Order): string {
  return paiseToRupeesText(order.totalPaise, order.totalAmount);
}

export function formatDeliveryDate(
  isoDate?: string | null
): { label: string; date: Date | null } {
  if (!isoDate) return { label: "Not scheduled", date: null };
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return { label: "Not scheduled", date: null };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  if (target.getTime() === today.getTime()) return { label: "Today", date };
  if (target.getTime() === tomorrow.getTime()) return { label: "Tomorrow", date };

  return {
    label: date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
    }),
    date,
  };
}

/** 24-hour "HH:MM" — the format the backend stores delivery windows in. */
const DELIVERY_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Shown wherever operational data the backend has not configured would go. */
export const WINDOW_UNAVAILABLE_LABEL = "Delivery window not available";

/**
 * Renders a 24h "HH:MM" delivery time as 12h "h:mm AM/PM", or null when there
 * is nothing valid to render.
 *
 * The admin configures the window in 24h form and the API transports it that
 * way, but a customer should never be shown "11:00" and left to guess.
 * Malformed or missing input returns null so callers must handle the gap —
 * emitting "12:00 AM" for an unset field would state a delivery time nobody
 * configured.
 */
export function formatTimeSlot(time?: string | null): string | null {
  const value = time?.trim();
  if (!value || !DELIVERY_TIME_PATTERN.test(value)) return null;
  const [hStr, m] = value.split(":");
  const h24 = parseInt(hStr, 10);
  return `${h24 % 12 || 12}:${m} ${h24 >= 12 ? "PM" : "AM"}`;
}

/**
 * Renders a delivery window, or null when either end is missing.
 *
 * There is deliberately no default window. The delivery window is operational
 * data owned by the backend; when it has none, the customer sees that rather
 * than a plausible-looking morning slot.
 */
export function formatDeliveryWindow(
  start?: string | null,
  end?: string | null
): string | null {
  const from = formatTimeSlot(start);
  const to = formatTimeSlot(end);
  if (!from || !to) return null;
  return `${from} – ${to}`;
}

/** Window for display, falling back to an explicit unavailable label. */
export function formatDeliveryWindowOrLabel(
  start?: string | null,
  end?: string | null,
  label: string = WINDOW_UNAVAILABLE_LABEL
): string {
  return formatDeliveryWindow(start, end) ?? label;
}

const ACTIVE_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "OUT_FOR_DELIVERY",
  "Placed",
  "Confirmed",
  "Out for delivery",
];

export function findNextDelivery(orders: Order[]): Order | null {
  const now = Date.now();
  const upcoming = orders
    .filter(
      (o) =>
        ACTIVE_STATUSES.includes(o.status) &&
        o.deliveryDate &&
        new Date(o.deliveryDate).getTime() >= now - 24 * 60 * 60 * 1000
    )
    .sort(
      (a, b) =>
        new Date(a.deliveryDate!).getTime() -
        new Date(b.deliveryDate!).getTime()
    );
  return upcoming[0] || null;
}

export type NormalisedStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "cancelled"
  | "failed";

export function normaliseStatus(status: OrderStatus): NormalisedStatus {
  const s = String(status).toLowerCase();
  // COMPLETED is matched first: it is the terminal status an admin sets after
  // a delivered order is closed out, and without its own branch it would fall
  // through every substring test below and be mislabelled as "Scheduled".
  if (s.includes("complet")) return "completed";
  if (s.includes("deliver") && !s.includes("out")) return "delivered";
  if (s.includes("out")) return "out_for_delivery";
  if (s.includes("process")) return "processing";
  if (s.includes("confirm")) return "confirmed";
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("fail")) return "failed";
  return "pending";
}

export function statusLabel(status: OrderStatus) {
  const n = normaliseStatus(status);
  return (
    {
      pending: "Scheduled",
      confirmed: "Confirmed",
      processing: "Preparing",
      out_for_delivery: "Out for delivery",
      delivered: "Delivered",
      completed: "Completed",
      cancelled: "Cancelled",
      failed: "Failed",
    }[n] || "Scheduled"
  );
}

export function statusTone(
  status: OrderStatus
): "success" | "warning" | "error" | "neutral" | "info" {
  const n = normaliseStatus(status);
  if (n === "delivered" || n === "completed") return "success";
  if (n === "cancelled" || n === "failed") return "error";
  if (n === "out_for_delivery") return "warning";
  return "info";
}

export function orderItemsSummary(order: Order) {
  const first = order.items?.[0];
  const name =
    first?.productNameSnapshot || first?.name || "A2 Cow Milk";
  const qty = order.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;
  const unit = first?.unit || "L";
  return { name, qty, unit, totalItems: order.items?.length || 0 };
}
