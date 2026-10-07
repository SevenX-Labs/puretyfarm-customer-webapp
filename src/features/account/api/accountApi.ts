import { apiClient } from "@/lib/api/client";
import { profileApi } from "@/features/profile/api/profileApi";
import {
  OrdersResponse,
  OrderResponse,
  AddressesResponse,
  AddressResponse,
  SubscriptionResponse,
  AddressFormData,
} from "../types";

export const accountApi = {
  async getOrders(): Promise<OrdersResponse> {
    return apiClient.get<OrdersResponse>("/api/orders");
  },

  async createOrder(orderPayload: unknown): Promise<OrderResponse> {
    return apiClient.post<OrderResponse>("/api/orders", orderPayload);
  },

  async getAddresses(): Promise<AddressesResponse> {
    return apiClient.get<AddressesResponse>("/api/addresses");
  },

  async createAddress(addressForm: AddressFormData): Promise<AddressResponse> {
    return apiClient.post<AddressResponse>("/api/addresses", addressForm);
  },

  async updateAddress(id: string, addressForm: Partial<AddressFormData>): Promise<AddressResponse> {
    return apiClient.patch<AddressResponse>(`/api/addresses/${id}`, addressForm);
  },

  async deleteAddress(id: string): Promise<{ success: boolean; message?: string }> {
    return apiClient.delete<{ success: boolean; message?: string }>(`/api/addresses/${id}`);
  },

  async getSubscription(): Promise<SubscriptionResponse> {
    return apiClient.get<SubscriptionResponse>("/api/subscription");
  },

  async updateSubscriptionStatus(status: "active" | "paused"): Promise<SubscriptionResponse> {
    return apiClient.patch<SubscriptionResponse>("/api/subscription", { status });
  },

  async createSubscription(payload: {
    planId: string;
    planName: string;
    price: number;
    dailyQuantity: string;
  }): Promise<SubscriptionResponse> {
    return apiClient.post<SubscriptionResponse>("/api/subscription", payload);
  },

  async updateProfile(payload: {
    name: string;
    email?: string;
    avatarUrl?: string;
    gender?: string;
    dob?: string;
  }): Promise<{ success: boolean; message?: string; user?: unknown; error?: string }> {
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

      // Keep local mock route sync for serverless preview
      await apiClient.patch("/api/me", payload).catch(() => {});

      return { success: true, message: "Profile updated successfully." };
    } catch (err: any) {
      const errorMsg =
        err?.data?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update profile.";
      const message = Array.isArray(errorMsg) ? errorMsg.join(", ") : String(errorMsg);
      return { success: false, error: message };
    }
  },
};
