"use client";

import React from "react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Order } from "@/types/models";
import { FiX } from "react-icons/fi";

export interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  return (
    <AnimatePresence>
      {order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl border border-[#E8DFD4] shadow-2xl max-w-lg w-full p-6 sm:p-7 relative overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD4] mb-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#3A241C]/50 font-bold block">
                  Delivery Order
                </span>
                <h3 className="text-lg font-bold text-[#1A1008] font-mono">
                  {order.id}
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
              <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#3A241C]/60">Status:</span>
                  <span className="font-bold text-[#5C1B13]">{order.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#3A241C]/60">Date Placed:</span>
                  <span className="font-semibold text-[#1A1008]">
                    {new Date(order.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#3A241C]/60">Delivery Slot:</span>
                  <span className="font-semibold text-[#1A1008]">Before 10:00 AM (Cold Chain)</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#1A1008] uppercase tracking-wider text-[11px] mb-2">
                  Ordered Items
                </h4>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#FAF3EA]/40 border border-[#E8DFD4]/60"
                    >
                      <div>
                        <p className="font-bold text-[#1A1008]">{item.name}</p>
                        <p className="text-[11px] text-[#3A241C]/60">{item.unit}</p>
                      </div>
                      <span className="font-bold text-[#5C1B13]">₹{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#1A1008] uppercase tracking-wider text-[11px] mb-2">
                  Delivery Address
                </h4>
                <div className="p-3 rounded-xl bg-[#FAF3EA]/40 border border-[#E8DFD4]/60">
                  <p className="font-bold text-[#1A1008]">{order.deliveryAddress.fullName}</p>
                  <p className="text-[#3A241C]/70">
                    {order.deliveryAddress.street}, {order.deliveryAddress.locality}
                  </p>
                  <p className="text-[#3A241C]/70">
                    {order.deliveryAddress.city} — {order.deliveryAddress.pincode}
                  </p>
                  <p className="text-[#3A241C]/70 font-mono mt-1">📞 {order.deliveryAddress.phone}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8DFD4] flex items-center justify-between text-sm">
                <span className="font-bold text-[#1A1008]">Total Paid:</span>
                <span className="font-bold text-lg text-[#5C1B13]">₹{order.totalAmount}</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={onClose}
                className="rounded-xl py-2.5 text-xs font-bold"
              >
                Close Details
              </Button>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
