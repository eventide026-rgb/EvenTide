
'use client';

import { SeatingChartClient } from '@/components/events/seating-chart-client';

export default function SeatingChartPage() {
  // For the planner, the SeatingChartClient will handle event selection.
  // We pass an empty string for eventId initially.
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
