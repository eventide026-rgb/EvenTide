
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
  Calendar,
  CheckSquare,
  Clock,
  MoreVertical,
  Users,
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
import { collection, query, where, doc, documentId, orderBy, limit } from 'firebase/firestore';
import { Countdown } from '@/components/countdown';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isFuture, isToday } from 'date-fns';
import type { Guest } from '@/lib/types';

type Event = {
  id: string;
  name: string;
  date?: string; // For countdown
  eventDate: any; // Firestore Timestamp
  eventCode?: string;
  status: 'Upcoming' | 'In Progress' | 'Completed';
  guestCapacity?: number;
};

type Task = {
    id: string;
    title: string;
    dueDate?: any;
    status: 'To Do' | 'In Progress' | 'Completed';
}

export default function PlannerDashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Fetch planner's assigned and accepted events
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
          guestCapacity: e.guestCapacity || 20,
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
  const rsvpRate = selectedEvent?.guestCapacity
    ? Math.round((guestCount / selectedEvent.guestCapacity) * 100)
    : 0;

  useEffect(() => {
    if (!selectedEventId && events.length > 0) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  const isLoading = isUserLoading || isLoadingAssignments || isLoadingEvents;
  const isLoadingDetails = isLoadingGuests || isLoadingTasks;

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold font-headline">
            Planner Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage all your assigned events.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/planner-dashboard/invitations">View Invitations</Link>
        </Button>
      </header>

      <div className="grid lg:grid-cols-12 gap-8 flex-1 mt-6">
        <div className="lg:col-span-4 xl:col-span-3 h-full">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>My Gigs</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : events.length > 0 ? (
                <ul className="space-y-2">
                  {events.map((event) => (
                    <li key={event.id}>
                      <button
                        className={cn(
                          'w-full text-left p-3 rounded-lg border transition-all',
                          selectedEvent?.id === event.id
                            ? 'bg-accent border-primary'
                            : 'hover:bg-accent/50'
                        )}
                        onClick={() => setSelectedEventId(event.id)}
                      >
                        <p className="font-semibold truncate">{event.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.status}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  You have no active gigs. Accept an invitation to get
                  started.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : selectedEvent ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {selectedEvent.name}
                    </CardTitle>
                    <CardDescription>
                      Event Code:{' '}
                      <span className="font-mono bg-muted px-2 py-1 rounded-md">
                        {selectedEvent.eventCode}
                      </span>
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <Countdown date={selectedEvent.date} />
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-6">
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
                        <CardTitle className="text-sm font-medium flex items-center gap-2"><CheckSquare className="h-4 w-4" /> Check-ins</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                             {isLoadingGuests ? <Loader2 className="h-6 w-6 animate-spin" /> : `${checkedInCount} / ${guestCount}`}
                        </div>
                    </CardContent>
                </Card>
              </div>

               <Card>
                <CardHeader>
                    <CardTitle>Upcoming Tasks</CardTitle>
                     <CardDescription>Your next 5 most urgent tasks for this event.</CardDescription>
                </CardHeader>
                 <CardContent>
                    {isLoadingDetails ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                        tasks && tasks.length > 0 ? (
                            <ul className="space-y-2">
                                {tasks.map(task => (
                                    <li key={task.id} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                                        <span className="font-medium">{task.title}</span>
                                        <span className="text-muted-foreground text-xs">{task.dueDate ? `Due: ${format(task.dueDate.toDate(), 'MMM dd')}` : ''}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No pending tasks for this event.</p>
                        )
                    )}
                 </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-16 border-dashed border-2 rounded-lg">
              <h3 className="text-xl font-semibold">No Event Selected</h3>
              <p className="text-muted-foreground mt-2 mb-4">
                Select an event from your gigs list to see details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
