"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function OrdersRedirectPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/account?tab=orders");
      } else {
        router.replace("/auth?redirect=/account?tab=orders");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
      <div className="text-center p-8 rounded-3xl bg-white/70 border border-[#E8DFD4] shadow-sm max-w-xs w-full mx-4">
        <div className="w-9 h-9 rounded-full border-3 border-[#5C1B13] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#1A1008] font-bold">Loading your deliveries...</p>
        <p className="text-xs text-[#6B584C] mt-1">Connecting to PuretyFarm Raipur</p>
      </div>
    </div>
  );
}
