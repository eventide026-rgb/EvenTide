'use client';

import { use } from 'react';
import { HotelForm } from "@/components/forms/hotel-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditHotelPage({ params }: { params: Promise<{ hotelId: string }> }) {
    const { hotelId } = use(params);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/hotelier-dashboard/my-hotels">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to My Hotels</span>
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold">Edit Hotel Listing</h1>
            </div>
            <Card className="max-w-4xl mx-auto w-full">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Edit Hotel Details</CardTitle>
                    <CardDescription>
                        Make changes to your hotel listing below. Your updates will be saved automatically.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <HotelForm hotelId={hotelId} />
                </CardContent>
            </Card>
        </div>
    );
}