
'use client';
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { OwnerDashboardSidebar } from "@/components/layout/owner-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full flex-row bg-muted/40 overflow-hidden">
        <OwnerDashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
