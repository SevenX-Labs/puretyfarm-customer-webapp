"use client";

import React, { Suspense } from "react";
import { CustomerHeader } from "@/components/pf/layout/CustomerHeader";
import { PaymentResultView } from "@/features/payments/components/PaymentResultView";

export default function PaymentResultPage() {
  return (
    <div className="space-y-6">
      <CustomerHeader
        title="Payment Verification"
        subtitle="Real-time PayU gateway transaction status and wallet ledger updates."
      />

      <Suspense
        fallback={
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#5C1B13] border-t-transparent animate-spin" />
          </div>
        }
      >
        <PaymentResultView />
      </Suspense>
    </div>
  );
}
