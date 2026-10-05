import { Suspense } from "react";
import type { Metadata } from "next";
import { OnboardingView } from "@/features/onboarding";

export const metadata: Metadata = {
  title: "Get Started | PuretyFarm Onboarding",
  description:
    "Complete your profile, verify delivery serviceability in Raipur, and select your fresh morning A2 Gir cow milk subscription plan.",
};

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#5C1B13] border-t-transparent animate-spin" />
        </div>
      }
    >
      <OnboardingView />
    </Suspense>
  );
}
