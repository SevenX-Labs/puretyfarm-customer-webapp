"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/features/auth/api/authApi";
import { profileApi, CustomerProfile } from "@/features/profile/api/profileApi";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import {
  bootstrapAuthSession,
  endAuthSession,
  refreshSession,
  subscribeToAuthSession,
} from "@/lib/auth/refreshSession";
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
  profile?: CustomerProfile | null
): AuthUser {
  const mobile = profile?.mobile || data.mobile || data.phone || "";

  let fullName = "";
  if (profile && (profile.firstName || profile.lastName)) {
    fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  } else if (data.name && data.name.trim()) {
    fullName = data.name.trim();
  }

  const displayName = fullName || (mobile ? `Customer (${mobile.slice(-4)})` : "Customer");

  // Derive onboarding step: only complete if a valid customer profile actually exists in database
  let onboardingStep: OnboardingStatus = "profile_pending";
  if (profile && (profile.firstName || profile.lastName)) {
    onboardingStep = (data.onboardingStep as OnboardingStatus) || "complete";
  } else if (data.onboardingStep && data.onboardingStep !== "profile_pending") {
    onboardingStep = data.onboardingStep as OnboardingStatus;
  }

  return {
    id: profile?.userId || data.id || "",
    phone: mobile,
    mobile: mobile,
    name: displayName,
    email: profile?.email || (data.email ? String(data.email) : undefined),
    emailVerified: Boolean(profile?.emailVerified ?? data.emailVerified),
    avatarUrl: profile?.profileImageUrl || data.avatarUrl || undefined,
    role: data.role || "CUSTOMER",
    gender: profile?.gender?.toLowerCase() || data.gender,
    dob: profile?.dateOfBirth ? profile.dateOfBirth.split("T")[0] : data.dob,
    onboardingStep,
    createdAt: profile?.createdAt || data.createdAt,
    updatedAt: profile?.updatedAt || data.updatedAt,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const fetchFullUserProfile = useCallback(async (): Promise<AuthUser | null> => {
    const authData = await authApi.getMe();
    if (!authData || !authData.id) return null;

    let profileData: CustomerProfile | null = null;
    try {
      profileData = await profileApi.getProfile();
    } catch {
      profileData = null;
    }

    return normalizeCustomerUser(authData, profileData);
  }, []);

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      if (!tokenStorage.getAccessToken() && tokenStorage.getRefreshToken()) {
        await refreshSession();
      }

      if (tokenStorage.getAccessToken()) {
        const authUser = await fetchFullUserProfile();
        if (authUser) {
          setUser(authUser);
          setAuthError(null);
          setStatus("authenticated");
          return authUser;
        }
      }

      setUser(null);
      setStatus("unauthenticated");
      return null;
    } catch (err) {
      console.warn("[AuthContext] Could not refresh the user profile:", err);
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }
  }, [fetchFullUserProfile]);

  const checkSession = useCallback(async () => {
    try {
      // 1. First attempt bootstrap via refresh token if present
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
            setUser(result.value as AuthUser);
            setStatus("authenticated");
            setAuthError(null);
            return;
          }
        } catch {
          // Token bootstrap failed or expired; fall through to next checks
        }
      }

      // 2. Check if accessToken is in storage
      if (tokenStorage.getAccessToken()) {
        try {
          const authUser = await fetchFullUserProfile();
          if (authUser) {
            setUser(authUser);
            setStatus("authenticated");
            setAuthError(null);
            return;
          }
        } catch {}
      }

      // If backend JWT tokens are not available, user is not authenticated.
      // Clean up any stale cookies.
      if (typeof window !== "undefined") {
        fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      }
      tokenStorage.clearTokens();
      setUser(null);
      setStatus("unauthenticated");
      setAuthError(null);
    } catch (err) {
      setUser(null);
      setStatus("unauthenticated");
      setAuthError(null);
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

  useEffect(
    () =>
      subscribeToAuthSession((event) => {
        if (event.type === "ended") {
          setUser(null);
          setStatus("unauthenticated");
          setAuthError(null);
          return;
        }

        void fetchFullUserProfile()
          .then((authUser) => {
            if (authUser) setUser(authUser);
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
      await authApi.logout();
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      try {
        endAuthSession();
      } catch (err) {
        console.error("Could not clear all local auth storage:", err);
      } finally {
        setUser(null);
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
