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

export type PlanType = "BUY_ONCE" | "SEVEN_DAY_TRIAL" | "MONTHLY";

export interface OrderItem {
  id?: string;
  name?: string;
  productNameSnapshot?: string;
  quantity: number;
  unitPricePaise?: number;
  discountPaise?: number;
  taxPaise?: number;
  totalPaise?: number;
  price?: number; // legacy fallback in rupees
  unit?: string;  // legacy fallback
}

export interface AddressSnapshot {
  fullName?: string;
  mobile?: string;
  phone?: string;
  houseNumber?: string;
  buildingName?: string;
  streetName?: string;
  street?: string;
  locality?: string;
  landmark?: string;
  city?: string;
  pincode?: string;
  addressType?: string;
  alternatePhone?: string;
}

export interface OrderInvoiceSummary {
  invoiceNumber: string;
  issuedAt: string;
}

export interface OrderInvoiceDetail {
  invoiceNumber: string;
  orderNumber: string;
  issuedAt: string;
  financialSnapshot: {
    subtotalPaise: number;
    deliveryFeePaise: number;
    totalPaise: number;
    discountPaise?: number;
    taxPaise?: number;
    items?: OrderItem[];
  };
  addressSnapshot: AddressSnapshot;
}

export interface CustomerOrder {
  id: string;
  orderNumber?: string;
  planType?: PlanType | string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus | string;
  items: OrderItem[];
  subtotalPaise?: number;
  discountPaise?: number;
  taxPaise?: number;
  deliveryFeePaise?: number;
  totalPaise?: number;
  totalAmount?: number; // legacy fallback
  deliveryDate?: string;
  deliveryStartTime?: string;
  deliveryEndTime?: string;
  addressSnapshot?: AddressSnapshot;
  deliveryAddress?: AddressSnapshot; // legacy fallback
  invoice?: OrderInvoiceSummary;
  reorderedFromOrderId?: string | null;
  /** Server-stamped completion time; present only for COMPLETED orders. */
  completedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
}

export interface ListOrdersParams {
  status?: OrderStatus;
  planType?: PlanType;
  startDate?: string;
  endDate?: string;
  orderNumber?: string;
  page?: number;
  limit?: number;
}

export interface ListOrdersResponse {
  data: CustomerOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateOrderPayload {
  planDeliveryId: string;
  addressId: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message?: string;
  order: CustomerOrder;
}

export interface ReorderPayload {
  addressId?: string;
}

export interface ReorderResponse {
  success: boolean;
  message?: string;
  order: CustomerOrder;
}

export interface PayOrderPayload {
  paymentMethod: "WALLET";
}

export interface PayOrderResponse {
  success: boolean;
  orderId: string;
  paymentMethod: "WALLET";
  paymentStatus: "PAID";
  orderStatus: "CONFIRMED";
  message?: string;
}
