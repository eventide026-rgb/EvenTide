
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview Legacy route redirector.
 * Consolidates /vendor-dashboard into the high-performance /vendor route group.
 */
export default function VendorDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/vendor');
  }, [router]);

  return (
    <div className="flex h-full min-h-[400px] w-full items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
