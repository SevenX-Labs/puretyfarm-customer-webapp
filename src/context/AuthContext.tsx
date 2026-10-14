"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/features/auth/api/authApi";
import { profileApi, CustomerProfile } from "@/features/profile/api/profileApi";
import { locationApi, CustomerAddress } from "@/features/location/api/locationApi";
import { manageDeliveryApi } from "@/features/delivery/api/manageDeliveryApi";
import { accountApi } from "@/features/account/api/accountApi";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import { useRealtimeSync } from "@/lib/useRealtimeSync";
import {
  bootstrapAuthSession,
  endAuthSession,
  isDefiniteRefreshRejection,
  refreshSession,
  subscribeToAuthSession,
} from "@/lib/auth/refreshSession";
import { clearUserCache, clearAllCache, setCacheData, getCacheData } from "@/lib/cache/swrCache";
import { User, OnboardingStatus } from "@/types/models";

export interface AuthUser extends User {
  mobile?: string;
  emailVerified?: boolean;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  loading: boolean;
  isProfileLoaded: boolean;
  authError: string | null;
  isLoggedIn: boolean;
  refreshUser: () => Promise<AuthUser | null>;
  retryAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface UserDataInput {
  id?: string;
  mobile?: string;
  phone?: string;
  name?: string;
  email?: string | null;
  emailVerified?: boolean;
  avatarUrl?: string;
  role?: string;
  gender?: string;
  dob?: string;
  onboardingStep?: OnboardingStatus | string;
  createdAt?: string;
  updatedAt?: string;
}

function normalizeCustomerUser(
  data: UserDataInput,
  profile?: CustomerProfile | null,
  addresses?: CustomerAddress[],
  hasActivePlan?: boolean,
  prevUser?: AuthUser | null
): AuthUser {
  const mobile = profile?.mobile || data.mobile || data.phone || prevUser?.mobile || prevUser?.phone || "";

  let fullName = "";
  if (profile && (profile.firstName || profile.lastName)) {
    fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  } else if (data.name && data.name.trim()) {
    fullName = data.name.trim();
  } else if (prevUser && prevUser.name && !prevUser.name.startsWith("Customer")) {
    fullName = prevUser.name.trim();
  }

  const isPlaceholder =
    !fullName ||
    fullName.startsWith("Customer (") ||
    fullName.toLowerCase() === "customer";

  // Only derive "Customer (1566)" fallback if profile truly has no name
  const displayName = fullName || (mobile ? `Customer (${mobile.slice(-4)})` : "Customer");

  const isMarkedCompleted =
    !isPlaceholder &&
    fullName.length > 0 &&
    typeof window !== "undefined" &&
    (window.localStorage.getItem("pf_onboarding_completed") === "true" ||
     window.sessionStorage.getItem("pf_onboarding_completed") === "true");

  let onboardingStep: OnboardingStatus = "complete";
  if (!isMarkedCompleted && !hasActivePlan) {
    if (isPlaceholder || fullName.length === 0) {
      onboardingStep = "profile_pending";
    } else {
      const hasAddress = Array.isArray(addresses) && addresses.length > 0;
      if (!hasAddress) {
        onboardingStep = "location_pending";
      } else {
        onboardingStep = "complete";
      }
    }
  }

  const avatar = profile?.profileImageUrl || data.avatarUrl || prevUser?.avatarUrl || undefined;

  return {
    id: profile?.userId || data.id || prevUser?.id || "",
    phone: mobile,
    mobile: mobile,
    name: displayName,
    email: profile?.email || (data.email ? String(data.email) : undefined) || prevUser?.email,
    emailVerified: Boolean(profile?.emailVerified ?? data.emailVerified ?? prevUser?.emailVerified),
    avatarUrl: avatar,
    role: data.role || prevUser?.role || "CUSTOMER",
    gender: profile?.gender?.toLowerCase() || data.gender || prevUser?.gender,
    dob: profile?.dateOfBirth ? profile.dateOfBirth.split("T")[0] : data.dob || prevUser?.dob,
    onboardingStep,
    createdAt: profile?.createdAt || data.createdAt || prevUser?.createdAt,
    updatedAt: profile?.updatedAt || data.updatedAt || prevUser?.updatedAt,
  };
}

function areUsersEqual(a: AuthUser | null, b: AuthUser | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.email === b.email &&
    a.avatarUrl === b.avatarUrl &&
    a.mobile === b.mobile &&
    a.role === b.role &&
    a.onboardingStep === b.onboardingStep &&
    a.emailVerified === b.emailVerified
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [isProfileLoaded, setIsProfileLoaded] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const userRef = useRef<AuthUser | null>(null);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const router = useRouter();

  const fetchFullUserProfile = useCallback(async (): Promise<AuthUser | null> => {
    // Load auth, profile, addresses, active plan, and orders in parallel
    const [authData, profileData, addresses, manageDeliveryRes, ordersRes] = await Promise.all([
      authApi.getMe().catch(() => null),
      profileApi.getProfile().catch((): CustomerProfile | null => null),
      locationApi.getAddresses().catch(() => [] as CustomerAddress[]),
      manageDeliveryApi.getManageDelivery().catch(() => null),
      accountApi.getOrders().catch(() => ({ success: false, orders: [] })),
    ]);
    if (!authData || !authData.id) return null;

    if (profileData) {
      setIsProfileLoaded(true);
      setCacheData(`profile:${authData.id}`, profileData);
    }

    const hasOrders = Boolean(ordersRes && ordersRes.orders && ordersRes.orders.length > 0);
    const hasPendingPurchases = Boolean(
      ordersRes &&
      (ordersRes as any).pendingPlanPurchases &&
      (ordersRes as any).pendingPlanPurchases.length > 0
    );
    const hasActivePlan = Boolean(
      manageDeliveryRes?.activePlan || hasOrders || hasPendingPurchases
    );

    const normalized = normalizeCustomerUser(authData, profileData, addresses, hasActivePlan, userRef.current);
    return normalized;
  }, []);

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      if (!tokenStorage.getAccessToken() && tokenStorage.getRefreshToken()) {
        await refreshSession();
      }

      if (tokenStorage.getAccessToken()) {
        const authUser = await fetchFullUserProfile();
        if (authUser) {
          setUser((prev) => (areUsersEqual(prev, authUser) ? prev : authUser));
          setAuthError(null);
          setStatus("authenticated");
          return authUser;
        }
      }

      if (tokenStorage.hasAccessToken()) {
        return userRef.current;
      }

      setUser(null);
      setIsProfileLoaded(false);
      setStatus("unauthenticated");
      return null;
    } catch (err) {
      console.warn("[AuthContext] Could not refresh the user profile:", err);
      return userRef.current;
    }
  }, [fetchFullUserProfile]);

  const checkSession = useCallback(async () => {
    try {
      if (tokenStorage.getRefreshToken()) {
        try {
          const result = await bootstrapAuthSession(async () => {
            const authUser = await fetchFullUserProfile();
            if (!authUser) {
              throw new Error("The authenticated customer profile was unavailable.");
            }
            return authUser;
          });
          if (result.status === "authenticated" && result.value) {
            const nextUser = result.value as AuthUser;
            setUser((prev) => (areUsersEqual(prev, nextUser) ? prev : nextUser));
            setStatus("authenticated");
            setAuthError(null);
            return;
          }
        } catch {
          // Token bootstrap failed or expired; fall through to next checks
        }
      }

      if (tokenStorage.getAccessToken()) {
        try {
          const authUser = await fetchFullUserProfile();
          if (authUser) {
            setUser((prev) => (areUsersEqual(prev, authUser) ? prev : authUser));
            setStatus("authenticated");
            setAuthError(null);
            return;
          }
        } catch {}
      }

      if (!tokenStorage.getRefreshToken() && !tokenStorage.getAccessToken()) {
        if (typeof window !== "undefined") {
          fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        }
        tokenStorage.clearTokens();
        setUser(null);
        setIsProfileLoaded(false);
        setStatus("unauthenticated");
        setAuthError(null);
      } else {
        setStatus("authenticated");
      }
    } catch (err: any) {
      if (isDefiniteRefreshRejection(err)) {
        tokenStorage.clearTokens();
        setUser(null);
        setIsProfileLoaded(false);
        setStatus("unauthenticated");
      } else if (tokenStorage.hasAccessToken() || Boolean(tokenStorage.getRefreshToken())) {
        setStatus("authenticated");
      } else {
        setStatus("unauthenticated");
      }
    }
  }, [fetchFullUserProfile]);

  useEffect(() => {
    let mounted = true;
    queueMicrotask(() => {
      if (mounted) void checkSession();
    });
    return () => {
      mounted = false;
    };
  }, [checkSession]);

  useRealtimeSync(() => {
    if (status === "authenticated" && tokenStorage.getAccessToken()) {
      refreshUser();
    }
  }, { intervalMs: 35000, enabled: status === "authenticated", events: ["wallet.updated", "plan.updated"] });

  useEffect(
    () =>
      subscribeToAuthSession((event) => {
        if (event.type === "ended") {
          setUser(null);
          setIsProfileLoaded(false);
          setStatus("unauthenticated");
          setAuthError(null);
          clearAllCache();
          return;
        }

        void fetchFullUserProfile()
          .then((authUser) => {
            if (authUser) {
              setUser((prev) => (areUsersEqual(prev, authUser) ? prev : authUser));
            }
            setStatus(authUser ? "authenticated" : "unauthenticated");
            setAuthError(null);
          })
          .catch((err) => {
            console.warn("[AuthContext] Could not load the updated session:", err);
          });
      }),
    [fetchFullUserProfile]
  );

  const logout = useCallback(async () => {
    try {
      const currentId = userRef.current?.id;
      if (currentId) clearUserCache(currentId);
      clearAllCache();
      await authApi.logout();
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      try {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("pf_onboarding_completed");
          window.sessionStorage.removeItem("pf_onboarding_completed");
        }
        endAuthSession();
      } catch (err) {
        console.error("Could not clear all local auth storage:", err);
      } finally {
        setUser(null);
        setIsProfileLoaded(false);
        setStatus("unauthenticated");
        setAuthError(null);
        router.push("/login");
        router.refresh();
      }
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        loading: status === "loading",
        isProfileLoaded,
        authError,
        isLoggedIn: Boolean(user),
        refreshUser,
        retryAuth: checkSession,
        logout,
        setUser,
      }}
    >
      {children}
      {status === "loading" && authError && (
        <div
          role="alert"
          className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-xl border border-[#e7d8c5] bg-[#fffdf8] px-4 py-3 text-sm text-[#24130f] shadow-lg"
        >
          <span>{authError}</span>
          <button
            type="button"
            onClick={() => {
              setAuthError(null);
              void checkSession();
            }}
            className="font-semibold text-[#7a2417] underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
