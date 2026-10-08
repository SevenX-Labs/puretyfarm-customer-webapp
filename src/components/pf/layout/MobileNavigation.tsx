"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, Milk, Truck, User } from "lucide-react";

const NAV = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Orders", href: "/orders", icon: Receipt },
  { label: "Plan", href: "/plan", icon: Milk },
  { label: "Delivery", href: "/delivery", icon: Truck },
  { label: "Account", href: "/account", icon: User },
] as const;

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--pf-surface)] border-t border-[var(--pf-border)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <ul className="grid grid-cols-5">
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
                className="flex flex-col items-center justify-center gap-1 h-[64px]"
              >
                <Icon
                  size={20}
                  strokeWidth={active ? 2.1 : 1.75}
                  className={
                    active ? "text-[var(--pf-brown)]" : "text-[var(--pf-text-muted)]"
                  }
                  aria-hidden
                />
                <span
                  className={`text-[10px] font-semibold ${
                    active ? "text-[var(--pf-text)]" : "text-[var(--pf-text-muted)]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
