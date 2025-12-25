
'use client';

import { BroadcastClient } from '@/components/broadcast-client';

export default function AnnouncementsPage() {
  return (
    <div className="space-y-6">
       <header className="pb-4 border-b">
        <div>
            <h1 className="text-3xl font-bold font-headline">Broadcast Center</h1>
            <p className="text-muted-foreground">Send real-time announcements to your event guests.</p>
        </div>
      </header>
      <div className='flex-1 mt-6'>
         <BroadcastClient />
      </div>
    </div>
  );
}
