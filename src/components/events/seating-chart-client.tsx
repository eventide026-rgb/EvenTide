
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, documentId } from 'firebase/firestore';
import { Loader2, Armchair, User, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '../ui/scroll-area';

type SeatingChartClientProps = {
  eventId: string;
  userRole: 'owner' | 'planner' | 'guest';
};

type Table = {
  id: string;
  tableName: string;
  capacity: number;
  eventId: string; // Add eventId for context in sub-components
};

type Seat = {
  id: string;
  seatNumber: number;
  guestId?: string;
  tableId: string;
};

type Guest = {
  id: string;
  name: string;
};

type FullSeat = Seat & { guestName?: string };
type FullTable = Table & { seats: FullSeat[] };

// New component to fetch seats for a single table
function useTableSeats(tableId: string, eventId: string) {
    const firestore = useFirestore();
    const seatsQuery = useMemoFirebase(() => {
        if (!firestore || !eventId || !tableId) return null;
        return query(collection(firestore, 'events', eventId, 'tables', tableId, 'seats'));
    }, [firestore, eventId, tableId]);

    const { data, isLoading } = useCollection<Seat>(seatsQuery);
    return { seats: data, isLoadingSeats: isLoading };
}

function TableWithSeats({ table, guestsData, guestId }: { table: Table; guestsData: Guest[] | null, guestId: string | null }) {
  const { seats, isLoadingSeats } = useTableSeats(table.id, table.eventId);
  
  const fullSeats = useMemo((): FullSeat[] => {
    const seatsForTable: FullSeat[] = [];
    for (let i = 1; i <= table.capacity; i++) {
        const realSeat = seats?.find(s => s.seatNumber === i);
        const guest = guestsData?.find(g => g.id === realSeat?.guestId);
        
        seatsForTable.push({
          id: realSeat?.id || `${table.id}-${i}`,
          seatNumber: i,
          tableId: table.id,
          guestId: realSeat?.guestId,
          guestName: guest?.name,
        });
      }
      return seatsForTable;
  }, [table, seats, guestsData]);


  if (isLoadingSeats) {
      return <div className="flex justify-center items-center h-48"><Loader2 className="h-6 w-6 animate-spin"/></div>
  }

  return (
    <div className="relative rounded-full border-2 border-dashed border-muted-foreground/50 p-8 flex items-center justify-center aspect-square max-w-lg mx-auto">
        <h3 className="absolute text-muted-foreground font-bold">{table.tableName}</h3>
        {fullSeats.map((seat, index) => {
            const angle = (index / table.capacity) * 360;
            const style = { transform: `rotate(${angle}deg) translate(12rem) rotate(-${angle}deg)`};
            const isThisGuestSeat = guestId && seat.guestId === guestId;
            
            return (
                <Tooltip key={seat.id}>
                    <TooltipTrigger asChild>
                        <button className="absolute w-12 h-12 flex items-center justify-center" style={style}>
                            <div className={cn("p-2 rounded-full", seat.guestName ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground", isThisGuestSeat && "ring-4 ring-offset-4 ring-accent ring-offset-secondary")}>
                                {seat.guestName ? <User className="h-5 w-5"/> : <Armchair className="h-5 w-5"/>}
                            </div>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent><p className='font-semibold'>Seat {seat.seatNumber}</p><p>{seat.guestName || "Available"}</p></TooltipContent>
                </Tooltip>
            )
        })}
    </div>
  )
}


export function SeatingChartClient({ eventId: initialEventId, userRole }: SeatingChartClientProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || userRole === 'guest') return null; // Guests don't need to select an event
    if (userRole === 'planner') {
      // This is a placeholder, a real app would have a more complex query for assigned events
      return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
    }
    if (userRole === 'owner') {
       return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
    }
    return null;
  }, [firestore, user, userRole]);
  const { data: events, isLoading: isLoadingEvents } = useCollection(eventsQuery);

  const tablesQuery = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return query(collection(firestore, 'events', selectedEventId, 'tables'));
  }, [firestore, selectedEventId]);

  const guestsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return query(collection(firestore, 'events', selectedEventId, 'guests'));
  }, [firestore, selectedEventId]);
  
  const { data: tablesData, isLoading: isLoadingTables } = useCollection<Table>(tablesQuery);
  const { data: guestsData, isLoading: isLoadingGuests } = useCollection<Guest>(guestsQuery);
  
  const tablesWithEventId = useMemo(() => tablesData?.map(t => ({...t, eventId: selectedEventId })), [tablesData, selectedEventId]);

  const isLoading = isLoadingEvents || (selectedEventId && (isLoadingTables || isLoadingGuests));

  useEffect(() => {
    if ((userRole === 'planner' || userRole === 'owner') && !selectedEventId && events && events.length > 0) {
        setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId, userRole]);

  const guestId = userRole === 'guest' ? user?.uid : null;

  return (
    <div className="grid lg:grid-cols-4 gap-6 h-full">
        <Card className="lg:col-span-3 h-full">
            <CardContent className="h-full p-4">
            {isLoading && selectedEventId ? (
                <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : tablesWithEventId && tablesWithEventId.length > 0 ? (
                <TooltipProvider>
                    <div className="bg-secondary/50 p-8 rounded-lg h-full overflow-auto">
                        <div className="space-y-12">
                        {tablesWithEventId.map(table => (
                            <TableWithSeats key={table.id} table={table} guestsData={guestsData} guestId={guestId} />
                        ))}
                        </div>
                    </div>
                </TooltipProvider>
            ) : (
                <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">
                      {selectedEventId ? 'The planner has not created any tables for this event yet.' : 'Please select an event.'}
                    </p>
                </div>
            )}
            </CardContent>
        </Card>
        <div className="lg:col-span-1 flex flex-col gap-6">
            {userRole !== 'guest' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Event</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select onValueChange={setSelectedEventId} value={selectedEventId || ''} disabled={isLoadingEvents}>
                            <SelectTrigger><SelectValue placeholder="Select an Event" /></SelectTrigger>
                            <SelectContent>
                                {events?.map(event => <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>
            )}
            {userRole === 'planner' && (
                <Card className="flex-grow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Unassigned Guests</CardTitle>
                         <CardDescription>Guests not on the chart.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-96">
                            {/* Unassigned guest logic would go here */}
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
            {userRole === 'guest' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Seat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Your assigned seat is highlighted on the chart.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    </div>
  );
}
