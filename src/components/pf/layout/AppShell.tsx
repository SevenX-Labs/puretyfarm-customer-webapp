"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CustomerSidebar } from "./CustomerSidebar";
import { MobileNavigation } from "./MobileNavigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      const path = pathname || "/dashboard";
      if (
        !path.startsWith("/login") &&
        !path.startsWith("/auth") &&
        !path.startsWith("/payment/result")
      ) {
        router.replace(`/login?redirect=${encodeURIComponent(path)}`);
      }
      return;
    }

    if (status === "authenticated" && user) {
      const path = pathname || "";
      // Only profile_pending (missing name) and location_pending (missing address)
      // are essential onboarding steps that require redirecting to setup.
      // plan_pending or complete must NEVER hijack access to /dashboard, /orders, /wallet, etc.
      const isEssentialSetupPending =
        user.onboardingStep === "profile_pending" ||
        user.onboardingStep === "location_pending";

      if (
        isEssentialSetupPending &&
        !path.startsWith("/onboarding") &&
        !path.startsWith("/payment/result") &&
        !path.startsWith("/order-confirmation")
      ) {
        if (user.onboardingStep === "location_pending") {
          router.replace("/onboarding?step=2");
        } else {
          router.replace("/onboarding?step=1");
        }
      }
    }
  }, [status, user, pathname, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen pf-app flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--pf-brown)] border-t-transparent animate-spin" />
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--pf-text-muted)]">
            Loading
          </div>
        </div>
      </div>
    );
  }

  if (status !== "authenticated") {
    const path = pathname || "";
    if (path.startsWith("/payment/result")) {
      return (
        <div className="pf-app min-h-screen flex">
          <main className="flex-1 min-w-0 pb-[88px] md:pb-0">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 pt-6 md:pt-8 pb-10 pf-page-in">
              {children}
            </div>
          </main>
        </div>
      );
    }
    return null;
  }

  // Only block with redirect spinner if essential profile/address setup is missing
  const isEssentialSetupPending =
    user?.onboardingStep === "profile_pending" ||
    user?.onboardingStep === "location_pending";

  if (isEssentialSetupPending) {
    const path = pathname || "";
    if (
      !path.startsWith("/onboarding") &&
      !path.startsWith("/order-confirmation") &&
      !path.startsWith("/payment/result")
    ) {
      return (
        <div className="min-h-screen pf-app flex items-center justify-center bg-[#faf7f2]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[var(--pf-brown)] border-t-transparent animate-spin" />
            <div className="text-[12px] font-semibold text-[#715e50]">
              Completing initial setup...
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="pf-app min-h-screen flex">
      <CustomerSidebar />
      <main className="flex-1 min-w-0 pb-[88px] md:pb-0">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 pt-6 md:pt-8 pb-10 pf-page-in">
          {children}
        </div>
      </main>
      <MobileNavigation />
    </div>
  );
}
