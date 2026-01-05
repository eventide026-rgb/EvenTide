
'use client';

import { use } from 'react';
import { VenueForm } from "@/components/forms/venue-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditVenuePage({ params }: { params: { venueId: string } }) {
    const { venueId } = use(params);

    return (
        <div className="flex flex-col gap-4">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/hall-owner-dashboard/my-venues">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to My Venues</span>
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold">Edit Venue Listing</h1>
            </div>
            <Card className="max-w-4xl mx-auto w-full">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Edit Venue Details</CardTitle>
                    <CardDescription>
                        Make changes to your venue listing below. Your updates will be saved automatically.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <VenueForm venueId={venueId} />
                </CardContent>
            </Card>
        </div>
    );
}
