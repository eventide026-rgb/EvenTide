
'use client';

import { useEffect, useState } from 'react';
import { SeatingChartClient } from '@/components/events/seating-chart-client';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function FindMySeatPage() {
  const [eventId, setEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = sessionStorage.getItem('guestEventId');
    if (id) {
      setEventId(id);
    }
    setIsLoading(false);
  }, []);

  return (
    <div className="flex flex-col gap-6 h-full">
      <header>
        <h1 className="text-3xl font-bold font-headline">Find My Seat</h1>
        <p className="text-muted-foreground">
          View your assigned table and seat number for the event.
        </p>
      </header>

      <div className="flex-grow">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : eventId ? (
          <SeatingChartClient eventId={eventId} userRole="guest" />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">Could not load event details. Please try logging in again.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
