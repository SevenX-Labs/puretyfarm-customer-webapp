import type { Metadata } from "next";
import { OrdersView } from "@/features/orders";

export const metadata: Metadata = {
  title: "My Orders | PuretyFarm",
  description: "View and manage your PuretyFarm deliveries.",
};

export default function OrdersPage() {
  return <OrdersView />;
}
