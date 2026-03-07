
'use client';

import { Suspense } from 'react';
import { GuestManagement } from '@/components/dashboard/guest-management';
import { Loader2 } from 'lucide-react';

export default function GuestsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold font-headline">Guest Management</h1>
          <p className="text-muted-foreground">
            Build, manage, and communicate with your guest list for your assigned events.
          </p>
        </div>
      </header>

      <main className="flex-1 mt-6 overflow-y-auto">
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8" /></div>}>
          <GuestManagement />
        </Suspense>
      </main>
    </div>
  );
}
