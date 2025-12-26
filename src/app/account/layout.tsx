
'use client';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { usePathname } from "next/navigation";
import { OwnerDashboardSidebar } from "../owner-dashboard/sidebar"; // Assuming you extract it

// This is a generic layout for account management that could be used by any role.
// It might need more logic to show the correct sidebar based on the user's primary role.

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isOwnerDashboard = pathname.startsWith('/owner-dashboard');

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        {/* For simplicity, we assume an owner context for the sidebar,
            a real app might need a more dynamic sidebar based on user role */}
        {isOwnerDashboard ? <OwnerDashboardSidebar /> : null}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <DashboardHeader />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
        </main>
      </div>
    </div>
  );
}
