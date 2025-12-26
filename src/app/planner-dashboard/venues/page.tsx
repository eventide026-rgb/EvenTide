
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
import { Building, Search, Calendar as CalendarIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { VenueListingCard, type Venue } from '@/components/venue-listing-card';
import { Button } from '@/components/ui/button';
import { useDebounce } from 'use-debounce';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';


export default function VenuesPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const venuesQuery = useMemoFirebase(() => {
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
      constraints.push(where('city', '==', selectedCity));
    }
    
    if(constraints.length > 0) {
        return query(collection(firestore, "events"), ...constraints);
    }

    return collection(firestore, "events");

  }, [firestore, debouncedSearchTerm, selectedState, selectedCity]);

  const { data: venues, isLoading, error } = useCollection<Venue>(venuesQuery);

  const cities = selectedState
    ? NigerianStatesAndCities.find((s) => s.state === selectedState)?.cities || []
    : [];

  useEffect(() => {
    setSelectedCity('');
  }, [selectedState]);

  return (
    <div className="flex flex-col gap-8">
       <div>
            <h1 className="text-3xl font-bold font-headline">Venue Hub</h1>
            <p className="text-muted-foreground">
                Discover and vet venues for your events.
            </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="relative sm:col-span-2 lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search for a venue by name..."
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

          {!isLoading && venues && venues.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {venues.map((venue) => (
                <VenueListingCard key={venue.id} venue={venue} />
              ))}
            </div>
          )}

          {!isLoading && (!venues || venues.length === 0) && (
            <div className="text-center py-16">
              <div className="inline-block bg-muted p-6 rounded-full mb-4">
                <Building className="h-16 w-16 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold font-headline">No Venues Found</h2>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search filters to find more results.
              </p>
            </div>
          )}

           {error && (
             <div className="text-center py-16 text-destructive">
                <h2 className="text-2xl font-bold font-headline">An Error Occurred</h2>
                <p className="text-red-500/80 mt-2">
                    Could not fetch venue listings. Please try again later.
                </p>
             </div>
           )}

        </section>
    </div>
  );
}
