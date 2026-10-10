"use client";

import React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Order } from "@/types/models";
import { FiPackage, FiPlus, FiClock, FiMapPin, FiRefreshCw } from "react-icons/fi";
import { OrderDetailModal } from "./OrderDetailModal";

export interface OrdersTabProps {
  orders: Order[];
  ordersLoading: boolean;
  selectedOrder: Order | null;
  onSelectOrder: (order: Order | null) => void;
  onPlaceSampleOrder: (planType: "single" | "trial") => void;
  onReorder?: (orderId: string) => Promise<void>;
  onPayOrder?: (orderId: string) => Promise<void>;
  onGetInvoice?: (orderId: string) => Promise<any>;
  orderActionLoading?: boolean;
}

export function OrdersTab({
  orders,
  ordersLoading,
  selectedOrder,
  onSelectOrder,
  onPlaceSampleOrder,
  onReorder,
  onPayOrder,
  onGetInvoice,
  orderActionLoading = false,
}: OrdersTabProps) {
  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "COMPLETED":
      case "DELIVERED":
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "OUT_FOR_DELIVERY":
      case "Out for delivery":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "CONFIRMED":
      case "Confirmed":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "PROCESSING":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "CANCELLED":
      case "Cancelled":
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      case "PENDING":
      case "Placed":
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const formatStatusText = (status: string) => {
    if (!status) return "";
    switch (status) {
      case "OUT_FOR_DELIVERY":
        return "Out for Delivery";
      case "COMPLETED":
        return "Completed";
      case "SEVEN_DAY_TRIAL":
        return "7-Day Trial";
      case "BUY_ONCE":
        return "Buy Once";
      case "MONTHLY":
        return "Monthly";
      default:
        return status;
    }
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8DFD4]">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A1008]">
            Order History & Deliveries
          </h2>
          <p className="text-xs sm:text-sm text-[#6B584C] mt-0.5">
            Track your past and active farm milk deliveries in Raipur.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onPlaceSampleOrder("single")}
            className="rounded-xl px-4 py-2 text-xs font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <FiPlus className="w-3.5 h-3.5" />
            <span>Order Sample Bottle (₹85)</span>
          </Button>
        </div>
      </div>

      {ordersLoading ? (
        <div className="py-20 text-center">
          <div className="w-9 h-9 rounded-full border-3 border-[#5C1B13] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#1A1008] font-bold">Loading orders...</p>
          <p className="text-xs text-[#6B584C] mt-1">
            Fetching your delivery records
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E8DFD4] p-8 sm:p-10 text-center max-w-lg mx-auto shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF3EA] text-[#5C1B13] flex items-center justify-center mx-auto mb-4 border border-[#E8DFD4]/70">
            <FiPackage className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-serif font-bold text-[#1A1008] mb-1.5">
            No orders yet
          </h3>
          <p className="text-xs sm:text-sm text-[#6B584C] mb-5 max-w-sm mx-auto leading-relaxed">
            Experience pure A2 Gir cow milk delivered fresh to your doorstep
            before 10 AM in Raipur.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onPlaceSampleOrder("single")}
              className="rounded-xl px-5 py-2 text-xs font-bold w-full sm:w-auto bg-[#5C1B13] hover:bg-[#48150f] text-white shadow-sm"
            >
              <span>Order Sample Bottle (₹85)</span>
            </Button>
            <Link href="/#pricing">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-xl px-5 py-2 text-xs font-semibold w-full sm:w-auto border-[#E8DFD4] bg-white hover:bg-[#FAF6F0]"
              >
                <span>Explore Monthly Plans</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const addr = order.addressSnapshot || order.deliveryAddress;
            const addressString = addr
              ? [
                  addr.houseNumber,
                  addr.buildingName,
                  addr.streetName || addr.street,
                  addr.locality,
                  addr.city,
                ]
                  .filter(Boolean)
                  .join(", ")
              : "Raipur Delivery Address";

            const displayAmount =
              order.totalPaise !== undefined
                ? `₹${(order.totalPaise / 100).toFixed(0)}`
                : `₹${order.totalAmount || 0}`;

            // A completed order is a delivered order the admin has closed
            // out, so it keeps the same reorder affordance.
            const isDelivered =
              order.status === "DELIVERED" ||
              order.status === "Delivered" ||
              order.status === "COMPLETED";

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#E8DFD4] p-4.5 sm:p-5 shadow-2xs hover:border-[#5C1B13]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#1A1008] bg-[#FAF3EA] px-2.5 py-0.5 rounded-lg border border-[#E8DFD4]/70">
                      {order.orderNumber || order.id}
                    </span>
                    {order.planType && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF3EA] text-[#5C1B13] border border-[#E8DFD4]/70">
                        {formatStatusText(order.planType)}
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {formatStatusText(order.status)}
                    </span>
                    {order.paymentStatus && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    )}
                    <span className="text-xs text-[#6B584C] flex items-center gap-1 font-medium">
                      <FiClock className="w-3 h-3 text-[#8C603D]" />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </span>
                  </div>

                  <div className="text-sm text-[#1A1008] font-bold">
                    {order.items &&
                      order.items.map((item, idx) => (
                        <span key={item.id || idx}>
                          {item.productNameSnapshot || item.name || "A2 Milk"} ×{" "}
                          {item.quantity}
                          {idx < (order.items?.length || 1) - 1 ? ", " : ""}
                        </span>
                      ))}
                  </div>

                  <div className="text-xs text-[#6B584C] flex items-center gap-1.5">
                    <FiMapPin className="w-3.5 h-3.5 text-[#5C1B13] shrink-0" />
                    <span>{addressString}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-[#E8DFD4]">
                  <div className="text-lg font-bold font-mono text-[#5C1B13]">
                    {displayAmount}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isDelivered && onReorder && (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={orderActionLoading}
                        onClick={() => onReorder(order.id)}
                        className="rounded-xl px-3 py-1.5 text-xs font-semibold border-[#E8DFD4] bg-[#FFFDF7] hover:bg-[#FAF6F0] text-[#5C1B13] flex items-center gap-1"
                        title="Quick Reorder"
                      >
                        <FiRefreshCw className="w-3 h-3" />
                        <span>Reorder</span>
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onSelectOrder(order)}
                      className="rounded-xl px-3.5 py-1.5 text-xs font-bold border-[#E8DFD4] bg-white hover:bg-[#FAF6F0] text-[#1A1008]"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => onSelectOrder(null)}
        onReorder={onReorder}
        onPayOrder={onPayOrder}
        onGetInvoice={onGetInvoice}
        actionLoading={orderActionLoading}
      />
    </m.div>
  );
}
