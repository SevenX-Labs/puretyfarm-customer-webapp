"use client";

import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Order } from "@/types/models";
import { FiX, FiFileText, FiRefreshCw, FiCreditCard } from "react-icons/fi";

export interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onReorder?: (orderId: string) => Promise<void>;
  onPayOrder?: (orderId: string) => Promise<void>;
  onGetInvoice?: (orderId: string) => Promise<any>;
  actionLoading?: boolean;
}

export function OrderDetailModal({
  order,
  onClose,
  onReorder,
  onPayOrder,
  onGetInvoice,
  actionLoading = false,
}: OrderDetailModalProps) {
  const [invoiceDetails, setInvoiceDetails] = useState<any>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  if (!order) return null;

  const addr = order.addressSnapshot || order.deliveryAddress;
  const addressStreet = [
    addr?.houseNumber,
    addr?.buildingName,
    addr?.streetName || addr?.street,
  ]
    .filter(Boolean)
    .join(", ");

  const formatPlanType = (type?: string) => {
    if (!type) return null;
    switch (type) {
      case "BUY_ONCE":
        return "Buy Once";
      case "SEVEN_DAY_TRIAL":
        return "7-Day Trial";
      case "MONTHLY":
        return "Monthly Plan";
      default:
        return type;
    }
  };

  const isDelivered =
    order.status === "DELIVERED" || order.status === "Delivered";
  const isPendingPayment =
    order.status === "PENDING" && order.paymentStatus !== "PAID";

  const totalDisplay =
    order.totalPaise !== undefined
      ? `₹${(order.totalPaise / 100).toFixed(0)}`
      : `₹${order.totalAmount || 0}`;

  const handleFetchInvoice = async () => {
    if (!onGetInvoice) return;
    setLoadingInvoice(true);
    try {
      const inv = await onGetInvoice(order.id);
      if (inv) {
        setInvoiceDetails(inv);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInvoice(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl border border-[#E8DFD4] shadow-2xl max-w-lg w-full p-6 sm:p-7 relative overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD4] mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider text-[#3A241C]/50 font-bold block">
                  Delivery Order
                </span>
                {order.planType && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF3EA] text-[#5C1B13] border border-[#E8DFD4]">
                    {formatPlanType(order.planType)}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-[#1A1008] font-mono">
                {order.orderNumber || order.id}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#FAF3EA] flex items-center justify-center text-[#5C1B13] hover:bg-[#5C1B13] hover:text-white transition-colors cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Order Status & Delivery Info */}
            <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#3A241C]/60">Status:</span>
                <span className="font-bold text-[#5C1B13]">{order.status}</span>
              </div>
              {order.paymentStatus && (
                <div className="flex justify-between items-center">
                  <span className="text-[#3A241C]/60">Payment Status:</span>
                  <span
                    className={`font-bold ${
                      order.paymentStatus === "PAID"
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-[#3A241C]/60">Date Placed:</span>
                <span className="font-semibold text-[#1A1008]">
                  {new Date(order.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#3A241C]/60">Delivery Window:</span>
                <span className="font-semibold text-[#1A1008]">
                  {order.deliveryStartTime && order.deliveryEndTime
                    ? `${order.deliveryStartTime} - ${order.deliveryEndTime} (Cold Chain)`
                    : "Before 10:00 AM (Cold Chain)"}
                </span>
              </div>
              {order.deliveryDate && (
                <div className="flex justify-between items-center">
                  <span className="text-[#3A241C]/60">Scheduled Date:</span>
                  <span className="font-semibold text-[#1A1008]">
                    {new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              {order.invoice && (
                <div className="flex justify-between items-center pt-1 border-t border-[#E8DFD4]/50">
                  <span className="text-[#3A241C]/60">Invoice No:</span>
                  <span className="font-mono font-bold text-[#5C1B13]">
                    {order.invoice.invoiceNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Ordered Items */}
            <div>
              <h4 className="font-bold text-[#1A1008] uppercase tracking-wider text-[11px] mb-2">
                Ordered Items
              </h4>
              <div className="space-y-2">
                {order.items &&
                  order.items.map((item, idx) => {
                    const itemName =
                      item.productNameSnapshot ||
                      item.name ||
                      "Pure A2 Gir Cow Milk";
                    const itemPrice =
                      item.unitPricePaise !== undefined
                        ? `₹${(item.unitPricePaise / 100).toFixed(0)}`
                        : `₹${item.price || 85}`;
                    const itemUnit =
                      item.unit ||
                      (item.quantity === 1
                        ? "1 Litre Glass Bottle"
                        : `${item.quantity} Litres`);

                    return (
                      <div
                        key={item.id || idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#FAF3EA]/40 border border-[#E8DFD4]/60"
                      >
                        <div>
                          <p className="font-bold text-[#1A1008]">
                            {itemName} × {item.quantity}
                          </p>
                          <p className="text-[11px] text-[#3A241C]/60">
                            {itemUnit}
                          </p>
                        </div>
                        <span className="font-bold text-[#5C1B13]">
                          {itemPrice}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Delivery Address */}
            {addr && (
              <div>
                <h4 className="font-bold text-[#1A1008] uppercase tracking-wider text-[11px] mb-2">
                  Delivery Address
                </h4>
                <div className="p-3 rounded-xl bg-[#FAF3EA]/40 border border-[#E8DFD4]/60">
                  <p className="font-bold text-[#1A1008]">{addr.fullName}</p>
                  <p className="text-[#3A241C]/70">
                    {addressStreet}
                    {addr.locality ? `, ${addr.locality}` : ""}
                  </p>
                  <p className="text-[#3A241C]/70">
                    {addr.city || "Raipur"}
                    {addr.pincode ? ` — ${addr.pincode}` : ""}
                  </p>
                  {(addr.phone || addr.mobile) && (
                    <p className="text-[#3A241C]/70 font-mono mt-1">
                      📞 {addr.phone || addr.mobile}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Financial Summary */}
            <div className="p-3.5 rounded-2xl bg-[#FAF3EA]/30 border border-[#E8DFD4] space-y-1.5">
              {order.subtotalPaise !== undefined && (
                <div className="flex justify-between items-center text-[#3A241C]/70">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    ₹{(order.subtotalPaise / 100).toFixed(0)}
                  </span>
                </div>
              )}
              {order.deliveryFeePaise !== undefined && (
                <div className="flex justify-between items-center text-[#3A241C]/70">
                  <span>Delivery Fee</span>
                  <span className="font-medium">
                    {order.deliveryFeePaise === 0
                      ? "FREE"
                      : `₹${(order.deliveryFeePaise / 100).toFixed(0)}`}
                  </span>
                </div>
              )}
              {!!order.discountPaise && order.discountPaise > 0 && (
                <div className="flex justify-between items-center text-emerald-700 font-medium">
                  <span>Discount</span>
                  <span>-₹{(order.discountPaise / 100).toFixed(0)}</span>
                </div>
              )}
              {!!order.taxPaise && order.taxPaise > 0 && (
                <div className="flex justify-between items-center text-[#3A241C]/70">
                  <span>Taxes</span>
                  <span className="font-medium">
                    ₹{(order.taxPaise / 100).toFixed(0)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-[#E8DFD4] flex items-center justify-between text-sm">
                <span className="font-bold text-[#1A1008]">Total Amount:</span>
                <span className="font-bold text-lg text-[#5C1B13]">
                  {totalDisplay}
                </span>
              </div>
            </div>

            {/* Invoice Detail Viewer if loaded */}
            {invoiceDetails && (
              <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#5C1B13]/20 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-[#5C1B13]">
                  <span className="flex items-center gap-1.5">
                    <FiFileText className="w-3.5 h-3.5" />
                    Tax Invoice ({invoiceDetails.invoiceNumber})
                  </span>
                  <span className="text-[10px] text-[#6B584C]">
                    Issued:{" "}
                    {new Date(invoiceDetails.issuedAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <p className="text-[11px] text-[#6B584C]">
                  Official tax document for order #{invoiceDetails.orderNumber}.
                  Immutable snapshot verified.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-5 space-y-2">
            {/* Pay with Wallet for Pending Orders */}
            {isPendingPayment && onPayOrder && (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                disabled={actionLoading}
                onClick={() => onPayOrder(order.id)}
                className="rounded-xl py-2.5 text-xs font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white flex items-center justify-center gap-2 shadow-sm"
              >
                <FiCreditCard className="w-3.5 h-3.5" />
                <span>
                  {actionLoading ? "Processing..." : `Pay Now with Wallet (${totalDisplay})`}
                </span>
              </Button>
            )}

            {/* Reorder Button for Delivered Orders */}
            {isDelivered && onReorder && (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                disabled={actionLoading}
                onClick={() => onReorder(order.id)}
                className="rounded-xl py-2.5 text-xs font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white flex items-center justify-center gap-2 shadow-sm"
              >
                <FiRefreshCw
                  className={`w-3.5 h-3.5 ${actionLoading ? "animate-spin" : ""}`}
                />
                <span>{actionLoading ? "Reordering..." : "Reorder Again"}</span>
              </Button>
            )}

            {/* Invoice Button */}
            {!invoiceDetails && (order.invoice || onGetInvoice) && (
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                disabled={loadingInvoice}
                onClick={handleFetchInvoice}
                className="rounded-xl py-2 text-xs font-semibold border-[#E8DFD4] bg-[#FFFDF7] hover:bg-[#FAF6F0] text-[#1A1008] flex items-center justify-center gap-1.5"
              >
                <FiFileText className="w-3.5 h-3.5 text-[#5C1B13]" />
                <span>
                  {loadingInvoice
                    ? "Loading Invoice..."
                    : `View Invoice ${order.invoice?.invoiceNumber ? `(${order.invoice.invoiceNumber})` : ""}`}
                </span>
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              fullWidth
              onClick={onClose}
              className="rounded-xl py-2 text-xs font-bold border-[#E8DFD4] bg-white hover:bg-[#FAF6F0] text-[#1A1008]"
            >
              Close Details
            </Button>
          </div>
        </m.div>
      </div>
    </AnimatePresence>
  );
}
