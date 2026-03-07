
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

/**
 * @fileOverview Public Venues Marketplace
 * ISR Optimized: 1 hour edge cache.
 */

const PublicVenuesClient = dynamic(() => import('@/components/marketplace/public-venues-client').then(mod => mod.PublicVenuesClient), {
  loading: () => <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
});

export const revalidate = 3600; // ISR: 1 hour

export default function VenuesPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <PublicVenuesClient />
    </Suspense>
  );
}
