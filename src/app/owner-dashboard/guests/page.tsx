
'use client';

import { Suspense } from 'react';
import { GuestManagement } from '@/components/dashboard/guest-management';
import { Loader2 } from 'lucide-react';

export default function GuestsPage() {
  return (
    <div className="space-y-6">
      <header className="pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold font-headline">Guest Management</h1>
          <p className="text-muted-foreground">
            Build, manage, and communicate with your guest list.
          </p>
        </div>
      </header>

      <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
        <GuestManagement />
      </Suspense>
    </div>
  );
}
