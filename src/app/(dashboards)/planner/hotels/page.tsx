
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  where,
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
import { Hotel, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { HotelListingCard, type Hotel as HotelType } from '@/components/hotel-listing-card';
import { useDebounce } from 'use-debounce';

export default function PlannerHotelSearchPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const hotelsQuery = useMemoFirebase(() => {
    if (!firestore) return null;

    const constraints: any[] = [];
    if (debouncedSearchTerm) {
         constraints.push(
            or(
                where('name', '>=', debouncedSearchTerm),
                where('name', '<=', debouncedSearchTerm + '\uf8ff')
            )
        );
    }
    
    return query(collection(firestore, 'hotels'), ...constraints);

  }, [firestore, debouncedSearchTerm]);

  const { data: allHotels, isLoading, error } = useCollection<HotelType>(hotelsQuery);

  const filteredHotels = useMemo(() => {
    if (!allHotels) return [];
    
    return allHotels.filter(hotel => {
        const stateMatch = selectedState !== 'All' ? hotel.state === selectedState : true;
        const cityMatch = selectedCity !== 'All' ? hotel.city === selectedCity : true;
        return stateMatch && cityMatch;
    });

  }, [allHotels, selectedState, selectedCity]);

  const cities = selectedState !== 'All'
    ? NigerianStatesAndCities.find((s) => s.state === selectedState)?.cities || []
    : [];

  useEffect(() => {
    setSelectedCity('All');
  }, [selectedState]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Hotel Hub</h1>
        <p className="text-muted-foreground">
            Discover and vet accommodations for your events.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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
                  <SelectItem value="All">All States</SelectItem>
                  {NigerianStatesAndCities.map((s) => (
                  <SelectItem key={s.state} value={s.state}>
                      {s.state}
                  </SelectItem>
                  ))}
              </SelectContent>
          </Select>
            <Select value={selectedCity} onValueChange={setSelectedCity} disabled={selectedState === 'All'}>
              <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="All">All Cities</SelectItem>
                  {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                      {city}
                  </SelectItem>
                  ))}
              </SelectContent>
          </Select>
      </div>

      <section>
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

        {!isLoading && filteredHotels && filteredHotels.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {filteredHotels.map((hotel) => (
              <HotelListingCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}

        {!isLoading && (!filteredHotels || filteredHotels.length === 0) && (
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
    </div>
  );
}
