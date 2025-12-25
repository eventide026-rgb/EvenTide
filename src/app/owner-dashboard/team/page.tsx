
'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { TeamManagement } from '@/components/dashboard/team-management';

function TeamPageContent() {
  return (
    <div className="h-full flex flex-col">
       <header className="pb-4 border-b">
        <div>
            <h1 className="text-3xl font-bold font-headline">Team Management</h1>
            <p className="text-muted-foreground">Assemble your event team by inviting planners and co-hosts.</p>
        </div>
      </header>
      <div className='flex-1 mt-6 h-full'>
         <TeamManagement />
      </div>
    </div>
  );
}

export default function TeamPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <TeamPageContent />
        </Suspense>
    )
}
