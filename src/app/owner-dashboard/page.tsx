
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

type Event = {
    id: string;
    name: string;
    date?: string; // Kept for compatibility with Countdown, will be populated from eventDate
    eventDate: any; // Firestore Timestamp
    code?: string;
    status: "Upcoming" | "Completed";
    guests?: number;
    guestCapacity?: number;
    rsvpRate?: number;
};


const Countdown = ({ date }: { date?: string }) => {
    if (!date) return null;
    const calculateTimeLeft = () => {
        const difference = +new Date(date) - +new Date();
        let timeLeft = {days: 0, hours: 0, minutes: 0};
        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    return (
        <div className="flex space-x-4">
            <div>
                <div className="text-3xl font-bold">{timeLeft.days}</div>
                <div className="text-xs text-muted-foreground">Days</div>
            </div>
            <div>
                <div className="text-3xl font-bold">{timeLeft.hours}</div>
                <div className="text-xs text-muted-foreground">Hours</div>
            </div>
            <div>
                <div className="text-3xl font-bold">{timeLeft.minutes}</div>
                <div className="text-xs text-muted-foreground">Minutes</div>
            </div>
        </div>
    );
}

export default function OwnerDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const eventsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
    }, [firestore, user]);

    const { data: eventsData, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

    const events = useMemo(() => {
        return eventsData?.map(e => ({
            ...e,
            date: e.eventDate.toDate().toISOString(),
            status: e.eventDate.toDate() > new Date() ? 'Upcoming' : 'Completed',
            // Mocking some stats for display
            guests: e.guestCount || 0,
            guestCapacity: e.guestLimit || 20,
            rsvpRate: e.guestCount ? Math.round((e.guestCount / (e.guestLimit || 20)) * 100) : 0,
        })) || [];
    }, [eventsData]);

    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

    // Effect to set the selected event once data loads
    React.useEffect(() => {
        if (!selectedEvent && eventsData && eventsData.length > 0) {
            const firstEvent = {
                ...eventsData[0],
                date: eventsData[0].eventDate.toDate().toISOString(),
                status: eventsData[0].eventDate.toDate() > new Date() ? 'Upcoming' : 'Completed',
                guests: eventsData[0].guestCount || 0,
                guestCapacity: eventsData[0].guestLimit || 20,
                rsvpRate: eventsData[0].guestCount ? Math.round((eventsData[0].guestCount / (eventsData[0].guestLimit || 20)) * 100) : 0,
            };
            setSelectedEvent(firstEvent);
        }
    }, [eventsData, selectedEvent]);
    
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
                                                    "w-full text-left p-3 rounded-lg border transition-all",
                                                    selectedEvent?.id === event.id ? "bg-accent border-primary" : "hover:bg-accent/50"
                                                )}
                                                onClick={() => setSelectedEvent(event)}
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
                                        <CardDescription>Event Code: <span className="font-mono bg-muted px-2 py-1 rounded-md">{selectedEvent.code}</span></CardDescription>
                                    </div>
                                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
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
                                    <div className="text-2xl font-bold">{selectedEvent.guests} / {selectedEvent.guestCapacity}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2"><Percent className="h-4 w-4" /> RSVP Rate</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{selectedEvent.rsvpRate}%</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Check-ins</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">0 / {selectedEvent.guests}</div>
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
