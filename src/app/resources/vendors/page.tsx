
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const PublicVendorsClient = dynamic(() => import('@/components/marketplace/public-vendors-client').then(mod => mod.PublicVendorsClient), {
  ssr: false,
  loading: () => <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
});

export const revalidate = 3600; // Cache for 1 hour

export default function PublicVendorsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <PublicVendorsClient />
    </Suspense>
  );
}
