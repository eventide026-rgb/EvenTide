
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from 'use-debounce';
import { type Vendor } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VendorSpecialties } from '@/lib/placeholder-images';

export default function VendorHubPage() {
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const vendorsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    if (specialty === 'All') {
        return query(collection(firestore, 'vendors'));
    }
    return query(collection(firestore, 'vendors'), where('specialty', '==', specialty));
  }, [firestore, specialty]);

  const { data: allVendors, isLoading } = useCollection<Vendor>(vendorsQuery);

  const filteredVendors = useMemo(() => {
    if (!allVendors) return [];
    if (!debouncedSearchTerm) return allVendors;

    const lowercasedFilter = debouncedSearchTerm.toLowerCase();
    return allVendors.filter(vendor => 
        vendor.name.toLowerCase().includes(lowercasedFilter)
    );
  }, [allVendors, debouncedSearchTerm]);

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">Vendor Hub</h1>
            <p className="text-muted-foreground">Discover, vet, and contract professionals for your event.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search by vendor name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base"
                />
            </div>
            <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Filter by specialty" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Specialties</SelectItem>
                    {VendorSpecialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading && (
                [...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-80 w-full" />
                    </div>
                ))
            )}

            {!isLoading && filteredVendors.map((vendor) => (
                <div key={vendor.id}>
                    {/* VendorCard will be implemented in a future step */}
                    <p>{vendor.name}</p>
                </div>
            ))}
        </div>

        {!isLoading && filteredVendors.length === 0 && (
            <div className="col-span-full text-center py-16">
                <h2 className="text-2xl font-bold font-headline">No Vendors Found</h2>
                <p className="text-muted-foreground mt-2">
                    {debouncedSearchTerm ? "Try adjusting your search filters." : "There are no vendors listed for this specialty yet."}
                </p>
            </div>
        )}
    </div>
  );
}
