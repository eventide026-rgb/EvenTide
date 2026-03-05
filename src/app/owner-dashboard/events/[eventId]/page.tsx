'use client';

import { use, Suspense } from 'react';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';
import { Loader2, Calendar, MapPin, Users, Palette, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

type Event = {
    id: string;
    name: string;
    description: string;
    eventDate: any;
    location: string;
    eventCode: string;
    primaryColor: string;
    secondaryColor: string;
    guestCount?: number;
    guestLimit?: number;
};

type Guest = {
    id: string;
}

function EventDetails({ eventId }: { eventId: string }) {
    const firestore = useFirestore();

    const eventRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'events', eventId);
    }, [firestore, eventId]);

    const { data: event, isLoading: isLoadingEvent } = useDoc<Event>(eventRef);

    const guestsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'events', eventId, 'guests'));
    }, [firestore, eventId]);

    const { data: guests, isLoading: isLoadingGuests } = useCollection<Guest>(guestsQuery);
    
    if (isLoadingEvent || isLoadingGuests) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!event) {
        return <p>Event not found.</p>;
    }

    const guestCount = guests?.length || 0;
    const guestLimit = event.guestLimit || 20;
    const capacityPercentage = guestLimit > 0 ? (guestCount / guestLimit) * 100 : 0;

    return (
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">{event.name}</CardTitle>
                    <div className='flex justify-between items-center'>
                        <CardDescription>{event.description}</CardDescription>
                        <Badge variant="outline">Code: {event.eventCode}</Badge>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <Card>
                    <CardHeader className="flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Date</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-bold">{event.eventDate?.toDate ? format(event.eventDate.toDate(), 'PPP') : 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{event.eventDate?.toDate ? format(event.eventDate.toDate(), 'p') : 'N/A'}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Location</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-bold truncate">{event.location}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Guests</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <p className="text-lg font-bold">{guestCount} / {guestLimit}</p>
                        <Progress value={capacityPercentage} className="h-2 mt-1"/>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Theme</CardTitle>
                        <Palette className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full border" style={{backgroundColor: event.primaryColor}} />
                        <div className="h-8 w-8 rounded-full border" style={{backgroundColor: event.secondaryColor}} />
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Check-in Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-bold">0</p>
                        <p className="text-muted-foreground">/ {guestCount} guests checked in</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function EventDetailsPage({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = use(params);

    return (
        <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <EventDetails eventId={eventId} />
        </Suspense>
    );
}
