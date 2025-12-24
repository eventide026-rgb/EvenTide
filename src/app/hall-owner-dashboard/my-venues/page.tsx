'use client';

import Link from 'next/link';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VenueListingCard, type Venue } from '@/components/venue-listing-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyVenuesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const myVenuesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'venues'), where('ownerId', '==', user.uid));
  }, [firestore, user]);

  const { data: myVenues, isLoading: isLoadingVenues } = useCollection<Venue>(myVenuesQuery);

  const isLoading = isUserLoading || isLoadingVenues;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Venues</h1>
          <p className="text-muted-foreground">Manage your venue listings.</p>
        </div>
        <Button asChild>
          <Link href="/hall-owner-dashboard/my-venues/new">Add New Venue</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Listings</CardTitle>
          <CardDescription>All venues you have listed on EvenTide.</CardDescription>
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

          {!isLoading && myVenues && myVenues.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myVenues.map((venue) => (
                <VenueListingCard key={venue.id} venue={venue} />
              ))}
            </div>
          )}

          {!isLoading && (!myVenues || myVenues.length === 0) && (
            <div className="text-center py-16 border-dashed border-2 rounded-lg">
              <h3 className="text-xl font-semibold">You haven't listed any venues yet.</h3>
              <p className="text-muted-foreground mt-2 mb-4">Click the button below to get started.</p>
              <Button asChild>
                <Link href="/hall-owner-dashboard/my-venues/new">Add New Venue</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
