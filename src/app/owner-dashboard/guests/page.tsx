
'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamic import for heavy guest management component
const GuestManagement = dynamic(() => import('@/components/dashboard/guest-management').then(mod => mod.GuestManagement), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
});

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

      {/* GuestManagement handles its own internal layout and cards */}
      <GuestManagement />
    </div>
  );
}
