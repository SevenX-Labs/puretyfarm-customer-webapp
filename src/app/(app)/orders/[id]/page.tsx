import type { Metadata } from "next";
import { OrderDetailView } from "@/features/orders";

export const metadata: Metadata = {
  title: "Order Details | PuretyFarm",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailView orderId={id} />;
}
