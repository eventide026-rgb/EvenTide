
'use client';

import { EventCard, type Event as Show } from '@/components/event-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from 'use-debounce';

const sampleShows: Show[] = [
    {
        id: 'sample-show-1',
        name: 'Vibes on the Beach',
        description: 'The biggest beach party of the year! Featuring live music from top artists, food stalls, and games. Dont miss out on the ultimate summer experience.',
        eventDate: { toDate: () => new Date('2024-12-15T18:00:00') },
        location: 'Landmark Beach, Lagos',
        imageUrls: ['https://picsum.photos/seed/beachparty/600/400'],
        imageHint: 'beach party',
        ownerId: 'sample-owner-1',
        isPublic: true,
        isTicketed: true,
    },
    {
        id: 'sample-show-2',
        name: 'Afro Beats Festival',
        description: 'A two-day festival celebrating the best of Afro Beats. Join us for a weekend of non-stop music, dance, and culture.',
        eventDate: { toDate: () => new Date('2025-01-20T14:00:00') },
        location: 'Eko Atlantic, Lagos',
        imageUrls: ['https://picsum.photos/seed/afrofest/600/400'],
        imageHint: 'music festival',
        ownerId: 'sample-owner-2',
        isPublic: true,
        isTicketed: true,
    },
    {
        id: 'sample-show-3',
        name: 'Art & Soul Exhibition',
        description: 'An immersive art experience showcasing the work of emerging Nigerian artists. Explore stunning paintings, sculptures, and digital art.',
        eventDate: { toDate: () => new Date('2024-11-30T12:00:00') },
        location: 'Nike Art Gallery, Lagos',
        imageUrls: ['https://picsum.photos/seed/artexhibit/600/400'],
        imageHint: 'art gallery',
        ownerId: 'sample-owner-3',
        isPublic: true,
        isTicketed: true,
    },
];


export default function ShowsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const firestore = useFirestore();

  const showsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "events"), where('isPublic', '==', true));
  }, [firestore]);

  const { data: allShows, isLoading } = useCollection<Show>(showsQuery);

  const showsToDisplay = !isLoading && allShows && allShows.length > 0 ? allShows : sampleShows;

  const filteredShows = useMemo(() => 
      showsToDisplay.filter(
          (show) =>
            show.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            show.location.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        ), [showsToDisplay, debouncedSearchTerm]
    );

  return (
    <>
      <section className="bg-secondary/50 border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-headline font-bold md:text-5xl">Discover Shows</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              Browse, find, and buy tickets for the best public shows happening near you.
            </p>
          </div>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by show name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 md:py-12">
        {isLoading && (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-56 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
              ))}
            </div>
        )}
        {!isLoading && filteredShows.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredShows.map((show) => (
              <EventCard key={show.id} event={show} />
            ))}
          </div>
        ) : !isLoading && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold font-headline">No Shows Found</h2>
            <p className="text-muted-foreground mt-2">
              {debouncedSearchTerm ? `Your search for "${debouncedSearchTerm}" did not match any shows.` : 'There are no public shows listed at the moment.'}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
