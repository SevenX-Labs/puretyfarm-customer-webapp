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

const MANAGE_DELIVERY_TTL_MS = 30 * 1000; // 30s cache
let cachedManageDelivery: { data: ManageDeliveryResponse | null; expiresAt: number } | null = null;
let manageDeliveryPromise: Promise<ManageDeliveryResponse | null> | null = null;

export const manageDeliveryApi = {
  /**
   * Clear in-memory delivery cache
   */
  clearCache(): void {
    cachedManageDelivery = null;
    manageDeliveryPromise = null;
  },

  /**
   * 1. Get active plan and upcoming delivery schedule
   * GET /api/v1/customer/manage-delivery
   */
  async getManageDelivery(forceRefresh = false): Promise<ManageDeliveryResponse> {
    const now = Date.now();
    if (!forceRefresh && cachedManageDelivery && cachedManageDelivery.expiresAt > now) {
      return (cachedManageDelivery.data || { activePlan: null as any, upcomingDeliveries: [] }) as ManageDeliveryResponse;
    }
    if (!forceRefresh && manageDeliveryPromise) {
      return (await manageDeliveryPromise) as ManageDeliveryResponse;
    }

    manageDeliveryPromise = apiClient
      .get<ManageDeliveryResponse>("/api/v1/customer/manage-delivery")
      .then((res) => {
        cachedManageDelivery = { data: res, expiresAt: Date.now() + MANAGE_DELIVERY_TTL_MS };
        return res;
      })
      .catch((err: any) => {
        // When customer has no active subscription, backend returns 404.
        // Return null/empty plan gracefully without throwing
        if (err?.status === 404 || err?.statusCode === 404) {
          const empty: ManageDeliveryResponse = { activePlan: null as any, upcomingDeliveries: [] };
          cachedManageDelivery = { data: empty, expiresAt: Date.now() + MANAGE_DELIVERY_TTL_MS };
          return empty;
        }
        throw err;
      })
      .finally(() => {
        manageDeliveryPromise = null;
      });

    return (await manageDeliveryPromise) as ManageDeliveryResponse;
  },

  /**
   * 2. Skip a specific delivery date
   * POST /api/v1/customer/manage-delivery/skip
   */
  async skipDelivery(
    payload: SkipDeliveryPayload
  ): Promise<{ success: boolean; message: string; delivery?: any }> {
    const res = await apiClient.post<{ success: boolean; message: string; delivery?: any }>(
      "/api/v1/customer/manage-delivery/skip",
      payload
    );
    cachedManageDelivery = null;
    return res;
  },

  /**
   * 3. Request a pause (Vacation mode).
   * POST /api/v1/customer/manage-delivery/pause
   *
   * Approval-gated: this creates a PENDING change request and does not change
   * the live plan. The response carries the created request.
   */
  async pauseDelivery(
    payload: PauseDeliveryPayload
  ): Promise<{ success: boolean; message: string; request?: any }> {
    const res = await apiClient.post<{ success: boolean; message: string; request?: any }>(
      "/api/v1/customer/manage-delivery/pause",
      payload
    );
    cachedManageDelivery = null;
    return res;
  },

  /**
   * 3b. Request a resume for a PAUSED plan.
   * POST /api/v1/customer/manage-delivery/resume
   */
  async resumeDelivery(): Promise<{
    success: boolean;
    message: string;
    request?: any;
  }> {
    const res = await apiClient.post<{ success: boolean; message: string; request?: any }>(
      "/api/v1/customer/manage-delivery/resume",
      {}
    );
    cachedManageDelivery = null;
    return res;
  },

  /**
   * 4. Change daily quantity (Litres) for all future deliveries
   * POST /api/v1/customer/manage-delivery/change-quantity
   */
  async changeQuantity(
    payload: ChangeQuantityPayload
  ): Promise<{ success: boolean; message: string; request?: any }> {
    const res = await apiClient.post<{ success: boolean; message: string; request?: any }>(
      "/api/v1/customer/manage-delivery/change-quantity",
      payload
    );
    cachedManageDelivery = null;
    return res;
  },

  /**
   * 5. Change frequency (Daily, Alternate days, etc.)
   * POST /api/v1/customer/manage-delivery/change-frequency
   */
  async changeFrequency(
    payload: ChangeFrequencyPayload
  ): Promise<{ success: boolean; message: string; request?: any }> {
    const res = await apiClient.post<{ success: boolean; message: string; request?: any }>(
      "/api/v1/customer/manage-delivery/change-frequency",
      payload
    );
    cachedManageDelivery = null;
    return res;
  },

  /**
   * 6. Change plan
   * POST /api/v1/customer/manage-delivery/change-plan
   */
  async changePlan(
    payload: ChangePlanPayload
  ): Promise<{ success: boolean; message: string; request?: any }> {
    const res = await apiClient.post<{ success: boolean; message: string; request?: any }>(
      "/api/v1/customer/manage-delivery/change-plan",
      payload
    );
    cachedManageDelivery = null;
    return res;
  },

  /**
   * 7. Change complete schedule
   * POST /api/v1/customer/manage-delivery/change-schedule
   */
  async changeSchedule(
    payload: ChangeSchedulePayload
  ): Promise<{ success: boolean; message: string; request?: any }> {
    const res = await apiClient.post<{ success: boolean; message: string; request?: any }>(
      "/api/v1/customer/manage-delivery/change-schedule",
      payload
    );
    cachedManageDelivery = null;
    return res;
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
