import { apiClient } from "@/lib/api/client";
import { profileApi } from "@/features/profile/api/profileApi";
import { locationApi } from "@/features/location/api/locationApi";
import { ordersApi } from "@/features/orders";
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
    // Backend is the single source of truth for order history. We do not
    // merge with the local Next.js /api/orders store, and we do not merge
    // with any browser-side cache. If the call fails, surface the failure.
    const res = await ordersApi.listOrders();
    return {
      success: true,
      orders: (res?.data || []) as any,
    };
  },

  async getOrder(id: string) {
    const order = await ordersApi.getOrder(id);
    return { success: true, order };
  },

  async createOrder(orderPayload: unknown): Promise<OrderResponse> {
    // If payload has planDeliveryId & addressId, send to backend API
    const p = orderPayload as Record<string, any>;
    if (p && p.planDeliveryId && p.addressId) {
      try {
        const res = await ordersApi.createOrder({
          planDeliveryId: p.planDeliveryId,
          addressId: p.addressId,
        });
        return {
          success: res.success,
          order: res.order as any,
          message: res.message,
        };
      } catch (err: any) {
        return {
          success: false,
          order: {} as any,
          error: err?.message || "Failed to create order.",
        };
      }
    }

    return apiClient.post<OrderResponse>("/api/orders", orderPayload);
  },

  async reorder(orderId: string, addressId?: string) {
    return ordersApi.reorder(orderId, { addressId });
  },

  async getInvoice(orderId: string) {
    return ordersApi.getInvoice(orderId);
  },

  async payOrder(orderId: string, paymentMethod: "WALLET" = "WALLET") {
    return ordersApi.payOrder(orderId, { paymentMethod });
  },

  async getAddresses(): Promise<AddressesResponse> {
    try {
      const addresses = await locationApi.getAddresses();
      if (addresses && Array.isArray(addresses)) {
        return {
          success: true,
          addresses: addresses.map((a, idx) => ({
            id: a.id,
            userId: a.userId,
            fullName: a.fullName,
            phone: a.mobile,
            street: `${a.houseNumber}, ${
              a.buildingName ? a.buildingName + ", " : ""
            }${a.streetName || ""}`.trim(),
            locality: a.area,
            landmark: a.landmark,
            city: a.city,
            pincode: a.pincode,
            isDefault: idx === 0,
            isServiceable: true,
            createdAt: a.createdAt,
          })),
        };
      }
    } catch (err) {
      console.warn("Direct address fetch error, falling back to local route:", err);
    }
    return apiClient.get<AddressesResponse>("/api/addresses");
  },

  async createAddress(addressForm: AddressFormData): Promise<AddressResponse> {
    return apiClient.post<AddressResponse>("/api/addresses", addressForm);
  },

  async updateAddress(id: string, addressForm: Partial<AddressFormData>): Promise<AddressResponse> {
    return apiClient.patch<AddressResponse>(`/api/addresses/${id}`, addressForm);
  },

  async deleteAddress(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      await locationApi.deleteAddress(id);
      return { success: true, message: "Address deleted successfully." };
    } catch {
      return apiClient.delete<{ success: boolean; message?: string }>(`/api/addresses/${id}`);
    }
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
