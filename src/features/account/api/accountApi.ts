import { apiClient } from "@/lib/api/client";
import { Order, Address, Subscription } from "@/types/models";
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
    email: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; message?: string; user?: unknown; error?: string }> {
    return apiClient.patch<{ success: boolean; message?: string; user?: unknown; error?: string }>(
      "/api/me",
      payload
    );
  },
};
