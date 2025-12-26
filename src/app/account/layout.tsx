
'use client';
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { OwnerDashboardSidebar } from "../owner-dashboard/sidebar";

// This is a generic layout for account management that could be used by any role.
// It might need more logic to show the correct sidebar based on the user's primary role.

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-row bg-muted/40">
        {/* For simplicity, we assume an owner context for the sidebar,
            a real app might need a more dynamic sidebar based on user role */}
        <OwnerDashboardSidebar />
      <div className="flex flex-col flex-1 h-full">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 overflow-y-auto">
            {children}
        </main>
      </div>
    </div>
  );
}
