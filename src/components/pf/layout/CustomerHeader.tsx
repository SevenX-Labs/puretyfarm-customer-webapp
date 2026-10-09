"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, MapPin, ChevronDown, LogOut, Settings, User as UserIcon, CircleHelp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { LogoutConfirmDialog } from "../LogoutConfirmDialog";

function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function CustomerHeader({
  title,
  subtitle,
  location,
}: {
  title?: string;
  subtitle?: string;
  location?: string;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const firstName = user?.name?.split(" ")[0] || "there";
  const [open, setOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const headingTitle = title ?? `${greeting()}, ${firstName}`;
  const headingSubtitle =
    subtitle ?? "Here's what's happening with your PuretyFarm delivery.";

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

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
      <header className="flex items-start sm:items-center justify-between gap-4 pb-6 sm:pb-8 flex-col sm:flex-row">
        <div className="min-w-0">
          <h1 className="text-[26px] sm:text-[32px] md:text-[36px] font-bold text-[var(--pf-text)] leading-[1.1] tracking-tight">
            {headingTitle}
          </h1>
          <p className="mt-1.5 text-[14px] sm:text-[15px] text-[var(--pf-text-secondary)]">
            {headingSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {location && (
            <div className="hidden sm:flex items-center gap-1.5 h-10 px-3.5 rounded-full bg-[var(--pf-surface)] border border-[var(--pf-border)] text-[12px] font-semibold text-[var(--pf-text-secondary)]">
              <MapPin size={14} strokeWidth={1.75} className="text-[var(--pf-brown)]" />
              <span className="truncate max-w-[160px]">{location}</span>
            </div>
          )}

          <button
            type="button"
            aria-label="Notifications"
            className="pf-focus-ring w-10 h-10 rounded-full bg-[var(--pf-surface)] border border-[var(--pf-border)] flex items-center justify-center text-[var(--pf-text-secondary)] hover:text-[var(--pf-brown)] cursor-pointer"
          >
            <Bell size={16} strokeWidth={1.75} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              className="pf-focus-ring inline-flex items-center gap-2 h-10 pl-1 pr-2.5 rounded-full bg-[var(--pf-surface)] border border-[var(--pf-border)] cursor-pointer"
            >
              <span className="w-8 h-8 rounded-full bg-[var(--pf-brown)] text-white flex items-center justify-center text-[12px] font-bold overflow-hidden">
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  firstName.charAt(0).toUpperCase()
                )}
              </span>
              <ChevronDown size={14} strokeWidth={1.75} className="text-[var(--pf-text-secondary)]" />
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 rounded-[14px] bg-white border border-[var(--pf-border)] shadow-[var(--pf-shadow-lg)] overflow-hidden z-30 pf-page-in"
              >
                <div className="px-4 py-3 border-b border-[var(--pf-border)]">
                  <div className="text-[13px] font-bold text-[var(--pf-text)] truncate">
                    {user?.name || "Customer"}
                  </div>
                  {user?.email && (
                    <div className="text-[12px] text-[var(--pf-text-muted)] truncate">
                      {user.email}
                    </div>
                  )}
                </div>
                <MenuItem href="/account" icon={<UserIcon size={15} strokeWidth={1.75} />}>
                  Account
                </MenuItem>
                <MenuItem
                  href="/account-settings?tab=preferences"
                  icon={<Settings size={15} strokeWidth={1.75} />}
                >
                  Settings
                </MenuItem>
                <MenuItem href="/faq" icon={<CircleHelp size={15} strokeWidth={1.75} />}>
                  Help
                </MenuItem>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    setShowLogoutDialog(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-[var(--pf-error)] hover:bg-[var(--pf-error-bg)] cursor-pointer"
                >
                  <LogOut size={15} strokeWidth={1.75} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <LogoutConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
}

function MenuItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-[var(--pf-text)] hover:bg-[var(--pf-surface-soft)]"
    >
      <span className="text-[var(--pf-text-secondary)]">{icon}</span>
      {children}
    </Link>
  );
}
