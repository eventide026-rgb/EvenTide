
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Search, Shirt } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from 'use-debounce';
import { type Vendor } from '@/lib/types';
import { DesignerCard } from '@/components/designer-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NigerianStatesAndCities } from '@/lib/nigerian-states';

export default function FindDesignerPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const designersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    
    let q = query(collection(firestore, 'vendors'), where('specialty', '==', 'Fashion Designer'));
    
    return q;
  }, [firestore]);

  const { data: allDesigners, isLoading } = useCollection<Vendor>(designersQuery);

  const filteredDesigners = useMemo(() => {
    if (!allDesigners) return [];
    
    return allDesigners.filter(designer => {
        const nameMatch = debouncedSearchTerm ? designer.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) : true;
        const stateMatch = selectedState !== 'All' ? designer.state === selectedState : true;
        const cityMatch = selectedCity !== 'All' ? designer.city === selectedCity : true;
        return nameMatch && stateMatch && cityMatch;
    });

  }, [allDesigners, debouncedSearchTerm, selectedState, selectedCity]);

  const cities = selectedState !== 'All' 
    ? NigerianStatesAndCities.find(s => s.state === selectedState)?.cities || []
    : [];

  useEffect(() => {
    setSelectedCity('All');
  }, [selectedState]);

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">Fashion Hub</h1>
            <p className="text-muted-foreground">Discover and commission talented fashion designers for your event.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2 lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search by designer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base"
                />
            </div>
             <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All States</SelectItem>
                    {NigerianStatesAndCities.map(s => <SelectItem key={s.state} value={s.state}>{s.state}</SelectItem>)}
                </SelectContent>
            </Select>
             <Select value={selectedCity} onValueChange={setSelectedCity} disabled={selectedState === 'All'}>
                <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Filter by city" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Cities</SelectItem>
                    {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading && (
                [...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="aspect-square w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ))
            )}

            {!isLoading && filteredDesigners.map((designer) => (
                <DesignerCard key={designer.id} designer={designer} />
            ))}
        </div>

        {!isLoading && filteredDesigners.length === 0 && (
            <div className="col-span-full text-center py-16">
                 <Shirt className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="text-2xl font-bold font-headline mt-4">No Designers Found</h2>
                <p className="text-muted-foreground mt-2">
                    {debouncedSearchTerm ? "Try adjusting your search term." : "There are no fashion designers listed yet."}
                </p>
            </div>
        )}
    </div>
  );
}
