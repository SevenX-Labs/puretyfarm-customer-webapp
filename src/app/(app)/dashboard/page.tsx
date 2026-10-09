import type { Metadata } from "next";
import { DashboardView } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "Dashboard | PuretyFarm",
  description:
    "Your PuretyFarm home — see your next A2 milk delivery, current plan, and recent orders.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
