export type DeliveryFrequency = "daily" | "alternate";
export type DeliveryMode = "fixed" | "pattern";

export interface PricingOptions {
  frequency: DeliveryFrequency;
  mode: DeliveryMode;
  fixedLitres?: number;
  day1Litres?: number;
  day2Litres?: number;
}

export interface PricingResult {
  frequency: DeliveryFrequency;
  mode: DeliveryMode;
  totalDeliveries: number;
  totalLitres: number;
  pricePerLitre: number;
  totalPrice: number;
  breakdownText: string;
  oddDeliveriesCount: number;
  evenDeliveriesCount: number;
  day1Litres: number;
  day2Litres: number;
  fixedLitres: number;
  isValid: boolean;
  validationError?: string;
}

/**
 * Payload sent to backend upon confirming customization
 * Note: Backend must recompute and re-validate the 1-5L range.
 * Client total is kept for display/verification reference only.
 */
export interface SubscriptionCustomizationPayload {
  frequency: DeliveryFrequency;
  mode: DeliveryMode;
  fixedLitres?: number;
  day1Litres?: number;
  day2Litres?: number;
  clientTotalAmount: number;
  clientTotalLitres: number;
  updatedAt: string;
}

export interface SubscriptionDraft {
  frequency: DeliveryFrequency;
  mode: DeliveryMode;
  fixedLitres: number;
  day1Litres: number;
  day2Litres: number;
  updatedAt: string;
}

export interface DeliveryDatePreviewItem {
  deliveryNumber: number;
  formattedDate: string;
  litres: number;
}
