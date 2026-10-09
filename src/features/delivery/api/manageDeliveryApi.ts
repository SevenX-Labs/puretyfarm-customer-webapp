import { apiClient } from "@/lib/api/client";
import {
  ManageDeliveryResponse,
  SkipDeliveryPayload,
  PauseDeliveryPayload,
  ChangeQuantityPayload,
  ChangeFrequencyPayload,
  ChangePlanPayload,
  ChangeSchedulePayload,
  DeliveryRequestItem,
} from "../types";

export const manageDeliveryApi = {
  /**
   * 1. Get active plan and upcoming delivery schedule
   * GET /api/v1/customer/manage-delivery
   */
  async getManageDelivery(): Promise<ManageDeliveryResponse> {
    const res = await apiClient.get<any>("/api/v1/customer/manage-delivery");
    return res;
  },

  /**
   * 2. Skip a specific delivery date
   * POST /api/v1/customer/manage-delivery/skip
   */
  async skipDelivery(
    payload: SkipDeliveryPayload
  ): Promise<{ success: boolean; message: string; delivery?: any }> {
    return apiClient.post("/api/v1/customer/manage-delivery/skip", payload);
  },

  /**
   * 3. Pause upcoming deliveries (Vacation mode)
   * POST /api/v1/customer/manage-delivery/pause
   */
  async pauseDelivery(
    payload: PauseDeliveryPayload
  ): Promise<{ success: boolean; message: string; request?: any }> {
    return apiClient.post("/api/v1/customer/manage-delivery/pause", payload);
  },

  /**
   * 4. Change daily quantity (Litres) for all future deliveries
   * POST /api/v1/customer/manage-delivery/change-quantity
   */
  async changeQuantity(
    payload: ChangeQuantityPayload
  ): Promise<{ success: boolean; message: string; request?: any }> {
    return apiClient.post(
      "/api/v1/customer/manage-delivery/change-quantity",
      payload
    );
  },

  /**
   * 5. Change frequency (Daily, Alternate days, etc.)
   * POST /api/v1/customer/manage-delivery/change-frequency
   */
  async changeFrequency(
    payload: ChangeFrequencyPayload
  ): Promise<{ success: boolean; message: string; request?: any }> {
    return apiClient.post(
      "/api/v1/customer/manage-delivery/change-frequency",
      payload
    );
  },

  /**
   * 6. Change plan
   * POST /api/v1/customer/manage-delivery/change-plan
   */
  async changePlan(
    payload: ChangePlanPayload
  ): Promise<{ success: boolean; message: string; request?: any }> {
    return apiClient.post("/api/v1/customer/manage-delivery/change-plan", payload);
  },

  /**
   * 7. Change complete schedule
   * POST /api/v1/customer/manage-delivery/change-schedule
   */
  async changeSchedule(
    payload: ChangeSchedulePayload
  ): Promise<{ success: boolean; message: string; request?: any }> {
    return apiClient.post(
      "/api/v1/customer/manage-delivery/change-schedule",
      payload
    );
  },

  /**
   * 8. List customer change requests
   * GET /api/v1/customer/manage-delivery/requests
   */
  async getRequests(): Promise<{ data: DeliveryRequestItem[] }> {
    const res = await apiClient.get<any>(
      "/api/v1/customer/manage-delivery/requests"
    );
    if (res && Array.isArray(res.data)) return res;
    if (Array.isArray(res)) return { data: res };
    return { data: [] };
  },

  /**
   * 9. Get specific change request
   * GET /api/v1/customer/manage-delivery/requests/:requestId
   */
  async getRequest(requestId: string): Promise<DeliveryRequestItem> {
    return apiClient.get<DeliveryRequestItem>(
      `/api/v1/customer/manage-delivery/requests/${requestId}`
    );
  },
};
