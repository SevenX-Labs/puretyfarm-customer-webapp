import { AppShell } from "@/components/pf/layout/AppShell";
import { RealtimeProvider } from "@/context/RealtimeContext";

export default function AppRouteGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RealtimeProvider>
      <AppShell>{children}</AppShell>
    </RealtimeProvider>
  );
}
