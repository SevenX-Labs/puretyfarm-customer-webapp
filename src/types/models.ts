export type OnboardingStatus =
  | "profile_pending"
  | "location_pending"
  | "plan_pending"
  | "complete";

export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  whatsappNumber?: string;
  avatarUrl?: string;
  gender?: string;
  dob?: string;
  onboardingStep?: OnboardingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  street: string;
  locality: string;
  landmark?: string;
  city: string;
  pincode: string;
  addressType?: "Home" | "Work" | "Other";
  isDefault: boolean;
  isServiceable: boolean;
  createdAt: string;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED"
  | "Placed"
  | "Confirmed"
  | "Out for delivery"
  | "Delivered"
  | "Cancelled";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export interface OrderItem {
  id?: string;
  name?: string;
  productNameSnapshot?: string;
  quantity: number;
  price?: number;
  unit?: string;
  unitPricePaise?: number;
  discountPaise?: number;
  taxPaise?: number;
  totalPaise?: number;
}

export interface AddressSnapshot {
  fullName?: string;
  phone?: string;
  mobile?: string;
  alternatePhone?: string;
  houseNumber?: string;
  buildingName?: string;
  streetName?: string;
  street?: string;
  locality?: string;
  landmark?: string;
  city?: string;
  pincode?: string;
  addressType?: string;
}

export interface Order {
  id: string;
  userId?: string;
  orderNumber?: string;
  planType?: "BUY_ONCE" | "SEVEN_DAY_TRIAL" | "MONTHLY" | string;
  items: OrderItem[];
  totalAmount?: number;
  subtotalPaise?: number;
  discountPaise?: number;
  taxPaise?: number;
  deliveryFeePaise?: number;
  totalPaise?: number;
  status: OrderStatus;
  paymentStatus?: PaymentStatus | string;
  deliveryAddress?: AddressSnapshot;
  addressSnapshot?: AddressSnapshot;
  deliveryDate?: string;
  deliveryStartTime?: string;
  deliveryEndTime?: string;
  invoice?: {
    invoiceNumber: string;
    issuedAt: string;
  };
  reorderedFromOrderId?: string | null;
  /** Server-stamped completion time; present only for COMPLETED orders. */
  completedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
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
  /**
   * Saved delivery window for the active plan, 24h "HH:MM". Null/absent means
   * the backend has none configured — show that, never a substitute time.
   */
  deliveryStartTime?: string | null;
  deliveryEndTime?: string | null;
  startedAt: string;
  updatedAt: string;
}

export interface ServiceArea {
  id: string;
  pincode: string;
  areaName: string;
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
