import { OrderConfirmationView } from "@/features/orders/OrderConfirmationView";

export const metadata = {
  title: "Order Confirmed - Purety Farm",
  description: "Your pure morning A2 milk delivery is confirmed.",
};

export default function OrderConfirmationPage() {
  return <OrderConfirmationView />;
}
