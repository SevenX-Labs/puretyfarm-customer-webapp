import Link from "next/link";
import { Receipt, Milk, Wallet, ShoppingBag, type LucideIcon } from "lucide-react";

const ACTIONS: { label: string; sub: string; href: string; icon: LucideIcon }[] = [
  { label: "Orders", sub: "History & invoices", href: "/orders", icon: Receipt },
  { label: "Plan", sub: "Change or pause", href: "/plan", icon: Milk },
  { label: "Wallet", sub: "Balance & top-up", href: "/wallet", icon: Wallet },
  { label: "Products", sub: "Explore the farm", href: "/products", icon: ShoppingBag },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {ACTIONS.map(({ label, sub, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="group pf-focus-ring flex items-center gap-3 p-4 rounded-[14px] bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-border-strong)] transition-colors"
        >
          <span className="w-10 h-10 rounded-[10px] bg-[var(--pf-surface-soft)] flex items-center justify-center shrink-0 group-hover:bg-[var(--pf-yellow-soft)] transition-colors">
            <Icon size={18} strokeWidth={1.75} className="text-[var(--pf-brown)]" />
          </span>
          <div className="min-w-0">
            <div className="text-[14px] font-bold text-[var(--pf-text)] leading-tight">
              {label}
            </div>
            <div className="text-[12px] text-[var(--pf-text-muted)] truncate">{sub}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}
