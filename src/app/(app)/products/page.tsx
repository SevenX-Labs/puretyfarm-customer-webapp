import type { Metadata } from "next";
import { ProductsView } from "@/features/products/ProductsView";

export const metadata: Metadata = {
  title: "Products | PuretyFarm",
  description: "Pure A2 Gir cow milk, delivered fresh from the farm every morning.",
};

export default function ProductsPage() {
  return <ProductsView />;
}
