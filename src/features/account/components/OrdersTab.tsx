"use client";

import React from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Order } from "@/types/models";
import { FiPackage, FiPlus, FiClock, FiMapPin } from "react-icons/fi";
import { OrderDetailModal } from "./OrderDetailModal";

export interface OrdersTabProps {
  orders: Order[];
  ordersLoading: boolean;
  selectedOrder: Order | null;
  onSelectOrder: (order: Order | null) => void;
  onPlaceSampleOrder: (planType: "single" | "trial") => void;
}

export function OrdersTab({
  orders,
  ordersLoading,
  selectedOrder,
  onSelectOrder,
  onPlaceSampleOrder,
}: OrdersTabProps) {
  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Out for delivery":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Confirmed":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "Placed":
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8DFD4]">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1008]">Order History & Deliveries</h2>
          <p className="text-sm sm:text-base text-[#6B584C] mt-1">Track your past and active farm milk deliveries in Raipur.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <Button
            variant="primary"
            size="md"
            onClick={() => onPlaceSampleOrder("single")}
            className="rounded-2xl px-6 py-3 text-xs sm:text-sm font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span>Order Sample Bottle (₹85)</span>
          </Button>
        </div>
      </div>

      {ordersLoading ? (
        <div className="py-24 text-center">
          <div className="w-10 h-10 rounded-full border-3 border-[#5C1B13] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-base text-[#1A1008] font-bold">Loading orders...</p>
          <p className="text-xs sm:text-sm text-[#6B584C] mt-1">Fetching your delivery records</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#E8DFD4] p-10 sm:p-14 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#FAF3EA] text-[#5C1B13] flex items-center justify-center mx-auto mb-4 border border-[#E8DFD4]/70">
            <FiPackage className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-[#1A1008] mb-2">No orders yet</h3>
          <p className="text-sm text-[#6B584C] mb-6 max-w-md mx-auto leading-relaxed">
            Experience pure A2 Gir cow milk delivered fresh to your doorstep before 10 AM in Raipur.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => onPlaceSampleOrder("single")}
              className="rounded-2xl px-6 py-3 text-xs sm:text-sm font-bold w-full sm:w-auto bg-[#5C1B13] hover:bg-[#48150f] text-white shadow-sm"
            >
              <span>Order Sample Bottle (₹85)</span>
            </Button>
            <Link href="/#pricing">
              <Button
                variant="secondary"
                size="md"
                className="rounded-2xl px-6 py-3 text-xs sm:text-sm font-semibold w-full sm:w-auto border-[#E8DFD4] bg-white hover:bg-[#FAF6F0]"
              >
                <span>Explore Monthly Plans</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-[26px] sm:rounded-[30px] border border-[#E8DFD4] p-6 sm:p-7 shadow-xs hover:border-[#5C1B13]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-xs sm:text-sm font-bold text-[#1A1008] bg-[#FAF3EA] px-3 py-1 rounded-lg border border-[#E8DFD4]/70">
                    {order.id}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <span className="text-xs text-[#6B584C] flex items-center gap-1.5 font-medium">
                    <FiClock className="w-3.5 h-3.5 text-[#8C603D]" />
                    <span>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                </div>

                <div className="text-sm sm:text-base text-[#1A1008] font-bold">
                  {order.items.map((item, idx) => (
                    <span key={item.id || idx}>
                      {item.name} × {item.quantity}
                      {idx < order.items.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </div>

                <div className="text-xs sm:text-sm text-[#6B584C] flex items-center gap-2">
                  <FiMapPin className="w-4 h-4 text-[#5C1B13] shrink-0" />
                  <span>
                    {order.deliveryAddress.street}, {order.deliveryAddress.locality},{" "}
                    {order.deliveryAddress.city}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#E8DFD4]">
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-[#5C1B13]">
                  ₹{order.totalAmount}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onSelectOrder(order)}
                  className="rounded-xl px-4 py-2 text-xs sm:text-sm font-bold border-[#E8DFD4] bg-white hover:bg-[#FAF6F0] text-[#1A1008]"
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal order={selectedOrder} onClose={() => onSelectOrder(null)} />
    </m.div>
  );
}
