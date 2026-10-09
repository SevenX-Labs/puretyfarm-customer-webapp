import type { Metadata } from "next";
import { DeliveryView } from "@/features/delivery/DeliveryView";

export const metadata: Metadata = {
  title: "Delivery | PuretyFarm",
  description: "Your delivery address, schedule, and preferences.",
};

export default function DeliveryPage() {
  return <DeliveryView />;
}
