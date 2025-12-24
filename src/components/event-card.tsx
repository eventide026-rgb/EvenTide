
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from './ui/badge';

export type Event = {
  id: string;
  name: string;
  description: string;
  eventDate: any; // Firestore timestamp
  location: string;
  imageUrls: string[];
  imageHint?: string;
  ownerId: string;
  isPublic: boolean;
  isTicketed: boolean;
};

type EventCardProps = {
  event: Event;
};

export function EventCard({ event }: EventCardProps) {
  const eventPath = event.isTicketed ? 'shows' : 'events';

  return (
    <Link href={`/${eventPath}/${event.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
        <CardHeader className="p-0">
          <div className="aspect-video relative overflow-hidden">
            <Image
              src={event.imageUrls[0]}
              alt={event.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={event.imageHint}
            />
            {event.isTicketed && (
                 <Badge className="absolute top-2 right-2">
                    Tickets Available
                </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-bold font-headline text-lg truncate">{event.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{format(event.eventDate.toDate(), 'PPP')}</span>
          </div>
           <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
