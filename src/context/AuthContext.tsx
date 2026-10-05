"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  onboardingStep?: "profile_pending" | "location_pending" | "plan_pending" | "complete";
  createdAt?: string;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const res = await fetch("/api/me", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const userWithStep: AuthUser = {
            ...data.user,
            onboardingStep: data.onboardingStep,
          };
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
        const res = await fetch("/api/me", {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (res.ok) {
          const data = await res.json();
          if (!ignore && data.success && data.user) {
            setUser({
              ...data.user,
              onboardingStep: data.onboardingStep,
            });
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
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
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
