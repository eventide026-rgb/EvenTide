
'use client';

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useUser, useMemoFirebase } from '@/firebase';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { CheckCircle, Loader2, Users } from 'lucide-react';
import { type Venue } from '@/components/venue-listing-card';
import { VenueBookingDialog } from '@/components/venue-booking-dialog';

export default function VenueDetailsPage({ params }: { params: { venueId: string } }) {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    const venueRef = useMemoFirebase(() => {
        if (!firestore || !params.venueId) return null;
        return doc(firestore, 'venues', params.venueId);
    }, [firestore, params.venueId]);

    const { data: venue, isLoading: isLoadingVenue } = useDoc<Venue>(venueRef);

    const isLoading = isUserLoading || isLoadingVenue;

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!venue && !isLoading) {
        return notFound();
    }
    
    if (!venue) return null;

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <PublicHeader />
            <main className="flex-1 py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                             <Carousel className="w-full rounded-lg overflow-hidden">
                                <CarouselContent>
                                    {venue.imageUrls.map((url, index) => (
                                        <CarouselItem key={index}>
                                            <div className="aspect-video relative">
                                                <Image
                                                    src={url}
                                                    alt={`${venue.name} view ${index + 1}`}
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
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-3xl font-headline">{venue.name}</CardTitle>
                                            <CardDescription>{venue.address}, {venue.city}, {venue.state}</CardDescription>
                                        </div>
                                        <Badge variant="secondary" className="flex items-center gap-2 text-lg">
                                            <Users className="h-5 w-5" />
                                            <span>{venue.capacity} Guests</span>
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{venue.description}</p>
                                    
                                    <h3 className="font-bold text-xl mt-6 mb-4">Amenities</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {venue.amenities.map(item => (
                                            <Badge key={item} variant="outline" className="flex items-center gap-2 py-1 px-3">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span>{item}</span>
                                            </Badge>
                                        ))}
                                    </div>

                                     <h3 className="font-bold text-xl mt-6 mb-4">Features</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {venue.features.map(item => (
                                            <Badge key={item} variant="outline" className="flex items-center gap-2 py-1 px-3">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span>{item}</span>
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-1">
                             <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle>Book this Venue</CardTitle>
                                    <CardDescription>Request to book this venue for your event.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                   <VenueBookingDialog 
                                        venue={venue}
                                        user={user} 
                                        isUserLoading={isUserLoading}
                                    />
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
