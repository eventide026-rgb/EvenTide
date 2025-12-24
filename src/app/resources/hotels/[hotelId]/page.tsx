
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
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { CheckCircle, Loader2 } from 'lucide-react';
import { type Hotel } from '@/components/hotel-listing-card';
import { BookingDialog } from '@/components/booking-dialog';

export default function HotelDetailsPage({ params }: { params: { hotelId: string } }) {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    const hotelRef = useMemoFirebase(() => {
        if (!firestore || !params.hotelId) return null;
        return doc(firestore, 'hotels', params.hotelId);
    }, [firestore, params.hotelId]);

    const { data: hotel, isLoading: isLoadingHotel, error } = useDoc<Hotel>(hotelRef);

    const isLoading = isUserLoading || isLoadingHotel;

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!hotel && !isLoading) {
        return notFound();
    }
    
    if (!hotel) return null;

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <PublicHeader />
            <main className="flex-1 py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                             <Carousel className="w-full rounded-lg overflow-hidden">
                                <CarouselContent>
                                    {hotel.imageUrls.map((url, index) => (
                                        <CarouselItem key={index}>
                                            <div className="aspect-video relative">
                                                <Image
                                                    src={url}
                                                    alt={`${hotel.name} view ${index + 1}`}
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
                                    <CardTitle className="text-3xl font-headline">About {hotel.name}</CardTitle>
                                    <CardDescription>{hotel.address}, {hotel.city}, {hotel.state}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{hotel.description}</p>
                                    <h3 className="font-bold text-xl mt-6 mb-4">Amenities</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {hotel.amenities.map(amenity => (
                                            <Badge key={amenity} variant="secondary" className="flex items-center gap-2 py-1 px-3">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span>{amenity}</span>
                                            </Badge>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-1">
                             <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle>Rooms & Availability</CardTitle>
                                    <CardDescription>Select a room to proceed with your booking.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                   {hotel.roomTypes.map(room => (
                                     <div key={room.name} className="border p-4 rounded-md flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold">{room.name}</h4>
                                            <p className="text-sm text-muted-foreground">Capacity: {room.capacity} guests</p>
                                            <p className="text-lg font-bold mt-1">₦{room.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
                                        </div>
                                        <BookingDialog 
                                            hotel={hotel} 
                                            roomType={room} 
                                            user={user} 
                                            isUserLoading={isUserLoading}
                                        />
                                     </div>  
                                   ))}
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
