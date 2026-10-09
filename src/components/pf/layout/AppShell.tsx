"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CustomerSidebar } from "./CustomerSidebar";
import { MobileNavigation } from "./MobileNavigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      const path =
        typeof window !== "undefined" ? window.location.pathname : "/dashboard";
      if (!path.startsWith("/auth")) {
        router.replace(`/auth?redirect=${encodeURIComponent(path)}`);
      }
    }
  }, [status, router]);

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

  if (status !== "authenticated") return null;

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
