import { apiClient } from "@/lib/api/client";
import { refreshSession } from "@/lib/auth/refreshSession";
import { tokenStorage } from "@/lib/auth/tokenStorage";
import {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  RefreshTokenResponse,
  SendEmailOtpRequest,
  SendEmailOtpResponse,
  VerifyEmailOtpRequest,
  VerifyEmailOtpResponse,
  CustomerUser,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from "../types";

export const authApi = {
  /**
   * 3.1 Send Login OTP
   * Initiates customer login or registration by sending a 6-digit OTP to the mobile number.
   * Path: POST /api/v1/auth/customer/login
   */
  async sendOtp(payload: SendOtpRequest): Promise<SendOtpResponse> {
    const rawMobile = (payload.mobile || payload.phone || "").replace(/\D/g, "");
    const mobile = rawMobile.length === 10 ? rawMobile : (payload.mobile || payload.phone || "");

    try {
      const data = await apiClient.post<{ success?: boolean; message?: string }>(
        "/api/v1/auth/customer/login",
        { mobile },
        { skipAuth: true }
      );

      return {
        success: true,
        message: data?.message || "OTP sent successfully",
        cooldownSeconds: 60,
      };
    } catch (err: any) {
      const errorMsg =
        err?.data?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send OTP.";
      const message = Array.isArray(errorMsg) ? errorMsg.join(", ") : String(errorMsg);

      return {
        success: false,
        error: message,
        message,
        remainingCooldown: err?.status === 429 ? 60 : undefined,
      };
    }
  },

  /**
   * 3.2 Verify Login OTP
   * Validates submitted OTP, provisions or retrieves customer profile, issues JWT access & refresh tokens.
   * Path: POST /api/v1/auth/customer/verify-otp
   */
  async verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const rawMobile = (payload.mobile || payload.phone || "").replace(/\D/g, "");
    const mobile = rawMobile.length === 10 ? rawMobile : (payload.mobile || payload.phone || "");
    const otp = (payload.otp || payload.code || "").trim();

    try {
      const data = await apiClient.post<VerifyOtpResponse>(
        "/api/v1/auth/customer/verify-otp",
        { mobile, otp },
        { skipAuth: true }
      );

      if (data.accessToken && data.refreshToken) {
        tokenStorage.setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      }

      return {
        success: true,
        message: data.message || "Authentication successful",
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
        isNewUser: data.isNewUser === true,
        onboardingStep: data.onboardingStep || data.user?.onboardingStep,
      };
    } catch (err: any) {
      const errorMsg =
        err?.data?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Invalid or expired OTP";
      const message = Array.isArray(errorMsg) ? errorMsg.join(", ") : String(errorMsg);

      return {
        success: false,
        error: message,
        message,
      };
    }
  },

  /**
   * 3.3 Refresh Access Token
   * Rotates refresh token and issues new access token. Old refresh tokens are invalidated.
   * Path: POST /api/v1/auth/customer/refresh
   */
  async refreshToken(refreshTokenParam?: string): Promise<RefreshTokenResponse> {
    const token = refreshTokenParam || tokenStorage.getRefreshToken();
    if (!token) {
      throw new Error("No refresh token available");
    }
    if (token !== tokenStorage.getRefreshToken()) {
      throw new Error("The supplied refresh token is no longer current.");
    }
    await refreshSession();
    return {
      success: true,
      accessToken: tokenStorage.getAccessToken() || "",
      refreshToken: tokenStorage.getRefreshToken() || "",
    };
  },

  /**
   * 3.4 Get Authenticated Customer Profile
   * Returns current authenticated customer's profile.
   * Path: GET /api/v1/auth/customer/get-me
   */
  async getMe(): Promise<CustomerUser> {
    const accessToken = tokenStorage.getAccessToken();
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
    return apiClient.get<CustomerUser>("/api/v1/auth/customer/get-me", { headers });
  },

  /**
   * 3.5 Customer Logout
   * Revokes current session and invalidates refresh token.
   * Path: POST /api/v1/auth/customer/logout
   */
  async logout(): Promise<{ success: boolean; message?: string }> {
    try {
      const accessToken = tokenStorage.getAccessToken();
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
      await apiClient.post<{ success: boolean; message?: string }>(
        "/api/v1/auth/customer/logout",
        {},
        { headers }
      );
    } catch (err) {
      console.warn("Logout request:", err);
    } finally {
      tokenStorage.clearTokens();
    }
    return { success: true, message: "Logged out successfully" };
  },

  /**
   * 3.6 Send Email Verification OTP
   * Path: POST /api/v1/auth/customer/email-verification/send-otp
   */
  async sendEmailOtp(payload: SendEmailOtpRequest): Promise<SendEmailOtpResponse> {
    const accessToken = tokenStorage.getAccessToken();
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
    return apiClient.post<SendEmailOtpResponse>(
      "/api/v1/auth/customer/email-verification/send-otp",
      payload,
      { headers }
    );
  },

  /**
   * 3.7 Verify Email Verification OTP
   * Path: POST /api/v1/auth/customer/email-verification/verify-otp
   */
  async verifyEmailOtp(payload: VerifyEmailOtpRequest): Promise<VerifyEmailOtpResponse> {
    const accessToken = tokenStorage.getAccessToken();
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
    return apiClient.post<VerifyEmailOtpResponse>(
      "/api/v1/auth/customer/email-verification/verify-otp",
      payload,
      { headers }
    );
  },

  /**
   * Profile update helper for onboarding and account management
   */
  async updateProfile(payload: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    return apiClient.patch<UpdateProfileResponse>("/api/me", payload);
  },
};
