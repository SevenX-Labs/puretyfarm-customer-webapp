"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Receipt,
  Download,
  Printer,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Sliders,
  SkipForward,
  PauseCircle,
  Settings2,
  CalendarRange,
  FileText,
  CreditCard,
  ChevronRight,
  Info,
  Check,
  RefreshCw,
  X,
} from "lucide-react";
import { CustomerHeader } from "@/components/pf/layout/CustomerHeader";
import { PfBadge, PfButton, PfCard, PfSkeleton } from "@/components/pf";
import { ordersApi } from "@/features/orders/api/ordersApi";
import { manageDeliveryApi, ManageDeliveryResponse } from "@/features/delivery";
import type { CustomerOrder, OrderInvoiceDetail } from "@/features/orders/types";
import {
  OrderBillingInfo,
  isPerDeliveryOrder,
  orderChargeLabel,
} from "@/features/orders/components/OrderBillingInfo";
import {
  formatDeliveryDate,
  formatDeliveryWindowOrLabel,
  paiseToRupeesText,
  statusLabel,
  statusTone,
} from "@/features/dashboard/utils";

export function OrderDetailView({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Invoice state
  const [invoice, setInvoice] = useState<OrderInvoiceDetail | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Manage Delivery state (for monthly orders)
  const [manageData, setManageData] = useState<ManageDeliveryResponse | null>(null);
  const [loadingManage, setLoadingManage] = useState(false);
  const [activeModal, setActiveModal] = useState<
    "QUANTITY" | "FREQUENCY" | "SKIP" | "PAUSE" | null
  >(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSuccessMsg, setModalSuccessMsg] = useState<string | null>(null);
  const [modalErrorMsg, setModalErrorMsg] = useState<string | null>(null);

  // Modal form inputs
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  // Set when a quantity request was refused because the wallet is too low.
  const [needsTopUp, setNeedsTopUp] = useState(false);
  const [selectedFrequency, setSelectedFrequency] = useState<string>("DAILY");
  const [skipDate, setSkipDate] = useState<string>("");
  const [pauseResumeDate, setPauseResumeDate] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await ordersApi.getOrder(orderId);
        if (!cancelled) {
          const ord = ((res as any).order || res) as CustomerOrder;
          setOrder(ord);

          // If monthly plan, fetch manage-delivery active plan view
          const isMonthly =
            ord.planType === "MONTHLY" ||
            ord.planType === "MONTHLY_PLAN" ||
            ord.items?.some((i) =>
              (i.productNameSnapshot || i.name || "").toLowerCase().includes("monthly")
            );

          if (isMonthly) {
            setLoadingManage(true);
            manageDeliveryApi
              .getManageDelivery()
              .then((mRes) => {
                if (!cancelled && mRes) {
                  setManageData(mRes);
                  if (mRes.activePlan?.quantityLitres) {
                    setSelectedQuantity(mRes.activePlan.quantityLitres);
                  }
                  if (mRes.activePlan?.frequency) {
                    setSelectedFrequency(mRes.activePlan.frequency);
                  }
                }
              })
              .catch(() => {})
              .finally(() => {
                if (!cancelled) setLoadingManage(false);
              });
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Could not load order.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // A per-delivery order that is still upcoming can have just its own
  // delivery changed; the server re-checks every one of these conditions.
  const changesThisDeliveryOnly = Boolean(
    order &&
      isPerDeliveryOrder(order) &&
      (order.status === "CONFIRMED" || order.status === "PENDING") &&
      order.deliveryDate
  );

  // Handle invoice fetch and trigger print
  const handlePrintOrDownloadInvoice = async () => {
    setLoadingInvoice(true);
    try {
      if (!invoice && order) {
        const inv = await ordersApi.getInvoice(order.id).catch(() => null);
        if (inv) setInvoice(inv);
      }
    } finally {
      setLoadingInvoice(false);
      // Small timeout to allow DOM to render invoice before print dialog
      setTimeout(() => {
        window.print();
      }, 150);
    }
  };

  // Actions for Manage Delivery
  const handleActionQuantity = async () => {
    setModalLoading(true);
    setModalErrorMsg(null);
    setNeedsTopUp(false);
    try {
      // For a per-delivery order that has not been dispatched, the request
      // targets this order's own delivery date. Otherwise it is plan-wide.
      const targetDate =
        order && changesThisDeliveryOnly && order.deliveryDate
          ? String(order.deliveryDate).slice(0, 10)
          : undefined;
      await manageDeliveryApi.changeQuantity({
        quantityLitres: selectedQuantity,
        ...(targetDate ? { deliveryDate: targetDate } : {}),
      });
      // A request changes nothing until an admin approves it.
      setModalSuccessMsg(
        targetDate
          ? `Request sent: ${selectedQuantity}L for the ${targetDate} delivery. It applies once approved.`
          : `Request sent: ${selectedQuantity}L for upcoming deliveries. It applies once approved.`
      );
      const refreshed = await manageDeliveryApi.getManageDelivery().catch(() => null);
      if (refreshed) setManageData(refreshed);
      setTimeout(() => setActiveModal(null), 2200);
    } catch (err: any) {
      if (err?.data?.error === "INSUFFICIENT_WALLET_BALANCE") setNeedsTopUp(true);
      setModalErrorMsg(err?.message || "Failed to request the quantity change. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleActionFrequency = async () => {
    setModalLoading(true);
    setModalErrorMsg(null);
    try {
      await manageDeliveryApi.changeFrequency({
        frequency: selectedFrequency as any,
      });
      setModalSuccessMsg(`Frequency updated to ${selectedFrequency.replace("_", " ")}.`);
      const refreshed = await manageDeliveryApi.getManageDelivery().catch(() => null);
      if (refreshed) setManageData(refreshed);
      setTimeout(() => setActiveModal(null), 1500);
    } catch (err: any) {
      setModalErrorMsg(err?.message || "Failed to update frequency.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleActionSkip = async () => {
    if (!skipDate) {
      setModalErrorMsg("Please choose a date to skip.");
      return;
    }
    setModalLoading(true);
    setModalErrorMsg(null);
    try {
      await manageDeliveryApi.skipDelivery({ deliveryDate: skipDate });
      setModalSuccessMsg(`Delivery for ${skipDate} has been skipped.`);
      const refreshed = await manageDeliveryApi.getManageDelivery().catch(() => null);
      if (refreshed) setManageData(refreshed);
      setTimeout(() => setActiveModal(null), 1500);
    } catch (err: any) {
      setModalErrorMsg(err?.message || "Failed to skip delivery.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleActionPause = async () => {
    setModalLoading(true);
    setModalErrorMsg(null);
    try {
      await manageDeliveryApi.pauseDelivery({
        resumeDate: pauseResumeDate || undefined,
      });
      setModalSuccessMsg(
        pauseResumeDate
          ? `Deliveries paused until ${pauseResumeDate}.`
          : "Deliveries paused until manually resumed."
      );
      const refreshed = await manageDeliveryApi.getManageDelivery().catch(() => null);
      if (refreshed) setManageData(refreshed);
      setTimeout(() => setActiveModal(null), 1500);
    } catch (err: any) {
      setModalErrorMsg(err?.message || "Failed to pause deliveries.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
      {/* Print stylesheet to isolate receipt voucher on print */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #purety-receipt-document,
          #purety-receipt-document * {
            visibility: visible;
          }
          #purety-receipt-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: 1px solid #000 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="mb-5 no-print">
        <Link
          href="/orders"
          className="pf-focus-ring inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)]"
        >
          <ArrowLeft size={14} strokeWidth={2} /> Back to all orders
        </Link>
      </div>

      {loading ? (
        <OrderSkeleton />
      ) : error || !order ? (
        <PfCard padding="lg">
          <h2 className="text-[20px] font-bold text-[var(--pf-text)]">
            Order not found
          </h2>
          <p className="mt-1.5 text-[14px] text-[var(--pf-text-secondary)]">
            {error || "We couldn't locate this order record."}
          </p>
          <div className="mt-5">
            <PfButton href="/orders">Return to Orders</PfButton>
          </div>
        </PfCard>
      ) : (
        <div className="space-y-8 max-w-3xl mx-auto pb-12">
          {/* Header */}
          <div className="no-print">
            <CustomerHeader
              title={`Order #${(order.orderNumber || order.id).toString().slice(0, 10).toUpperCase()}`}
              subtitle={`Receipt & Tax Summary • Placed on ${new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}`}
            />
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              1. OFFICIAL PURETYFARM RECEIPT DESIGN (NO PROGRESS BAR)
             ══════════════════════════════════════════════════════════════════ */}
          <div
            id="purety-receipt-document"
            className="bg-white rounded-3xl border border-[#E8DFD4] shadow-sm p-4.5 sm:p-7 md:p-9 relative overflow-hidden"
          >
            {/* Top decorative receipt teeth/notch */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#5C1B13] via-[#8C2C20] to-[#5C1B13]" />

            {/* Receipt Brand & Order Title */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#E8DFD4]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl font-black tracking-tight text-[#1A1008]">
                    Purety<span className="text-[#5C1B13]">Farm</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#FAF3EA] text-[#5C1B13] border border-[#E8DFD4]">
                    Official Receipt
                  </span>
                </div>
                <p className="text-xs text-[#6B584C] mt-1">
                  Raipur A2 Desi Gir Cow Milk • 4°C Cold-Chain Certified
                </p>
                <p className="text-[11px] font-mono text-[#8C7A6B] mt-0.5">
                  Tax Invoice Ref: {order.invoice?.invoiceNumber || `PF-INV-${order.id.slice(0, 8).toUpperCase()}`}
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0 space-y-1">
                <div className="flex items-center sm:justify-end gap-2">
                  <PfBadge tone={statusTone(order.status)} dot>
                    {statusLabel(order.status)}
                  </PfBadge>
                </div>
                <p className="text-xs font-mono font-bold text-[#1A1008]">
                  #{order.orderNumber || order.id.slice(0, 12)}
                </p>
                <p className="text-[11px] text-[#8C7A6B]">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Delivery Date & Address Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-[#E8DFD4] text-xs">
              {/* Delivery Window */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD4]/80 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-[#8C7A6B]">
                  <Calendar size={13} className="text-[#5C1B13]" />
                  <span>Scheduled Delivery</span>
                </div>
                <p className="text-sm font-bold text-[#1A1008]">
                  {formatDeliveryDate(order.deliveryDate).label}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-[#5C1B13]">
                  <Clock size={12} />
                  <span>
                    {formatDeliveryWindowOrLabel(
                      order.deliveryStartTime,
                      order.deliveryEndTime,
                      "Not available"
                    )}
                  </span>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD4]/80 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-[#8C7A6B]">
                  <MapPin size={13} className="text-[#5C1B13]" />
                  <span>Doorstep Destination</span>
                </div>
                {order.addressSnapshot || order.deliveryAddress ? (
                  <div className="text-[12px] text-[#1A1008] leading-tight">
                    <p className="font-bold">
                      {(order.addressSnapshot || order.deliveryAddress)?.fullName || "Customer"}
                    </p>
                    <p className="text-[#6B584C] mt-0.5">
                      {[
                        (order.addressSnapshot || order.deliveryAddress)?.houseNumber,
                        (order.addressSnapshot || order.deliveryAddress)?.buildingName,
                        (order.addressSnapshot || order.deliveryAddress)?.streetName ||
                          (order.addressSnapshot || order.deliveryAddress)?.street,
                        (order.addressSnapshot || order.deliveryAddress)?.locality,
                        (order.addressSnapshot || order.deliveryAddress)?.city || "Raipur",
                        (order.addressSnapshot || order.deliveryAddress)?.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    {((order.addressSnapshot || order.deliveryAddress)?.phone ||
                      (order.addressSnapshot || order.deliveryAddress)?.mobile) && (
                      <p className="font-mono text-[11px] text-[#8C7A6B] mt-1">
                        📞 {(order.addressSnapshot || order.deliveryAddress)?.phone ||
                          (order.addressSnapshot || order.deliveryAddress)?.mobile}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[#8C7A6B]">Raipur Central Depot Delivery</p>
                )}
              </div>
            </div>

            {/* Itemized Receipt Items */}
            <div className="py-5 border-b border-[#E8DFD4]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] mb-3">
                Itemized Summary
              </div>
              <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-xs min-w-[280px]">
                <thead>
                  <tr className="text-left text-[#8C7A6B] border-b border-[#E8DFD4]/60 pb-2">
                    <th className="font-semibold pb-2">Description</th>
                    <th className="font-semibold pb-2 text-center">Qty</th>
                    <th className="font-semibold pb-2 text-right">Price</th>
                    <th className="font-semibold pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8DFD4]/40">
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item, idx) => {
                      const name =
                        item.productNameSnapshot || item.name || "A2 Desi Cow Raw Milk";
                      const qty = item.quantity || 1;
                      const unit = item.unit || "Litre Glass Bottle";
                      const unitPrice = item.unitPricePaise
                        ? paiseToRupeesText(item.unitPricePaise)
                        : item.price
                        ? `₹${item.price}`
                        : "₹85.00";
                      const totalItem = paiseToRupeesText(item.totalPaise, item.price);

                      return (
                        <tr key={item.id || idx} className="py-2.5">
                          <td className="py-2.5 pr-2">
                            <span className="font-bold text-[#1A1008] block">{name}</span>
                            <span className="text-[11px] text-[#8C7A6B]">{unit}</span>
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono font-medium text-[#1A1008]">
                            × {qty}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono text-[#6B584C]">
                            {unitPrice}
                          </td>
                          <td className="py-2.5 pl-2 text-right font-mono font-bold text-[#1A1008]">
                            {totalItem}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-3 text-center text-[#8C7A6B]">
                        Standard Daily Milk Subscription Delivery
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>
            </div>

            {/* Financial Ledger & Totals */}
            <div className="py-5 border-b border-[#E8DFD4] space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#6B584C]">
                <span>Items Subtotal</span>
                <span className="font-mono font-semibold text-[#1A1008]">
                  {order.subtotalPaise != null
                    ? paiseToRupeesText(order.subtotalPaise)
                    : paiseToRupeesText(order.totalPaise, order.totalAmount)}
                </span>
              </div>

              {order.deliveryFeePaise !== undefined && (
                <div className="flex justify-between items-center text-[#6B584C]">
                  <span>Morning Cold-Chain Delivery</span>
                  <span className="font-mono font-semibold text-[#1A1008]">
                    {order.deliveryFeePaise === 0
                      ? "FREE (Included)"
                      : paiseToRupeesText(order.deliveryFeePaise)}
                  </span>
                </div>
              )}

              {!!order.discountPaise && order.discountPaise > 0 && (
                <div className="flex justify-between items-center text-emerald-700 font-medium">
                  <span>Subscription Discount Applied</span>
                  <span className="font-mono">- {paiseToRupeesText(order.discountPaise)}</span>
                </div>
              )}

              {!!order.taxPaise && order.taxPaise > 0 && (
                <div className="flex justify-between items-center text-[#6B584C]">
                  <span>Taxes (GST Included)</span>
                  <span className="font-mono font-semibold text-[#1A1008]">
                    {paiseToRupeesText(order.taxPaise)}
                  </span>
                </div>
              )}

              {/* Total Row */}
              <div className="pt-3 mt-2 border-t border-[#E8DFD4] flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-bold text-[#1A1008] block">
                    {!isPerDeliveryOrder(order)
                      ? "Total Amount Paid"
                      : order.settlementStatus === "SETTLED"
                      ? "Amount Charged"
                      : "Expected Charge"}
                  </span>
                  <span className="text-[10px] text-[#8C7A6B] font-mono">
                    {isPerDeliveryOrder(order)
                      ? order.settlementStatus === "SETTLED"
                        ? "Deducted from wallet"
                        : "Charged only when delivered"
                      : order.totalPaise
                      ? `(${order.totalPaise.toLocaleString("en-IN")} integer paise)`
                      : "Paid in Full"}
                  </span>
                </div>
                <span className="text-xl font-black font-mono text-[#5C1B13]">
                  {paiseToRupeesText(order.totalPaise, order.totalAmount)}
                </span>
              </div>
            </div>

            {/* Payment & Audit Stamp */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CreditCard size={15} className="text-[#5C1B13]" />
                <span className="text-[#6B584C]">Payment Status:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-full border ${
                    !isPerDeliveryOrder(order) || order.settlementStatus === "SETTLED"
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : order.settlementStatus === "OUTSTANDING"
                      ? "text-rose-700 bg-rose-50 border-rose-200"
                      : "text-amber-800 bg-amber-50 border-amber-200"
                  }`}
                >
                  {orderChargeLabel(order)}
                </span>
              </div>
              <div className="text-[11px] text-[#8C7A6B] font-mono">
                PuretyFarm Raipur Depot • Sunrise Delivery Verified
              </div>
            </div>
          </div>

          <OrderBillingInfo order={order} />

          {/* ══════════════════════════════════════════════════════════════════
              2. DOWNLOAD INVOICE & RECEIPT ACTIONS
             ══════════════════════════════════════════════════════════════════ */}
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#E8DFD4] p-5 sm:p-6 shadow-2xs space-y-3 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-[#1A1008] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#5C1B13]" />
                  <span>Tax Invoice & Document Downloads</span>
                </h4>
                <p className="text-xs text-[#6B584C] mt-0.5">
                  Download or print the legal tax invoice for accounting and reimbursement.
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={loadingInvoice}
                  onClick={handlePrintOrDownloadInvoice}
                  className="px-4 py-2.5 rounded-xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs disabled:opacity-50"
                >
                  {loadingInvoice ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Download Invoice (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2.5 rounded-xl border border-[#E8DFD4] bg-white hover:bg-[#FAF3EA] text-[#1A1008] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                  title="Print Receipt"
                >
                  <Printer className="w-3.5 h-3.5 text-[#5C1B13]" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {invoice && (
              <div className="p-3 rounded-2xl bg-white border border-[#E8DFD4] text-xs flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-bold text-[#1A1008]">
                    Tax Invoice #{invoice.invoiceNumber}
                  </p>
                  <p className="text-[11px] text-[#8C7A6B]">
                    Issued: {new Date(invoice.issuedAt).toLocaleDateString("en-IN")} • Order #{invoice.orderNumber}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified Snapshot
                </span>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              3. MONTHLY SUBSCRIPTION MANAGEMENT (MANAGE / CUSTOMIZE / CHANGE)
             ══════════════════════════════════════════════════════════════════ */}
          {(order.planType === "MONTHLY" ||
            order.planType === "MONTHLY_PLAN" ||
            order.items?.some((i) =>
              (i.productNameSnapshot || i.name || "").toLowerCase().includes("monthly")
            )) && (
            <div className="bg-white rounded-3xl border border-[#E8DFD4] p-6 shadow-2xs space-y-5 no-print">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#E8DFD4]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-[#FAF3EA] text-[#5C1B13]">
                      <CalendarRange className="w-4 h-4" />
                    </span>
                    <h3 className="text-base font-bold text-[#1A1008]">
                      Manage Monthly Subscription
                    </h3>
                  </div>
                  <p className="text-xs text-[#6B584C] mt-1">
                    This order is part of your recurring monthly milk delivery. You can customize daily quantities, change frequencies, or skip upcoming dates anytime.
                  </p>
                </div>

                <Link
                  href="/plan"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C1B13] hover:underline shrink-0"
                >
                  <span>View Plan Details</span>
                  <ChevronRight size={14} />
                </Link>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal("QUANTITY");
                    setModalSuccessMsg(null);
                    setModalErrorMsg(null);
                  }}
                  className="p-3.5 rounded-2xl border border-[#E8DFD4] hover:border-[#5C1B13] bg-[#FAF8F5]/60 hover:bg-[#FAF3EA] text-left cursor-pointer transition-all group"
                >
                  <div className="w-7 h-7 rounded-xl bg-white border border-[#E8DFD4] flex items-center justify-center text-[#5C1B13] mb-2 group-hover:scale-105 transition-transform">
                    <Sliders size={14} />
                  </div>
                  <p className="text-xs font-bold text-[#1A1008]">Change Quantity</p>
                  <p className="text-[11px] text-[#6B584C] mt-0.5">
                    Adjust daily litres per delivery
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveModal("FREQUENCY");
                    setModalSuccessMsg(null);
                    setModalErrorMsg(null);
                  }}
                  className="p-3.5 rounded-2xl border border-[#E8DFD4] hover:border-[#5C1B13] bg-[#FAF8F5]/60 hover:bg-[#FAF3EA] text-left cursor-pointer transition-all group"
                >
                  <div className="w-7 h-7 rounded-xl bg-white border border-[#E8DFD4] flex items-center justify-center text-[#5C1B13] mb-2 group-hover:scale-105 transition-transform">
                    <Settings2 size={14} />
                  </div>
                  <p className="text-xs font-bold text-[#1A1008]">Change Frequency</p>
                  <p className="text-[11px] text-[#6B584C] mt-0.5">
                    Daily vs Alternate Days
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveModal("SKIP");
                    setModalSuccessMsg(null);
                    setModalErrorMsg(null);
                  }}
                  className="p-3.5 rounded-2xl border border-[#E8DFD4] hover:border-[#5C1B13] bg-[#FAF8F5]/60 hover:bg-[#FAF3EA] text-left cursor-pointer transition-all group"
                >
                  <div className="w-7 h-7 rounded-xl bg-white border border-[#E8DFD4] flex items-center justify-center text-[#5C1B13] mb-2 group-hover:scale-105 transition-transform">
                    <SkipForward size={14} />
                  </div>
                  <p className="text-xs font-bold text-[#1A1008]">Skip Delivery</p>
                  <p className="text-[11px] text-[#6B584C] mt-0.5">
                    Skip a specific calendar morning
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveModal("PAUSE");
                    setModalSuccessMsg(null);
                    setModalErrorMsg(null);
                  }}
                  className="p-3.5 rounded-2xl border border-[#E8DFD4] hover:border-[#5C1B13] bg-[#FAF8F5]/60 hover:bg-[#FAF3EA] text-left cursor-pointer transition-all group"
                >
                  <div className="w-7 h-7 rounded-xl bg-white border border-[#E8DFD4] flex items-center justify-center text-[#5C1B13] mb-2 group-hover:scale-105 transition-transform">
                    <PauseCircle size={14} />
                  </div>
                  <p className="text-xs font-bold text-[#1A1008]">Vacation Pause</p>
                  <p className="text-[11px] text-[#6B584C] mt-0.5">
                    Pause with auto-resume date
                  </p>
                </button>
              </div>

              {/* Server Endpoint Reference & API Transparency Box */}
              <div className="p-4 rounded-2xl bg-[#FAF3EA]/50 border border-[#E8DFD4] text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#5C1B13]">
                  <Info size={14} />
                  <span>Available Server Endpoints for Manage Delivery:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono text-[#6B584C]">
                  <div className="p-2 rounded-xl bg-white border border-[#E8DFD4]">
                    <strong className="text-[#1A1008] block">GET /api/v1/customer/manage-delivery</strong>
                    <span>Fetches active subscription plan & 30-day upcoming delivery calendar.</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#E8DFD4]">
                    <strong className="text-[#1A1008] block">POST /api/v1/customer/manage-delivery/change-quantity</strong>
                    <span>Sets quantityLitres (whole number) for all future scheduled deliveries.</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#E8DFD4]">
                    <strong className="text-[#1A1008] block">POST /api/v1/customer/manage-delivery/change-frequency</strong>
                    <span>Switches frequency between DAILY, ALTERNATE_DAYS, WEEKDAYS, etc.</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#E8DFD4]">
                    <strong className="text-[#1A1008] block">POST /api/v1/customer/manage-delivery/skip</strong>
                    <span>Skips a specific calendar delivery date with zero fee.</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#E8DFD4]">
                    <strong className="text-[#1A1008] block">POST /api/v1/customer/manage-delivery/pause</strong>
                    <span>Pauses recurring deliveries with optional resumeDate (YYYY-MM-DD).</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#E8DFD4]">
                    <strong className="text-[#1A1008] block">POST /api/v1/customer/manage-delivery/change-plan</strong>
                    <span>Switches active subscription between TRIAL, MONTHLY, and BUY_ONCE.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MANAGE DELIVERY MODAL DIALOGS
         ══════════════════════════════════════════════════════════════════ */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl border border-[#E8DFD4] shadow-2xl max-w-md w-full p-6 space-y-4 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#FAF3EA] text-[#8C7A6B] cursor-pointer"
            >
              <X size={16} />
            </button>

            {/* Modal Titles */}
            <div>
              <h3 className="text-base font-bold text-[#1A1008]">
                {activeModal === "QUANTITY" && "Change Daily Quantity"}
                {activeModal === "FREQUENCY" && "Change Delivery Frequency"}
                {activeModal === "SKIP" && "Skip Next Delivery Date"}
                {activeModal === "PAUSE" && "Vacation Pause Delivery"}
              </h3>
              <p className="text-xs text-[#6B584C] mt-0.5">
                {activeModal === "QUANTITY" && "Applies to all future scheduled morning deliveries."}
                {activeModal === "FREQUENCY" && "Updates your recurrence schedule on the server."}
                {activeModal === "SKIP" && "Select the future delivery date to skip."}
                {activeModal === "PAUSE" && "Temporarily freeze sunrise dispatches until you return."}
              </p>
            </div>

            {/* Success / Error Messages */}
            {modalSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{modalSuccessMsg}</span>
              </div>
            )}
            {modalErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>
                  {modalErrorMsg}
                  {needsTopUp && (
                    <>
                      {" "}
                      <Link href="/wallet" className="font-bold underline">
                        Add money to wallet
                      </Link>
                    </>
                  )}
                </span>
              </div>
            )}

            {/* Modal Content Bodies */}
            {activeModal === "QUANTITY" && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-[#1A1008] block">
                  Select Litres per Morning:
                </label>
                <p className="text-[11px] text-[#6B584C]">
                  {changesThisDeliveryOnly && order
                    ? `Applies only to the ${String(order.deliveryDate).slice(0, 10)} delivery (order ${order.orderNumber ?? ""}), after admin approval. The new quantity sets what is charged when it is delivered; an increase needs enough wallet balance.`
                    : "Applies to your upcoming deliveries after admin approval."}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setSelectedQuantity(qty)}
                      className={`py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        selectedQuantity === qty
                          ? "bg-[#5C1B13] text-white border-[#5C1B13]"
                          : "bg-[#FAF8F5] text-[#1A1008] border-[#E8DFD4] hover:bg-[#FAF3EA]"
                      }`}
                    >
                      {qty} Litre{qty > 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={modalLoading}
                  onClick={handleActionQuantity}
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs font-bold cursor-pointer transition-all shadow-xs disabled:opacity-50"
                >
                  {modalLoading ? "Sending..." : "Request New Quantity"}
                </button>
              </div>
            )}

            {activeModal === "FREQUENCY" && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-[#1A1008] block">
                  Choose Recurrence:
                </label>
                <div className="space-y-2">
                  {[
                    { val: "DAILY", label: "Daily (Every Morning)", sub: "Recommended for families" },
                    { val: "ALTERNATE_DAYS", label: "Alternate Days", sub: "Delivered every other morning" },
                    { val: "WEEKDAYS_ONLY", label: "Weekdays Only", sub: "Monday through Friday" },
                  ].map((freq) => (
                    <button
                      key={freq.val}
                      type="button"
                      onClick={() => setSelectedFrequency(freq.val)}
                      className={`w-full p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                        selectedFrequency === freq.val
                          ? "bg-[#FAF3EA] border-[#5C1B13] text-[#1A1008]"
                          : "bg-white border-[#E8DFD4] text-[#6B584C] hover:bg-[#FAF8F5]"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold">{freq.label}</p>
                        <p className="text-[11px] text-[#8C7A6B]">{freq.sub}</p>
                      </div>
                      {selectedFrequency === freq.val && (
                        <Check size={16} className="text-[#5C1B13]" />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={modalLoading}
                  onClick={handleActionFrequency}
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs font-bold cursor-pointer transition-all shadow-xs disabled:opacity-50"
                >
                  {modalLoading ? "Saving..." : "Confirm Frequency"}
                </button>
              </div>
            )}

            {activeModal === "SKIP" && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-[#1A1008] block">
                  Select Delivery Date to Skip:
                </label>
                <input
                  type="date"
                  value={skipDate}
                  min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                  onChange={(e) => setSkipDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C7B8] focus:border-[#5C1B13] text-xs font-semibold focus:outline-none"
                />
                <button
                  type="button"
                  disabled={modalLoading || !skipDate}
                  onClick={handleActionSkip}
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs font-bold cursor-pointer transition-all shadow-xs disabled:opacity-50"
                >
                  {modalLoading ? "Skipping..." : "Confirm Skip Delivery"}
                </button>
              </div>
            )}

            {activeModal === "PAUSE" && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-[#1A1008] block">
                  Resume Delivery Date (Optional):
                </label>
                <input
                  type="date"
                  value={pauseResumeDate}
                  min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                  onChange={(e) => setPauseResumeDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#D5C7B8] focus:border-[#5C1B13] text-xs font-semibold focus:outline-none"
                />
                <p className="text-[11px] text-[#8C7A6B]">
                  Leave empty if you wish to pause indefinitely until you unpause manually.
                </p>
                <button
                  type="button"
                  disabled={modalLoading}
                  onClick={handleActionPause}
                  className="w-full mt-2 py-2.5 rounded-xl bg-[#5C1B13] hover:bg-[#48150f] text-white text-xs font-bold cursor-pointer transition-all shadow-xs disabled:opacity-50"
                >
                  {modalLoading ? "Pausing..." : "Pause Deliveries"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function OrderSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PfCard padding="lg">
        <PfSkeleton height={14} width={120} />
        <PfSkeleton className="mt-3" height={36} width="60%" />
        <PfSkeleton className="mt-2" height={16} width="40%" />
        <PfSkeleton className="mt-6" height={160} />
      </PfCard>
    </div>
  );
}
