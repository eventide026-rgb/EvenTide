
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreVertical, Calendar, Users, Percent, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { isToday, isFuture } from 'date-fns';
import { Countdown } from '@/components/countdown';

type Event = {
    id: string;
    name: string;
    date?: string; // Kept for compatibility with Countdown, will be populated from eventDate
    eventDate: any; // Firestore Timestamp
    eventCode?: string;
    status: "Upcoming" | "In Progress" | "Completed";
    guestCapacity?: number;
};

type Guest = {
    id: string;
}


export default function OwnerDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    const eventsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
    }, [firestore, user]);

    const { data: eventsData, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

    const events = useMemo(() => {
        return eventsData?.map(e => {
            const eventDate = e.eventDate.toDate();
            let status: Event['status'];
            if (isToday(eventDate)) {
                status = 'In Progress';
            } else if (isFuture(eventDate)) {
                status = 'Upcoming';
            } else {
                status = 'Completed';
            }
            return {
                ...e,
                date: eventDate.toISOString(),
                status,
                guestCapacity: e.guestCapacity || 20,
            }
        }) || [];
    }, [eventsData]);

    const selectedEvent = useMemo(() => {
        return events.find(e => e.id === selectedEventId) || null;
    }, [events, selectedEventId]);
    
    const guestsQuery = useMemoFirebase(() => {
        if (!firestore || !selectedEventId) return null;
        return query(collection(firestore, 'events', selectedEventId, 'guests'));
    }, [firestore, selectedEventId]);

    const { data: guests, isLoading: isLoadingGuests } = useCollection<Guest>(guestsQuery);
    const guestCount = guests?.length ?? 0;
    const rsvpRate = selectedEvent?.guestCapacity ? Math.round((guestCount / selectedEvent.guestCapacity) * 100) : 0;


    React.useEffect(() => {
        if (!selectedEventId && events.length > 0) {
            setSelectedEventId(events[0].id);
        }
    }, [events, selectedEventId]);
    
    const isLoading = isUserLoading || isLoadingEvents;


    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center justify-between pb-4 border-b">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Owner Dashboard</h1>
                    <p className="text-muted-foreground">Manage all your events from one command center.</p>
                </div>
                <Button asChild>
                    <Link href="/owner-dashboard/create-event">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Event
                    </Link>
                </Button>
            </header>

            <div className="grid lg:grid-cols-12 gap-8 flex-1 mt-6">
                <div className="lg:col-span-4 xl:col-span-3 h-full">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>My Events</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            ) : events.length > 0 ? (
                                <ul className="space-y-2">
                                    {events.map(event => (
                                        <li key={event.id}>
                                            <button
                                                className={cn(
                                                    "block w-full text-left p-3 rounded-lg border transition-all",
                                                    selectedEvent?.id === event.id ? "bg-accent border-primary" : "hover:bg-accent/50"
                                                )}
                                                onClick={() => setSelectedEventId(event.id)}
                                            >
                                                <p className="font-semibold truncate">{event.name}</p>
                                                <p className="text-sm text-muted-foreground">{event.status}</p>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">You have no events yet. Create one to get started!</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-8 xl:col-span-9">
                    {isLoading && !selectedEvent ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 content-start">
                            <Skeleton className="h-40 md:col-span-2" />
                            <Skeleton className="h-40" />
                            <Skeleton className="h-24" />
                            <Skeleton className="h-24" />
                            <Skeleton className="h-24" />
                        </div>
                    ) : selectedEvent ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 content-start">
                            <Card className="md:col-span-2">
                                <CardHeader className="flex flex-row items-start justify-between">
                                    <div>
                                        <CardTitle className="text-2xl">{selectedEvent.name}</CardTitle>
                                        <CardDescription>Event Code: <span className="font-mono bg-muted px-2 py-1 rounded-md">{selectedEvent.eventCode}</span></CardDescription>
                                    </div>
                                     <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/owner-dashboard/events/${selectedEvent.id}`}>
                                            <MoreVertical className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <Countdown date={selectedEvent.date} />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2"><Calendar className="h-4 w-4" /> Event Date</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{new Date(selectedEvent.eventDate.toDate()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4" /> Total Guests</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {isLoadingGuests ? <Loader2 className="h-6 w-6 animate-spin"/> : `${guestCount} / ${selectedEvent.guestCapacity}`}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2"><Percent className="h-4 w-4" /> RSVP Rate</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        {isLoadingGuests ? <Loader2 className="h-6 w-6 animate-spin"/> : `${rsvpRate}%`}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Check-ins</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">0 / {guestCount}</div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                         <div className="text-center py-16 border-dashed border-2 rounded-lg">
                            <h3 className="text-xl font-semibold">No Event Selected</h3>
                            <p className="text-muted-foreground mt-2 mb-4">Create an event or select one from the list.</p>
                            <Button asChild>
                                <Link href="/owner-dashboard/create-event">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Create Your First Event
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
