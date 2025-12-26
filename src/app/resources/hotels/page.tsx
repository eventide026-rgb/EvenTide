
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  Firestore,
  Query,
  DocumentData,
  or,
} from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { NigerianStatesAndCities } from '@/lib/nigerian-states';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Hotel, Search, SlidersHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { HotelListingCard, type Hotel as HotelType } from '@/components/hotel-listing-card';
import { Button } from '@/components/ui/button';
import { useDebounce } from 'use-debounce';


export default function HotelsPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const hotelsQuery = useMemoFirebase(() => {
    if (!firestore) return null;

    const constraints = [];
    if (debouncedSearchTerm) {
         constraints.push(
            or(
                where('name', '>=', debouncedSearchTerm),
                where('name', '<=', debouncedSearchTerm + '\uf8ff')
            )
        );
    }
    if (selectedState) {
      constraints.push(where('state', '==', selectedState));
    }
    if (selectedCity) {
      constraints.push(where('city', '==', selectedState));
    }
    
    if(constraints.length > 0) {
        return query(collection(firestore, "events"), ...constraints);
    }

    return collection(firestore, "events");

  }, [firestore, debouncedSearchTerm, selectedState, selectedCity]);

  const { data: hotels, isLoading, error } = useCollection<HotelType>(hotelsQuery);

  const cities = selectedState
    ? NigerianStatesAndCities.find((s) => s.state === selectedState)?.cities || []
    : [];

  useEffect(() => {
    setSelectedCity('');
  }, [selectedState]);

  return (
    <>
        <section className="bg-secondary/50 border-b">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-headline font-bold md:text-5xl">Find the Perfect Stay</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                    Discover accommodations close to your event venue.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end max-w-5xl mx-auto">
                <div className="relative sm:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search for a hotel..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 text-base"
                    />
                </div>
                 <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                        {NigerianStatesAndCities.map((s) => (
                        <SelectItem key={s.state} value={s.state}>
                            {s.state}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState}>
                    <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                        {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                            {city}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8 md:py-12">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && hotels && hotels.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {hotels.map((hotel) => (
                <HotelListingCard key={hotel.id} hotel={hotel} />
              ))}
            </div>
          )}

          {!isLoading && (!hotels || hotels.length === 0) && (
            <div className="text-center py-16">
              <div className="inline-block bg-muted p-6 rounded-full mb-4">
                <Hotel className="h-16 w-16 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold font-headline">No Hotels Found</h2>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search filters to find more results.
              </p>
            </div>
          )}

           {error && (
             <div className="text-center py-16 text-destructive">
                <h2 className="text-2xl font-bold font-headline">An Error Occurred</h2>
                <p className="text-red-500/80 mt-2">
                    Could not fetch hotel listings. Please try again later.
                </p>
             </div>
           )}

        </section>
    </>
  );
}
