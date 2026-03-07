
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * @fileOverview Legacy path redirector.
 * Logic moved to high-performance Route Group at src/app/(dashboards)/planner/calendar/page.tsx
 */
export default function PlannerCalendarRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/planner/calendar');
  }, [router]);

  return (
    <div className="flex h-full min-h-[400px] w-full items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
