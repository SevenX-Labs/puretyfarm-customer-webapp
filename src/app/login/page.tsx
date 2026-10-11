import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/ui/Navbar";
import { AuthView } from "@/features/auth";

export const metadata: Metadata = {
  title: "Sign In / Login | PuretyFarm",
  description:
    "Sign in to PuretyFarm to manage your daily fresh A2 Desi Gir cow milk subscription, pause delivery, or update details.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen min-h-[100dvh] w-full flex flex-1 flex-col bg-[#f3dfc0]">
      <Navbar variant="auth" />
      <Suspense
        fallback={
          <div className="min-h-screen min-h-[100dvh] bg-[#f3dfc0] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#5C1B13] border-t-transparent animate-spin" />
          </div>
        }
      >
        <AuthView />
      </Suspense>
    </div>
  );
}
