
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  SquareCheck,
  MoreVertical,
  Users,
  Loader2,
  TrendingUp,
  Mail,
} from "lucide-react";
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
} from '@/firebase';
import { collection, query, where, documentId, orderBy, limit } from 'firebase/firestore';
import { Countdown } from '@/components/countdown';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isFuture, isToday } from 'date-fns';
import type { Guest } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

type Event = {
  id: string;
  name: string;
  date?: string; // For countdown
  eventDate: any; // Firestore Timestamp
  eventCode?: string;
  status: 'Upcoming' | 'In Progress' | 'Completed';
  guestLimit?: number;
};

type Task = {
    id: string;
    title: string;
    dueDate?: any;
    status: 'To Do' | 'In Progress' | 'Completed';
}

export function PlannerDashboardClient() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const assignmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'planners', user.uid, 'assignments'),
      where('status', '==', 'accepted')
    );
  }, [firestore, user]);

  const { data: assignments, isLoading: isLoadingAssignments } = useCollection(assignmentsQuery);
  const eventIds = useMemo(() => assignments?.map((a: any) => a.eventId) || [], [assignments]);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || eventIds.length === 0) return null;
    return query(collection(firestore, 'events'), where(documentId(), 'in', eventIds));
  }, [firestore, eventIds]);

  const { data: eventsData, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  const events = useMemo(() => {
    return (
      eventsData?.map((e) => {
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
        };
      }) || []
    );
  }, [eventsData]);

  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || null;
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
  const rsvpRate = selectedEvent?.guestLimit
    ? Math.round((guestCount / selectedEvent.guestLimit) * 100)
    : 0;

  useEffect(() => {
    if (!selectedEventId && events.length > 0) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  const isLoading = isUserLoading || isLoadingAssignments || isLoadingEvents;

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button asChild variant="outline" className="w-full sm:w-auto shadow-sm">
          <Link href="/planner/invitations"><Mail className="mr-2 h-4 w-4" /> Gig Invitations</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 xl:col-span-3">
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Active Gigs</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full rounded-xl" />
                  <Skeleton className="h-14 w-full rounded-xl" />
                </div>
              ) : events.length > 0 ? (
                <ul className="space-y-2">
                  {events.map((event) => (
                    <li key={event.id}>
                      <button
                        className={cn(
                          'w-full text-left p-3 rounded-xl border transition-all duration-200',
                          selectedEvent?.id === event.id
                            ? 'bg-primary text-primary-foreground border-primary shadow-md'
                            : 'hover:bg-muted/80 border-transparent bg-muted/30'
                        )}
                        onClick={() => setSelectedEventId(event.id)}
                      >
                        <p className="font-semibold truncate text-sm">{event.name}</p>
                        <p className={cn("text-[10px] uppercase font-bold tracking-wider", selectedEvent?.id === event.id ? "text-primary-foreground/80" : "text-muted-foreground")}>
                          {event.status}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No active assignments.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {isLoading && !selectedEvent ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-64 w-full rounded-3xl" />
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                </div>
            </div>
          ) : selectedEvent ? (
            <>
              <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-primary/5 via-background to-background relative">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div className="space-y-1">
                    <Badge variant="outline" className="bg-background/50 border-primary/20 text-primary">{selectedEvent.status}</Badge>
                    <CardTitle className="text-3xl font-headline pt-2">
                      {selectedEvent.name}
                    </CardTitle>
                    <CardDescription>
                      Event Identifier:{' '}
                      <span className="font-mono bg-muted/50 px-2 py-0.5 rounded text-foreground font-bold">
                        {selectedEvent.eventCode}
                      </span>
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="pb-8">
                  <Countdown date={selectedEvent.date} />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> Guest Load</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {isLoadingGuests ? <Loader2 className="h-6 w-6 animate-spin"/> : `${guestCount} / ${selectedEvent.guestLimit}`}
                        </div>
                        <div className="w-full bg-muted h-1 rounded-full mt-3 overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: `${Math.min(100, rsvpRate)}%` }} />
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><SquareCheck className="h-4 w-4" /> Validated Arrivals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                             {isLoadingGuests ? <Loader2 className="h-6 w-6 animate-spin" /> : `${checkedInCount} / ${guestCount}`}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Live check-in stream active</p>
                    </CardContent>
                </Card>
                <Card className="sm:col-span-2 lg:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground"><TrendingUp className="h-4 w-4" /> Engagement</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{rsvpRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Confirmed RSVP frequency</p>
                    </CardContent>
                </Card>
              </div>

               <Card className="border-none shadow-lg">
                <CardHeader className="border-b bg-muted/10 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Critical Task Board</CardTitle>
                        <CardDescription>High-priority logistical milestones.</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/planner/tasks">View Board</Link>
                    </Button>
                </CardHeader>
                 <CardContent className="pt-6">
                    {isLoadingTasks ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : (
                        tasks && tasks.length > 0 ? (
                            <div className="space-y-3">
                                {tasks.map(task => (
                                    <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                            <span className="font-semibold text-sm">{task.title}</span>
                                        </div>
                                        <span className="text-muted-foreground text-[10px] font-mono font-bold uppercase">{task.dueDate ? format(task.dueDate.toDate(), 'MMM d') : ''}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed rounded-2xl">
                                <p className="text-sm text-muted-foreground">All assignment paths are currently clear.</p>
                            </div>
                        )
                    )}
                 </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-32 bg-muted/20 border-2 border-dashed rounded-3xl px-4">
              <div className="p-6 bg-background rounded-full shadow-lg mb-6 text-primary">
                <Briefcase className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-headline font-bold">No Gig Selected</h3>
              <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                Select an active assignment from your list to access logistical tools and real-time event metrics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
