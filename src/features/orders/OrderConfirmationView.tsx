"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Package,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Milk,
  Receipt,
  Sparkles,
  Banknote,
  Wallet,
} from "lucide-react";
import { CustomerHeader } from "@/components/pf/layout/CustomerHeader";
import { PfBadge, PfButton, PfCard } from "@/components/pf";

export function OrderConfirmationView() {
  const searchParams = useSearchParams();
  const [orderData, setOrderData] = useState<{
    orderNumber: string;
    planName: string;
    amount: string;
    method: string;
    deliveryDate: string;
    addressText: string;
    receiverName: string;
    receiverMobile: string;
  }>({
    orderNumber: searchParams.get("orderNumber") || "ORD-PF-89210",
    planName: searchParams.get("plan") || "Purety Farm Milk Plan",
    amount: searchParams.get("amount") || "80.00",
    method: searchParams.get("method") || "CASH",
    deliveryDate: "Tomorrow Morning (6:00 AM – 8:00 AM)",
    addressText: "",
    receiverName: "",
    receiverMobile: "",
  });

  useEffect(() => {
    // Read cached order details if present in browser localStorage
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("pf_last_confirmed_order");
        if (raw) {
          const parsed = JSON.parse(raw);
          const addr = parsed.deliveryAddress;
          setOrderData((prev) => ({
            ...prev,
            orderNumber: parsed.orderNumber || prev.orderNumber,
            planName: parsed.planName || prev.planName,
            amount: parsed.totalAmount ? String(parsed.totalAmount) : prev.amount,
            method: parsed.paymentMethod || prev.method,
            addressText: addr
              ? `${addr.houseNumber || ""} ${addr.buildingName ? addr.buildingName + ", " : ""}${addr.street || addr.streetName || ""}, ${addr.locality || addr.area || ""}, ${addr.city || ""}`.trim()
              : prev.addressText,
            receiverName: addr?.fullName || prev.receiverName,
            receiverMobile: addr?.phone || addr?.mobile || prev.receiverMobile,
          }));
        }
      } catch {}
    }
  }, []);

  const isCash = orderData.method.toUpperCase() === "CASH";

  return (
    <>
      <CustomerHeader
        title="Order Confirmed"
        subtitle="Your farm-fresh A2 milk delivery is scheduled and on its way."
      />

      <div className="mx-auto max-w-3xl space-y-5">
        {/* Success Hero Banner */}
        <div className="relative overflow-hidden rounded-[24px] border border-[#cce3cf] bg-gradient-to-b from-[#f0f8f0] to-[#e4f3e5] p-6 text-center sm:p-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
            <CheckCircle2 className="h-9 w-9 stroke-[2.2]" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isCash ? "Cash on Delivery Placed" : "Payment Successful"}</span>
          </div>

          <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-bold text-[#1a1008]">
            {isCash ? "Order Placed Successfully!" : "Subscription Activated!"}
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm text-[#4a3b32] sm:text-[15px]">
            Thank you for choosing Purety Farm. Your fresh, unadulterated morning A2 cow milk will be bottled at 4°C and delivered silently to your door.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/80 px-4 py-2 text-xs font-semibold text-[#1a1008] backdrop-blur-sm border border-emerald-200">
            <span className="text-[#715e50]">Order ID:</span>
            <span className="font-mono font-bold text-[#5C1B13]">#{orderData.orderNumber}</span>
          </div>
        </div>

        {/* Order Breakdown & Schedule Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Plan Details Card */}
          <PfCard padding="md" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[var(--pf-border)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5C1B13]/10 text-[#5C1B13]">
                    <Milk className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--pf-text-muted)]">
                      Selected Plan
                    </h3>
                    <p className="font-bold text-[var(--pf-text)] text-sm sm:text-[15px]">
                      {orderData.planName}
                    </p>
                  </div>
                </div>
                <PfBadge tone="brand">Active</PfBadge>
              </div>

              <div className="mt-3.5 space-y-2 text-xs">
                <div className="flex justify-between text-[#715e50]">
                  <span>Milk Type</span>
                  <span className="font-semibold text-[#24130f]">100% Pure A2 Desi Cow Milk</span>
                </div>
                <div className="flex justify-between text-[#715e50]">
                  <span>Container</span>
                  <span className="font-semibold text-[#24130f]">Sterilized Eco-Glass Bottle</span>
                </div>
                <div className="flex justify-between text-[#715e50]">
                  <span>Payment Method</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#24130f]">
                    {isCash ? (
                      <>
                        <Banknote className="h-3.5 w-3.5 text-amber-600" />
                        <span>Cash on Delivery</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Wallet Payment</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--pf-border)] pt-3 text-sm">
              <span className="font-semibold text-[var(--pf-text)]">Total Amount</span>
              <span className="font-serif text-lg font-bold text-[#5C1B13]">
                ₹{Number(orderData.amount).toFixed(2)}
              </span>
            </div>
          </PfCard>

          {/* Delivery & Schedule Card */}
          <PfCard padding="md" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[var(--pf-border)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--pf-text-muted)]">
                      First Delivery
                    </h3>
                    <p className="font-bold text-[var(--pf-text)] text-sm sm:text-[15px]">
                      {orderData.deliveryDate}
                    </p>
                  </div>
                </div>
                <PfBadge tone="warning">6:00 AM – 8:00 AM</PfBadge>
              </div>

              <div className="mt-3.5 space-y-2 text-xs">
                <div className="flex items-start gap-2 text-[#715e50]">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#7a2417] mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#24130f]">
                      {orderData.receiverName ? `${orderData.receiverName} • ${orderData.receiverMobile}` : "Delivering to:"}
                    </p>
                    <p className="text-[11.5px] leading-relaxed text-[#715e50]">
                      {orderData.addressText || "Your saved home delivery address"}
                    </p>
                  </div>
                </div>

                {isCash && (
                  <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-[11px] text-amber-900 leading-snug">
                    💵 <strong>Cash Payment Note:</strong> Please keep ₹{Number(orderData.amount).toFixed(2)} cash handy for our delivery agent upon morning delivery.
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 border-t border-[var(--pf-border)] pt-3 text-[11px] text-[var(--pf-text-muted)]">
              Daily morning silent door-drop. No doorbell ringing before 7 AM unless requested.
            </div>
          </PfCard>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between pt-2">
          <Link
            href="/orders"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#5C1B13] px-6 text-sm font-bold text-white shadow-md shadow-[#5C1B13]/20 hover:bg-[#48150f] transition-all cursor-pointer"
          >
            <Receipt className="h-4 w-4" />
            <span>View My Orders</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/plan"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[#5C1B13] bg-white px-5 text-sm font-bold text-[#5C1B13] hover:bg-[#FAF8F5] transition-all cursor-pointer sm:flex-initial"
            >
              <Milk className="h-4 w-4" />
              <span>Milk Plan</span>
            </Link>

            <Link
              href="/account"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--pf-border)] bg-white px-5 text-sm font-bold text-[#24130f] hover:bg-[var(--pf-surface-soft)] transition-all cursor-pointer sm:flex-initial"
            >
              <span>Account</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
