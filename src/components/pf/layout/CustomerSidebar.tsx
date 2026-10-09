"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Receipt,
  Milk,
  ShoppingBag,
  Truck,
  User,
  CircleHelp,
  LogOut,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LogoutConfirmDialog } from "../LogoutConfirmDialog";

const NAV = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Orders", href: "/orders", icon: Receipt },
  { label: "Milk Plan", href: "/plan", icon: Milk },
  { label: "Wallet", href: "/wallet", icon: Wallet },
  { label: "Products", href: "/products", icon: ShoppingBag },
  { label: "Account", href: "/account", icon: User },
] as const;

export function CustomerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const firstName =
    user?.name?.split(" ")[0] || (user?.mobile ? `Customer` : "Customer");

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.replace("/");
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  return (
    <>
      <aside
        className="hidden md:flex md:w-[248px] shrink-0 flex-col bg-[var(--pf-surface)] border-r border-[var(--pf-border)] sticky top-0 h-screen"
        aria-label="Primary"
      >
        {/* Logo */}
        <div className="px-6 pt-6 pb-7">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--pf-brown)] flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.webp"
                alt="PuretyFarm"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-bold text-[var(--pf-text)]">PuretyFarm</div>
              <div className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[var(--pf-text-muted)]">
                Pure A2 Milk
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 h-11 px-3.5 rounded-[10px] text-[14px] font-semibold transition-colors ${
                      active
                        ? "bg-[var(--pf-yellow-soft)] text-[var(--pf-text)]"
                        : "text-[var(--pf-text-secondary)] hover:bg-[var(--pf-surface-soft)] hover:text-[var(--pf-text)]"
                    }`}
                  >
                    <Icon
                      size={18}
                      strokeWidth={active ? 2.1 : 1.75}
                      className={active ? "text-[var(--pf-brown)]" : ""}
                      aria-hidden
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 pt-5 border-t border-[var(--pf-border)]">
            <Link
              href="/faq"
              className="flex items-center gap-3 h-11 px-3.5 rounded-[10px] text-[14px] font-semibold text-[var(--pf-text-secondary)] hover:bg-[var(--pf-surface-soft)] hover:text-[var(--pf-text)]"
            >
              <CircleHelp size={18} strokeWidth={1.75} aria-hidden />
              <span>Help & Support</span>
            </Link>
          </div>
        </nav>

        {/* Profile mini-card */}
        <div className="p-3">
          <div className="flex items-center gap-3 p-3 rounded-[14px] bg-[var(--pf-surface-soft)] border border-[var(--pf-border)]">
            <div className="w-9 h-9 rounded-full bg-[var(--pf-brown)] text-white flex items-center justify-center text-[13px] font-bold overflow-hidden">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                firstName.charAt(0).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-[var(--pf-text)] truncate">
                {firstName}
              </div>
              <div className="text-[11px] text-[var(--pf-text-muted)] font-medium">
                Customer
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowLogoutDialog(true)}
              aria-label="Sign out"
              className="pf-focus-ring w-8 h-8 rounded-full flex items-center justify-center text-[var(--pf-text-secondary)] hover:text-[var(--pf-brown)] hover:bg-[var(--pf-surface)] cursor-pointer"
            >
              <LogOut size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </aside>

      {/* Confirmation Dialog */}
      <LogoutConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
}
