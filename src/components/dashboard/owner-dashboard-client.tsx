
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreVertical, Calendar, Users, Percent, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { isToday, isFuture, format } from 'date-fns';
import { Countdown } from '@/components/countdown';
import { Badge } from '@/components/ui/badge';

type Event = {
    id: string;
    name: string;
    date?: string; 
    eventDate: any; 
    eventCode?: string;
    status: "Upcoming" | "In Progress" | "Completed";
    guestLimit?: number;
};

type Guest = {
    id: string;
    hasCheckedIn: boolean;
}

type Task = {
    id: string;
    title: string;
    dueDate?: any;
    status: 'To Do' | 'In Progress' | 'Completed';
}

export function OwnerDashboardClient() {
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
                guestLimit: e.guestLimit || 20,
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

    const tasksQuery = useMemoFirebase(() => {
        if (!firestore || !selectedEventId) return null;
        return query(
            collection(firestore, 'events', selectedEventId, 'tasks'),
            where('status', '!=', 'Completed'),
            orderBy('status'),
            orderBy('dueDate', 'asc'),
            limit(5)
        );
    }, [firestore, selectedEventId]);
    const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(tasksQuery);


    const guestCount = guests?.length ?? 0;
    const checkedInCount = guests?.filter(g => g.hasCheckedIn).length ?? 0;
    const rsvpRate = selectedEvent?.guestLimit ? Math.round((guestCount / selectedEvent.guestLimit) * 100) : 0;


    React.useEffect(() => {
        if (!selectedEventId && events.length > 0) {
            setSelectedEventId(events[0].id);
        }
    }, [events, selectedEventId]);
    
    const isLoading = isUserLoading || isLoadingEvents;
    const isLoadingDetails = isLoadingGuests || isLoadingTasks;

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <Button asChild className="w-full sm:w-auto shadow-lg shadow-primary/20">
                    <Link href="/owner-dashboard/create-event">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Event
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 xl:col-span-3">
                    <Card className="sticky top-20">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">My Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-3">
                                    <Skeleton className="h-14 w-full rounded-xl" />
                                    <Skeleton className="h-14 w-full rounded-xl" />
                                </div>
                            ) : events.length > 0 ? (
                                <ul className="space-y-2">
                                    {events.map(event => (
                                        <li key={event.id}>
                                            <button
                                                className={cn(
                                                    "block w-full text-left p-3 rounded-xl border transition-all duration-200",
                                                    selectedEvent?.id === event.id 
                                                        ? "bg-primary text-primary-foreground border-primary shadow-md" 
                                                        : "hover:bg-muted/80 border-transparent bg-muted/30"
                                                )}
                                                onClick={() => setSelectedEventId(event.id)}
                                            >
                                                <p className="font-semibold truncate text-sm">{event.name}</p>
                                                <p className={cn("text-[10px] uppercase font-bold tracking-wider", selectedEvent?.id === event.id ? "text-primary-foreground/80" : "text-muted-foreground")}>{event.status}</p>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-sm text-muted-foreground">No events yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-8 xl:col-span-9 space-y-6">
                    {isLoading && !selectedEvent ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <Skeleton className="h-48 md:col-span-2 rounded-2xl" />
                            <Skeleton className="h-48 rounded-2xl" />
                            <Skeleton className="h-32 rounded-2xl" />
                            <Skeleton className="h-32 rounded-2xl" />
                            <Skeleton className="h-32 rounded-2xl" />
                        </div>
                    ) : selectedEvent ? (
                        <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <Card className="md:col-span-2 overflow-hidden border-none shadow-xl bg-gradient-to-br from-primary/10 via-background to-background relative group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                                <CardHeader className="flex flex-row items-start justify-between">
                                    <div className="space-y-1">
                                        <Badge variant="outline" className="bg-background/50 border-primary/20 text-primary">{selectedEvent.status}</Badge>
                                        <CardTitle className="text-3xl font-headline pt-2">{selectedEvent.name}</CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            Code: <span className="font-mono bg-muted/50 px-2 py-0.5 rounded text-foreground font-bold">{selectedEvent.eventCode}</span>
                                        </CardDescription>
                                    </div>
                                     <Button variant="ghost" size="icon" className="rounded-full hover:bg-background/80" asChild>
                                        <Link href={`/owner-dashboard/events/${selectedEvent.id}`}>
                                            <MoreVertical className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent className="pb-8">
                                    <Countdown date={selectedEvent.date} />
                                </CardContent>
                            </Card>

                            <Card className="flex flex-col justify-center">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> Schedule</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{format(selectedEvent.eventDate.toDate(), 'MMMM d, yyyy')}</div>
                                    <p className="text-xs text-muted-foreground mt-1">{format(selectedEvent.eventDate.toDate(), 'EEEE, p')}</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> Capacity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">
                                        {isLoadingGuests ? <Loader2 className="h-6 w-6 animate-spin"/> : `${guestCount} / ${selectedEvent.guestLimit}`}
                                    </div>
                                    <div className="w-full bg-muted h-1.5 rounded-full mt-3 overflow-hidden">
                                        <div 
                                            className="bg-primary h-full transition-all duration-1000" 
                                            style={{ width: `${Math.min(100, rsvpRate)}%` }} 
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><Percent className="h-4 w-4" /> RSVP Engagement</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">
                                        {isLoadingGuests ? <Loader2 className="h-6 w-6 animate-spin"/> : `${rsvpRate}%`}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Confirmed attendance rate</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-4 w-4" /> On-Site Check-ins</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">
                                        {isLoadingGuests ? <Loader2 className="h-6 w-6 animate-spin" /> : `${checkedInCount} / ${guestCount}`}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Real-time arrival stream</p>
                                </CardContent>
                            </Card>
                        </div>

                         <Card className="border-none shadow-lg">
                            <CardHeader className="border-b bg-muted/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">Upcoming Logistics</CardTitle>
                                        <CardDescription>A priority feed of your planner's roadmap.</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/owner-dashboard/contracts-tasks">View Full Board</Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {isLoadingDetails ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-12 w-full rounded-lg" />
                                        <Skeleton className="h-12 w-full rounded-lg" />
                                    </div>
                                ) : (
                                    tasks && tasks.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {tasks.map(task => (
                                                <div key={task.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 transition-colors">
                                                    <div className="space-y-1">
                                                        <p className="font-semibold text-sm line-clamp-1">{task.title}</p>
                                                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{task.status}</Badge>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Due</p>
                                                        <p className="text-xs font-mono">{task.dueDate ? format(task.dueDate.toDate(), 'MMM d') : '—'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 border-2 border-dashed rounded-2xl">
                                            <CheckCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                                            <p className="text-sm text-muted-foreground">All logistical milestones for this week are clear.</p>
                                        </div>
                                    )
                                )}
                            </CardContent>
                        </Card>
                        </>
                    ) : (
                         <div className="flex flex-col items-center justify-center text-center py-32 bg-muted/20 border-2 border-dashed rounded-3xl">
                            <div className="p-6 bg-background rounded-full shadow-lg mb-6">
                                <PlusCircle className="h-12 w-12 text-primary" />
                            </div>
                            <h3 className="text-2xl font-headline font-bold">No Active Celebration</h3>
                            <p className="text-muted-foreground mt-2 max-w-md mx-auto px-4">
                                You haven't created any events yet. Start your first masterpiece by clicking the button below.
                            </p>
                            <Button asChild size="lg" className="mt-8 px-10 rounded-full font-bold">
                                <Link href="/owner-dashboard/create-event">
                                    Launch New Event
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
