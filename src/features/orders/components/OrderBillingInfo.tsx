import { formatCurrency } from "@/lib/utils/formatters";

/**
 * The billing fields this component reads. Both order shapes in the app (the
 * orders feature's and the shared model's) satisfy it.
 */
export interface BillableOrder {
  orderNumber?: string;
  status: string;
  paymentStatus?: string;
  totalPaise?: number;
  billingModel?: "PER_DELIVERY" | "PREPAID_LEGACY" | null;
  deliveredAt?: string | null;
  settlementStatus?: "PENDING" | "SETTLED" | "OUTSTANDING" | null;
  settledAt?: string | null;
  walletTransactionId?: string | null;
  expectedAmountPaise?: number;
  chargedAmountPaise?: number | null;
}

const rupees = (paise?: number | null) =>
  paise == null ? "—" : formatCurrency(paise / 100);

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

/** True when the order is charged to the wallet on delivery, not prepaid. */
export function isPerDeliveryOrder(order: BillableOrder): boolean {
  return order.billingModel === "PER_DELIVERY";
}

/** Short, honest payment label for an order. Never "Paid" before it is charged. */
export function orderChargeLabel(order: BillableOrder): string {
  if (!isPerDeliveryOrder(order)) return String(order.paymentStatus || "—");
  if (order.status === "CANCELLED" || order.status === "FAILED") return "Not charged";
  if (order.settlementStatus === "SETTLED") return "Charged";
  if (order.settlementStatus === "OUTSTANDING") return "Payment due";
  return "Charged on delivery";
}

/**
 * Delivery and wallet-charge details for a per-delivery order: what it is
 * expected to cost, whether and when it was delivered, what was charged, and a
 * reference to the matching wallet transaction. Renders nothing for prepaid
 * plan orders, which are not charged per delivery.
 */
export function OrderBillingInfo({
  order,
  compact = false,
}: {
  order: BillableOrder;
  compact?: boolean;
}) {
  if (!isPerDeliveryOrder(order)) return null;

  const expectedPaise = order.expectedAmountPaise ?? order.totalPaise ?? null;
  const settled = order.settlementStatus === "SETTLED";
  const outstanding = order.settlementStatus === "OUTSTANDING";
  const cancelled = order.status === "CANCELLED" || order.status === "FAILED";

  if (compact) {
    return (
      <div className="text-[11px] leading-snug text-[#6B584C]">
        {settled && (
          <span className="font-semibold text-emerald-700">
            Charged {rupees(order.chargedAmountPaise ?? expectedPaise)} from wallet
          </span>
        )}
        {outstanding && (
          <span className="font-semibold text-rose-700">
            {rupees(expectedPaise)} due — please add money to your wallet
          </span>
        )}
        {!settled && !outstanding && !cancelled && (
          <span>{rupees(expectedPaise)} will be charged when delivered</span>
        )}
        {cancelled && <span>Not charged</span>}
        {order.deliveredAt && (
          <span className="block font-mono">Delivered {formatDateTime(order.deliveredAt)}</span>
        )}
      </div>
    );
  }

  const rows: Array<[string, string]> = [
    [settled ? "Amount charged" : "Expected charge", rupees(settled ? order.chargedAmountPaise ?? expectedPaise : expectedPaise)],
    ["Charge status", orderChargeLabel(order)],
    ["Delivered at", order.deliveredAt ? formatDateTime(order.deliveredAt) : "Not delivered yet"],
  ];
  if (settled) {
    rows.push(["Charged at", formatDateTime(order.settledAt)]);
    rows.push([
      "Wallet transaction",
      order.walletTransactionId
        ? `#${order.walletTransactionId.slice(0, 8).toUpperCase()}`
        : "—",
    ]);
  }

  return (
    <div className="rounded-2xl border border-[#E8DFD4] bg-[#FAF8F5] p-4 text-xs">
      <div className="font-bold text-[#1A1008]">Wallet charge for this delivery</div>
      <p className="mt-0.5 text-[#6B584C]">
        This order is charged to your wallet only when it is delivered.
        {settled && order.orderNumber &&
          ` Look for "Order #${order.orderNumber}" in your wallet history.`}
      </p>
      <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 sm:block">
            <dt className="text-[#8C7A6B]">{label}</dt>
            <dd className="font-semibold text-[#1A1008] sm:mt-0.5">{value}</dd>
          </div>
        ))}
      </dl>
      {outstanding && (
        <p className="mt-3 font-semibold text-rose-700">
          This delivery could not be charged because your wallet balance was too low.
          Please add money to your wallet.
        </p>
      )}
    </div>
  );
}
