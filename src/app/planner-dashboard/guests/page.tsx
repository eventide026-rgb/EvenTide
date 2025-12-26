'use client';

import { Suspense } from 'react';
import { GuestManagement } from '@/components/dashboard/guest-management';

export default function GuestsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header stays fixed at the top */}
      <header className="pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold font-headline">Guest Management</h1>
          <p className="text-muted-foreground">
            Build, manage, and communicate with your guest list for your assigned events.
          </p>
        </div>
      </header>

      {/* Main content scrolls if needed */}
      <main className="flex-1 mt-6 overflow-y-auto">
        <Suspense fallback={<div>Loading...</div>}>
          <GuestManagement />
        </Suspense>
      </main>
    </div>
  );
}
