"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { Address, Order, Subscription } from "@/types/models";
import { AvatarUpload } from "@/components/ui/AvatarUpload";
import {
  FiUser,
  FiPackage,
  FiMapPin,
  FiCalendar,
  FiLogOut,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiX,
  FiArrowRight,
  FiShield,
  FiPause,
  FiPlay,
  FiMail,
} from "react-icons/fi";

type AccountTab = "profile" | "orders" | "addresses" | "subscription";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<AccountTab>("profile");

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Addresses State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    locality: "",
    landmark: "",
    city: "Raipur",
    pincode: "492001",
    isDefault: false,
  });
  const [addressSaving, setAddressSaving] = useState(false);

  // Subscription State
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [subUpdating, setSubUpdating] = useState(false);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth?redirect=/account");
    }
  }, [user, authLoading, router]);

  const handleStartEditProfile = () => {
    setProfileName(user?.name || "");
    setProfileEmail(user?.email || "");
    setProfileAvatar(user?.avatarUrl || "");
    setIsEditingProfile(true);
  };

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders || []);
        }
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Fetch Addresses
  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAddresses(data.addresses || []);
        }
      }
    } catch (err) {
      console.error("Failed to load addresses:", err);
    } finally {
      setAddressesLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const loadAll = async () => {
      try {
        const [ordersRes, addressesRes, subRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/addresses"),
          fetch("/api/subscription"),
        ]);
        if (!ignore && ordersRes.ok) {
          const o = await ordersRes.json();
          if (o.success) setOrders(o.orders || []);
        }
        if (!ignore && addressesRes.ok) {
          const a = await addressesRes.json();
          if (a.success) setAddresses(a.addresses || []);
        }
        if (!ignore && subRes.ok) {
          const s = await subRes.json();
          if (s.success) setSubscription(s.subscription);
        }
      } catch (err) {
        console.error("Failed to load account data:", err);
      } finally {
        if (!ignore) {
          setOrdersLoading(false);
          setAddressesLoading(false);
          setSubLoading(false);
        }
      }
    };

    if (user) {
      loadAll();
    }
    return () => {
      ignore = true;
    };
  }, [user]);

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setProfileMsg({ type: "error", text: "Name cannot be empty." });
      return;
    }

    setProfileSaving(true);
    setProfileMsg(null);

    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName.trim(),
          email: profileEmail.trim(),
          avatarUrl: profileAvatar,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setProfileMsg({ type: "error", text: data.error || "Failed to update profile." });
      } else {
        await refreshUser();
        setIsEditingProfile(false);
        setProfileMsg({ type: "success", text: "Profile updated successfully!" });
        setTimeout(() => setProfileMsg(null), 3500);
      }
    } catch {
      setProfileMsg({ type: "error", text: "Network error saving profile." });
    } finally {
      setProfileSaving(false);
    }
  };

  // Open Address Modal
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: user?.name || "",
      phone: user?.phone?.replace("+91", "") || "",
      street: "",
      locality: "",
      landmark: "",
      city: "Raipur",
      pincode: "492001",
      isDefault: addresses.length === 0,
    });
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      fullName: addr.fullName,
      phone: addr.phone.replace("+91", ""),
      street: addr.street,
      locality: addr.locality,
      landmark: addr.landmark || "",
      city: addr.city,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setShowAddressModal(true);
  };

  // Save Address
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);

    try {
      const url = editingAddress ? `/api/addresses/${editingAddress.id}` : "/api/addresses";
      const method = editingAddress ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await fetchAddresses();
        setShowAddressModal(false);
      } else {
        alert(data.error || "Failed to save address.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving address. Please try again.");
    } finally {
      setAddressSaving(false);
    }
  };

  // Delete Address
  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchAddresses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Set Default Address
  const handleSetDefaultAddress = async (addr: Address) => {
    try {
      const res = await fetch(`/api/addresses/${addr.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        await fetchAddresses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Place Quick Sample Order (Order Single Bottle ₹85 or 7-Day Trial)
  const handlePlaceSampleOrder = async (planType: "single" | "trial" = "single") => {
    // If no address saved yet, prompt user to add address first
    if (addresses.length === 0) {
      setActiveTab("addresses");
      handleOpenAddAddress();
      alert("Please add a delivery address in Raipur first so we can deliver your milk bottle.");
      return;
    }

    const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];

    const orderPayload =
      planType === "single"
        ? {
            items: [
              {
                id: "item_single_1l",
                name: "1 Litre Pure A2 Gir Cow Milk (Chilled Glass Bottle)",
                quantity: 1,
                price: 85,
                unit: "1L Bottle",
              },
            ],
            totalAmount: 85,
            deliveryAddress: {
              fullName: defaultAddr.fullName,
              phone: defaultAddr.phone,
              street: defaultAddr.street,
              locality: defaultAddr.locality,
              city: defaultAddr.city,
              pincode: defaultAddr.pincode,
            },
            status: "Placed",
          }
        : {
            items: [
              {
                id: "item_trial_7d",
                name: "7-Day Starter Trial Plan (1L Daily Morning Delivery)",
                quantity: 7,
                price: 525,
                unit: "7 Litres",
              },
            ],
            totalAmount: 525,
            deliveryAddress: {
              fullName: defaultAddr.fullName,
              phone: defaultAddr.phone,
              street: defaultAddr.street,
              locality: defaultAddr.locality,
              city: defaultAddr.city,
              pincode: defaultAddr.pincode,
            },
            status: "Placed",
          };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await fetchOrders();
        setActiveTab("orders");
        setSelectedOrder(data.order);
      } else {
        alert(data.error || "Failed to place order.");
      }
    } catch (err) {
      console.error(err);
      alert("Error placing order. Please try again.");
    }
  };

  // Toggle Subscription Pause/Resume
  const handleToggleSubPause = async () => {
    if (!subscription) return;
    const targetStatus = subscription.status === "paused" ? "active" : "paused";

    setSubUpdating(true);
    try {
      const res = await fetch("/api/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubUpdating(false);
    }
  };

  // Activate Plan
  const handleActivatePlan = async (planId: "trial" | "monthly" | "single") => {
    setSubUpdating(true);
    const planDetails = {
      trial: { name: "7-Day Trial Plan", price: 525, dailyQuantity: "1L Daily for 7 Days" },
      monthly: { name: "Monthly Subscription", price: 2250, dailyQuantity: "1L Daily (30L / mo)" },
      single: { name: "Buy Once (1 Litre)", price: 85, dailyQuantity: "Single Bottle Order" },
    }[planId];

    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          planName: planDetails.name,
          price: planDetails.price,
          dailyQuantity: planDetails.dailyQuantity,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubUpdating(false);
    }
  };

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
          <m.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl bg-white rounded-3xl border border-[#E8DFD4] p-6 sm:p-8 shadow-xs"
          >
            <div className="flex items-center justify-between pb-5 border-b border-[#E8DFD4] mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#1A1008]">Personal Information</h2>
                <p className="text-xs text-[#3A241C]/65 mt-0.5">Your verified PuretyFarm customer profile.</p>
              </div>
              {!isEditingProfile && (
                <button
                  onClick={handleStartEditProfile}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5C1B13] hover:text-[#40110D] bg-[#5C1B13]/8 hover:bg-[#5C1B13]/12 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <FiEdit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {profileMsg && (
              <div
                className={`mb-5 p-3 rounded-2xl text-xs flex items-center gap-2 ${
                  profileMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {profileMsg.type === "success" ? (
                  <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                ) : (
                  <FiAlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span>{profileMsg.text}</span>
              </div>
            )}

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Avatar Uploader with Square Crop */}
                <div className="pb-4 border-b border-[#E8DFD4]">
                  <AvatarUpload
                    initialUrl={profileAvatar}
                    name={profileName || user.name}
                    onUploaded={(url) => setProfileAvatar(url)}
                    onError={(msg) => setProfileMsg({ type: "error", text: msg })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
                    Phone Number (Verified)
                  </label>
                  <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#FBF6EE] border border-[#E8DFD4] text-xs font-mono font-semibold text-[#1A1008]">
                    <span>{user.phone}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Verified ✓
                    </span>
                  </div>
                  <p className="text-[11px] text-[#3A241C]/50 mt-1">Phone number is locked to your account.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <div className="flex items-center rounded-2xl border border-[#E8DFD4] focus-within:border-[#5C1B13] bg-[#FFFDF7] px-3.5 py-2.5">
                    <FiUser className="w-4 h-4 text-[#3A241C]/40 mr-2.5" />
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-[#1A1008] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1A1008] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="flex items-center rounded-2xl border border-[#E8DFD4] focus-within:border-[#5C1B13] bg-[#FFFDF7] px-3.5 py-2.5">
                    <FiMail className="w-4 h-4 text-[#3A241C]/40 mr-2.5" />
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="e.g. yourname@domain.com"
                      className="w-full bg-transparent text-sm font-medium text-[#1A1008] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={profileSaving}
                    className="rounded-xl px-5 py-2.5 text-xs font-bold"
                  >
                    {profileSaving ? "Saving Changes..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileName(user.name || "");
                      setProfileEmail(user.email || "");
                      setProfileAvatar(user.avatarUrl || "");
                    }}
                    className="rounded-xl px-5 py-2.5 text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Profile Avatar Card */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]">
                  <div className="w-16 h-16 rounded-full border border-[#E8DFD4] overflow-hidden bg-gradient-to-br from-[#FAF3EA] to-[#F3E7D7] flex items-center justify-center shrink-0">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatarUrl}
                        alt={user.name || "User Avatar"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-serif font-bold text-[#5C1B13]">
                        {(user.name || "PF")
                          .split(/\s+/)
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#1A1008]">{user.name || "Purety Member"}</h3>
                    <p className="text-xs text-[#3A241C]/65">Farm Fresh Milk Subscriber</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]">
                  <div>
                    <span className="text-[11px] font-bold text-[#3A241C]/50 uppercase tracking-wider block">
                      Mobile Number
                    </span>
                    <span className="text-sm font-bold text-[#1A1008] mt-0.5 block font-mono">
                      {user.phone}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <FiCheckCircle className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]">
                  <span className="text-[11px] font-bold text-[#3A241C]/50 uppercase tracking-wider block">
                    Full Name
                  </span>
                  <span className="text-sm font-bold text-[#1A1008] mt-0.5 block">
                    {user.name || "Not provided"}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]">
                  <span className="text-[11px] font-bold text-[#3A241C]/50 uppercase tracking-wider block">
                    Email Address
                  </span>
                  <span className="text-sm font-semibold text-[#1A1008] mt-0.5 block">
                    {user.email || "Not specified (used for delivery receipts)"}
                  </span>
                </div>
              </div>
            )}
          </m.div>
        )}

        {/* ─── TAB CONTENT: ORDERS ─── */}
        {activeTab === "orders" && (
          <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#1A1008]">Order History & Deliveries</h2>
                <p className="text-xs text-[#3A241C]/65">Track your past and active farm milk deliveries.</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handlePlaceSampleOrder("single")}
                  className="rounded-xl px-4 py-2 text-xs font-bold"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                  <span>Order Sample Bottle (₹85)</span>
                </Button>
              </div>
            </div>

            {ordersLoading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#5C1B13] border-t-transparent animate-spin mx-auto mb-2" />
                <p className="text-xs text-[#3A241C]/60">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E8DFD4] p-10 sm:p-14 text-center max-w-xl mx-auto shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF3EA] text-[#5C1B13] flex items-center justify-center mx-auto mb-4">
                  <FiPackage className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1008] mb-1.5">No orders yet</h3>
                <p className="text-xs text-[#3A241C]/70 mb-6 max-w-sm mx-auto">
                  Experience pure A2 Gir cow milk delivered fresh to your doorstep before 10 AM in Raipur.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handlePlaceSampleOrder("single")}
                    className="rounded-xl px-5 py-2.5 text-xs font-bold w-full sm:w-auto"
                  >
                    <span>Order Sample Bottle (₹85)</span>
                  </Button>
                  <Link href="/#pricing">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-xl px-5 py-2.5 text-xs font-semibold w-full sm:w-auto"
                    >
                      <span>Explore Monthly Plans</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const getStatusBadge = (status: Order["status"]) => {
                    switch (status) {
                      case "Delivered":
                        return "bg-emerald-100 text-emerald-800 border-emerald-200";
                      case "Out for delivery":
                        return "bg-purple-100 text-purple-800 border-purple-200";
                      case "Confirmed":
                        return "bg-amber-100 text-amber-800 border-amber-200";
                      case "Cancelled":
                        return "bg-red-100 text-red-800 border-red-200";
                      case "Placed":
                      default:
                        return "bg-blue-100 text-blue-800 border-blue-200";
                    }
                  };

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-3xl border border-[#E8DFD4] p-5 sm:p-6 shadow-xs hover:border-[#5C1B13]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono text-xs font-bold text-[#1A1008]">
                            {order.id}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                          <span className="text-[11px] text-[#3A241C]/50 flex items-center gap-1">
                            <FiClock className="w-3 h-3" />
                            <span>{new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}</span>
                          </span>
                        </div>

                        <div className="text-xs text-[#1A1008] font-semibold">
                          {order.items.map((item, idx) => (
                            <span key={item.id || idx}>
                              {item.name} × {item.quantity}
                              {idx < order.items.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </div>

                        <div className="text-[11px] text-[#3A241C]/60 flex items-center gap-1.5">
                          <FiMapPin className="w-3.5 h-3.5 text-[#5C1B13]" />
                          <span>
                            {order.deliveryAddress.street}, {order.deliveryAddress.locality}, {order.deliveryAddress.city}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:flex-col md:items-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#E8DFD4]">
                        <div className="text-base font-bold text-[#5C1B13]">
                          ₹{order.totalAmount}
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-xl px-3.5 py-1.5 text-xs font-semibold"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Order Detail Modal */}
            <AnimatePresence>
              {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
                  <m.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl border border-[#E8DFD4] shadow-2xl max-w-lg w-full p-6 sm:p-7 relative overflow-hidden max-h-[90vh] overflow-y-auto"
                  >
                    <div className="flex items-center justify-between pb-4 border-b border-[#E8DFD4] mb-4">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-[#3A241C]/50 font-bold block">
                          Delivery Order
                        </span>
                        <h3 className="text-lg font-bold text-[#1A1008] font-mono">
                          {selectedOrder.id}
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="w-8 h-8 rounded-full bg-[#FAF3EA] flex items-center justify-center text-[#5C1B13] hover:bg-[#5C1B13] hover:text-white transition-colors cursor-pointer"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4] space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[#3A241C]/60">Status:</span>
                          <span className="font-bold text-[#5C1B13]">{selectedOrder.status}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#3A241C]/60">Date Placed:</span>
                          <span className="font-semibold text-[#1A1008]">
                            {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#3A241C]/60">Delivery Slot:</span>
                          <span className="font-semibold text-[#1A1008]">Before 10:00 AM (Cold Chain)</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-[#1A1008] uppercase tracking-wider text-[11px] mb-2">
                          Ordered Items
                        </h4>
                        <div className="space-y-2">
                          {selectedOrder.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-xl bg-[#FAF3EA]/40 border border-[#E8DFD4]/60"
                            >
                              <div>
                                <p className="font-bold text-[#1A1008]">{item.name}</p>
                                <p className="text-[11px] text-[#3A241C]/60">{item.unit}</p>
                              </div>
                              <span className="font-bold text-[#5C1B13]">₹{item.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-[#1A1008] uppercase tracking-wider text-[11px] mb-2">
                          Delivery Address
                        </h4>
                        <div className="p-3 rounded-xl bg-[#FAF3EA]/40 border border-[#E8DFD4]/60">
                          <p className="font-bold text-[#1A1008]">{selectedOrder.deliveryAddress.fullName}</p>
                          <p className="text-[#3A241C]/70">
                            {selectedOrder.deliveryAddress.street}, {selectedOrder.deliveryAddress.locality}
                          </p>
                          <p className="text-[#3A241C]/70">
                            {selectedOrder.deliveryAddress.city} — {selectedOrder.deliveryAddress.pincode}
                          </p>
                          <p className="text-[#3A241C]/70 font-mono mt-1">📞 {selectedOrder.deliveryAddress.phone}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#E8DFD4] flex items-center justify-between text-sm">
                        <span className="font-bold text-[#1A1008]">Total Paid:</span>
                        <span className="font-bold text-lg text-[#5C1B13]">₹{selectedOrder.totalAmount}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => setSelectedOrder(null)}
                        className="rounded-xl py-2.5 text-xs font-bold"
                      >
                        Close Details
                      </Button>
                    </div>
                  </m.div>
                </div>
              )}
            </AnimatePresence>
          </m.div>
        )}

        {/* ─── TAB CONTENT: ADDRESSES ─── */}
        {activeTab === "addresses" && (
          <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#1A1008]">Delivery Addresses</h2>
                <p className="text-xs text-[#3A241C]/65">
                  Addresses across Raipur where our daily morning chilled milk is delivered.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenAddAddress}
                className="rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Address</span>
              </Button>
            </div>

            {addressesLoading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#5C1B13] border-t-transparent animate-spin mx-auto mb-2" />
                <p className="text-xs text-[#3A241C]/60">Loading addresses...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E8DFD4] p-10 text-center max-w-md mx-auto shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF3EA] text-[#5C1B13] flex items-center justify-center mx-auto mb-3">
                  <FiMapPin className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#1A1008] mb-1">No delivery address saved</h3>
                <p className="text-xs text-[#3A241C]/70 mb-5">
                  Add your home or apartment address in Raipur for daily morning deliveries.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleOpenAddAddress}
                  className="rounded-xl px-5 py-2.5 text-xs font-bold"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add First Address</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all relative flex flex-col justify-between ${
                      addr.isDefault
                        ? "border-[#5C1B13] shadow-md shadow-[#5C1B13]/5"
                        : "border-[#E8DFD4] hover:border-[#5C1B13]/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm text-[#1A1008] flex items-center gap-2">
                          <FiMapPin className="w-4 h-4 text-[#5C1B13]" />
                          <span>{addr.fullName}</span>
                        </span>
                        {addr.isDefault ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Default Address ✓
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr)}
                            className="text-[11px] font-semibold text-[#5C1B13] hover:underline cursor-pointer"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>

                      <div className="text-xs text-[#3A241C]/80 space-y-0.5 mb-4 pl-6">
                        <p className="font-medium text-[#1A1008]">{addr.street}</p>
                        <p>{addr.locality}{addr.landmark ? `, Near ${addr.landmark}` : ""}</p>
                        <p>{addr.city} — {addr.pincode}</p>
                        <p className="text-[#3A241C]/60 pt-1 font-mono">📞 {addr.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DFD4]/70">
                      <button
                        type="button"
                        onClick={() => handleOpenEditAddress(addr)}
                        className="p-2 rounded-xl text-[#3A241C]/70 hover:text-[#5C1B13] hover:bg-[#FAF3EA] transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Address Modal */}
            <AnimatePresence>
              {showAddressModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
                  <m.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl border border-[#E8DFD4] shadow-2xl max-w-md w-full p-6 sm:p-7 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#E8DFD4] mb-4">
                      <h3 className="text-base font-bold text-[#1A1008]">
                        {editingAddress ? "Edit Delivery Address" : "Add Delivery Address"}
                      </h3>
                      <button
                        onClick={() => setShowAddressModal(false)}
                        className="w-7 h-7 rounded-full bg-[#FAF3EA] flex items-center justify-center text-[#5C1B13] hover:bg-[#5C1B13] hover:text-white transition-colors cursor-pointer"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveAddress} className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-[#1A1008] uppercase mb-1">
                            Contact Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.fullName}
                            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full px-3 py-2 rounded-xl border border-[#E8DFD4] text-xs font-semibold text-[#1A1008] focus:border-[#5C1B13] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#1A1008] uppercase mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                            placeholder="10-digit mobile"
                            className="w-full px-3 py-2 rounded-xl border border-[#E8DFD4] text-xs font-semibold text-[#1A1008] focus:border-[#5C1B13] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#1A1008] uppercase mb-1">
                          House / Flat / Building / Street *
                        </label>
                        <input
                          type="text"
                          required
                          value={addressForm.street}
                          onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                          placeholder="e.g. Flat 402, Royal Palms, Shankar Nagar"
                          className="w-full px-3 py-2 rounded-xl border border-[#E8DFD4] text-xs font-semibold text-[#1A1008] focus:border-[#5C1B13] focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-[#1A1008] uppercase mb-1">
                            Locality in Raipur *
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.locality}
                            onChange={(e) => setAddressForm({ ...addressForm, locality: e.target.value })}
                            placeholder="e.g. Shankar Nagar, VIP Rd"
                            className="w-full px-3 py-2 rounded-xl border border-[#E8DFD4] text-xs font-semibold text-[#1A1008] focus:border-[#5C1B13] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#1A1008] uppercase mb-1">
                            Pincode *
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.pincode}
                            onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                            placeholder="492001"
                            className="w-full px-3 py-2 rounded-xl border border-[#E8DFD4] text-xs font-semibold text-[#1A1008] focus:border-[#5C1B13] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#1A1008] uppercase mb-1">
                          Landmark (Optional)
                        </label>
                        <input
                          type="text"
                          value={addressForm.landmark}
                          onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                          placeholder="e.g. Near City Center Mall"
                          className="w-full px-3 py-2 rounded-xl border border-[#E8DFD4] text-xs font-medium text-[#1A1008] focus:border-[#5C1B13] focus:outline-none"
                        />
                      </div>

                      <div className="pt-1">
                        <label className="flex items-center gap-2 text-xs font-semibold text-[#1A1008] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            className="rounded text-[#5C1B13] focus:ring-[#5C1B13]"
                          />
                          <span>Set as default morning delivery address</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-2 pt-3">
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          fullWidth
                          disabled={addressSaving}
                          className="rounded-xl py-2.5 text-xs font-bold"
                        >
                          {addressSaving ? "Saving Address..." : "Save Address"}
                        </Button>
                      </div>
                    </form>
                  </m.div>
                </div>
              )}
            </AnimatePresence>
          </m.div>
        )}

        {/* ─── TAB CONTENT: SUBSCRIPTION / PLAN ─── */}
        {activeTab === "subscription" && (
          <m.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[#1A1008]">Daily Milk Plan & Vacation Mode</h2>
              <p className="text-xs text-[#3A241C]/65">
                Delivered fresh every morning before 10:00 AM across Raipur in sanitized glass bottles.
              </p>
            </div>

            {subLoading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#5C1B13] border-t-transparent animate-spin mx-auto mb-2" />
                <p className="text-xs text-[#3A241C]/60">Checking your subscription status...</p>
              </div>
            ) : subscription ? (
              <div className="bg-white rounded-3xl border border-[#E8DFD4] p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8DFD4] gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-xl font-bold text-[#1A1008]">{subscription.planName}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          subscription.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {subscription.status === "active" ? "Active Daily Delivery" : "Paused (Vacation Mode)"}
                      </span>
                    </div>
                    <p className="text-xs text-[#3A241C]/70">
                      Rate: <strong className="text-[#5C1B13]">₹{subscription.price}</strong> • {subscription.dailyQuantity}
                    </p>
                  </div>

                  {/* Vacation Pause / Resume Control */}
                  <Button
                    variant={subscription.status === "active" ? "secondary" : "primary"}
                    size="sm"
                    disabled={subUpdating}
                    onClick={handleToggleSubPause}
                    className="rounded-2xl px-5 py-2.5 text-xs font-bold flex items-center gap-2"
                  >
                    {subscription.status === "active" ? (
                      <>
                        <FiPause className="w-3.5 h-3.5" />
                        <span>Pause Delivery (Vacation)</span>
                      </>
                    ) : (
                      <>
                        <FiPlay className="w-3.5 h-3.5" />
                        <span>Resume Morning Delivery</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                  <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]">
                    <span className="text-[11px] font-bold text-[#3A241C]/50 uppercase tracking-wider block">
                      Next Delivery
                    </span>
                    <span className="text-sm font-bold text-[#1A1008] mt-0.5 block">
                      {subscription.status === "active" ? "Tomorrow before 10 AM" : "Paused"}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]">
                    <span className="text-[11px] font-bold text-[#3A241C]/50 uppercase tracking-wider block">
                      Bottles Sanitized & Sealed
                    </span>
                    <span className="text-sm font-bold text-[#1A1008] mt-0.5 block">
                      Zero-Plastic Glass
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#E8DFD4]">
                    <span className="text-[11px] font-bold text-[#3A241C]/50 uppercase tracking-wider block">
                      Cut-off for Changes
                    </span>
                    <span className="text-sm font-bold text-[#5C1B13] mt-0.5 block">
                      10:00 PM (night before)
                    </span>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-[#FAF3EA]/50 border border-[#E8DFD4] text-xs text-[#3A241C]/75 flex items-start gap-2.5">
                  <FiShield className="w-4 h-4 text-[#5C1B13] shrink-0 mt-0.5" />
                  <p>
                    <strong>Vacation Policy:</strong> You can pause deliveries anytime before 10:00 PM for next-day effect.
                    Your milk balance remains safely credited in your PuretyFarm account.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Available Plans from Pricing section */}
            <div>
              <h3 className="text-base font-bold text-[#1A1008] mb-3">
                {subscription ? "Switch or Upgrade Plan" : "Choose Your PuretyFarm Plan"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: "trial" as const,
                    name: "7-Day Trial Plan",
                    price: 525,
                    rate: "₹75 / litre",
                    tag: "ONE-TIME OFFER",
                    desc: "7 consecutive mornings of farm-fresh pure A2 Gir cow milk in glass bottles.",
                  },
                  {
                    id: "monthly" as const,
                    name: "Monthly Subscription",
                    price: 2250,
                    rate: "₹75 / delivery",
                    tag: "MOST POPULAR",
                    desc: "1L Daily (30L / month) with automatic morning delivery & flexible vacation pause.",
                  },
                  {
                    id: "single" as const,
                    name: "Buy Once (1 Litre)",
                    price: 85,
                    rate: "₹85 / bottle",
                    tag: "SAMPLE BOTTLE",
                    desc: "Taste test our rich farm milk with a single bottle before subscribing.",
                  },
                ].map((plan) => (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-3xl p-5 border flex flex-col justify-between transition-all ${
                      subscription?.planId === plan.id
                        ? "border-[#5C1B13] shadow-md shadow-[#5C1B13]/10"
                        : "border-[#E8DFD4] hover:border-[#5C1B13]/30"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF3EA] text-[#5C1B13]">
                          {plan.tag}
                        </span>
                        {subscription?.planId === plan.id && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Current Plan
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-base text-[#1A1008]">{plan.name}</h4>
                      <div className="mt-1 mb-2">
                        <span className="text-xl font-bold text-[#5C1B13]">₹{plan.price}</span>
                        <span className="text-xs text-[#3A241C]/60 ml-1.5 font-medium">({plan.rate})</span>
                      </div>
                      <p className="text-xs text-[#3A241C]/70 mb-4">{plan.desc}</p>
                    </div>

                    <Button
                      variant={subscription?.planId === plan.id ? "secondary" : "primary"}
                      size="sm"
                      fullWidth
                      disabled={subUpdating || subscription?.planId === plan.id}
                      onClick={() => handleActivatePlan(plan.id)}
                      className="rounded-xl py-2.5 text-xs font-bold"
                    >
                      {subscription?.planId === plan.id ? "Selected Plan" : `Choose ${plan.name}`}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </m.div>
        )}
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="py-4 text-center border-t border-[#E8DFD4] text-[11px] text-[#3A241C]/50 bg-white">
        © {new Date().getFullYear()} PuretyFarm. Milked at Dawn, Delivered Chilled Before 10 AM in Raipur.
      </footer>
    </div>
  );
}
