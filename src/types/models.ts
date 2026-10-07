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
