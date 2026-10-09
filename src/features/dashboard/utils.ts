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

export function formatDeliveryWindow(start?: string, end?: string): string {
  const s = start?.trim();
  const e = end?.trim();
  if (s && e) return `${s} – ${e}`;
  return s || e || "";
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
  | "cancelled"
  | "failed";

export function normaliseStatus(status: OrderStatus): NormalisedStatus {
  const s = String(status).toLowerCase();
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
      cancelled: "Cancelled",
      failed: "Failed",
    }[n] || "Scheduled"
  );
}

export function statusTone(
  status: OrderStatus
): "success" | "warning" | "error" | "neutral" | "info" {
  const n = normaliseStatus(status);
  if (n === "delivered") return "success";
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
