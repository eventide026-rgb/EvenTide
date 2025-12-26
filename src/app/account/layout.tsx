
'use client';
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { OwnerDashboardSidebar } from "@/app/owner-dashboard/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-row bg-muted/40">
        <OwnerDashboardSidebar />
        <div className="flex flex-col flex-1 h-full">
          <DashboardHeader />
          <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 overflow-y-auto">
              {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
