
'use client';

import Link from 'next/link';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { type Event as Show } from '@/components/event-card';
import { EventCard } from '@/components/event-card';

export default function MyShowsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const myShowsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "shows"), where('ownerId', '==', user.uid));
  }, [firestore, user]);

  const { data: myShows, isLoading: isLoadingEvents } = useCollection<Show>(myShowsQuery);

  const isLoading = isUserLoading || isLoadingEvents;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Shows</h1>
          <p className="text-muted-foreground">Manage your show listings.</p>
        </div>
        <Button asChild>
          <Link href="/ticketier-dashboard/shows/new">Create New Show</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Shows</CardTitle>
          <CardDescription>All shows you have created on EvenTide.</CardDescription>
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

          {!isLoading && myShows && myShows.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myShows.map((show) => (
                <EventCard key={show.id} event={show} isDashboard={true} />
              ))}
            </div>
          )}

          {!isLoading && (!myShows || myShows.length === 0) && (
            <div className="text-center py-16 border-dashed border-2 rounded-lg">
              <h3 className="text-xl font-semibold">You haven't created any shows yet.</h3>
              <p className="text-muted-foreground mt-2 mb-4">Click the button below to add your first show.</p>
              <Button asChild>
                <Link href="/ticketier-dashboard/shows/new">Create New Show</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
