import { AppShell } from "@/components/pf/layout/AppShell";

export default function AppRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
