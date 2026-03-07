'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview Scanner Page (Client Component)
 * Next.js 15 requires params to be handled as a Promise.
 */

const ScannerClient = dynamic(() => import('@/components/security/scanner-client'), { 
  ssr: false, 
  loading: () => <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> 
});

export default function ScannerPage({ params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId;

  return <ScannerClient eventId={eventId} />;
}
