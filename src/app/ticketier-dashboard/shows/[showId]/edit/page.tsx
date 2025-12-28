
'use client';

import { use } from 'react';
import { EventForm } from "@/components/forms/event-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditShowPage({ params }: { params: Promise<{ showId: string }> }) {
    const { showId } = use(params);

    return (
        <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/ticketier-dashboard/shows">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back to My Shows</span>
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold">Edit Show</h1>
                </div>
                 <Button variant="outline" asChild>
                    <Link href={`/ticketier-dashboard/shows/${showId}/tiers`}>
                        Manage Ticket Tiers
                    </Link>
                </Button>
            </div>
            <Card className="max-w-4xl mx-auto w-full">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Edit Show Details</CardTitle>
                    <CardDescription>
                        Make changes to your show listing below. Your updates will be saved automatically.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <EventForm showId={showId} />
                </CardContent>
            </Card>
        </div>
    );
}
