import { Suspense } from "react";
import type { Metadata } from "next";
import { AccountView } from "@/features/account";

export const metadata: Metadata = {
  title: "My Account | PuretyFarm",
  description:
    "Manage your daily fresh A2 Desi Gir cow milk subscription, pause delivery, view delivery schedule and addresses in Raipur.",
};

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#5C1B13] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AccountView />
    </Suspense>
  );
}
