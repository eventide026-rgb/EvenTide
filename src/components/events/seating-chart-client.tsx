
'use client';

import { useMemo, useState, useEffect, Suspense } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, documentId, writeBatch, setDoc, addDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { Loader2, Armchair, User, Users, Trash2 } from 'lucide-react';
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
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { DndContext, useDroppable, useDraggable } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { PlusCircle } from 'lucide-react';

/* ---------------------------------- TYPES --------------------------------- */

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
  tableId: string;
  seatNumber: number;
  guestId?: string;
  guestName?: string;
};

type Guest = {
  id: string;
  name: string;
  category: string;
};

type PlannerEvent = {
    id: string;
    name: string;
};

/* --------------------------- DND GUEST ITEM --------------------------- */
function DraggableGuest({ guest, isAssigned }: { guest: Guest, isAssigned: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `guest-${guest.id}`,
    data: guest,
    disabled: isAssigned,
  });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "p-2 cursor-grab",
        isAssigned && "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
      )}
    >
      <p className="font-semibold text-sm">{guest.name}</p>
      <p className="text-xs text-muted-foreground">{guest.category}</p>
    </Card>
  );
}


/* --------------------------- DND SEAT TARGET --------------------------- */
function DroppableSeat({ seat, children, isThisGuestSeat }: { seat: Seat, children: React.ReactNode, isThisGuestSeat: boolean }) {
  const { setNodeRef } = useDroppable({
    id: `seat-${seat.tableId}-${seat.seatNumber}`,
    data: seat,
  });

  return (
    <div ref={setNodeRef} className={cn(isThisGuestSeat && "ring-4 ring-offset-4 ring-accent ring-offset-background rounded-full")}>
        {children}
    </div>
  );
}

/* ----------------------------- TABLE COMPONENT ---------------------------- */

