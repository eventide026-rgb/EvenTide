'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tag } from 'lucide-react';
import { Badge } from './ui/badge';

export type Car = {
    id: string;
    ownerId: string;
    make: string;
    model: string;
    year: number;
    pricePerDay: number;
    location: {
        city: string;
        state: string;
    };
    imageUrls: string[];
    features: string[];
};

type CarListingCardProps = {
  car: Car;
};

export function CarListingCard({ car }: CarListingCardProps) {
  return (
    <Link href={`/resources/cars/${car.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        <CardHeader className="p-0">
          <div className="aspect-video relative overflow-hidden">
            <Image
              src={car.imageUrls[0] || 'https://picsum.photos/seed/placeholder-car/400/225'}
              alt={`${car.year} ${car.make} ${car.model}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-bold font-headline text-lg truncate">{car.year} {car.make} {car.model}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
             <Badge variant="secondary" className="flex items-center gap-1 text-base">
                <Tag className="h-4 w-4" />
                <span>₦{car.pricePerDay.toLocaleString()}/day</span>
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
