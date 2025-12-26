
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProgramPlannerClient } from '@/components/planner/program-planner-client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

function ProgramPlannerOwnerView() {
    const searchParams = useSearchParams();
    const eventId = searchParams.get('eventId');

    if (!eventId) {
        return (
            <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Event Not Selected</AlertTitle>
                <AlertDescription>
                    No event was selected. Please go back and choose an event to view its program.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Program Viewer</CardTitle>
                <CardDescription>
                    This is a read-only view of the event program. Any changes made by your planner will appear here in real-time.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ProgramPlannerClient eventId={eventId} isReadOnly />
            </CardContent>
        </Card>
    );
}

export default function ProgramPlannerPage() {
    return (
        <Suspense fallback={<div>Loading event details...</div>}>
            <ProgramPlannerOwnerView />
        </Suspense>
    );
}