function TableDisplay({
  table,
  guests,
  seats,
  guestId,
  userRole,
  onSeatUpdate,
}: {
  table: Table;
  guests: Guest[];
  seats: Seat[];
  guestId: string | null;
  userRole: 'owner' | 'planner' | 'guest';
  onSeatUpdate: (tableId: string, seatNumber: number, guestId: string | null) => void;
}) {
  const fullSeats = useMemo(() => {
    const seatsForTable: Seat[] = [];
    for (let i = 1; i <= table.capacity; i++) {
      const realSeat = seats?.find(s => s.seatNumber === i);
      const guest = guests?.find(g => g.id === realSeat?.guestId);
      seatsForTable.push({
        id: realSeat?.id || `${table.id}-${i}`,
        seatNumber: i,
        tableId: table.id,
        guestId: realSeat?.guestId,
        guestName: guest?.name,
      });
    }
    return seatsForTable;
  }, [table, seats, guests]);
  
  const handleRemoveGuest = (seat: Seat) => {
    if (userRole === 'planner' && seat.guestId) {
      onSeatUpdate(table.id, seat.seatNumber, null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{table.tableName}</CardTitle>
        <CardDescription>{table.capacity} Seats</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
            <div className="relative rounded-full border-2 border-dashed border-muted-foreground/50 p-8 flex items-center justify-center aspect-square max-w-lg mx-auto">
                <h3 className="absolute text-muted-foreground font-bold">{table.tableName}</h3>
                {fullSeats.map((seat, index) => {
                    const angle = (index / table.capacity) * 360;
                    const style = { transform: `rotate(${angle}deg) translate(12rem) rotate(-${angle}deg)`};
                    const isThisGuestSeat = guestId && seat.guestId === guestId;
                    
                    return (
                        <DroppableSeat key={seat.id} seat={seat} isThisGuestSeat={!!isThisGuestSeat}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="absolute w-12 h-12 flex items-center justify-center" style={style}>
                                        <div className={cn("p-2 rounded-full relative", seat.guestName ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                                            {seat.guestName ? <User className="h-5 w-5"/> : <Armchair className="h-5 w-5"/>}
                                            {userRole === 'planner' && seat.guestName && (
                                                <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5" onClick={() => handleRemoveGuest(seat)}>
                                                    <Trash2 className="h-3 w-3"/>
                                                </Button>
                                            )}
                                        </div>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent><p className='font-semibold'>Seat {seat.seatNumber}</p><p>{seat.guestName || "Available"}</p></TooltipContent>
                            </Tooltip>
                        </DroppableSeat>
                    )
                })}
            </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

/* --------------------------- MAIN CLIENT COMPONENT -------------------------- */

export function SeatingChartClient({ eventId: initialEventId, userRole }: SeatingChartClientProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState(8);

  // Fetch events for Planner/Owner to select from
  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid || userRole === 'guest') return null;
    const roleField = userRole === 'owner' ? 'ownerId' : 'plannerIds';
    const operator = userRole === 'owner' ? '==' : 'array-contains';
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user, userRole]);
  const { data: events, isLoading: isLoadingEvents } = useCollection<PlannerEvent>(eventsQuery);

  // Set default selected event
  useEffect(() => {
    if (!initialEventId && events && events.length > 0) {
      setSelectedEventId(events[0].id);
    }
  }, [events, initialEventId]);

  // Fetch tables and guests for the selected event
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
    return query(collection(firestore, `events/${selectedEventId}/seats`));
  }, [firestore, selectedEventId]);


  const { data: tablesData, isLoading: isLoadingTables } = useCollection<Table>(tablesQuery);
  const { data: guestsData, isLoading: isLoadingGuests } = useCollection<Guest>(guestsQuery);
  const { data: allSeats, isLoading: isLoadingSeats } = useCollection<Seat>(seatsQuery);

  const isLoading = isLoadingEvents || (selectedEventId && (isLoadingTables || isLoadingGuests || isLoadingSeats));

  const guestId = userRole === 'guest' ? user?.uid : null;

  const { assignedGuests, unassignedGuests } = useMemo(() => {
    if (!guestsData || !allSeats) return { assignedGuests: new Set(), unassignedGuests: [] };
    const assigned = new Set(allSeats.map(s => s.guestId).filter(Boolean) as string[]);
    const unassigned = guestsData.filter(g => !assigned.has(g.id));
    return { assignedGuests: assigned, unassignedGuests: unassigned };
  }, [guestsData, allSeats]);


  const handleAddTable = async () => {
    if (!firestore || !selectedEventId || !newTableName || newTableCapacity < 1) return;
    try {
        const tablesCollection = collection(firestore, `events/${selectedEventId}/tables`);
        await addDoc(tablesCollection, {
            tableName: newTableName,
            capacity: newTableCapacity,
        });
        toast({ title: 'Table Added' });
        setNewTableName("");
        setNewTableCapacity(8);
    } catch (e) {
        toast({ variant: "destructive", title: "Error adding table" });
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { over, active } = event;
    if (over && active.id.startsWith('guest-')) {
        const guest = active.data.current as Guest;
        const seatData = over.data.current as Seat;

        if (seatData) {
           await handleSeatUpdate(seatData.tableId, seatData.seatNumber, guest.id);
        }
    }
  };

  const handleSeatUpdate = async (tableId: string, seatNumber: number, guestId: string | null) => {
    if (!firestore || !selectedEventId) return;
    
    const existingSeat = allSeats?.find(s => s.tableId === tableId && s.seatNumber === seatNumber);

    try {
        if (existingSeat) {
            const seatRef = doc(firestore, `events/${selectedEventId}/seats`, existingSeat.id);
            if (guestId) {
                await setDoc(seatRef, { guestId: guestId }, { merge: true });
            } else {
                // If guestId is null, we are un-assigning. We can just delete the seat document.
                await deleteDoc(seatRef);
            }
        } else if (guestId) {
            const seatsCol = collection(firestore, `events/${selectedEventId}/seats`);
            await addDoc(seatsCol, { tableId, seatNumber, guestId });
        }
        toast({title: "Seating Updated"});
    } catch (e) {
        toast({variant: "destructive", title: "Could not update seat."});
    }
  }

  return (
     <DndContext onDragEnd={handleDragEnd}>
        <div className="grid lg:grid-cols-4 gap-6 h-full">
            <div className="lg:col-span-3 h-full">
                {isLoading && selectedEventId ? (
                    <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                ) : tablesData && tablesData.length > 0 ? (
                    <ScrollArea className="h-full pr-4 -mr-4">
                        <div className="space-y-8">
                            {tablesData.map(table => (
                                <TableDisplay
                                key={table.id}
                                table={table}
                                guests={guestsData || []}
                                seats={allSeats?.filter(s => s.tableId === table.id) || []}
                                guestId={guestId}
                                userRole={userRole}
                                onSeatUpdate={handleSeatUpdate}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">
                        {selectedEventId ? 'The planner has not created any tables for this event yet.' : 'Please select an event.'}
                        </p>
                    </div>
                )}
            </div>
            <div className="lg:col-span-1 flex flex-col gap-6">
                {(userRole === 'planner' || userRole === 'owner') && (
                    <Card>
                        <CardHeader><CardTitle>Event</CardTitle></CardHeader>
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
                    <>
                        <Card>
                            <CardHeader><CardTitle>Add New Table</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="table-name">Table Name</Label>
                                    <Input id="table-name" value={newTableName} onChange={(e) => setNewTableName(e.target.value)} placeholder="e.g., Table 1"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="table-capacity">Capacity</Label>
                                    <Input id="table-capacity" type="number" value={newTableCapacity} onChange={(e) => setNewTableCapacity(Number(e.target.value))}/>
                                </div>
                                <Button className="w-full" onClick={handleAddTable} disabled={!selectedEventId || !newTableName}><PlusCircle className="mr-2 h-4 w-4"/>Add Table</Button>
                            </CardContent>
                        </Card>
                        <Card className="flex-grow">
                            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Unassigned Guests</CardTitle></CardHeader>
                            <CardContent>
                                <ScrollArea className="h-96 pr-3">
                                    <div className="space-y-2">
                                        {unassignedGuests.map(guest => (
                                            <DraggableGuest key={guest.id} guest={guest} isAssigned={false}/>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </>
                )}
                {userRole === 'guest' && (
                    <Card>
                        <CardHeader><CardTitle>Your Seat</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground">Your assigned seat is highlighted on the chart.</p></CardContent>
                    </Card>
                )}
            </div>
        </div>
    </DndContext>
  );
}
