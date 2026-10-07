"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/features/auth/api/authApi";
import { profileApi, CustomerProfile } from "@/features/profile/api/profileApi";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import { CustomerUser } from "@/features/auth/types";
import { User, OnboardingStatus } from "@/types/models";

export interface AuthUser extends User {
  mobile?: string;
  emailVerified?: boolean;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isLoggedIn: boolean;
  refreshUser: () => Promise<AuthUser | null>;
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

  // If profile exists in database, onboarding step has passed profile creation
  let onboardingStep: OnboardingStatus = "profile_pending";
  if (profile) {
    onboardingStep = (data.onboardingStep as OnboardingStatus) || "location_pending";
  } else if (data.onboardingStep) {
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
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchFullUserProfile = async (
    accessToken: string
  ): Promise<AuthUser | null> => {
    try {
      const [authData, profileData] = await Promise.all([
        authApi.getMe(),
        profileApi.getProfile().catch(() => null),
      ]);

      if (authData && authData.id) {
        return normalizeCustomerUser(authData, profileData);
      }
      return null;
    } catch (err: any) {
      if (err?.status === 401 || err?.statusCode === 401) {
        const refreshToken = tokenStorage.getRefreshToken();
        if (refreshToken) {
          await authApi.refreshToken(refreshToken);
          const [authData, profileData] = await Promise.all([
            authApi.getMe(),
            profileApi.getProfile().catch(() => null),
          ]);
          if (authData && authData.id) {
            return normalizeCustomerUser(authData, profileData);
          }
        }
      }
      throw err;
    }
  };

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const accessToken = tokenStorage.getAccessToken();

      if (accessToken) {
        try {
          const authUser = await fetchFullUserProfile(accessToken);
          if (authUser) {
            setUser(authUser);
            return authUser;
          }
        } catch (err) {
          console.warn("[AuthContext] Token profile error:", err);
          tokenStorage.clearTokens();
        }
      }

      // Fallback check to local /api/me session cookie
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
          return userWithStep;
        }
      }

      setUser(null);
      return null;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const checkSession = async () => {
      try {
        const accessToken = tokenStorage.getAccessToken();
        if (accessToken) {
          try {
            const authUser = await fetchFullUserProfile(accessToken);
            if (!ignore && authUser) {
              setUser(authUser);
              return;
            }
          } catch {
            tokenStorage.clearTokens();
          }
        }

        // Fallback check to /api/me session cookie
        const res = await fetch("/api/me", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (res.ok) {
          const data = await res.json();
          if (!ignore && data.success && data.user) {
            setUser(
              normalizeCustomerUser({
                ...data.user,
                onboardingStep: data.onboardingStep,
              })
            );
            return;
          }
        }
        if (!ignore) setUser(null);
      } catch {
        if (!ignore) setUser(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    checkSession();
    return () => {
      ignore = true;
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      tokenStorage.clearTokens();
      setUser(null);
      router.push("/");
      router.refresh();
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLoggedIn: Boolean(user),
        refreshUser,
        logout,
        setUser,
      }}
    >
      {children}
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
