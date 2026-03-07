
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const GuestManagement = dynamic(() => import('@/components/dashboard/guest-management').then(mod => mod.GuestManagement), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
});

export default async function GuestsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <GuestManagement />
    </Suspense>
  );
}
