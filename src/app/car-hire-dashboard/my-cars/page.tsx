
'use client';

import Link from 'next/link';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CarListingCard } from '@/components/car-listing-card';
import { Skeleton } from '@/components/ui/skeleton';
import { type Car } from '@/components/car-listing-card';

export default function MyCarsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const myCarsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'cars'), where('ownerId', '==', user.uid));
  }, [firestore, user]);

  const { data: myCars, isLoading: isLoadingCars } = useCollection<Car>(myCarsQuery);

  const isLoading = isUserLoading || isLoadingCars;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Cars</h1>
          <p className="text-muted-foreground">Manage your vehicle listings.</p>
        </div>
        <Button asChild>
          <Link href="/car-hire-dashboard/my-cars/new">Add New Car</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Fleet</CardTitle>
          <CardDescription>All vehicles you have listed for hire on EvenTide.</CardDescription>
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

          {!isLoading && myCars && myCars.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCars.map((car) => (
                <CarListingCard key={car.id} car={car} />
              ))}
            </div>
          )}

          {!isLoading && (!myCars || myCars.length === 0) && (
            <div className="text-center py-16 border-dashed border-2 rounded-lg">
              <h3 className="text-xl font-semibold">You haven't listed any cars yet.</h3>
              <p className="text-muted-foreground mt-2 mb-4">Click the button below to add your first vehicle.</p>
              <Button asChild>
                <Link href="/car-hire-dashboard/my-cars/new">Add New Car</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
