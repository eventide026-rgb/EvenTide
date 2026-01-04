
'use client';

import { use, Suspense } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ProgramPreviewCard } from '@/components/stationery/previews/program-preview';

function ProgramPreviewPageContent({ eventId }: { eventId: string }) {
    const firestore = useFirestore();

    const eventRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'events', eventId);
    }, [firestore, eventId]);

    const { data: event, isLoading: isLoadingEvent } = useDoc(eventRef);
    
    if (isLoadingEvent || !event) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
             <div className="flex justify-between items-center mb-4">
                 <Button variant="outline" asChild>
                    <Link href={`/owner-dashboard/stationery-hub/gatepass-preview/${eventId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Gatepass
                    </Link>
                </Button>
                <Button asChild>
                    <Link href={`/owner-dashboard/stationery-hub/menu-preview/${eventId}`}>
                        Next: Menu Preview
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Program Card Preview</CardTitle>
                    <CardDescription>This is a read-only preview of how your event program will appear to guests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProgramPreviewCard event={event} />
                </CardContent>
            </Card>
        </div>
    );
}

export default function ProgramPreviewPage({ params }: { params: { eventId: string } }) {
    const { eventId } = use(params);

    return (
        <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <ProgramPreviewPageContent eventId={eventId} />
        </Suspense>
    );
}
