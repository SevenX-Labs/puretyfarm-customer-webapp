"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/features/auth/api/authApi";
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

function normalizeCustomerUser(data: UserDataInput): AuthUser {
  const mobile = data.mobile || data.phone || "";
  const displayName =
    data.name && data.name.trim()
      ? data.name.trim()
      : mobile
      ? `Customer (${mobile.slice(-4)})`
      : "Customer";

  return {
    id: data.id || "",
    phone: mobile,
    mobile: mobile,
    name: displayName,
    email: data.email ? String(data.email) : undefined,
    emailVerified: Boolean(data.emailVerified),
    avatarUrl: data.avatarUrl,
    role: data.role || "CUSTOMER",
    gender: data.gender,
    dob: data.dob,
    onboardingStep: (data.onboardingStep as OnboardingStatus) || "complete",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const accessToken = tokenStorage.getAccessToken();

      // If JWT access token exists, fetch authenticated customer profile from backend
      if (accessToken) {
        try {
          const profile = await authApi.getMe();
          if (profile && profile.id) {
            const authUser = normalizeCustomerUser(profile);
            setUser(authUser);
            return authUser;
          }
        } catch (err) {
          console.warn("[AuthContext] getMe error, attempting token refresh:", err);
          const refreshToken = tokenStorage.getRefreshToken();
          if (refreshToken) {
            try {
              await authApi.refreshToken(refreshToken);
              const retriedProfile = await authApi.getMe();
              if (retriedProfile && retriedProfile.id) {
                const authUser = normalizeCustomerUser(retriedProfile);
                setUser(authUser);
                return authUser;
              }
            } catch {
              tokenStorage.clearTokens();
            }
          } else {
            tokenStorage.clearTokens();
          }
        }
      }

      // Fallback check to /api/me session cookie
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
            const profile = await authApi.getMe();
            if (!ignore && profile && profile.id) {
              setUser(normalizeCustomerUser(profile));
              return;
            }
          } catch {
            const refreshToken = tokenStorage.getRefreshToken();
            if (refreshToken) {
              try {
                await authApi.refreshToken(refreshToken);
                const retriedProfile = await authApi.getMe();
                if (!ignore && retriedProfile && retriedProfile.id) {
                  setUser(normalizeCustomerUser(retriedProfile));
                  return;
                }
              } catch {
                tokenStorage.clearTokens();
              }
            } else {
              tokenStorage.clearTokens();
            }
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
