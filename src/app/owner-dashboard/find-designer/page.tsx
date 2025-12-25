
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from 'use-debounce';
import { type Vendor } from '@/lib/types';
import { DesignerCard } from '@/components/designer-card';

export default function FindDesignerPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const designersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'vendors'), where('specialty', '==', 'Fashion Designer'));
  }, [firestore]);

  const { data: allDesigners, isLoading } = useCollection<Vendor>(designersQuery);

  const filteredDesigners = useMemo(() => {
    if (!allDesigners) return [];
    if (!debouncedSearchTerm) return allDesigners;

    const lowercasedFilter = debouncedSearchTerm.toLowerCase();
    return allDesigners.filter(designer => 
        designer.name.toLowerCase().includes(lowercasedFilter)
    );
  }, [allDesigners, debouncedSearchTerm]);

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">Fashion Hub</h1>
            <p className="text-muted-foreground">Discover and commission talented fashion designers for your event.</p>
        </div>

        <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
                placeholder="Search by designer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
            />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading && (
                [...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                    <Skeleton className="h-80 w-full" />
                    </div>
                ))
            )}

            {!isLoading && filteredDesigners.map((designer) => (
                <DesignerCard key={designer.id} designer={designer} />
            ))}
        </div>

        {!isLoading && filteredDesigners.length === 0 && (
            <div className="col-span-full text-center py-16">
                <h2 className="text-2xl font-bold font-headline">No Designers Found</h2>
                <p className="text-muted-foreground mt-2">
                    {debouncedSearchTerm ? "Try adjusting your search term." : "There are no fashion designers listed yet."}
                </p>
            </div>
        )}
    </div>
  );
}
