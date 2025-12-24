'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HotelListingCard } from '@/components/hotel-listing-card';
import { type Hotel } from '@/components/hotel-listing-card';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyHotelsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const myHotelsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'hotels'), where('ownerId', '==', user.uid));
  }, [firestore, user]);

  const { data: myHotels, isLoading: isLoadingHotels } = useCollection<Hotel>(myHotelsQuery);

  const isLoading = isUserLoading || isLoadingHotels;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Hotels</h1>
          <p className="text-muted-foreground">Manage your property listings.</p>
        </div>
        <Button asChild>
          <Link href="/hotelier-dashboard/my-hotels/new">Add New Hotel</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Listings</CardTitle>
          <CardDescription>All hotels you have listed on EvenTide.</CardDescription>
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

          {!isLoading && myHotels && myHotels.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myHotels.map((hotel) => (
                <HotelListingCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}

          {!isLoading && (!myHotels || myHotels.length === 0) && (
            <div className="text-center py-16 border-dashed border-2 rounded-lg">
              <h3 className="text-xl font-semibold">You haven't listed any hotels yet.</h3>
              <p className="text-muted-foreground mt-2 mb-4">Click the button below to get started.</p>
              <Button asChild>
                <Link href="/hotelier-dashboard/my-hotels/new">Add New Hotel</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
