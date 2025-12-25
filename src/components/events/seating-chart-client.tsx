
'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Loader2, Armchair, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';

type SeatingChartClientProps = {
  eventId: string;
  userRole: 'owner' | 'planner';
};

type Table = {
  id: string;
  tableName: string;
  capacity: number;
};

type Seat = {
  id: string;
  seatNumber: number;
  guestId?: string;
};

type Guest = {
  id: string;
  name: string;
};

// This is a simplified representation. In a real app, you might have more complex state management.
type FullSeat = Seat & { guestName?: string };
type FullTable = Table & { seats: FullSeat[] };

export function SeatingChartClient({ eventId, userRole }: SeatingChartClientProps) {
  const firestore = useFirestore();

  const tablesQuery = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return query(collection(firestore, 'events', eventId, 'tables'));
  }, [firestore, eventId]);

  const guestsQuery = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return query(collection(firestore, 'events', eventId, 'guests'));
  }, [firestore, eventId]);

  const { data: tablesData, isLoading: isLoadingTables } = useCollection<Table>(tablesQuery);
  const { data: guestsData, isLoading: isLoadingGuests } = useCollection<Guest>(guestsQuery);

  // Note: Fetching seats for all tables can be inefficient. For a large event,
  // it would be better to fetch seats for a selected table.
  // This simplified approach fetches all seats for demonstration.
  const seatsQueries = useMemo(() => {
    if (!firestore || !tablesData) return [];
    return tablesData.map(table =>
      query(collection(firestore, 'events', eventId, 'tables', table.id, 'seats'))
    );
  }, [firestore, eventId, tablesData]);

  // This is a limitation of the current `useCollection`. It doesn't handle an array of queries.
  // We'll simulate by fetching seats for the first table only. A more robust hook would be needed.
  const { data: seatsData, isLoading: isLoadingSeats } = useCollection<Seat>(
    seatsQueries.length > 0 ? seatsQueries[0] : null
  );

  const fullSeatingChart = useMemo((): FullTable[] => {
    if (!tablesData || !guestsData) return [];

    // This is a mock-up since we can't easily fetch all seats for all tables with the current hook.
    // In a real implementation, we would merge all fetched seats with tables.
    return tablesData.map(table => {
      const seatsForTable: FullSeat[] = [];
      for (let i = 1; i <= table.capacity; i++) {
        // Try to find a real seat if it was fetched (only for first table in this mock)
        const realSeat = seatsData?.find(s => s.seatNumber === i);
        const guest = guestsData.find(g => g.id === realSeat?.guestId);
        
        seatsForTable.push({
          id: realSeat?.id || `${table.id}-${i}`,
          seatNumber: i,
          guestId: realSeat?.guestId,
          guestName: guest?.name,
        });
      }
      return { ...table, seats: seatsForTable };
    });
  }, [tablesData, guestsData, seatsData]);


  const isLoading = isLoadingTables || isLoadingGuests || isLoadingSeats;

  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading Seating Chart...</p>
      </Card>
    );
  }

  if (!tablesData || tablesData.length === 0) {
     return (
         <Card className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">The planner has not created any tables for this event yet.</p>
        </Card>
     )
  }

  return (
    <TooltipProvider>
      <div className="bg-secondary/50 p-8 rounded-lg h-full overflow-auto">
        <div className="space-y-12">
          {fullSeatingChart.map(table => (
            <div key={table.id} className="relative rounded-full border-2 border-dashed border-muted-foreground/50 p-8 flex items-center justify-center aspect-square max-w-lg mx-auto">
                <h3 className="absolute text-muted-foreground font-bold">{table.tableName}</h3>
                {table.seats.map((seat, index) => {
                    const angle = (index / table.capacity) * 360;
                    const style = {
                        transform: `rotate(${angle}deg) translate(12rem) rotate(-${angle}deg)`,
                    };
                    return (
                        <Tooltip key={seat.id}>
                            <TooltipTrigger asChild>
                                <div className="absolute w-12 h-12 flex items-center justify-center" style={style}>
                                     <div className={cn(
                                         "p-2 rounded-full",
                                         seat.guestName ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                     )}>
                                        {seat.guestName ? <User className="h-5 w-5"/> : <Armchair className="h-5 w-5"/>}
                                     </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className='font-semibold'>Seat {seat.seatNumber}</p>
                                <p>{seat.guestName || "Available"}</p>
                            </TooltipContent>
                        </Tooltip>
                    )
                })}
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
