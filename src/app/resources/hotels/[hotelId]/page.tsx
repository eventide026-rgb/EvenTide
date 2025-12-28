
'use client';

import { use, useMemo } from 'react';
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
import { CheckCircle, Loader2, MapPin, Users, Wifi, Wind, Coffee, Dumbbell, Car, Star } from 'lucide-react';
import { type Hotel } from '@/components/hotel-listing-card';
import { BookingDialog } from '@/components/booking-dialog';
import { Separator } from '@/components/ui/separator';

const amenityIcons: { [key: string]: React.ElementType } = {
  'Wi-Fi': Wifi,
  'Air Conditioning': Wind,
  'Restaurant': Coffee,
  'Gym': Dumbbell,
  'Parking': Car,
  'Pool': () => <span>🏊</span>, // Lucide doesn't have a great pool icon
};

export default function HotelDetailsPage({ params }: { params: Promise<{ hotelId: string }> }) {
    const { hotelId } = use(params);
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    const hotelRef = useMemoFirebase(() => {
        if (!firestore || !hotelId) return null;
        return doc(firestore, 'hotels', hotelId);
    }, [firestore, hotelId]);

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
            <main className="flex-1">
                <section className="relative h-[50vh] w-full">
                    <Image
                        src={hotel.imageUrls[0]}
                        alt={hotel.name}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="relative z-10 flex h-full flex-col justify-end p-4 md:p-8 text-white">
                        <h1 className="text-4xl md:text-6xl font-headline font-bold text-shadow-lg">{hotel.name}</h1>
                        <p className="mt-2 text-lg flex items-center gap-2">
                           <MapPin className="h-5 w-5" /> 
                           {hotel.city}, {hotel.state}
                        </p>
                    </div>
                </section>

                <div className="container mx-auto px-4 py-8 md:py-12">
                    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                        <div className="lg:col-span-2 space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>About {hotel.name}</CardTitle>
                                    <CardDescription>{hotel.address}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{hotel.description}</p>
                                </CardContent>
                            </Card>

                             <Card>
                                <CardHeader>
                                    <CardTitle>Amenities</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                     {hotel.amenities.map(amenity => {
                                         const Icon = amenityIcons[amenity] || CheckCircle;
                                         return (
                                            <div key={amenity} className="flex items-center gap-2 text-sm">
                                                <Icon className="h-5 w-5 text-primary" />
                                                <span>{amenity}</span>
                                            </div>
                                         )
                                     })}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Gallery</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Carousel>
                                        <CarouselContent>
                                            {hotel.imageUrls.map((url, index) => (
                                                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                                    <div className="aspect-video relative rounded-lg overflow-hidden">
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
                                        <CarouselPrevious className="-left-4" />
                                        <CarouselNext className="-right-4" />
                                    </Carousel>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Reviews</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                            <span className="font-bold text-lg">4.8</span>
                                            <span className="text-sm text-muted-foreground">(120 reviews)</span>
                                        </div>
                                    </div>
                                    <div className="border-t pt-6">
                                        <p className="italic text-muted-foreground">&quot;Absolutely stunning hotel with world-class service. The rooms were spacious and immaculate. A perfect getaway!&quot;</p>
                                        <p className="font-semibold mt-2">- Tunde A.</p>
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
                                   {hotel.roomTypes.map((room, index) => (
                                     <React.Fragment key={room.name}>
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <h4 className="font-semibold">{room.name}</h4>
                                                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                                    <Users className="h-4 w-4" />
                                                    <span>Up to {room.capacity} guests</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-lg font-bold">₦{room.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/night</span></p>
                                                <BookingDialog 
                                                    hotel={hotel} 
                                                    roomType={room} 
                                                    user={user} 
                                                    isUserLoading={isUserLoading}
                                                />
                                            </div>
                                        </div>
                                        {index < hotel.roomTypes.length - 1 && <Separator />}
                                     </React.Fragment>
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
