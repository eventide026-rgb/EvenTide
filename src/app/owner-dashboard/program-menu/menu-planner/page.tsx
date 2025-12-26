
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MenuPlannerClient } from '@/components/planner/menu-planner-client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

function MenuPlannerOwnerView() {
    const searchParams = useSearchParams();
    const eventId = searchParams.get('eventId');

    if (!eventId) {
        return (
             <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Event Not Selected</AlertTitle>
                <AlertDescription>
                    No event was selected. Please go back and choose an event to view its menu.
                </AlertDescription>
            </Alert>
        );
    }

    return (
         <Card>
            <CardHeader>
                <CardTitle>Menu Viewer</CardTitle>
                <CardDescription>
                    This is a read-only view of the event menu. Any changes made by your planner will appear here in real-time.
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
    <Suspense fallback={<div>Loading menu details...</div>}>
        <MenuPlannerOwnerView />
    </Suspense>
  );
}
