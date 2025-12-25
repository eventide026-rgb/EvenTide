
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SeatingChartClient } from '@/components/events/seating-chart-client';
import { Loader2 } from 'lucide-react';

type Event = {
  id: string;
  name: string;
};

export default function SeatingChartPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user]);

  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  return (
    <div className="flex flex-col gap-6 h-full">
      <Card>
        <CardHeader>
          <CardTitle>Seating Chart</CardTitle>
          <CardDescription>
            Select an event to view its seating arrangement. This is a read-only view of the chart created by your planner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingEvents ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
              <SelectTrigger className="w-full md:w-1/3">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {events && events.length > 0 ? (
                  events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-events" disabled>
                    No events found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      <div className="flex-grow">
        {selectedEventId ? (
          <SeatingChartClient eventId={selectedEventId} userRole="owner" />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">Please select an event to view the seating chart.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
