import { Metadata } from "next";
import { EmptyStateContent } from "@/components/ui/EmptyStateContent";

export const metadata: Metadata = {
  title: "Delivery Coverage Status",
  description:
    "PuretyFarm A2 Cow Milk delivery coverage and empty state inquiry page.",
};

export default function EmptyStatePage() {
  return <EmptyStateContent />;
}
