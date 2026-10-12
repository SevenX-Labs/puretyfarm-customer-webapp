import { apiClient } from "@/lib/api/client";
import { profileApi } from "@/features/profile/api/profileApi";
import { locationApi } from "@/features/location/api/locationApi";
import { ordersApi } from "@/features/orders";
import { manageDeliveryApi } from "@/features/delivery";
import type { ListOrdersParams } from "@/features/orders/types";
import { Subscription } from "@/types/models";
import {
  OrdersResponse,
  OrderResponse,
  AddressesResponse,
  AddressResponse,
  SubscriptionResponse,
  AddressFormData,
} from "../types";

export const accountApi = {
  async getOrders(params?: ListOrdersParams): Promise<OrdersResponse> {
    // Backend is the single source of truth for order history.
    // Default limit 100 ensures all active and past orders (including completed/delivered) are fetched.
    const limit = params?.limit ?? 100;
    const res = await ordersApi.listOrders({ limit, ...params });
    let ordersList = (res?.data || []) as any[];
    const totalPages = res?.pagination?.totalPages ?? 1;

    // Fetch remaining pages if more than 100 orders exist
    if (totalPages > 1 && !params?.page) {
      const extraPromises = [];
      for (let p = 2; p <= totalPages && p <= 5; p++) {
        extraPromises.push(ordersApi.listOrders({ limit, page: p, ...params }));
      }
      const extraResults = await Promise.all(extraPromises);
      for (const extra of extraResults) {
        if (extra?.data && Array.isArray(extra.data)) {
          ordersList = ordersList.concat(extra.data);
        }
      }
    }

    return {
      success: true,
      orders: ordersList,
      pendingPlanPurchases: res?.pendingPlanPurchases || [],
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
    try {
      const [manageRes, ordersRes] = await Promise.allSettled([
        manageDeliveryApi.getManageDelivery(),
        ordersApi.listOrders(),
      ]);

      const res = manageRes.status === "fulfilled" ? manageRes.value : null;
      const orders = ordersRes.status === "fulfilled" ? ordersRes.value?.data || [] : [];

      if (res && res.activePlan) {
        const plan = res.activePlan;
        const rawType = (plan.planType || "").toUpperCase();
        const planId =
          rawType === "BUY_ONCE"
            ? "single"
            : rawType === "SEVEN_DAY_TRIAL" || rawType === "TRIAL"
            ? "trial"
            : "monthly";
        const planName =
          rawType === "BUY_ONCE"
            ? "Buy Once (1 Litre Sample)"
            : rawType === "SEVEN_DAY_TRIAL" || rawType === "TRIAL"
            ? "7-Day Trial Plan"
            : "Monthly Subscription";
        const nextDelivery =
          res.upcomingDeliveries?.[0]?.date || plan.startDate || "";
        const nextDeliveryDate = nextDelivery
          ? new Date(nextDelivery).toISOString().split("T")[0]
          : "";

        // Resolve dynamic actual price from matched order / upcoming delivery instead of hardcoding
        const relevantOrder = orders.find(
          (o: any) => o.planSelectionId === plan.selectionId || o.planDeliveryId
        ) || orders[0];

        let price: number;
        if (relevantOrder && relevantOrder.totalPaise != null) {
          price = relevantOrder.totalPaise / 100;
        } else if (res.upcomingDeliveries?.[0]?.expectedAmountPaise != null) {
          price = res.upcomingDeliveries[0].expectedAmountPaise / 100;
        } else {
          price =
            rawType === "BUY_ONCE"
              ? 100
              : rawType === "SEVEN_DAY_TRIAL" || rawType === "TRIAL"
              ? 665
              : 2700;
        }

        const frequencyStr = (plan.frequency || "").toUpperCase();
        const dailyQuantity =
          rawType === "BUY_ONCE"
            ? `${plan.quantityLitres || 1}L Sample Bottle`
            : frequencyStr === "ALTERNATE_DAYS"
            ? `${plan.quantityLitres || plan.quantityA || 1}L Alternate Days`
            : `${plan.quantityLitres || 1}L Daily`;

        const sub: Subscription = {
          id: plan.selectionId,
          userId: "",
          planId,
          planType: rawType,
          billingModel: plan.billingModel,
          frequency: plan.frequency,
          planName,
          price,
          status:
            plan.status === "ACTIVE" || plan.status === "CONFIRMED"
              ? "active"
              : "paused",
          dailyQuantity,
          nextDeliveryDate: nextDeliveryDate,
          deliveryStartTime: plan.deliveryStartTime ?? null,
          deliveryEndTime: plan.deliveryEndTime ?? null,
          startedAt: plan.startDate || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { success: true, subscription: sub };
      }
      return { success: true, subscription: null };
    } catch {
      return { success: true, subscription: null };
    }
  },

  async updateSubscriptionStatus(
    status: "active" | "paused"
  ): Promise<SubscriptionResponse> {
    try {
      if (status === "paused") {
        await manageDeliveryApi.pauseDelivery({});
      }
      return this.getSubscription();
    } catch (e: any) {
      return { success: false, error: e?.message || "Could not update status", subscription: null };
    }
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
    whatsappNumber?: string;
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
        whatsappNumber: payload.whatsappNumber,
      });

      if (payload.avatarUrl && payload.avatarUrl.startsWith("data:image/")) {
        try {
          await profileApi.uploadAvatarFromDataUrl(payload.avatarUrl);
        } catch (avatarErr) {
          console.warn("Avatar upload after saveProfile failed:", avatarErr);
        }
      }

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
