
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car } from 'lucide-react';

export default function CarDetailsPage({ params }: { params: { carId: string } }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
             <Card>
                <CardHeader>
                    <Car className="h-8 w-8 text-muted-foreground" />
                    <CardTitle>Car Details Page</CardTitle>
                    <CardDescription>Details for car {params.carId} will be shown here.</CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
}
