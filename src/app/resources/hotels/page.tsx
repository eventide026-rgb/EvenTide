
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

/**
 * @fileOverview Public Hotels Marketplace
 * ISR Optimized: 1 hour edge cache.
 */

const PublicHotelsClient = dynamic(() => import('@/components/marketplace/public-hotels-client').then(mod => mod.PublicHotelsClient), {
  loading: () => <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
});

export const revalidate = 3600; // ISR: 1 hour

export default function HotelsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <PublicHotelsClient />
    </Suspense>
  );
}
