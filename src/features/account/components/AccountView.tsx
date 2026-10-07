"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { useAccountData } from "../hooks/useAccountData";
import { ProfileTab } from "./ProfileTab";
import { OrdersTab } from "./OrdersTab";
import { AddressesTab } from "./AddressesTab";
import { SubscriptionTab } from "./SubscriptionTab";
import { WalletTab } from "./WalletTab";
import { SubscriptionPanel } from "@/features/subscription";
import { AccountTab } from "../types";
import {
  FiUser,
  FiPackage,
  FiMapPin,
  FiCalendar,
  FiLogOut,
  FiShield,
  FiArrowRight,
  FiMenu,
  FiX,
  FiChevronDown,
} from "react-icons/fi";
import { LuWallet } from "react-icons/lu";

export function AccountView() {
  const {
    user,
    authLoading,
    logout,
    activeTab,
    setActiveTab,
    isEditingProfile,
    setIsEditingProfile,
    profileName,
    setProfileName,
    profileEmail,
    setProfileEmail,
    profileAvatar,
    setProfileAvatar,
    profileSaving,
    profileMsg,
    setProfileMsg,
    handleStartEditProfile,
    handleSaveProfile,
    orders,
    ordersLoading,
    selectedOrder,
    setSelectedOrder,
    handlePlaceSampleOrder,
    addresses,
    addressesLoading,
    showAddressModal,
    setShowAddressModal,
    editingAddress,
    addressForm,
    setAddressForm,
    addressSaving,
    handleOpenAddAddress,
    handleOpenEditAddress,
    handleSaveAddress,
    handleDeleteAddress,
    handleSetDefaultAddress,
    subscription,
    subLoading,
    subUpdating,
    handleToggleSubPause,
    handleActivatePlan,
    customPlan,
    handleApplyCustomSchedule,
    walletBalance,
    walletLoading,
    walletRecharging,
    walletSuccessMsg,
    handleRechargeWallet,
  } = useAccountData();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSubPanelOpen, setIsSubPanelOpen] = useState(false);

  useEffect(() => {
    setIsSubPanelOpen(false);
  }, [activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
        <div className="text-center p-8 rounded-3xl bg-white/80 border border-[#E8DFD4] shadow-sm max-w-xs w-full mx-4">
          <div className="w-10 h-10 rounded-full border-3 border-[#5C1B13] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#1A1008] font-bold">Loading pure farm goodness...</p>
          <p className="text-xs text-[#6B584C] mt-1">Retrieving your PuretyFarm account</p>
        </div>
      </div>
    );
  }

  const initials = (user.name || "MU")
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const tabs = [
    { id: "profile" as AccountTab, label: "Profile", icon: FiUser },
    { id: "orders" as AccountTab, label: `Orders (${orders.length})`, icon: FiPackage },
    { id: "addresses" as AccountTab, label: `Addresses (${addresses.length})`, icon: FiMapPin },
    { id: "subscription" as AccountTab, label: "Milk Subscription", icon: FiCalendar },
    { id: "wallet" as AccountTab, label: `Wallet (₹${walletBalance.toFixed(0)})`, icon: LuWallet },
  ];

  return (
    <div
      className="min-h-screen w-full max-w-full overflow-x-hidden relative flex flex-col bg-cover bg-center bg-no-repeat bg-fixed selection:bg-[#5C1B13]/15 selection:text-[#5C1B13]"
      style={{
        backgroundImage: "url('/account-bg.png')",
      }}
    >
      {/* ─── FLOATING TOP NAVBAR ─── */}
      <header className="sticky top-3 sm:top-5 z-40 w-full px-3 sm:px-6 lg:px-8 pointer-events-none transition-all duration-300">
        <div
          className={`pointer-events-auto max-w-7xl mx-auto rounded-full transition-all duration-300 ${
            isScrolled
              ? "bg-white/95 shadow-[0_14px_40px_rgba(74,46,27,0.12)] border border-[#E5DACD] py-2 px-3.5 sm:px-6 scale-[0.995]"
              : "bg-white/90 shadow-[0_10px_32px_rgba(74,46,27,0.08)] border border-[#E8DFD4] py-2.5 sm:py-3 px-4 sm:px-7"
          } backdrop-blur-xl flex items-center justify-between gap-3 sm:gap-4`}
        >
          {/* Left: Hamburger (mobile) + Logo + Divider + Customer Portal */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full text-[#3A241C] hover:bg-[#5C1B13]/5 transition-colors cursor-pointer md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX className="w-5 h-5 text-[#5C1B13]" /> : <FiMenu className="w-5 h-5" />}
            </button>

            <BrandLogo size="sm" priority className="hover:opacity-90 transition-opacity" />

            <span className="hidden sm:inline-block h-4 w-px bg-[#E8DFD4]" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF3EA] border border-[#E8DFD4] text-xs font-semibold text-[#5C1B13]">
                Customer Portal
              </span>
              <Link
                href="/"
                className="hidden lg:inline-flex items-center text-xs font-semibold text-[#3A241C]/80 hover:text-[#5C1B13] px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors"
              >
                Farm Home
              </Link>
            </div>
          </div>

          {/* Right: Wallet pill + Namaste user greeting + Log Out button */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Quick Wallet Pill */}
            <button
              type="button"
              onClick={() => setActiveTab("wallet")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                activeTab === "wallet"
                  ? "bg-[#5C1B13] text-white border-[#5C1B13]"
                  : "bg-[#FAF3EA] text-[#5C1B13] border-[#E8DFD4] hover:bg-[#F3E7D8]"
              }`}
              title="Open PuretyFarm Wallet"
            >
              <LuWallet className="w-3.5 h-3.5" />
              <span>₹{walletBalance.toFixed(0)}</span>
            </button>

            <div className="flex items-center gap-2 bg-transparent pl-1 pr-1.5 py-0.5 select-none">
              <div className="w-8 h-8 rounded-full border border-[#E8DFD4] overflow-hidden bg-[#FAF3EA] flex items-center justify-center text-xs font-serif font-bold text-[#5C1B13] shrink-0 shadow-2xs">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <span className="text-xs sm:text-sm text-[#3A241C] font-normal hidden sm:inline flex items-center gap-1">
                <span>Namaste,</span>
                <strong className="text-[#1A1008] font-bold">{user.name || "Customer"}</strong>
              </span>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={logout}
              className="rounded-full px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5 border-[#E8DFD4] bg-white text-[#1A1008] hover:bg-[#FAF6F0] hover:text-[#5C1B13] transition-all shadow-2xs cursor-pointer"
            >
              <FiLogOut className="w-3.5 h-3.5 text-[#5C1B13]" />
              <span className="hidden sm:inline">Log Out</span>
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Card */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <m.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto max-w-7xl mx-auto mt-2 p-4 rounded-3xl bg-white/95 backdrop-blur-xl border border-[#E8DFD4] shadow-[0_16px_40px_rgba(74,46,27,0.12)] space-y-3 md:hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD4]/70 px-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#FAF3EA] border border-[#E8DFD4] flex items-center justify-center text-xs font-serif font-bold text-[#5C1B13]">
                    {initials}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1A1008]">{user.name || "Customer"}</p>
                    <p className="text-[10px] text-[#6B584C] font-mono">{user.phone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-[#6B584C] hover:bg-black/5"
                  aria-label="Close menu"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-2xl bg-[#FAF6F0] text-xs font-semibold text-[#1A1008] hover:bg-[#FAF3EA] transition-colors text-center"
                >
                  Home
                </Link>
                <Link
                  href="/#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-2xl bg-[#FAF6F0] text-xs font-semibold text-[#1A1008] hover:bg-[#FAF3EA] transition-colors text-center"
                >
                  Pricing
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("wallet");
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-2xl bg-[#FAF3EA] text-xs font-bold text-[#5C1B13] hover:bg-[#F3E7D8] transition-colors text-center flex items-center justify-center gap-1 cursor-pointer"
                >
                  <LuWallet className="w-3.5 h-3.5 text-[#5C1B13]" />
                  <span>₹{walletBalance.toFixed(0)}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full py-2.5 rounded-2xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiLogOut className="w-3.5 h-3.5" />
                <span>Log Out of Account</span>
              </button>
            </m.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 z-10 transition-all duration-300 overflow-x-hidden">
        {/* Welcome Section */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
          <div className="max-w-2xl">
            {/* Raipur Cold-Chain Customer Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3EA]/90 border border-[#E8DFD4] text-[#5C1B13] text-xs font-semibold shadow-2xs backdrop-blur-xs">
              <FiShield className="w-3.5 h-3.5 text-[#5C1B13]" />
              <span>Raipur Cold-Chain Customer</span>
            </div>

            {/* Main Greeting */}
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1A1008] tracking-tight leading-tight mt-2.5">
              Welcome back, {user.name || "Customer"}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-[#3A241C]/85 mt-2 font-medium max-w-xl">
              Manage your daily morning deliveries, addresses, and farm milk subscription in Raipur.
            </p>
          </div>

          {/* Right Action: Start 7-Day Trial */}
          <div className="self-start lg:self-auto shrink-0 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab("subscription")}
              className="rounded-full px-5 py-2.5 text-xs sm:text-sm font-bold bg-[#5C1B13] hover:bg-[#48150f] text-white flex items-center gap-2 shadow-md shadow-[#5C1B13]/15 transition-all cursor-pointer"
            >
              <span>Start 7-Day Trial</span>
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── TABS NAVIGATION ─── */}
        <div className="w-full max-w-full flex items-center gap-2 overflow-x-auto scrollbar-none py-1 mb-5 transition-all duration-300 ease-out">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm transition-all cursor-pointer select-none whitespace-nowrap relative
                  ${
                    isActive
                      ? "bg-white text-[#1A1008] font-bold border border-[#E8DFD4] shadow-sm"
                      : "text-[#3A241C]/80 hover:text-[#1A1008] hover:bg-white/50 font-semibold backdrop-blur-2xs"
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#5C1B13]" : "text-[#5C1B13]/80"}`} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-1.5 left-4 right-4 h-0.5 bg-[#5C1B13] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* ─── TAB CONTENT (Side-by-side on subscription when customize is open) ─── */}
        {activeTab === "subscription" ? (
          <div className="flex flex-col lg:flex-row items-start gap-6 w-full mb-12">
            {/* Main Milk Subscription Card */}
            <div className="flex-1 min-w-0 w-full bg-white/95 backdrop-blur-md rounded-[32px] border border-[#E8DFD4] p-5 sm:p-8 shadow-[0_16px_44px_rgba(74,46,27,0.07)] transition-all duration-300">
              <SubscriptionTab
                subscription={subscription}
                subLoading={subLoading}
                subUpdating={subUpdating}
                onToggleSubPause={handleToggleSubPause}
                onActivatePlan={handleActivatePlan}
                customPlan={customPlan}
                onConfirmPlan={handleApplyCustomSchedule}
                isPanelOpen={isSubPanelOpen}
                onOpenPanel={() => setIsSubPanelOpen(true)}
                onClosePanel={() => setIsSubPanelOpen(false)}
              />
            </div>

            {/* Customize Milk Subscription Card - directly on the right side of milk subscription card, designed SAME AS MAIN CARD */}
            <AnimatePresence>
              {isSubPanelOpen && (
                <m.div
                  initial={{ opacity: 0, x: 20, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="w-full lg:w-[450px] xl:w-[470px] shrink-0 bg-white/95 backdrop-blur-md rounded-[32px] border border-[#E8DFD4] p-5 sm:p-7 shadow-[0_16px_44px_rgba(74,46,27,0.07)] relative"
                >
                  <SubscriptionPanel
                    isOpen={isSubPanelOpen}
                    onClose={() => setIsSubPanelOpen(false)}
                    onConfirmPlan={handleApplyCustomSchedule}
                    inline={true}
                    title="Customize Milk Subscription"
                  />
                </m.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-[32px] border border-[#E8DFD4] p-5 sm:p-8 shadow-[0_16px_44px_rgba(74,46,27,0.07)] mb-12">
            {activeTab === "profile" && (
              <ProfileTab
                user={user}
                isEditingProfile={isEditingProfile}
                profileName={profileName}
                profileEmail={profileEmail}
                profileAvatar={profileAvatar}
                profileSaving={profileSaving}
                profileMsg={profileMsg}
                onStartEdit={handleStartEditProfile}
                onCancelEdit={() => {
                  setIsEditingProfile(false);
                  setProfileName(user.name || "");
                  setProfileEmail(user.email || "");
                  setProfileAvatar(user.avatarUrl || "");
                }}
                onNameChange={setProfileName}
                onEmailChange={setProfileEmail}
                onAvatarChange={setProfileAvatar}
                onProfileError={(msg) => setProfileMsg({ type: "error", text: msg })}
                onSaveProfile={handleSaveProfile}
              />
            )}

            {activeTab === "orders" && (
              <OrdersTab
                orders={orders}
                ordersLoading={ordersLoading}
                selectedOrder={selectedOrder}
                onSelectOrder={setSelectedOrder}
                onPlaceSampleOrder={handlePlaceSampleOrder}
              />
            )}

            {activeTab === "addresses" && (
              <AddressesTab
                addresses={addresses}
                addressesLoading={addressesLoading}
                showAddressModal={showAddressModal}
                editingAddress={editingAddress}
                addressForm={addressForm}
                addressSaving={addressSaving}
                onOpenAddAddress={handleOpenAddAddress}
                onOpenEditAddress={handleOpenEditAddress}
                onCloseModal={() => setShowAddressModal(false)}
                onChangeForm={setAddressForm}
                onSaveAddress={handleSaveAddress}
                onDeleteAddress={handleDeleteAddress}
                onSetDefaultAddress={handleSetDefaultAddress}
              />
            )}

            {activeTab === "wallet" && (
              <WalletTab
                user={user}
                walletBalance={walletBalance}
                walletLoading={walletLoading}
                walletRecharging={walletRecharging}
                walletSuccessMsg={walletSuccessMsg}
                onRecharge={handleRechargeWallet}
              />
            )}
          </div>
        )}
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="py-5 text-center border-t border-[#E8DFD4]/70 text-xs text-[#3A241C]/70 bg-white/70 backdrop-blur-md mt-auto z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} PuretyFarm. Milked at Dawn, Delivered Chilled Before 10 AM in Raipur.</span>
          <span className="text-[11px] text-[#3A241C]/60 font-medium">Safe &amp; Encrypted Account Portal</span>
        </div>
      </footer>
    </div>
  );
}