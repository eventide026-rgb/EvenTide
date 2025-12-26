
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
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { CheckCircle, Loader2, DollarSign } from 'lucide-react';
import { CarBookingDialog } from '@/components/car-booking-dialog';

// This type should be moved to a shared types file later
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


export default function CarDetailsPage({ params }: { params: Promise<{ carId: string }> }) {
    const { carId } = use(params);
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();

    const carRef = useMemoFirebase(() => {
        if (!firestore || !carId) return null;
        return doc(firestore, 'cars', carId);
    }, [firestore, carId]);

    const { data: car, isLoading: isLoadingCar } = useDoc<Car>(carRef);

    const isLoading = isUserLoading || isLoadingCar;

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!car && !isLoading) {
        return notFound();
    }
    
    if (!car) return null;

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <PublicHeader />
            <main className="flex-1 py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                             <Carousel className="w-full rounded-lg overflow-hidden">
                                <CarouselContent>
                                    {car.imageUrls.map((url, index) => (
                                        <CarouselItem key={index}>
                                            <div className="aspect-video relative">
                                                <Image
                                                    src={url}
                                                    alt={`${car.make} ${car.model} view ${index + 1}`}
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
                                            <CardTitle className="text-3xl font-headline">{car.make} {car.model}</CardTitle>
                                            <CardDescription>{car.year} &bull; {car.location.city}, {car.location.state}</CardDescription>
                                        </div>
                                        <Badge variant="secondary" className="flex items-center gap-2 text-lg">
                                            <DollarSign className="h-5 w-5" />
                                            <span>{car.pricePerDay.toLocaleString()}/day</span>
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <h3 className="font-bold text-xl mt-6 mb-4">Features</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {car.features.map(item => (
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
                                    <CardTitle>Book this Car</CardTitle>
                                    <CardDescription>Select your dates to request a booking.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                   <CarBookingDialog 
                                        car={car}
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
