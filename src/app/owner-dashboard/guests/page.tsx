'use client';

import { Suspense } from 'react';
import { GuestManagement } from '@/components/dashboard/guest-management';

function GuestsPageContent() {
  return (
    <div className="h-full flex flex-col">
       <header className="pb-4 border-b">
        <div>
            <h1 className="text-3xl font-bold font-headline">Guest Management</h1>
            <p className="text-muted-foreground">Build, manage, and communicate with your guest list.</p>
        </div>
      </header>
      <div className='flex-1 mt-6'>
         <GuestManagement />
      </div>
    </div>
  );
}

export default function GuestsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GuestsPageContent />
        </Suspense>
    )
}
