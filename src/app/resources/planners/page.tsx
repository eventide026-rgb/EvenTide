
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

/**
 * @fileOverview Public Planners Marketplace
 * ISR Optimized: 1 hour edge cache.
 */

const PublicPlannersClient = dynamic(() => import('@/components/marketplace/public-planners-client').then(mod => mod.PublicPlannersClient), {
  ssr: false,
  loading: () => <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
});

export const revalidate = 3600; // ISR: 1 hour

export default function PlannersPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <PublicPlannersClient />
    </Suspense>
  );
}
