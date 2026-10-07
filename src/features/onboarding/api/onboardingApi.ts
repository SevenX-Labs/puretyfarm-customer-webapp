import { apiClient } from "@/lib/api/client";
import { Address } from "@/types/models";
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
    email: string;
    avatarUrl?: string;
    gender?: string;
    dob?: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    return apiClient.patch<{ success: boolean; message?: string; error?: string }>("/api/me", payload);
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
