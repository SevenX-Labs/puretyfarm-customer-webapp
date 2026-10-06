"use client";

import React, { Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FiHome, FiPackage, FiUser } from "react-icons/fi";
import { LuWallet } from "react-icons/lu";

interface NavItem {
  id: "home" | "order" | "wallets" | "account";
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "home",
    label: "Home",
    path: "/",
    icon: FiHome,
    requiresAuth: false,
  },
  {
    id: "order",
    label: "Order",
    path: "/account?tab=orders",
    icon: FiPackage,
    requiresAuth: true,
  },
  {
    id: "wallets",
    label: "Wallets",
    path: "/wallet",
    icon: LuWallet,
    requiresAuth: true,
  },
  {
    id: "account",
    label: "Account",
    path: "/account",
    icon: FiUser,
    requiresAuth: true,
  },
];

function BottomNavbarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoggedIn, loading } = useAuth();

  const handleNavClick = (item: NavItem) => {
    // 1. If public route (Home)
    if (!item.requiresAuth) {
      if (pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        router.push(item.path);
      }
      return;
    }

    // 2. Check if user is logged in
    if (!isLoggedIn && !loading) {
      // If not logged in, redirect to login/signup page with target redirect query
      router.push(`/auth?redirect=${encodeURIComponent(item.path)}`);
      return;
    }

    // 3. If logged in, auto redirect to respective page
    router.push(item.path);
  };

  // Determine active state
  const isItemActive = (item: NavItem) => {
    if (item.id === "home") {
      return pathname === "/";
    }
    if (item.id === "order") {
      return (
        pathname === "/orders" ||
        (pathname === "/account" && searchParams.get("tab") === "orders")
      );
    }
    if (item.id === "wallets") {
      return pathname === "/wallet";
    }
    if (item.id === "account") {
      return (
        pathname === "/account" &&
        searchParams.get("tab") !== "orders"
      );
    }
    return false;
  };

  return (
    <nav
      data-testid="bottom-navbar"
      aria-label="Bottom Navigation"
      className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-sm sm:max-w-md pb-[max(0.25rem,env(safe-area-inset-bottom))]"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-full sm:rounded-3xl border border-[#E8DFD4] shadow-[0_12px_40px_rgba(92,27,19,0.12)] p-1.5 sm:p-2">
        <div className="grid grid-cols-4 items-center">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item)}
                className={`
                  relative flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all cursor-pointer select-none group
                  ${active ? "text-[#5C1B13]" : "text-[#8C7A6B] hover:text-[#1A1008]"}
                `}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
              >
                {/* Active Pill Background Highlight */}
                {active && (
                  <span className="absolute inset-x-2 inset-y-1 bg-[#FAF3EA] rounded-xl -z-10" />
                )}

                <Icon
                  className={`
                    w-5 h-5 transition-transform duration-200
                    ${active ? "scale-110 text-[#5C1B13]" : "group-hover:scale-105"}
                  `}
                />

                <span
                  className={`
                    text-[11px] mt-1 tracking-tight leading-none
                    ${active ? "font-bold text-[#5C1B13]" : "font-medium"}
                  `}
                >
                  {item.label}
                </span>

                {/* Active Indicator Dot */}
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5C1B13] mt-1 shrink-0 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function BottomNavbar() {
  return (
    <Suspense fallback={null}>
      <BottomNavbarContent />
    </Suspense>
  );
}
