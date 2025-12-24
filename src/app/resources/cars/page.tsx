
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Car, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CarListingCard, type Car as CarType } from '@/components/car-listing-card';
import { useDebounce } from 'use-debounce';

export default function CarsPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const carsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'cars'));
  }, [firestore]);

  const { data: allCars, isLoading } = useCollection<CarType>(carsQuery);

  const filteredCars = useMemo(() => {
    if (!allCars) return [];
    if (!debouncedSearchTerm) return allCars;

    const lowercasedFilter = debouncedSearchTerm.toLowerCase();
    return allCars.filter(car => 
        car.make.toLowerCase().includes(lowercasedFilter) ||
        car.model.toLowerCase().includes(lowercasedFilter) ||
        car.year.toString().includes(lowercasedFilter)
    );
  }, [allCars, debouncedSearchTerm]);

  return (
    <>
        <section className="bg-secondary/50 border-b">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-headline font-bold md:text-5xl">Hire a Car for Your Event</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Arrive in style. Browse and book from our curated collection of premium vehicles.
                </p>
            </div>
             <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search by make, model, or year..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base"
                />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8 md:py-12">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredCars.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {filteredCars.map((car) => (
                <CarListingCard key={car.id} car={car} />
              ))}
            </div>
          )}

          {!isLoading && filteredCars.length === 0 && (
             <div className="text-center py-16">
              <div className="inline-block bg-muted p-6 rounded-full mb-4">
                <Car className="h-16 w-16 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold font-headline">No Cars Found</h2>
              <p className="text-muted-foreground mt-2">
                {debouncedSearchTerm ? "Try adjusting your search term." : "There are no vehicles listed yet. Please check back later."}
              </p>
            </div>
          )}

        </section>
    </>
  );
}
