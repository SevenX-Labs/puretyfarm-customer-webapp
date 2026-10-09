import type { Metadata } from "next";
import { PlanView } from "@/features/plans/PlanView";

export const metadata: Metadata = {
  title: "My Milk Plan | PuretyFarm",
  description: "Manage, pause, or change your daily A2 milk subscription.",
};

export default function PlanPage() {
  return <PlanView />;
}
