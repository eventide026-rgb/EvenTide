
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PlannerCard } from '@/components/planner-card';
import { type PlannerProfile } from '@/lib/types';
import { useDebounce } from 'use-debounce';

export function PublicPlannersClient() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const plannersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "plannerProfiles"));
  }, [firestore]);

  const { data: allPlanners, isLoading } = useCollection<PlannerProfile>(plannersQuery);

  const filteredPlanners = useMemo(() => {
    if (!allPlanners) return [];
    if (!debouncedSearchTerm) return allPlanners;

    const lowercasedFilter = debouncedSearchTerm.toLowerCase();
    return allPlanners.filter(planner => 
        planner.name?.toLowerCase().includes(lowercasedFilter)
    );
  }, [allPlanners, debouncedSearchTerm]);

  return (
    <>
      <section className="bg-secondary/50 border-b">
        <div className="container mx-auto px-4 py-8 md:py-12 text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-headline font-bold md:text-5xl">Find a Planner</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              Discover experienced event planners to help bring your vision to life.
            </p>
          </div>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by planner name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 md:py-12">
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[4/3] w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredPlanners.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlanners.map((planner) => (
              <PlannerCard key={planner.id} planner={planner} />
            ))}
          </div>
        )}

        {!isLoading && filteredPlanners.length === 0 && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold font-headline">No Planners Found</h2>
            <p className="text-muted-foreground mt-2">
              {debouncedSearchTerm ? "Try adjusting your search term." : "There are no planners listed yet. Please check back later."}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
