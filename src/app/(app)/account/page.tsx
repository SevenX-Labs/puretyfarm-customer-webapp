import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountLandingView } from "@/features/account/AccountLandingView";

export const metadata: Metadata = {
  title: "Account | PuretyFarm",
  description: "Manage your PuretyFarm profile, delivery, and preferences.",
};

const TAB_REDIRECTS: Record<string, string> = {
  orders: "/orders",
  subscription: "/plan",
  wallet: "/wallet",
  addresses: "/account-settings?tab=addresses",
  profile: "/account-settings?tab=profile",
  preferences: "/account-settings?tab=preferences",
  security: "/account-settings?tab=security",
  activity: "/account-settings?tab=activity",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tab = typeof params.tab === "string" ? params.tab : undefined;
  if (tab && TAB_REDIRECTS[tab]) {
    redirect(TAB_REDIRECTS[tab]);
  }
  return <AccountLandingView />;
}
