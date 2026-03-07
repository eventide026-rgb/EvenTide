
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview Legacy route redirector.
 * Consolidates /owner-dashboard into the high-performance /owner route group.
 */
export default function OwnerDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/owner');
  }, [router]);

  return (
    <div className="flex h-full min-h-[400px] w-full items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
