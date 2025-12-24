'use client';

import Link from 'next/link';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { type Event } from '@/components/event-card';
import { EventCard } from '@/components/event-card';

export default function MyEventsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const myEventsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user]);

  const { data: myEvents, isLoading: isLoadingEvents } = useCollection<Event>(myEventsQuery);

  const isLoading = isUserLoading || isLoadingEvents;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Events</h1>
          <p className="text-muted-foreground">Manage your event listings.</p>
        </div>
        <Button asChild>
          <Link href="/ticketier-dashboard/events/new">Create New Event</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
          <CardDescription>All events you have created on EvenTide.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && myEvents && myEvents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          {!isLoading && (!myEvents || myEvents.length === 0) && (
            <div className="text-center py-16 border-dashed border-2 rounded-lg">
              <h3 className="text-xl font-semibold">You haven't created any events yet.</h3>
              <p className="text-muted-foreground mt-2 mb-4">Click the button below to add your first event.</p>
              <Button asChild>
                <Link href="/ticketier-dashboard/events/new">Create New Event</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
