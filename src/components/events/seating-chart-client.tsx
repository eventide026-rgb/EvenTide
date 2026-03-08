
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, addDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { Loader2, Armchair, User, Users, Trash2, CirclePlus } from 'lucide-react';
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
import { DndContext, useDroppable, useDraggable, DragEndEvent } from '@dnd-kit/core';
import * as React from 'react';

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
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: `guest-${guest.id}`,
    data: guest,
    disabled: isAssigned
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50
  } : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "p-2 cursor-grab shadow-sm border border-border hover:border-primary/50 transition-colors",
        isAssigned && "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
      )}
    >
      <p className="font-semibold text-sm">{guest.name}</p>
      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{guest.category}</p>
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
    <div ref={setNodeRef} className={cn("relative", isThisGuestSeat && "ring-4 ring-offset-4 ring-accent ring-offset-background rounded-full")}>
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
        guestId: realSeat?.guestId || undefined,
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
    <Card className="border-none shadow-lg overflow-hidden bg-muted/20">
      <CardHeader className="bg-muted/30 border-b">
        <CardTitle className="flex items-center gap-2"><Armchair className="h-5 w-5 text-primary" /> {table.tableName}</CardTitle>
        <CardDescription>{table.capacity} Seats Available</CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <TooltipProvider>
            <div className="relative rounded-full border-2 border-dashed border-muted-foreground/30 p-8 flex items-center justify-center aspect-square max-w-[300px] mx-auto">
                <div className="bg-background shadow-inner border w-24 h-24 rounded-full flex flex-col items-center justify-center">
                    <p className="text-muted-foreground font-bold text-xs uppercase tracking-tighter">{table.tableName}</p>
                </div>
                {fullSeats.map((seat, index) => {
                    const angle = (index / table.capacity) * 360;
                    const style = { transform: `rotate(${angle}deg) translate(8rem) rotate(-${angle}deg)`};
                    const isThisGuestSeat = guestId && seat.guestId === guestId;
                    
                    return (
                        <DroppableSeat key={seat.id} seat={seat} isThisGuestSeat={!!isThisGuestSeat}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="absolute w-10 h-10 flex items-center justify-center -translate-x-5 -translate-y-5" style={style}>
                                        <div className={cn(
                                            "p-2 rounded-full relative transition-all duration-300", 
                                            seat.guestName ? "bg-primary text-primary-foreground shadow-md scale-110" : "bg-muted text-muted-foreground border-2 border-dashed"
                                        )}>
                                            {seat.guestName ? <User className="h-4 w-4"/> : <Armchair className="h-4 w-4"/>}
                                            {userRole === 'planner' && seat.guestName && (
                                                <Button 
                                                    variant="destructive" 
                                                    size="icon" 
                                                    className="absolute -top-3 -right-3 h-5 w-5 rounded-full shadow-lg" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveGuest(seat);
                                                    }}
                                                >
                                                    <Trash2 className="h-2 w-2"/>
                                                </Button>
                                            )}
                                        </div>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-background border-primary/20 shadow-xl">
                                    <p className='font-bold text-xs uppercase tracking-widest'>Seat {seat.seatNumber}</p>
                                    <p className="text-primary font-bold">{seat.guestName || "Available"}</p>
                                </TooltipContent>
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
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid, userRole]);
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

  const guestId: string | null = (userRole === 'guest' && user?.uid) ? (user.uid as string) : null;

  const { unassignedGuests } = useMemo(() => {
    if (!guestsData || !allSeats) return { assignedGuests: new Set<string>(), unassignedGuests: [] };
    const assigned = new Set(allSeats?.map(s => s.guestId).filter(Boolean) as string[] || []);
    const unassigned = guestsData.filter(g => !assigned.has(g.id));
    return { assignedGuests: assigned, unassignedGuests: unassigned };
  }, [guestsData, allSeats]);


  const handleAddTable = async (): Promise<void> => {
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

  const handleSeatUpdate = async (tableId: string, seatNumber: number, guestId: string | null): Promise<void> => {
    if (!firestore || !selectedEventId) return;
    
    const existingSeat = allSeats?.find(s => s.tableId === tableId && s.seatNumber === seatNumber);

    try {
        if (existingSeat) {
            const seatRef = doc(firestore, `events/${selectedEventId}/seats`, existingSeat.id);
            if (guestId) {
                await setDoc(seatRef, { guestId: guestId }, { merge: true });
            } else {
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.data.current) {
        const guest = active.data.current as Guest;
        const parts = (over.id as string).split('-');
        const tableId = parts[1];
        const seatNumber = parseInt(parts[2], 10);
        handleSeatUpdate(tableId, seatNumber, guest.id);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
        <div className="grid lg:grid-cols-4 gap-8 h-full">
            <div className="lg:col-span-3 h-full">
                {isLoading && selectedEventId ? (
                    <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                ) : tablesData && tablesData.length > 0 ? (
                    <ScrollArea className="h-full pr-4 -mr-4">
                        <div className="grid md:grid-cols-2 gap-8 pb-20">
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
                    <div className="flex h-full items-center justify-center text-center p-8 border-2 border-dashed rounded-3xl">
                        <div className="max-w-xs">
                            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                            <p className="text-muted-foreground font-medium">
                            {selectedEventId ? 'The seating plan for this celebration is currently open for design.' : 'Select an active celebration to begin seating assignments.'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
            <div className="lg:col-span-1 flex flex-col gap-6">
                {(userRole === 'planner' || userRole === 'owner') && (
                    <Card className="border-none shadow-sm bg-muted/30">
                        <CardHeader className="pb-3"><CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Celebration</CardTitle></CardHeader>
                        <CardContent>
                            <Select onValueChange={setSelectedEventId} value={selectedEventId || ''} disabled={isLoadingEvents}>
                                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select Event" /></SelectTrigger>
                                <SelectContent>
                                    {events?.map(event => <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                )}
                {userRole === 'planner' && (
                    <>
                        <Card className="border-none shadow-md">
                            <CardHeader className="pb-3"><CardTitle className="text-base">Add New Table</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="table-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Label</Label>
                                    <Input id="table-name" value={newTableName} onChange={(e) => setNewTableName(e.target.value)} placeholder="e.g., Table 1" className="rounded-xl"/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="table-capacity" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Capacity</Label>
                                    <Input id="table-capacity" type="number" value={newTableCapacity} onChange={(e) => setNewTableCapacity(Number(e.target.value))} className="rounded-xl"/>
                                </div>
                                <Button className="w-full rounded-xl font-bold" onClick={handleAddTable} disabled={!selectedEventId || !newTableName}><CirclePlus className="mr-2 h-4 w-4"/>Add Table</Button>
                            </CardContent>
                        </Card>
                        <Card className="flex-grow border-none shadow-lg overflow-hidden flex flex-col">
                            <CardHeader className="bg-muted/30 pb-3"><CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4 text-primary" /> Unassigned ({unassignedGuests.length})</CardTitle></CardHeader>
                            <CardContent className="flex-1 p-0">
                                <ScrollArea className="h-[400px]">
                                    <div className="p-4 space-y-3">
                                        {unassignedGuests.map(guest => (
                                            <DraggableGuest key={guest.id} guest={guest} isAssigned={false}/>
                                        ))}
                                        {unassignedGuests.length === 0 && <p className="text-xs text-center text-muted-foreground py-8 italic">All guests have been seated.</p>}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </>
                )}
                {userRole === 'guest' && (
                    <Card className="bg-accent/10 border-accent/20">
                        <CardHeader><CardTitle className="text-accent">Assigned Seating</CardTitle></CardHeader>
                        <CardContent><p className="text-sm text-foreground/80 leading-relaxed font-medium">Your designated seat is highlighted on the chart. Please look for the gold ring to identify your table.</p></CardContent>
                    </Card>
                )}
            </div>
        </div>
    </DndContext>
  );
}
