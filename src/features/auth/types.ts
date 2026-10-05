export type AuthStep = "phone" | "otp" | "onboarding";

export interface SendOtpRequest {
  phone: string;
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
  phone: string;
  code: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  isNewUser?: boolean;
  onboardingStep?: "profile_pending" | "location_pending" | "plan_pending" | "complete";
  user?: {
    id: string;
    phone: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
  };
  error?: string;
}

export interface UpdateProfileRequest {
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message?: string;
  onboardingStep?: "profile_pending" | "location_pending" | "plan_pending" | "complete";
  user?: {
    id: string;
    phone: string;
    name: string;
    email: string;
    avatarUrl: string;
    createdAt?: string;
  };
  error?: string;
}
