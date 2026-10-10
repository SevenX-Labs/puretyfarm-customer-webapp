export type OnboardingStatus =
  | "profile_pending"
  | "location_pending"
  | "plan_pending"
  | "complete";

export interface User {
  id: string;
  phone: string; // E.164 normalized, e.g. +919876543210
  name: string;
  email?: string;
  whatsappNumber?: string;
  avatarUrl?: string; // Profile image URL or optimized data URL
  gender?: string;
  dob?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OtpRecord {
  phone: string;
  codeHash: string;
  expiresAt: number; // Unix timestamp ms
  attempts: number;
  lastSentAt: number; // For cooldown enforcement
  createdAt: number;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  street: string; // House/Flat No, Building, Street
  locality: string; // Area/Locality
  landmark?: string;
  city: string;
  pincode: string;
  addressType?: "Home" | "Work" | "Other";
  isDefault: boolean;
  isServiceable: boolean;
  createdAt: string;
}

export interface ServiceArea {
  id: string;
  pincode: string; // 6-digit PIN
  areaName: string; // Locality / Colony
  city: string;
  active: boolean;
}

export interface WaitlistRequest {
  id: string;
  phone: string;
  pincode: string;
  locality?: string;
  createdAt: string;
}

export type OrderStatus =
  | "Placed"
  | "Confirmed"
  | "Out for delivery"
  | "Delivered"
  | "Cancelled";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress: {
    fullName: string;
    phone: string;
    alternatePhone?: string;
    street: string;
    locality: string;
    city: string;
    pincode: string;
    addressType?: string;
  };
  deliveryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: "trial" | "monthly" | "single";
  planName: string;
  price: number;
  status: "active" | "paused" | "cancelled";
  dailyQuantity: string;
  nextDeliveryDate: string;
  startedAt: string;
  updatedAt: string;
}

/**
 * Derives a user's exact onboarding status from concrete business data:
 * 1. "profile_pending"   -> Profile name is missing or incomplete
 * 2. "location_pending"  -> Profile complete, but no serviceable delivery address saved
 * 3. "plan_pending"      -> Serviceable address saved, but no plan selected / order placed
 * 4. "complete"          -> Plan selected / active subscription or placed order
 */
export function deriveOnboardingStatus(
  user: User | null,
  addresses: Address[],
  orders: Order[],
  subscription: Subscription | null
): OnboardingStatus {
  if (!user || !user.name || !user.name.trim()) {
    return "profile_pending";
  }

  // Must have at least one address that is marked serviceable
  const hasServiceableAddress = addresses.some(
    (addr) => addr.isServiceable !== false
  );
  if (!hasServiceableAddress || addresses.length === 0) {
    return "location_pending";
  }

  // Must have selected an initial plan or placed an order
  const hasPlan =
    (subscription && subscription.status !== "cancelled") || orders.length > 0;
  if (!hasPlan) {
    return "plan_pending";
  }

  return "complete";
}
