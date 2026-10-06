import { Address, Order, Subscription } from "@/types/models";

export type AccountTab =
  | "profile"
  | "preferences"
  | "security"
  | "activity"
  | "orders"
  | "addresses"
  | "subscription";

export interface AddressFormData {
  fullName: string;
  phone: string;
  street: string;
  locality: string;
  landmark: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
  error?: string;
}

export interface OrderResponse {
  success: boolean;
  order: Order;
  message?: string;
  error?: string;
}

export interface AddressesResponse {
  success: boolean;
  addresses: Address[];
  error?: string;
}

export interface AddressResponse {
  success: boolean;
  address: Address;
  message?: string;
  error?: string;
}

export interface SubscriptionResponse {
  success: boolean;
  subscription: Subscription | null;
  error?: string;
}
