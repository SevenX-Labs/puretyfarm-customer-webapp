import { apiClient } from "@/lib/api/client";
import { Address } from "@/types/models";
import { profileApi } from "@/features/profile/api/profileApi";
import { plansApi } from "@/features/plans/api/plansApi";
import {
  ServiceabilityCheckRequest,
  ServiceabilityCheckResponse,
  SaveAddressRequest,
  SaveAddressResponse,
  CompletePlanRequest,
  CompletePlanResponse,
} from "../types";

export const onboardingApi = {
  async getAddresses(): Promise<{ success: boolean; addresses: Address[]; error?: string }> {
    return apiClient.get<{ success: boolean; addresses: Address[]; error?: string }>("/api/addresses");
  },

  async updateProfile(payload: {
    name: string;
    email?: string;
    avatarUrl?: string;
    gender?: string;
    dob?: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const parts = (payload.name || "").trim().split(/\s+/);
      const firstName = parts[0] || "Customer";
      const lastName = parts.slice(1).join(" ") || "User";

      await profileApi.saveProfile({
        firstName,
        lastName,
        gender: payload.gender,
        dateOfBirth: payload.dob,
      });

      await apiClient.patch<{ success: boolean }>("/api/me", payload).catch(() => {});
      return { success: true, message: "Profile saved successfully." };
    } catch (err: any) {
      const errorMsg =
        err?.data?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save profile.";
      const message = Array.isArray(errorMsg) ? errorMsg.join(", ") : String(errorMsg);
      return { success: false, error: message };
    }
  },

  async checkServiceability(
    payload: ServiceabilityCheckRequest
  ): Promise<ServiceabilityCheckResponse> {
    return apiClient.post<ServiceabilityCheckResponse>("/api/serviceability/check", payload);
  },

  async saveAddress(payload: SaveAddressRequest): Promise<SaveAddressResponse> {
    return apiClient.post<SaveAddressResponse>("/api/addresses", payload);
  },

  async joinWaitlist(payload: {
    phone: string;
    pincode?: string;
    locality?: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    return apiClient.post<{ success: boolean; message?: string; error?: string }>(
      "/api/waitlist",
      payload
    );
  },

  async completePlanSelection(payload: CompletePlanRequest): Promise<CompletePlanResponse> {
    try {
      // 1. Generate server-side quote via Plans API
      let quote;
      if (payload.planId === "trial") {
        quote = await plansApi.createTrialQuote(1);
      } else if (payload.planId === "single") {
        quote = await plansApi.createBuyOnceQuote(1);
      } else {
        let draft = null;
        try {
          const raw =
            typeof window !== "undefined"
              ? localStorage.getItem("pf_subscription_draft_v2") ||
                localStorage.getItem("pf_subscription_draft")
              : null;
          if (raw) draft = JSON.parse(raw);
        } catch {}

        const freq = draft?.frequency === "alternate" ? "ALTERNATE_DAYS" : "DAILY";
        const mode = draft?.mode === "pattern" ? "ALTERNATING" : "FIXED";

        quote = await plansApi.createMonthlyQuote({
          frequency: freq,
          quantityMode: mode,
          quantity: mode === "FIXED" ? (draft?.fixedLitres || 1) : undefined,
          quantityA: mode === "ALTERNATING" ? (draft?.day1Litres || 1) : undefined,
          quantityB: mode === "ALTERNATING" ? (draft?.day2Litres || 2) : undefined,
        });
      }

      // 2. Confirm quote with paymentMethod WALLET or CASH
      if (quote && quote.quoteId) {
        try {
          await plansApi.confirmPlanQuote({
            quoteId: quote.quoteId,
            paymentMethod: "WALLET",
          });
        } catch (confirmErr: any) {
          // If insufficient wallet balance, try CASH confirmation
          if (confirmErr?.data?.error === "INSUFFICIENT_WALLET_BALANCE" || confirmErr?.status === 400) {
            await plansApi.confirmPlanQuote({
              quoteId: quote.quoteId,
              paymentMethod: "CASH",
            }).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.warn("Direct plan quote error, falling back to local complete-plan route:", err);
    }

    return apiClient.post<CompletePlanResponse>("/api/onboarding/complete-plan", payload);
  },
};
