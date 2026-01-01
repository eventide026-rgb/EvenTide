
'use client';

import { SeatingChartClient } from '@/components/events/seating-chart-client';

export default function SeatingChartPage() {

  // The SeatingChartClient will handle event selection for the owner.
  // We pass an empty string for eventId initially.
  return (
    <div className="flex flex-col gap-6 h-full">
      <header>
        <h1 className="text-3xl font-bold font-headline">Seating Chart</h1>
        <p className="text-muted-foreground">
          Select an event to view its seating arrangement. This is a read-only view of the chart created by your planner.
        </p>
      </header>

      <div className="flex-grow">
        <SeatingChartClient eventId="" userRole="owner" />
      </div>
    </div>
  );
}
