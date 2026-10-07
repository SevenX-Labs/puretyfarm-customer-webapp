"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Address, Order, Subscription } from "@/types/models";
import { accountApi } from "../api/accountApi";
import { AccountTab, AddressFormData } from "../types";
import {
  PricingResult,
  SubscriptionDraft,
  SubscriptionCustomizationPayload,
  calculateSubscriptionPricing,
  DRAFT_STORAGE_KEY,
} from "@/features/subscription";

export function useAccountData() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, logout, refreshUser, setUser } = useAuth();

  const queryTab = searchParams.get("tab") as AccountTab | null;
  const [activeTab, setActiveTab] = useState<AccountTab>(() => {
    if (queryTab && ["profile", "orders", "addresses", "subscription", "wallet", "preferences", "security", "activity"].includes(queryTab)) {
      return queryTab;
    }
    return "profile";
  });

  useEffect(() => {
    const tab = searchParams.get("tab") as AccountTab | null;
    if (tab && ["profile", "orders", "addresses", "subscription", "wallet", "preferences", "security", "activity"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Addresses State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<AddressFormData>({
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

  // Wallet State
  const [walletBalance, setWalletBalance] = useState<number>(255);
  const [walletLoading, setWalletLoading] = useState<boolean>(true);
  const [walletRecharging, setWalletRecharging] = useState<boolean>(false);
  const [walletSuccessMsg, setWalletSuccessMsg] = useState<string | null>(null);

  // Sync wallet balance from localStorage & custom events
  useEffect(() => {
    if (!user) return;
    const syncBalance = () => {
      try {
        const saved = localStorage.getItem(`pf_wallet_${user.id}`);
        if (saved !== null) {
          setWalletBalance(parseFloat(saved) || 0);
        } else {
          setWalletBalance(255);
        }
      } catch {
        setWalletBalance(255);
      } finally {
        setWalletLoading(false);
      }
    };

    syncBalance();

    window.addEventListener("storage", syncBalance);
    window.addEventListener("wallet_update", syncBalance);
    return () => {
      window.removeEventListener("storage", syncBalance);
      window.removeEventListener("wallet_update", syncBalance);
    };
  }, [user]);

  const handleRechargeWallet = (amount: number) => {
    if (!user || amount <= 0) return;
    setWalletRecharging(true);
    setTimeout(() => {
      const next = walletBalance + amount;
      setWalletBalance(next);
      try {
        localStorage.setItem(`pf_wallet_${user.id}`, next.toString());
        const txKey = `pf_wallet_tx_${user.id}`;
        const existingTx = JSON.parse(localStorage.getItem(txKey) || "[]");
        const newTx = {
          id: `tx_${Date.now()}`,
          type: "credit",
          amount,
          title: `Wallet Top-Up (₹${amount})`,
          description: "Online Instant UPI/Card Recharge",
          date: new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        localStorage.setItem(txKey, JSON.stringify([newTx, ...existingTx]));
        window.dispatchEvent(new Event("wallet_update"));
      } catch {
        // Ignore
      }
      setWalletRecharging(false);
      setWalletSuccessMsg(`Successfully added ₹${amount} to your PuretyFarm wallet!`);
      setTimeout(() => setWalletSuccessMsg(null), 4000);
    }, 600);
  };

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
      const data = await accountApi.getOrders();
      if (data.success) {
        setOrders(data.orders || []);
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
      const data = await accountApi.getAddresses();
      if (data.success) {
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error("Failed to load addresses:", err);
    } finally {
      setAddressesLoading(false);
    }
  }, []);

  // Load all initial account data
  useEffect(() => {
    let ignore = false;
    const loadAll = async () => {
      try {
        const [ordersRes, addressesRes, subRes] = await Promise.all([
          accountApi.getOrders(),
          accountApi.getAddresses(),
          accountApi.getSubscription(),
        ]);
        if (!ignore && ordersRes.success) {
          setOrders(ordersRes.orders || []);
        }
        if (!ignore && addressesRes.success) {
          setAddresses(addressesRes.addresses || []);
        }
        if (!ignore && subRes.success) {
          setSubscription(subRes.subscription);
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
      const data = await accountApi.updateProfile({
        name: profileName.trim(),
        email: profileEmail.trim(),
        avatarUrl: profileAvatar,
      });

      if (!data.success) {
        setProfileMsg({ type: "error", text: data.error || "Failed to update profile." });
      } else {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                name: profileName.trim(),
                email: profileEmail.trim(),
                avatarUrl: profileAvatar,
              }
            : null
        );
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
      const data = editingAddress
        ? await accountApi.updateAddress(editingAddress.id, addressForm)
        : await accountApi.createAddress(addressForm);

      if (data.success) {
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
      const res = await accountApi.deleteAddress(id);
      if (res.success) {
        await fetchAddresses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Set Default Address
  const handleSetDefaultAddress = async (addr: Address) => {
    try {
      const res = await accountApi.updateAddress(addr.id, { isDefault: true });
      if (res.success) {
        await fetchAddresses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Place Quick Sample Order
  const handlePlaceSampleOrder = async (planType: "single" | "trial" = "single") => {
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
      const data = await accountApi.createOrder(orderPayload);
      if (data.success) {
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
      const data = await accountApi.updateSubscriptionStatus(targetStatus);
      if (data.success) {
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubUpdating(false);
    }
  };

  // Custom Plan state (loaded from DRAFT_STORAGE_KEY if available)
  const [customPlan, setCustomPlan] = useState<{
    price: number;
    dailyQuantity: string;
    breakdownText?: string;
  } | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const pricing = calculateSubscriptionPricing(parsed);
        return {
          price: pricing.totalPrice,
          dailyQuantity: `${parsed.frequency === "daily" ? "Daily" : "Alternate Day"} (${pricing.totalLitres}L / mo)`,
          breakdownText: pricing.breakdownText,
        };
      }
    } catch {}
    return null;
  });

  // Apply custom schedule confirmed via SubscriptionPanel
  const handleApplyCustomSchedule = async (
    result: PricingResult,
    draft: SubscriptionDraft,
    _payload: SubscriptionCustomizationPayload
  ) => {
    const customDetails = {
      price: result.totalPrice,
      dailyQuantity: `${draft.frequency === "daily" ? "Daily" : "Alternate Day"} (${result.totalLitres}L / mo)`,
      breakdownText: result.breakdownText,
    };
    setCustomPlan(customDetails);
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {}

    setSubUpdating(true);
    try {
      const data = await accountApi.createSubscription({
        planId: "monthly",
        planName: "Monthly Subscription",
        price: customDetails.price,
        dailyQuantity: customDetails.dailyQuantity,
      });

      if (data.success) {
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubUpdating(false);
    }
  };

  // Activate Plan (uses customized plan details if user previously customized monthly plan)
  const handleActivatePlan = async (planId: "trial" | "monthly" | "single") => {
    setSubUpdating(true);
    const defaultMonthly = { name: "Monthly Subscription", price: 2250, dailyQuantity: "1L Daily (30L / mo)" };
    const monthlyDetails = customPlan
      ? {
          name: "Monthly Subscription",
          price: customPlan.price,
          dailyQuantity: customPlan.dailyQuantity,
        }
      : defaultMonthly;

    const planDetails = {
      trial: { name: "7-Day Trial Plan", price: 525, dailyQuantity: "1L Daily for 7 Days" },
      monthly: monthlyDetails,
      single: { name: "Buy Once (1 Litre)", price: 85, dailyQuantity: "Single Bottle Order" },
    }[planId];

    try {
      const data = await accountApi.createSubscription({
        planId,
        planName: planDetails.name,
        price: planDetails.price,
        dailyQuantity: planDetails.dailyQuantity,
      });

      if (data.success) {
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubUpdating(false);
    }
  };

  return {
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
  };
}
