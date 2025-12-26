
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Contact, Search } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { BusinessCard } from '@/components/planner/business-card';

type Contact = {
  id: string;
  vendorId: string;
};

export default function MyNetworkPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

  const contactsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    // This assumes contacts are stored in a subcollection under the user's document
    return query(collection(firestore, "events"));
  }, [firestore, user]);

  const { data: contacts, isLoading } = useCollection<Contact>(contactsQuery);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Network</h1>
        <p className="text-muted-foreground">Your curated list of trusted event professionals.</p>
      </div>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search your network by name or specialty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading &&
          [...Array(4)].map((_, i) => (
            <BusinessCard.Skeleton key={i} />
          ))}

        {!isLoading && contacts && contacts.map((contact) => (
          <BusinessCard key={contact.id} contactId={contact.vendorId} searchTerm={debouncedSearchTerm} />
        ))}
      </div>

      {!isLoading && (!contacts || contacts.length === 0) && (
        <div className="col-span-full text-center py-16">
          <Contact className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-2xl font-bold font-headline mt-4">Your Network is Empty</h2>
          <p className="text-muted-foreground mt-2">
            Bookmark vendors from the marketplace to add them here.
          </p>
        </div>
      )}
    </div>
  );
}
