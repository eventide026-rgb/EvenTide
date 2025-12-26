
'use client';

import dynamic from 'next/dynamic';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';

// ✅ Explicitly select the named export
const OwnerDashboardSidebar = dynamic(
  () =>
    import('@/components/layout/owner-sidebar').then(
      (mod) => mod.OwnerDashboardSidebar
    ),
  { ssr: false }
);

export default function OwnerDashboardLayout({
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
