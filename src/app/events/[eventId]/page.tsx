'use client';

import { useMemo, useState } from 'react';
import { doc, collection, query, where } from 'firebase/firestore';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Calendar, MapPin, MinusCircle, PlusCircle } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { type Event } from '@/components/event-card';
import { type TicketTier } from '@/app/(app)/events/new/page';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

type TicketSelection = {
  [tierId: string]: number;
};

export default function EventDetailPage({ params }: { params: { eventId: string } }) {
    const firestore = useFirestore();
    const router = useRouter();
    const [ticketSelection, setTicketSelection] = useState<TicketSelection>({});

    const eventRef = useMemoFirebase(() => {
        if (!firestore || !params.eventId) return null;
        return doc(firestore, 'events', params.eventId);
    }, [firestore, params.eventId]);

    const ticketTiersQuery = useMemoFirebase(() => {
        if (!firestore || !params.eventId) return null;
        return query(collection(firestore, 'events', params.eventId, 'ticketTiers'));
    }, [firestore, params.eventId]);

    const { data: event, isLoading: isLoadingEvent } = useDoc<Event>(eventRef);
    const { data: ticketTiers, isLoading: isLoadingTiers } = useCollection<TicketTier>(ticketTiersQuery);

    const isLoading = isLoadingEvent || isLoadingTiers;

    const handleQuantityChange = (tierId: string, delta: number) => {
        setTicketSelection(prev => {
            const currentQuantity = prev[tierId] || 0;
            const newQuantity = Math.max(0, currentQuantity + delta);
            return { ...prev, [tierId]: newQuantity };
        });
    };

    const handlePurchase = () => {
        const selection = Object.entries(ticketSelection)
            .filter(([, quantity]) => quantity > 0)
            .map(([tierId, quantity]) => `${tierId}:${quantity}`);
        
        if (selection.length === 0) return;

        const queryParams = new URLSearchParams({
            selection: selection.join(','),
        });

        router.push(`/events/${params.eventId}/purchase?${queryParams.toString()}`);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!event && !isLoading) {
        return notFound();
    }
    
    if (!event) return null;

    const totalSelectedTickets = Object.values(ticketSelection).reduce((sum, qty) => sum + qty, 0);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <PublicHeader />
            <main className="flex-1 py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-3">
                             <Carousel className="w-full rounded-lg overflow-hidden border">
                                <CarouselContent>
                                    {event.imageUrls && event.imageUrls.map((url, index) => (
                                        <CarouselItem key={index}>
                                            <div className="aspect-video relative">
                                                <Image
                                                    src={url}
                                                    alt={`${event.name} view ${index + 1}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="left-4" />
                                <CarouselNext className="right-4" />
                            </Carousel>
                            <Card className="mt-8">
                                <CardHeader>
                                    <CardTitle className="text-3xl font-headline">{event.name}</CardTitle>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-2 text-muted-foreground pt-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>{format(new Date(event.eventDate), 'PPP p')}</span>
                                        </div>
                                         <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>{event.location}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose prose-invert max-w-none text-foreground/80">
                                      <p>{event.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-2">
                             <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle>Get Your Tickets</CardTitle>
                                    <CardDescription>Select the number of tickets for each tier.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                   {ticketTiers && ticketTiers.map(tier => (
                                     <div key={tier.id} className="border p-4 rounded-md flex items-center justify-between gap-4">
                                        <div>
                                            <h4 className="font-semibold">{tier.name}</h4>
                                            <p className="text-lg font-bold mt-1">₦{tier.price.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">{tier.quantity - (tier.sold || 0)} available</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(tier.id, -1)} disabled={(ticketSelection[tier.id] || 0) === 0}>
                                                <MinusCircle className="h-5 w-5" />
                                            </Button>
                                            <span className="font-bold text-lg w-8 text-center">{ticketSelection[tier.id] || 0}</span>
                                            <Button variant="ghost" size="icon" onClick={() => handleQuantityChange(tier.id, 1)} disabled={(ticketSelection[tier.id] || 0) >= (tier.quantity - (tier.sold || 0))}>
                                                <PlusCircle className="h-5 w-5" />
                                            </Button>
                                        </div>
                                     </div>  
                                   ))}
                                   <Button className="w-full" size="lg" disabled={totalSelectedTickets === 0} onClick={handlePurchase}>
                                        Purchase {totalSelectedTickets > 0 ? `${totalSelectedTickets} Ticket(s)` : 'Tickets'}
                                   </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <PublicFooter />
        </div>
    )
}
