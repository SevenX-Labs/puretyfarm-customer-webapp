"use client";

import React from "react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { useAccountData } from "../hooks/useAccountData";
import { ProfileTab } from "./ProfileTab";
import { OrdersTab } from "./OrdersTab";
import { AddressesTab } from "./AddressesTab";
import { SubscriptionTab } from "./SubscriptionTab";
import { AccountTab } from "../types";
import {
  FiUser,
  FiPackage,
  FiMapPin,
  FiCalendar,
  FiLogOut,
  FiArrowRight,
} from "react-icons/fi";

export function AccountView() {
  const {
    user,
    authLoading,
    logout,
    activeTab,
    setActiveTab,
    isEditingProfile,
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
  } = useAccountData();

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-9 h-9 rounded-full border-3 border-[#5C1B13] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#3A241C]/60 font-medium">Loading your PuretyFarm account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col selection:bg-[#5C1B13]/15 selection:text-[#5C1B13]">
      {/* ─── HEADER BAR ─── */}
      <header className="w-full py-4 px-4 sm:px-8 border-b border-[#E8DFD4] bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BrandLogo size="sm" priority />
            <div className="hidden sm:block h-5 w-px bg-[#E8DFD4]" />
            <span className="hidden sm:inline-block text-xs font-semibold text-[#3A241C]/80">
              Customer Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-[#E8DFD4] overflow-hidden bg-[#FAF3EA] flex items-center justify-center text-[10px] font-bold text-[#5C1B13]">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>
                    {(user.name || "PF")
                      .split(/\s+/)
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-xs text-[#3A241C]/80 font-medium hidden sm:inline">
                Namaste, <strong className="text-[#1A1008] font-bold">{user.name || "Member"}</strong>
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={logout}
              className="rounded-full px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5 border-[#E8DFD4] text-[#5C1B13] hover:bg-[#5C1B13]/8"
            >
              <FiLogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Welcome greeting card banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#FAF3EA] via-[#FFFDF7] to-[#FAF6F0] border border-[#E8DFD4] p-6 sm:p-8 mb-8 relative overflow-hidden shadow-xs">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5C1B13]/10 text-[#5C1B13] text-[11px] font-bold mb-2">
                <span>🥛</span>
                <span>Raipur Cold-Chain Customer</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A1008]">
                {user.name ? `Welcome back, ${user.name}` : "Welcome to Your Account"}
              </h1>
              <p className="text-xs sm:text-sm text-[#3A241C]/70 mt-1">
                Manage your daily morning deliveries, addresses, and farm milk subscription in Raipur.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handlePlaceSampleOrder("trial")}
                className="rounded-xl px-4 py-2.5 text-xs font-bold shadow-md shadow-[#5C1B13]/15 cursor-pointer"
              >
                <span>Start 7-Day Trial</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* ─── TABS NAVIGATION ─── */}
        <div className="flex items-center gap-2 border-b border-[#E8DFD4] pb-px overflow-x-auto scrollbar-none mb-8">
          {[
            { id: "profile", label: "Profile", icon: FiUser },
            { id: "orders", label: `Orders (${orders.length})`, icon: FiPackage },
            { id: "addresses", label: `Addresses (${addresses.length})`, icon: FiMapPin },
            { id: "subscription", label: "Milk Subscription", icon: FiCalendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AccountTab)}
                className={`
                  flex items-center gap-2 px-4 sm:px-5 py-3 rounded-t-2xl font-semibold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer
                  ${
                    isActive
                      ? "bg-white text-[#5C1B13] border-t-2 border-x border-[#E8DFD4] border-t-[#5C1B13] shadow-xs"
                      : "text-[#3A241C]/70 hover:text-[#1A1008] hover:bg-white/50"
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#5C1B13]" : "text-[#3A241C]/50"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── TAB CONTENT: PROFILE ─── */}
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

        {/* ─── TAB CONTENT: ORDERS ─── */}
        {activeTab === "orders" && (
          <OrdersTab
            orders={orders}
            ordersLoading={ordersLoading}
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
            onPlaceSampleOrder={handlePlaceSampleOrder}
          />
        )}

        {/* ─── TAB CONTENT: ADDRESSES ─── */}
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

        {/* ─── TAB CONTENT: SUBSCRIPTION / PLAN ─── */}
        {activeTab === "subscription" && (
          <SubscriptionTab
            subscription={subscription}
            subLoading={subLoading}
            subUpdating={subUpdating}
            onToggleSubPause={handleToggleSubPause}
            onActivatePlan={handleActivatePlan}
          />
        )}
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="py-4 text-center border-t border-[#E8DFD4] text-[11px] text-[#3A241C]/50 bg-white">
        © {new Date().getFullYear()} PuretyFarm. Milked at Dawn, Delivered Chilled Before 10 AM in Raipur.
      </footer>
    </div>
  );
}
