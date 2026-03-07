
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

/**
 * @fileOverview Public Vendors Marketplace
 * ISR Optimized: Cached at edge for 1 hour.
 */

const PublicVendorsClient = dynamic(() => import('@/components/marketplace/public-vendors-client').then(mod => mod.PublicVendorsClient), {
  loading: () => <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
});

export const revalidate = 3600; // ISR: 1 hour

export default function PublicVendorsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <PublicVendorsClient />
    </Suspense>
  );
}
