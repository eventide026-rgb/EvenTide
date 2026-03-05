'use client';

import { use, useMemo } from 'react';
import { doc, collection, query, where } from 'firebase/firestore';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { notFound } from 'next/navigation';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EventCard, type Event as Show } from '@/components/event-card';
import { Skeleton } from '@/components/ui/skeleton';

type TicketierProfile = {
    id: string;
    promoterName: string;
    bio: string;
    avatarUrl: string;
};

export default function TicketierPublicPage({ params }: { params: Promise<{ ticketierId: string }> }) {
    const { ticketierId } = use(params);
    const firestore = useFirestore();

    const ticketierRef = useMemoFirebase(() => {
        if (!firestore || !ticketierId) return null;
        return doc(firestore, 'ticketiers', ticketierId);
    }, [firestore, ticketierId]);

    const showsQuery = useMemoFirebase(() => {
        if (!firestore || !ticketierId) return null;
        return query(
            collection(firestore, 'shows'), 
            where('ownerId', '==', ticketierId),
            where('isPublic', '==', true)
        );
    }, [firestore, ticketierId]);

    const { data: ticketier, isLoading: isLoadingTicketier } = useDoc<TicketierProfile>(ticketierRef);
    const { data: shows, isLoading: isLoadingShows } = useCollection<Show>(showsQuery);

    const isLoading = isLoadingTicketier || isLoadingShows;

    if (!isLoading && !ticketier) {
        return notFound();
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <PublicHeader />
            <main className="flex-1">
                <section className="bg-secondary/50 border-b">
                    <div className="container mx-auto px-4 py-8 md:py-16">
                        {isLoading ? (
                            <div className="flex flex-col items-center text-center">
                                <Skeleton className="h-24 w-24 rounded-full" />
                                <Skeleton className="h-8 w-48 mt-4" />
                                <Skeleton className="h-4 w-64 mt-2" />
                            </div>
                        ) : ticketier && (
                            <div className="flex flex-col items-center text-center">
                                <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
                                    <AvatarImage src={ticketier.avatarUrl} alt={ticketier.promoterName} />
                                    <AvatarFallback>{ticketier.promoterName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <h1 className="text-4xl font-headline font-bold md:text-5xl">{ticketier.promoterName}</h1>
                                <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                                    {ticketier.bio}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
                <section className="container mx-auto px-4 py-8 md:py-12">
                    <h2 className="text-2xl font-headline font-bold mb-8 text-center">Upcoming Shows</h2>
                    {isLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                <Skeleton className="h-48 w-full" />
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                </div>
                            ))}
                        </div>
                    )}
                    {!isLoading && shows && shows.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {shows.map(show => (
                                <EventCard key={show.id} event={show} />
                            ))}
                        </div>
                    )}
                     {!isLoading && (!shows || shows.length === 0) && (
                        <div className="text-center py-16">
                            <p className="text-muted-foreground">This promoter has no upcoming public shows.</p>
                        </div>
                     )}
                </section>
            </main>
            <PublicFooter />
        </div>
    )
}