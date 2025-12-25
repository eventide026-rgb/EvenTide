'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Search, UserSearch } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from 'use-debounce';
import { PlannerCard, type PlannerProfile } from '@/components/planner-card';

export default function FindPlannerPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const plannersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // This query finds all users who have the role of 'Planner'
    return query(collection(firestore, 'users'), where('role', '==', 'Planner'));
  }, [firestore]);

  // We are casting the result to PlannerProfile. This assumes the user document
  // has the fields expected by PlannerProfile.
  const { data: allPlanners, isLoading } = useCollection<PlannerProfile>(plannersQuery);

  const filteredPlanners = useMemo(() => {
    if (!allPlanners) return [];
    if (!debouncedSearchTerm) return allPlanners;

    const lowercasedFilter = debouncedSearchTerm.toLowerCase();
    // Assuming user documents have `firstName` and `lastName` fields
    return allPlanners.filter(planner => 
        (planner.name?.toLowerCase() || `${planner.firstName} ${planner.lastName}`.toLowerCase()).includes(lowercasedFilter)
    );
  }, [allPlanners, debouncedSearchTerm]);

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">Find a Planner</h1>
            <p className="text-muted-foreground">Discover and vet professional event planners for your next event.</p>
        </div>

        <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                placeholder="Search by planner name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
            />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading && (
                [...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="aspect-[4/3] w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ))
            )}

            {!isLoading && filteredPlanners.map((planner) => (
                // Assuming the user document structure matches what PlannerCard expects
                <PlannerCard key={planner.id} planner={planner} />
            ))}
        </div>

        {!isLoading && (!filteredPlanners || filteredPlanners.length === 0) && (
            <div className="col-span-full text-center py-16">
                 <UserSearch className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="text-2xl font-bold font-headline mt-4">No Planners Found</h2>
                <p className="text-muted-foreground mt-2">
                    {debouncedSearchTerm ? "Try adjusting your search term." : "There are no planners listed on the platform yet."}
                </p>
            </div>
        )}
    </div>
  );
}
