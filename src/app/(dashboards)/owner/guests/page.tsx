
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview Guests Dashboard (Server Component Shell)
 * Optimized structure: removed redundant nesting for a standalone experience.
 */
const GuestManagement = dynamic(() => import('@/components/dashboard/guest-management').then(mod => mod.GuestManagement), {
  loading: () => <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
});

export default async function GuestsPage() {
  return (
    <div className="w-full h-full">
      <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
        <GuestManagement />
      </Suspense>
    </div>
  );
}
