'use client';

import { MoodBoardClient } from '@/components/planner/mood-board-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Loader2 } from 'lucide-react';

function MoodBoardVendorView() {
    const searchParams = useSearchParams();
    const eventId = searchParams.get('eventId');

     if (!eventId) {
        return (
             <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Event Not Selected</AlertTitle>
                <AlertDescription>
                    No event was selected. Please go to your "My Gigs" page and select an event to view its visual theme.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Mood Board Viewer</CardTitle>
                <CardDescription>
                    This is a read-only view of the event's visual identity. Use these references to guide your decoration choices.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <MoodBoardClient isReadOnly={true} />
            </CardContent>
        </Card>
    );
}

export default function MoodBoardPage() {
  return (
     <div className="space-y-6 h-full flex flex-col">
        <header>
            <h1 className="text-3xl font-bold font-headline">Event Aesthetic</h1>
            <p className="text-muted-foreground">Review the master visual theme for your assigned event.</p>
        </header>
        <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8" /></div>}>
            <MoodBoardVendorView />
        </Suspense>
    </div>
  );
}
