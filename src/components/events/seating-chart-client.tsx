
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
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

type FullSeat = Seat & { guestName?: string };
type FullTable = Table & { seats: FullSeat[] };

export function SeatingChartClient({ eventId: initialEventId, userRole }: SeatingChartClientProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || userRole !== 'planner') return null;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
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
  
  const seatsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return query(collection(firestore, 'events', selectedEventId, 'seats'));
  }, [firestore, selectedEventId]);

  const { data: tablesData, isLoading: isLoadingTables } = useCollection<Table>(tablesQuery);
  const { data: guestsData, isLoading: isLoadingGuests } = useCollection<Guest>(guestsQuery);
  const { data: seatsData, isLoading: isLoadingSeats } = useCollection<Seat>(seatsQuery);
  

  const unassignedGuests = useMemo(() => {
    if (!guestsData || !seatsData) return guestsData || [];
    const assignedGuestIds = new Set(seatsData.map(s => s.guestId).filter(Boolean));
    return guestsData.filter(g => !assignedGuestIds.has(g.id));
  }, [guestsData, seatsData]);

  const fullSeatingChart = useMemo((): FullTable[] => {
    if (!tablesData || !guestsData) return [];

    return tablesData.map(table => {
      const seatsForTable: FullSeat[] = [];
      for (let i = 1; i <= table.capacity; i++) {
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

  const isLoading = isLoadingEvents || isLoadingTables || isLoadingGuests || isLoadingSeats;

    useEffect(() => {
      if (userRole === 'planner' && !selectedEventId && events && events.length > 0) {
          setSelectedEventId(events[0].id);
      }
  }, [events, selectedEventId, userRole]);

  const handleSeatClick = (seatId: string) => {
    if (userRole !== 'planner' || !selectedGuestId) return;
    console.log(`Assigning guest ${selectedGuestId} to seat ${seatId}`);
    // In a real app, this would trigger a Firestore update.
    setSelectedGuestId(null); // Reset selection
  }
  
  const guestId = userRole === 'guest' ? user?.uid : null;

  return (
    <div className="grid lg:grid-cols-4 gap-6 h-full">
        <Card className="lg:col-span-3 h-full">
            <CardContent className="h-full p-4">
            {isLoading ? (
                <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : fullSeatingChart.length > 0 ? (
                <TooltipProvider>
                    <div className="bg-secondary/50 p-8 rounded-lg h-full overflow-auto">
                        <div className="space-y-12">
                        {fullSeatingChart.map(table => (
                            <div key={table.id} className="relative rounded-full border-2 border-dashed border-muted-foreground/50 p-8 flex items-center justify-center aspect-square max-w-lg mx-auto">
                                <h3 className="absolute text-muted-foreground font-bold">{table.tableName}</h3>
                                {table.seats.map((seat, index) => {
                                    const angle = (index / table.capacity) * 360;
                                    const style = { transform: `rotate(${angle}deg) translate(12rem) rotate(-${angle}deg)`};
                                    const isThisGuestSeat = guestId && seat.guestId === guestId;
                                    
                                    return (
                                        <Tooltip key={seat.id}>
                                            <TooltipTrigger asChild>
                                                <button className="absolute w-12 h-12 flex items-center justify-center" style={style} onClick={() => handleSeatClick(seat.id)} disabled={userRole !== 'planner' || (!!seat.guestId && !selectedGuestId)}>
                                                    <div className={cn("p-2 rounded-full", seat.guestName ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground", selectedGuestId && !seat.guestId && "cursor-pointer ring-2 ring-primary ring-offset-2 ring-offset-secondary", isThisGuestSeat && "ring-4 ring-offset-4 ring-accent ring-offset-secondary")}>
                                                        {seat.guestName ? <User className="h-5 w-5"/> : <Armchair className="h-5 w-5"/>}
                                                    </div>
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent><p className='font-semibold'>Seat {seat.seatNumber}</p><p>{seat.guestName || "Available"}</p></TooltipContent>
                                        </Tooltip>
                                    )
                                })}
                            </div>
                        ))}
                        </div>
                    </div>
                </TooltipProvider>
            ) : (
                <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">The planner has not created any tables for this event yet.</p>
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
                         <CardDescription>{unassignedGuests.length} remaining</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-96">
                            <div className="space-y-2">
                                {unassignedGuests.map(guest => (
                                    <Button key={guest.id} variant={selectedGuestId === guest.id ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setSelectedGuestId(guest.id)}>
                                        {guest.name}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="mt-4 flex gap-2">
                            <Button className="w-full" disabled={unassignedGuests.length === 0}>Seat with Eni</Button>
                            <Button className="w-full" variant="secondary" disabled={!selectedGuestId} onClick={() => setSelectedGuestId(null)}>Clear Selection</Button>
                        </div>
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
