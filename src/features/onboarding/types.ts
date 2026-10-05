import { Address } from "@/types/models";

export type StepKey = 1 | 2 | 3;

export interface ServiceCheckResult {
  performed: boolean;
  serviceable: boolean;
  areaName?: string;
  pincode?: string;
  reason?: string;
}

export interface AddressDetailsFormData {
  houseNo: string;
  street: string;
  locality: string;
  landmark: string;
  addressType: "Home" | "Work" | "Other";
  receiverName: string;
  alternatePhone: string;
}

export interface ServiceabilityCheckRequest {
  lat?: number;
  lng?: number;
  pincode?: string;
  addressText?: string;
}

export interface ServiceabilityCheckResponse {
  success: boolean;
  serviceable: boolean;
  areaName?: string;
  pincode?: string;
  formattedAddress?: string;
  reason?: string;
  error?: string;
}

export interface SaveAddressRequest {
  fullName: string;
  phone: string;
  alternatePhone?: string;
  street: string;
  locality: string;
  landmark?: string;
  city: string;
  pincode: string;
  addressType: "Home" | "Work" | "Other";
  isDefault: boolean;
}

export interface SaveAddressResponse {
  success: boolean;
  address: Address;
  message?: string;
  error?: string;
}

export interface CompletePlanRequest {
  planId: string;
  addressId: string;
}

export interface CompletePlanResponse {
  success: boolean;
  message?: string;
  order?: unknown;
  redirectStep?: string;
  error?: string;
}
