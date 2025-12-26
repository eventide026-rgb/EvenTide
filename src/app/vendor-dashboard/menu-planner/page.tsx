
'use client';

import { MenuPlannerClient } from '@/components/planner/menu-planner-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';


function MenuPlannerVendorView() {
    const searchParams = useSearchParams();
    const eventId = searchParams.get('eventId');

     if (!eventId) {
        return (
             <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Event Not Selected</AlertTitle>
                <AlertDescription>
                    No event was selected. Please go to your "My Gigs" page and select an event to view its menu.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Menu Viewer</CardTitle>
                <CardDescription>
                    This is a read-only view of the event menu. This serves as your official instruction list for what to prepare.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <MenuPlannerClient eventId={eventId} isReadOnly />
            </CardContent>
        </Card>
    );
}

export default function MenuPlannerPage() {
  return (
     <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold font-headline">Event Menu</h1>
            <p className="text-muted-foreground">Review the culinary plan for your assigned event.</p>
        </header>
        <Suspense fallback={<div>Loading menu...</div>}>
            <MenuPlannerVendorView />
        </Suspense>
    </div>
  );
}
