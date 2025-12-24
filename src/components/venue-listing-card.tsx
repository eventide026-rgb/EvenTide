
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Building, MapPin, Users } from 'lucide-react';
import { Badge } from './ui/badge';

export type Venue = {
    id: string;
    ownerId: string;
    name: string;
    state: string;
    city: string;
    address: string;
    imageUrls: string[];
    description: string;
    capacity: number;
    amenities: string[];
    features: string[];
};

type VenueListingCardProps = {
  venue: Venue;
};

export function VenueListingCard({ venue }: VenueListingCardProps) {
  return (
    <Link href={`/resources/venues/${venue.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        <CardHeader className="p-0">
          <div className="aspect-video relative overflow-hidden">
            <Image
              src={venue.imageUrls[0] || 'https://picsum.photos/seed/placeholder-venue/400/225'}
              alt={venue.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
             <Badge className="absolute top-2 right-2">
                <Users className="h-3 w-3 mr-1" />
                {venue.capacity} Guests
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-bold font-headline text-lg truncate">{venue.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{venue.city}, {venue.state}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
