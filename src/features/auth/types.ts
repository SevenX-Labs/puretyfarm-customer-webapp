export type AuthStep = "phone" | "otp" | "onboarding";

export interface CustomerUser {
  id: string;
  mobile: string;
  phone?: string;
  name?: string;
  email?: string | null;
  emailVerified: boolean;
  role: "CUSTOMER" | string;
  avatarUrl?: string;
  gender?: string;
  dob?: string;
  createdAt?: string;
  updatedAt?: string;
  onboardingStep?: "profile_pending" | "location_pending" | "plan_pending" | "complete";
}

export interface SendOtpRequest {
  mobile?: string;
  phone?: string;
}

export interface SendOtpResponse {
  success: boolean;
  message?: string;
  cooldownSeconds?: number;
  remainingCooldown?: number;
  devOtpHint?: string;
  error?: string;
}

export interface VerifyOtpRequest {
  mobile?: string;
  otp?: string;
  phone?: string;
  code?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  isNewUser?: boolean;
  onboardingStep?: "profile_pending" | "location_pending" | "plan_pending" | "complete";
  user?: CustomerUser;
  error?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  message?: string;
  error?: string;
}

export interface SendEmailOtpRequest {
  email: string;
}

export interface SendEmailOtpResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface VerifyEmailOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyEmailOtpResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  whatsappNumber?: string;
  avatarUrl?: string;
  gender?: string;
  dob?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message?: string;
  onboardingStep?: "profile_pending" | "location_pending" | "plan_pending" | "complete";
  user?: CustomerUser;
  error?: string;
}
