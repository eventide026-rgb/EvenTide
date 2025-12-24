'use client';

import { EventCard, type Event } from '@/components/event-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

// Sample data for demonstration purposes
const sampleEvents: Event[] = [
  {
    id: 'evt-1',
    name: 'Beachside Bonfire Fest',
    eventDate: new Date('2024-11-20T18:00:00'),
    location: 'Landmark Beach, Lagos',
    imageUrl: PlaceHolderImages.find(img => img.id === 'africansFun1')?.imageUrl || '',
    imageHint: PlaceHolderImages.find(img => img.id === 'africansFun1')?.imageHint,
    ownerId: 'ticketier-1',
    isPublic: true,
    isTicketed: true,
  },
  {
    id: 'evt-2',
    name: 'Rooftop Rhythms',
    eventDate: new Date('2024-12-05T20:00:00'),
    location: 'The Grand Terrace, Abuja',
    imageUrl: PlaceHolderImages.find(img => img.id === 'gardenParty')?.imageUrl || '',
    imageHint: PlaceHolderImages.find(img => img.id === 'gardenParty')?.imageHint,
    ownerId: 'ticketier-2',
    isPublic: true,
    isTicketed: true,
  },
  {
    id: 'evt-3',
    name: 'Art & Soul Expo',
    eventDate: new Date('2024-11-28T12:00:00'),
    location: 'Eko Convention Centre, Lagos',
    imageUrl: PlaceHolderImages.find(img => img.id === 'eventHall')?.imageUrl || '',
    imageHint: PlaceHolderImages.find(img => img.id === 'eventHall')?.imageHint,
    ownerId: 'ticketier-1',
    isPublic: true,
    isTicketed: true,
  },
  {
    id: 'evt-4',
    name: 'End of Year Gala',
    eventDate: new Date('2024-12-22T19:00:00'),
    location: 'The Pearl Hall, Port Harcourt',
    imageUrl: PlaceHolderImages.find(img => img.id === 'africansFun2')?.imageUrl || '',
    imageHint: PlaceHolderImages.find(img => img.id === 'africansFun2')?.imageHint,
    ownerId: 'ticketier-3',
    isPublic: true,
    isTicketed: true,
  },
];


export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = sampleEvents.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <section className="bg-secondary/50 border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-headline font-bold md:text-5xl">Discover Events</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
              Browse, find, and buy tickets for the best public events happening near you.
            </p>
          </div>
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by event name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 md:py-12">
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold font-headline">No Events Found</h2>
            <p className="text-muted-foreground mt-2">
              Your search for &quot;{searchTerm}&quot; did not match any events.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
