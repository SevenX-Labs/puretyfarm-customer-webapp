import { apiClient } from "@/lib/api/client";
import {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from "../types";

export const authApi = {
  async sendOtp(payload: SendOtpRequest): Promise<SendOtpResponse> {
    return apiClient.post<SendOtpResponse>("/api/auth/send-otp", payload);
  },

  async verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    return apiClient.post<VerifyOtpResponse>("/api/auth/verify-otp", payload);
  },

  async updateProfile(payload: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    return apiClient.patch<UpdateProfileResponse>("/api/me", payload);
  },

  async logout(): Promise<{ success: boolean; message?: string }> {
    return apiClient.post<{ success: boolean; message?: string }>("/api/auth/logout");
  },
};
