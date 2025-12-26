
'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { OwnerDashboardSidebar } from '@/components/layout/owner-sidebar';

export default function OwnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full flex-row bg-muted/40 overflow-hidden">
        <OwnerDashboardSidebar />
        <div className="flex flex-col flex-1">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
