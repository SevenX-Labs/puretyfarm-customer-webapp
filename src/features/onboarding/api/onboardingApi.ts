import { apiClient } from "@/lib/api/client";
import { Address } from "@/types/models";
import { profileApi } from "@/features/profile/api/profileApi";
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

      // Keep local mock route sync for serverless local preview if needed
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
    return apiClient.post<CompletePlanResponse>("/api/onboarding/complete-plan", payload);
  },
};
