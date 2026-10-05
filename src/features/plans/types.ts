import { IconType } from "react-icons";

export interface PlanFeature {
  text: string;
  icon: IconType;
}

export interface PlanOrderItemPayload {
  id: string;
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

export interface PlanDefinition {
  id: "trial" | "monthly" | "single";
  name: string;
  badge: string;
  quantity: string;
  price: number;
  originalPrice: number | null;
  savingsText: string | null;
  rateText: string;
  periodLabel: string;
  description: string;
  icon: IconType;
  gradient: string;
  borderColor: string;
  features: PlanFeature[];
  highlighted: boolean;
  ctaText: string;
  // Payload used when creating an order/sample order
  orderItem: PlanOrderItemPayload;
}
