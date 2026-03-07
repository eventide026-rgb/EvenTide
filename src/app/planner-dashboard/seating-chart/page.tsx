
'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const SeatingChartClient = dynamic(() => import('@/components/events/seating-chart-client').then(mod => mod.SeatingChartClient), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
});

export default function SeatingChartPage() {
  return (
    <div className="flex flex-col gap-6 h-full">
       <header>
        <h1 className="text-3xl font-bold font-headline">Seating Chart Designer</h1>
        <p className="text-muted-foreground">
          Select an event to begin arranging your guests.
        </p>
      </header>
      <div className="flex-grow">
        <SeatingChartClient eventId="" userRole="planner" />
      </div>
    </div>
  );
}
