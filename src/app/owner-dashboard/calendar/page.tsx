'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview Legacy path redirector.
 * Logic moved to high-performance Route Group at src/app/(dashboards)/owner/calendar/page.tsx
 */
export default function OwnerCalendarRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/owner/calendar');
  }, [router]);

  return (
    <div className="flex h-full min-h-[400px] w-full items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}