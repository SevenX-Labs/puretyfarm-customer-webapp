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

  // Derive onboarding step: if profile/name exists, user has completed profile onboarding
  let onboardingStep: OnboardingStatus = "complete";
  if (data.onboardingStep) {
    onboardingStep = data.onboardingStep as OnboardingStatus;
  } else if (!fullName && !profile?.firstName && !data.name?.trim()) {
    onboardingStep = "profile_pending";
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
    const [authData, profileData] = await Promise.all([
      authApi.getMe(),
      profileApi.getProfile().catch(() => null),
    ]);

    if (authData && authData.id) {
      return normalizeCustomerUser(authData, profileData);
    }
    return null;
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

      // Preserve support for the same-origin httpOnly pf_session flow.
      const res = await fetch("/api/me", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const userWithStep: AuthUser = normalizeCustomerUser({
            ...data.user,
            onboardingStep: data.onboardingStep,
          });
          setUser(userWithStep);
          setAuthError(null);
          setStatus("authenticated");
          return userWithStep;
        }
      }

      setUser(null);
      setStatus("unauthenticated");
      return null;
    } catch (err) {
      console.warn("[AuthContext] Could not refresh the user profile:", err);
      return null;
    } finally {
      if (!tokenStorage.getRefreshToken() && !tokenStorage.getAccessToken()) {
        setStatus("unauthenticated");
      }
    }
  }, [fetchFullUserProfile]);

  const checkSession = useCallback(async () => {
    try {
      const result = await bootstrapAuthSession(async () => {
        const authUser = await fetchFullUserProfile();
        if (!authUser) {
          throw new Error("The authenticated customer profile was unavailable.");
        }
        return authUser;
      });
      setUser(result.value as AuthUser | null);
      setStatus(result.status);
      setAuthError(null);
    } catch (err) {
      const isRejected =
        typeof err === "object" &&
        err !== null &&
        "status" in err &&
        err.status === 401;
      if (isRejected) {
        setUser(null);
        setStatus("unauthenticated");
        setAuthError(null);
      } else {
        setAuthError("Can’t connect. Check your connection, then retry.");
        setStatus("loading");
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
        router.push("/");
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
