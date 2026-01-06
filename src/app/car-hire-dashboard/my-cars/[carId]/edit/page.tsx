
'use client';

import { use } from 'react';
import { CarForm } from "@/components/forms/car-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditCarPage({ params }: { params: { carId: string } }) {
    const { carId } = params;

    return (
        <div className="flex flex-col gap-4">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/car-hire-dashboard/my-cars">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to My Cars</span>
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold">Edit Vehicle Listing</h1>
            </div>
            <Card className="max-w-4xl mx-auto w-full">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Edit Vehicle Details</CardTitle>
                    <CardDescription>
                        Make changes to your vehicle listing below. Your updates will be saved automatically.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CarForm carId={carId} />
                </CardContent>
            </Card>
        </div>
    );
}
