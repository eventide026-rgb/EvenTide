'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview Direct Access Guest Portal (Streamlined)
 * Access via eventide.app/e/[eventCode]
 * Instant access to program, registry, and interactions.
 */

const GuestPortalClient = dynamic(() => import('@/components/guest/guest-portal-client').then(mod => mod.GuestPortalClient), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4 text-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground font-headline font-bold uppercase tracking-widest">Loading Celebration...</p>
    </div>
  )
});

export default function DirectGuestPortalPage({ params }: { params: Promise<{ eventCode: string }> }) {
  const resolvedParams = use(params);
  const eventCode = resolvedParams.eventCode;

  return <GuestPortalClient eventCode={eventCode} />;
}
