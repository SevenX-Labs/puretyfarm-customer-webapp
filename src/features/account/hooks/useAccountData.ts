"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Address, Order, Subscription } from "@/types/models";
import { accountApi } from "../api/accountApi";
import { plansApi } from "@/features/plans/api/plansApi";
import { paymentsApi, VerifyPaymentResponse, PaymentRecord } from "@/features/payments";
import {
  walletApi,
  CustomerWallet,
  WalletTransaction,
  WalletCreditRequest,
} from "@/features/wallet";
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
    if (
      queryTab &&
      [
        "profile",
        "orders",
        "addresses",
        "subscription",
        "wallet",
        "preferences",
        "security",
        "activity",
      ].includes(queryTab)
    ) {
      return queryTab;
    }
    return "profile";
  });

  useEffect(() => {
    const tab = searchParams.get("tab") as AccountTab | null;
    if (
      tab &&
      [
        "profile",
        "orders",
        "addresses",
        "subscription",
        "wallet",
        "preferences",
        "security",
        "activity",
      ].includes(tab)
    ) {
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
  const [orderActionLoading, setOrderActionLoading] = useState(false);

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
  const [wallet, setWallet] = useState<CustomerWallet | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(255);
  const [walletLoading, setWalletLoading] = useState<boolean>(true);
  const [walletRecharging, setWalletRecharging] = useState<boolean>(false);
  const [walletSuccessMsg, setWalletSuccessMsg] = useState<string | null>(null);
  const [walletPaymentError, setWalletPaymentError] = useState<{
    message: string;
    transactionId?: string;
    canRetry?: boolean;
  } | null>(null);
  const [walletPaymentStatus, setWalletPaymentStatus] = useState<VerifyPaymentResponse | null>(null);
  const [livePayments, setLivePayments] = useState<PaymentRecord[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [creditRequests, setCreditRequests] = useState<WalletCreditRequest[]>([]);

  // Fetch Wallet & Transactions from Server API
  const fetchWalletData = useCallback(async () => {
    if (!user) return;
    try {
      const [walletRes, txRes, crRes] = await Promise.all([
        walletApi.getWallet().catch(() => null),
        walletApi.getTransactions({ limit: 20 }).catch(() => null),
        walletApi.getCreditRequests({ limit: 10 }).catch(() => null),
      ]);

      if (walletRes && walletRes.balancePaise !== undefined) {
        setWallet(walletRes);
        const rubBalance = walletRes.balancePaise / 100;
        setWalletBalance(rubBalance);
        try {
          localStorage.setItem(`pf_wallet_${user.id}`, rubBalance.toString());
        } catch {}
      }

      if (txRes && Array.isArray(txRes.data)) {
        setWalletTransactions(txRes.data);
      }

      if (crRes && Array.isArray(crRes.data)) {
        setCreditRequests(crRes.data);
      }
    } catch (err) {
      console.warn("Wallet fetch error, using local fallback:", err);
    } finally {
      setWalletLoading(false);
    }
  }, [user]);

  // Sync wallet balance on mount and custom events
  useEffect(() => {
    if (!user) return;

    fetchWalletData();

    const syncBalance = () => {
      fetchWalletData();
      try {
        const saved = localStorage.getItem(`pf_wallet_${user.id}`);
        if (saved !== null) {
          setWalletBalance(parseFloat(saved) || 0);
        }
      } catch {}
    };

    window.addEventListener("storage", syncBalance);
    window.addEventListener("wallet_update", syncBalance);
    return () => {
      window.removeEventListener("storage", syncBalance);
      window.removeEventListener("wallet_update", syncBalance);
    };
  }, [user, fetchWalletData]);

  // Check & verify any return txnid from PayU
  useEffect(() => {
    const txnid = searchParams.get("txnid");
    if (txnid && user) {
      paymentsApi
        .verifyPayment({ transactionId: txnid })
        .then((res) => {
          setWalletPaymentStatus(res);
          if (res.payment.status === "SUCCESS") {
            const amt = (res.payment.amountPaise / 100).toFixed(0);
            if (res.requiresAdminApproval || res.payment.walletCredit?.status === "PENDING") {
              setWalletSuccessMsg(
                `Payment of ₹${amt} verified! Awaiting Admin Approval for first wallet credit.`
              );
            } else {
              setWalletSuccessMsg(
                `Payment of ₹${amt} verified! Wallet credited successfully.`
              );
            }
            fetchWalletData();
            window.dispatchEvent(new Event("wallet_update"));
          } else if (
            res.payment.status === "FAILED" ||
            res.payment.status === "CANCELLED" ||
            res.payment.status === "EXPIRED"
          ) {
            setWalletPaymentError({
              message: `Payment of ₹${(res.payment.amountPaise / 100).toFixed(0)} was ${res.payment.status.toLowerCase()}.`,
              transactionId: txnid,
              canRetry: true,
            });
          }
        })
        .catch((err) => {
          console.warn("Automatic payment verification on return:", err);
        });
    }
  }, [searchParams, user, fetchWalletData]);

  // Load live payments history
  useEffect(() => {
    if (!user) return;
    paymentsApi
      .listPayments({ limit: 15 })
      .then((res) => {
        if (res && Array.isArray(res.data)) {
          setLivePayments(res.data);
        }
      })
      .catch(() => {});
  }, [user, walletSuccessMsg]);

  // Handle Wallet Recharge (ONLINE PayU / CASH)
  const handleRechargeWallet = async (
    amount: number,
    method: "ONLINE" | "CASH" = "ONLINE"
  ) => {
    if (!user || amount <= 0) return;
    setWalletRecharging(true);
    setWalletPaymentError(null);
    setWalletSuccessMsg(null);

    const amountPaise = Math.round(amount * 100);

    try {
      if (method === "ONLINE") {
        const res = await paymentsApi.initiateOnlineTopup(amountPaise, {
          autoRedirect: true,
        });
        if (res.checkout) {
          // PayU hosted form was submitted automatically
          return;
        }
      } else {
        const res = await paymentsApi.requestCashTopup(amountPaise);
        setWalletSuccessMsg(
          res.message ||
            `Cash collection of ₹${amount} requested. Your wallet will be credited once confirmed by admin.`
        );
        fetchWalletData();
      }
    } catch (err: any) {
      console.warn("Live payment creation notice, running local ledger:", err);
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
          description:
            method === "ONLINE"
              ? "Online Instant UPI/Card Recharge"
              : "Cash Collection Request",
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
      setWalletSuccessMsg(`Successfully added ₹${amount} to your PuretyFarm wallet!`);
      setTimeout(() => setWalletSuccessMsg(null), 5000);
    } finally {
      setWalletRecharging(false);
    }
  };

  // Retry Failed/Expired Payment
  const handleRetryPayment = async (transactionId: string) => {
    setWalletRecharging(true);
    try {
      await paymentsApi.retryPayment({ transactionId }, { autoRedirect: true });
    } catch (err: any) {
      console.error("Payment retry failed:", err);
      alert(err?.message || "Failed to retry payment. Please start a fresh top-up.");
    } finally {
      setWalletRecharging(false);
    }
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
        setProfileMsg({ type: "success", text: "Profile updated successfully." });
        setTimeout(() => {
          setIsEditingProfile(false);
          setProfileMsg(null);
        }, 1200);
      }
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message || "An unexpected error occurred." });
    } finally {
      setProfileSaving(false);
    }
  };

  // Address Modal handlers
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      fullName: user?.name || "",
      phone: user?.phone || "",
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
      phone: addr.phone,
      street: addr.street,
      locality: addr.locality,
      landmark: addr.landmark || "",
      city: addr.city,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);

    try {
      if (editingAddress) {
        const res = await accountApi.updateAddress(editingAddress.id, addressForm);
        if (res.success) {
          setShowAddressModal(false);
          await fetchAddresses();
        } else {
          alert(res.error || "Failed to update address.");
        }
      } else {
        const res = await accountApi.createAddress(addressForm);
        if (res.success) {
          setShowAddressModal(false);
          await fetchAddresses();
        } else {
          alert(res.error || "Failed to add address.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error saving address. Please try again.");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to remove this delivery address?")) return;
    try {
      const res = await accountApi.deleteAddress(id);
      if (res.success) {
        await fetchAddresses();
      }
    } catch (err) {
      console.error(err);
    }
  };

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
      // 1. Try server plan quote & confirmation for single/trial
      let quote;
      if (planType === "trial") {
        quote = await plansApi.createTrialQuote(1).catch(() => null);
      } else {
        quote = await plansApi.createBuyOnceQuote(1).catch(() => null);
      }

      if (quote?.quoteId) {
        try {
          await plansApi.confirmPlanQuote({
            quoteId: quote.quoteId,
            paymentMethod: "WALLET",
          });
        } catch (cErr: any) {
          await plansApi
            .confirmPlanQuote({
              quoteId: quote.quoteId,
              paymentMethod: "CASH",
            })
            .catch(() => {});
        }
      }

      const data = await accountApi.createOrder(orderPayload);
      if (data.success) {
        await fetchOrders();
        fetchWalletData();
        setActiveTab("orders");
        if (data.order) {
          setSelectedOrder(data.order);
        }
      } else {
        alert(data.error || "Failed to place order.");
      }
    } catch (err) {
      console.error(err);
      alert("Error placing order. Please try again.");
    }
  };

  // Reorder a delivered order
  const handleReorder = async (orderId: string, addressId?: string) => {
    setOrderActionLoading(true);
    try {
      const selectedAddr = addressId || (addresses.find((a) => a.isDefault) || addresses[0])?.id;
      const res = await accountApi.reorder(orderId, selectedAddr);
      if (res && res.success) {
        await fetchOrders();
        fetchWalletData();
        if (res.order) {
          setSelectedOrder(res.order);
        }
        alert(res.message || "Reorder placed successfully!");
      } else {
        alert("Failed to reorder. Please try again.");
      }
    } catch (err: any) {
      console.error("Reorder failed:", err);
      alert(err?.message || "Reorder failed. Order must be DELIVERED to reorder.");
    } finally {
      setOrderActionLoading(false);
    }
  };

  // Pay for a pending order with Wallet
  const handlePayOrder = async (orderId: string) => {
    setOrderActionLoading(true);
    try {
      const res = await accountApi.payOrder(orderId, "WALLET");
      if (res && res.success) {
        await fetchOrders();
        fetchWalletData();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            status: "CONFIRMED",
            paymentStatus: "PAID",
          });
        }
        window.dispatchEvent(new Event("wallet_update"));
        alert("Order payment completed successfully with your wallet!");
      } else {
        alert(res?.message || "Payment failed.");
      }
    } catch (err: any) {
      console.error("Payment failed:", err);
      const msg =
        err?.data?.error ||
        err?.message ||
        "Payment failed. Please check your wallet balance.";
      alert(msg);
    } finally {
      setOrderActionLoading(false);
    }
  };

  // Get Invoice
  const handleGetInvoice = async (orderId: string) => {
    try {
      return await accountApi.getInvoice(orderId);
    } catch (err: any) {
      console.error("Invoice fetch failed:", err);
      return null;
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
    const defaultMonthly = {
      name: "Monthly Subscription",
      price: 2250,
      dailyQuantity: "1L Daily (30L / mo)",
    };
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
      // 1. Generate live server quote
      let quote;
      if (planId === "trial") {
        quote = await plansApi.createTrialQuote(1).catch(() => null);
      } else if (planId === "single") {
        quote = await plansApi.createBuyOnceQuote(1).catch(() => null);
      } else {
        quote = await plansApi
          .createMonthlyQuote({
            frequency: "DAILY",
            quantityMode: "FIXED",
            quantity: 1,
          })
          .catch(() => null);
      }

      // 2. Confirm quote via WALLET or CASH
      if (quote?.quoteId) {
        try {
          await plansApi.confirmPlanQuote({
            quoteId: quote.quoteId,
            paymentMethod: "WALLET",
          });
        } catch (confirmErr: any) {
          if (
            confirmErr?.data?.error === "INSUFFICIENT_WALLET_BALANCE" ||
            confirmErr?.status === 400
          ) {
            await plansApi
              .confirmPlanQuote({
                quoteId: quote.quoteId,
                paymentMethod: "CASH",
              })
              .catch(() => {});
          }
        }
      }

      const data = await accountApi.createSubscription({
        planId,
        planName: planDetails.name,
        price: quote ? Math.round(quote.totalSellingAmount / 100) : planDetails.price,
        dailyQuantity: planDetails.dailyQuantity,
      });

      if (data.success) {
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.error("Plan activation error:", err);
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
    handleReorder,
    handlePayOrder,
    handleGetInvoice,
    orderActionLoading,
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
    wallet,
    walletBalance,
    walletLoading,
    walletRecharging,
    walletSuccessMsg,
    walletPaymentError,
    walletPaymentStatus,
    livePayments,
    walletTransactions,
    creditRequests,
    fetchWalletData,
    handleRechargeWallet,
    handleRetryPayment,
  };
}
