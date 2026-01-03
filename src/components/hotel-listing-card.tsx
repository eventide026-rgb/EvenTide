
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

export type RoomType = {
    name: string;
    price: number;
    capacity: number;
};

export type Hotel = {
    id: string;
    ownerId: string;
    name: string;
    state: string;
    city: string;
    address: string;
    description: string;
    imageUrls: string[];
    amenities: string[];
    roomTypes: RoomType[];
    imageHint?: string; // Kept optional for now
};

type HotelListingCardProps = {
  hotel: Hotel;
  isDashboard?: boolean;
};

export function HotelListingCard({ hotel, isDashboard = false }: HotelListingCardProps) {
  const linkHref = isDashboard ? `/hotelier-dashboard/my-hotels/${hotel.id}/edit` : `/resources/hotels/${hotel.id}`;
  return (
    <Link href={linkHref} className="group block">
      <Card className="overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        <CardHeader className="p-0">
          <div className="aspect-video relative overflow-hidden">
            <Image
              src={hotel.imageUrls[0] || 'https://picsum.photos/seed/placeholder/400/225'}
              alt={hotel.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-bold font-headline text-lg truncate">{hotel.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{hotel.city}, {hotel.state}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
